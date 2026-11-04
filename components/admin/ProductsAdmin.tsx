'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/components/store/StoreProvider';
import { categories } from '@/lib/data';
import seedCatalog from '@/data/catalog-seed.json';
import type { Product } from '@/lib/types';
import { PublishPanel } from '@/components/admin/PublishPanel';
import { deleteProduct, importCatalog, listProducts, saveProduct, slugify, type ProductDoc } from '@/lib/admin';
import {
  MAX_IMAGES,
  MAX_IMAGES_BYTES,
  compressImage,
  totalImageBytes,
} from '@/lib/admin-images';

const PLAN_TYPES = [
  { type: 'monthly', label: '1 Month', days: 30 },
  { type: 'threeMonth', label: '3 Months', days: 90 },
  { type: 'sixMonth', label: '6 Months', days: 180 },
  { type: 'yearly', label: '1 Year', days: 365 },
];

type Form = {
  isNew: boolean;
  name: string;
  slug: string;
  isPhysical: boolean;
  categorySlug: string;
  price: string;
  comparePrice: string;
  stock: string;
  tag: string;
  images: string[];
  description: string;
  features: string;
  youtube: string;
  active: boolean;
  plans: Record<string, string>;
};

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2f7d57]';

function emptyForm(): Form {
  return {
    isNew: true,
    name: '',
    slug: '',
    isPhysical: true,
    categorySlug: '',
    price: '',
    comparePrice: '',
    stock: '10',
    tag: '',
    images: [],
    description: '',
    features: '',
    youtube: '',
    active: true,
    plans: {},
  };
}

function formFromProduct(p: ProductDoc): Form {
  const plans: Record<string, string> = {};
  for (const option of p.pricingOptions) plans[option.type] = String(option.price);
  return {
    isNew: false,
    name: p.name,
    slug: p.slug,
    isPhysical: p.isPhysicalProduct,
    categorySlug: p.category.slug,
    price: String(p.price),
    comparePrice: p.comparePrice == null ? '' : String(p.comparePrice),
    stock: String(p.stock),
    tag: p.tag ?? '',
    images: p.gallery.length > 0 ? p.gallery : p.image ? [p.image] : [],
    description: p.description,
    features: p.features.join('\n'),
    youtube: p.youtubeVideoUrl ?? '',
    active: p.active,
    plans,
  };
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Returns a ready-to-save product, or a message explaining what to fix. */
function buildProduct(form: Form): ProductDoc | string {
  const name = form.name.trim();
  if (!name) return 'Enter a product name.';
  const slug = form.slug.trim();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return 'The slug may only contain lowercase letters, numbers and single dashes.';
  }
  const category = categories.find((item) => item.slug === form.categorySlug);
  if (!category) return 'Choose a category.';

  const price = Number(form.price);
  if (form.price.trim() === '' || !Number.isFinite(price) || price < 0) return 'Enter a valid price.';
  let comparePrice: number | null = null;
  if (form.comparePrice.trim() !== '') {
    comparePrice = Number(form.comparePrice);
    if (!Number.isFinite(comparePrice) || comparePrice < 0) return 'The old price is not a valid number.';
  }
  const stock = Number(form.stock);
  if (!Number.isInteger(stock) || stock < 0) return 'Stock must be a whole number (0 or more).';

  if (form.images.length === 0) return 'Upload at least one product image.';
  if (totalImageBytes(form.images) > MAX_IMAGES_BYTES) {
    return 'The images are too large together. Remove one or two and try again.';
  }
  const image = form.images[0];
  const gallery = form.images;

  const youtube = form.youtube.trim();
  if (youtube && !youtube.startsWith('https://')) return 'The video link must start with https://';

  const pricingOptions = form.isPhysical
    ? []
    : PLAN_TYPES.flatMap((plan) => {
        const raw = (form.plans[plan.type] ?? '').trim();
        if (raw === '') return [];
        return [{ type: plan.type, price: Number(raw), durationDays: plan.days }];
      });
  if (pricingOptions.some((option) => !Number.isFinite(option.price) || option.price < 0)) {
    return 'A plan price is not a valid number.';
  }

  return {
    slug,
    name,
    description: form.description.trim(),
    image,
    gallery,
    isPhysicalProduct: form.isPhysical,
    stock,
    price,
    comparePrice,
    tag: form.tag.trim() || null,
    youtubeVideoUrl: youtube || null,
    category: { name: category.name, slug: category.slug },
    features: splitLines(form.features),
    pricingOptions,
    active: form.active,
  };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

// Permanent copy of the original catalog (never overwritten by the build sync).
const catalog = seedCatalog as Product[];

export function ProductsAdmin() {
  const { notify } = useStore();
  const [items, setItems] = useState<ProductDoc[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<Form | null>(null);
  formRef.current = form;

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    setFormError('');
    try {
      const added: string[] = [];
      for (const file of files) {
        try {
          added.push(await compressImage(file));
        } catch (error) {
          setFormError(error instanceof Error ? error.message : 'An image could not be processed.');
        }
      }
      const current = formRef.current;
      if (current && added.length > 0) {
        const merged = [...current.images];
        let rejected = 0;
        for (const image of added) {
          if (merged.length >= MAX_IMAGES || totalImageBytes([...merged, image]) > MAX_IMAGES_BYTES) {
            rejected += 1;
            continue;
          }
          merged.push(image);
        }
        update({ images: merged });
        if (rejected > 0) {
          setFormError(
            `${rejected} photo(s) were not added (limit: ${MAX_IMAGES} photos and a total size cap). Remove one and try again.`,
          );
        }
      }
    } finally {
      setUploading(false);
    }
  }

  async function refresh() {
    try {
      setItems(await listProducts());
      setLoadError('');
    } catch {
      setLoadError('Could not load products. Check that the Firestore rules are published.');
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const [importing, setImporting] = useState(false);

  async function onImport() {
    if (!window.confirm(`Copy the ${catalog.length} built-in products into your database so you can edit them? Products already in the database are not changed.`)) {
      return;
    }
    setImporting(true);
    try {
      const { added, skipped } = await importCatalog(catalog);
      notify(`Imported ${added} product(s)${skipped ? `, ${skipped} already existed` : ''}.`, 'success');
      await refresh();
    } catch {
      notify('Import failed. Make sure the latest Firestore rules are published.', 'error');
    } finally {
      setImporting(false);
    }
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!items) return [];
    return q ? items.filter((p) => p.name.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const categoryOptions = useMemo(
    () =>
      categories.filter((c) =>
        form?.isPhysical ? c.slug !== 'subscriptions' : c.slug === 'subscriptions',
      ),
    [form?.isPhysical],
  );

  function update(patch: Partial<Form>) {
    setForm((current) => (current ? { ...current, ...patch } : current));
  }

  function openNew() {
    setForm(emptyForm());
    setFormError('');
    setSlugTouched(false);
  }

  function openEdit(product: ProductDoc) {
    setForm(formFromProduct(product));
    setFormError('');
    setSlugTouched(true);
  }

  async function onSave() {
    if (!form) return;
    const result = buildProduct(form);
    if (typeof result === 'string') {
      setFormError(result);
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await saveProduct(result, form.isNew);
      notify(form.isNew ? 'Product added' : 'Product saved', 'success');
      setForm(null);
      await refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(product: ProductDoc) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product.slug);
      notify('Product deleted', 'success');
      await refresh();
    } catch {
      notify('Could not delete the product', 'error');
    }
  }

  return (
    <section>
      <PublishPanel />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-[#1b1e1d]">Products</h2>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={importing}
            onClick={() => void onImport()}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-50"
          >
            {importing ? 'Importing…' : 'Import current catalog'}
          </button>
          <button
            type="button"
            onClick={openNew}
            className="rounded-full bg-[#2f7d57] px-5 py-2 text-sm font-bold text-white"
          >
            + Add product
          </button>
        </div>
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products"
        className={`${inputClass} mb-4`}
      />

      {loadError ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{loadError}</p>
      ) : !items ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-bold text-[#1b1e1d]">No products yet</p>
          <p className="mt-1 text-sm text-slate-400">Tap “Add product” to create your first one.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((product) => (
            <li key={product.slug} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt=""
                className="size-16 shrink-0 rounded-lg bg-slate-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#1b1e1d]">{product.name}</p>
                <p className="text-xs text-slate-500">
                  {product.category.name} · ৳{product.price} · stock {product.stock}
                  {product.active ? '' : ' · hidden'}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(product)}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {form ? (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-white">
          <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-[#1b1e1d]">
                {form.isNew ? 'Add product' : 'Edit product'}
              </h3>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4">
              <Field label="Type">
                <div className="flex gap-2">
                  {[
                    { value: true, label: 'Physical product' },
                    { value: false, label: 'Digital subscription' },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      disabled={!form.isNew}
                      onClick={() => update({ isPhysical: option.value, categorySlug: '' })}
                      className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-bold ${
                        form.isPhysical === option.value
                          ? 'border-[#2f7d57] bg-orange-50 text-[#256646]'
                          : 'border-slate-300 text-slate-500'
                      } disabled:opacity-60`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Name">
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(event) => {
                    const name = event.target.value;
                    update({ name, ...(slugTouched ? {} : { slug: slugify(name) }) });
                  }}
                />
              </Field>

              <Field
                label="Slug (web address)"
                hint={form.isNew ? 'Auto-filled from the name. Cannot be changed after saving.' : 'Cannot be changed.'}
              >
                <input
                  className={inputClass}
                  value={form.slug}
                  disabled={!form.isNew}
                  onChange={(event) => {
                    setSlugTouched(true);
                    update({ slug: event.target.value });
                  }}
                />
              </Field>

              <Field label="Category">
                <select
                  className={inputClass}
                  value={form.categorySlug}
                  onChange={(event) => update({ categorySlug: event.target.value })}
                >
                  <option value="">Choose…</option>
                  {categoryOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Price ৳">
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={form.price}
                    onChange={(event) => update({ price: event.target.value })}
                  />
                </Field>
                <Field label="Old price ৳">
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={form.comparePrice}
                    onChange={(event) => update({ comparePrice: event.target.value })}
                  />
                </Field>
                <Field label="Stock">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={form.stock}
                    onChange={(event) => update({ stock: event.target.value })}
                  />
                </Field>
              </div>

              {!form.isPhysical ? (
                <Field label="Plan prices ৳" hint="Fill only the plans you sell. Leave the others empty.">
                  <div className="grid grid-cols-2 gap-3">
                    {PLAN_TYPES.map((plan) => (
                      <div key={plan.type} className="flex items-center gap-2">
                        <span className="w-20 shrink-0 text-xs font-semibold text-slate-500">{plan.label}</span>
                        <input
                          className={inputClass}
                          inputMode="decimal"
                          value={form.plans[plan.type] ?? ''}
                          onChange={(event) =>
                            update({ plans: { ...form.plans, [plan.type]: event.target.value } })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </Field>
              ) : null}

              <Field label="Tag (optional)" hint="A small label such as “New” or “Best seller”.">
                <input
                  className={inputClass}
                  value={form.tag}
                  onChange={(event) => update({ tag: event.target.value })}
                />
              </Field>

              <div>
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Product images
                </span>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {form.images.map((src, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="size-full object-cover" />
                      {index === 0 ? (
                        <span className="absolute left-1 top-1 rounded bg-[#2f7d57] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Main
                        </span>
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 px-1 py-0.5 text-[11px] font-bold text-white">
                        {index > 0 ? (
                          <button type="button" onClick={() => update({ images: [src, ...form.images.filter((_, i) => i !== index)] })}>
                            Make main
                          </button>
                        ) : (
                          <span />
                        )}
                        <button type="button" onClick={() => update({ images: form.images.filter((_, i) => i !== index) })}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {form.images.length < MAX_IMAGES ? (
                    <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border-2 border-dashed border-slate-300 bg-white text-center text-xs font-bold text-slate-500">
                      <span>{uploading ? 'Processing…' : '+ Upload images'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploading}
                        onChange={(event) => {
                          const files = Array.from(event.target.files ?? []);
                          event.target.value = '';
                          void handleFiles(files);
                        }}
                      />
                    </label>
                  ) : null}
                </div>
                <span className="mt-1 block text-xs text-slate-400">
                  Up to {MAX_IMAGES} photos. The first one is the main photo. Photos are shrunk automatically.
                </span>
              </div>

              <Field label="Description">
                <textarea
                  className={inputClass}
                  rows={5}
                  value={form.description}
                  onChange={(event) => update({ description: event.target.value })}
                />
              </Field>

              <Field label="Features (optional)" hint="One feature per line.">
                <textarea
                  className={inputClass}
                  rows={4}
                  value={form.features}
                  onChange={(event) => update({ features: event.target.value })}
                />
              </Field>

              <Field label="Video link (optional)">
                <input
                  className={inputClass}
                  value={form.youtube}
                  onChange={(event) => update({ youtube: event.target.value })}
                />
              </Field>

              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => update({ active: event.target.checked })}
                  className="size-5"
                />
                Show this product in the store
              </label>

              {formError ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{formError}</p> : null}
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-3">
            <div className="mx-auto flex max-w-2xl gap-3">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="flex-1 rounded-full border border-slate-300 py-3 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void onSave()}
                className="flex-1 rounded-full bg-[#2f7d57] py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save product'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
