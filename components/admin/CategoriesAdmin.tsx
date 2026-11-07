'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/components/store/StoreProvider';
import { PublishPanel } from '@/components/admin/PublishPanel';
import { Field, inputClass } from '@/components/admin/ui';
import {
  deleteCategory,
  importCategories,
  listCategoryDocs,
  listProducts,
  saveCategoryDoc,
  saveCategoryOrder,
  slugify,
  type CategoryDoc,
} from '@/lib/admin';
import { compressImage } from '@/lib/admin-images';
import seedCategories from '@/data/categories-seed.json';

export function CategoriesAdmin() {
  const { notify } = useStore();
  const [items, setItems] = useState<CategoryDoc[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState<Record<string, string>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});

  // "Add category" form
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newError, setNewError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const changePhotoSlug = useRef<string>('');
  const changeRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    try {
      const rows = await listCategoryDocs();
      setItems(rows);
      setNames(Object.fromEntries(rows.map((row) => [row.slug, row.name])));
      setError('');
      try {
        const products = await listProducts();
        const next: Record<string, number> = {};
        for (const product of products) next[product.category.slug] = (next[product.category.slug] ?? 0) + 1;
        setCounts(next);
      } catch {
        // Counts are a convenience; the list still works without them.
      }
    } catch {
      setError('Could not load categories. Publish the latest Firestore rules and try again.');
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function run(action: () => Promise<void>, success: string): Promise<boolean> {
    setBusy(true);
    try {
      await action();
      notify(success, 'success');
      await refresh();
      return true;
    } catch {
      notify('That did not save. Check your connection and the Firestore rules.', 'error');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function onImport() {
    setBusy(true);
    try {
      const added = await importCategories(seedCategories);
      notify(`Imported ${added} categories.`, 'success');
      await refresh();
    } catch {
      notify('Import failed. Publish the latest Firestore rules first.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(item: CategoryDoc) {
    const count = counts[item.slug] ?? 0;
    const message =
      count > 0
        ? `Delete "${item.name}" AND its ${count} product${count === 1 ? '' : 's'}?\n\nThis cannot be undone. To keep the products, press Cancel and use Hide instead.`
        : `Delete the category "${item.name}"?`;
    if (!window.confirm(message)) return;
    await run(async () => {
      await deleteCategory(item.slug, count > 0);
    }, count > 0 ? `Deleted "${item.name}" and ${count} product(s)` : `Deleted "${item.name}"`);
  }

  function move(index: number, direction: -1 | 1) {
    if (!items) return;
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    void run(() => saveCategoryOrder(next), 'Order saved');
  }

  async function onPickNewImage(file: File | undefined) {
    if (!file) return;
    try {
      setNewImage(await compressImage(file));
      setNewError('');
    } catch (err) {
      setNewError(err instanceof Error ? err.message : 'That image could not be used.');
    }
  }

  async function onChangePhoto(file: File | undefined) {
    const slug = changePhotoSlug.current;
    const category = items?.find((item) => item.slug === slug);
    if (!file || !category) return;
    try {
      const image = await compressImage(file);
      await run(() => saveCategoryDoc({ ...category, image }), 'Photo updated');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'That image could not be used.', 'error');
    }
  }

  async function onAdd() {
    const name = newName.trim();
    const slug = slugify(name);
    if (!name || !slug) {
      setNewError('Type a category name.');
      return;
    }
    if (items?.some((item) => item.slug === slug)) {
      setNewError('A category with this name already exists.');
      return;
    }
    const ok = await run(
      () =>
        saveCategoryDoc({
          slug,
          name,
          image: newImage,
          order: items?.length ?? 0,
          hidden: false,
        }),
      'Category added',
    );
    if (ok) {
      setNewName('');
      setNewImage('');
      setNewError('');
    }
  }

  return (
    <section>
      <PublishPanel />

      <h2 className="mb-1 text-lg font-black text-[#1b1e1d]">Categories</h2>
      <p className="mb-4 text-sm text-slate-500">
        Rename, hide, add and reorder categories. Hiding a category also hides its products from the store. Deleting removes it for good.
        Changes show on the store after you tap <strong>Publish to website</strong>.
      </p>

      {error ? <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p> : null}

      {items && items.length === 0 ? (
        <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-sm text-slate-500">No categories in the database yet.</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onImport()}
            className="mt-3 rounded-full bg-[#2f7d57] px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Import current categories
          </button>
        </div>
      ) : null}

      <input
        ref={changeRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void onChangePhoto(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      {items && items.length > 0 ? (
        <ul className="mb-6 grid gap-2">
          {items.map((item, index) => {
            const draft = names[item.slug] ?? item.name;
            const changed = draft.trim() !== item.name && draft.trim() !== '';
            return (
              <li
                key={item.slug}
                className={`flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 ${
                  item.hidden ? 'opacity-60' : ''
                }`}
              >
                <div className="flex flex-col">
                  <button
                    type="button"
                    disabled={busy || index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Move ${item.name} up`}
                    className="rounded px-2 text-sm font-bold disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={busy || index === items.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Move ${item.name} down`}
                    className="rounded px-2 text-sm font-bold disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    changePhotoSlug.current = item.slug;
                    changeRef.current?.click();
                  }}
                  className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400"
                  title="Change photo"
                >
                  {item.image ? <img src={item.image} alt="" className="size-full object-cover" /> : 'Photo'}
                </button>

                <div className="min-w-[160px] flex-1">
                  <input
                    className={inputClass}
                    value={draft}
                    onChange={(event) => setNames((current) => ({ ...current, [item.slug]: event.target.value }))}
                    aria-label={`Name of ${item.slug}`}
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    /{item.slug} · {counts[item.slug] ?? 0} product{(counts[item.slug] ?? 0) === 1 ? '' : 's'}
                  </p>
                </div>

                {changed ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void run(() => saveCategoryDoc({ ...item, name: draft.trim() }), 'Name saved')}
                    className="rounded-full bg-[#2f7d57] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Save name
                  </button>
                ) : null}

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () => saveCategoryDoc({ ...item, hidden: !item.hidden }),
                      item.hidden ? 'Category is visible again' : 'Category hidden',
                    )
                  }
                  className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-bold disabled:opacity-50"
                >
                  {item.hidden ? 'Show' : 'Hide'}
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onDelete(item)}
                  className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-bold text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-black text-[#1b1e1d]">Add a category</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field label="Category name" hint="It appears on the store once it has at least one product.">
            <input
              className={inputClass}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="e.g. Smart Watches"
            />
          </Field>
          <div className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Photo (optional)</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                void onPickNewImage(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="grid size-[46px] place-items-center overflow-hidden rounded-lg border border-dashed border-slate-300 text-xs font-bold text-slate-400"
            >
              {newImage ? <img src={newImage} alt="" className="size-full object-cover" /> : '+'}
            </button>
          </div>
        </div>
        {newError ? <p className="mt-3 text-sm text-red-600">{newError}</p> : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => void onAdd()}
          className="mt-4 rounded-full bg-[#2f7d57] px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Add category
        </button>
      </div>
    </section>
  );
}
