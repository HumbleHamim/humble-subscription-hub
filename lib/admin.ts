import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import type { PricingOption, Product } from '@/lib/types';
import { requireFirebase } from '@/lib/firebase';

export type Customer = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  createdAt: number; // epoch ms, 0 if unknown
};

/** An account is an admin when a document exists at admins/{uid}.
 *  Only the Firebase console can create it (client writes are blocked by the rules). */
export async function checkIsAdmin(uid: string): Promise<boolean> {
  const { db } = requireFirebase();
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}

function toMillis(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'toMillis' in value) {
    const fn = (value as { toMillis: () => number }).toMillis;
    if (typeof fn === 'function') return fn.call(value);
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export async function listCustomers(): Promise<Customer[]> {
  const { db } = requireFirebase();
  const snap = await getDocs(query(collection(db, 'users'), limit(500)));
  return snap.docs
    .map((entry) => {
      const data = entry.data();
      return {
        uid: entry.id,
        name: String(data.name ?? ''),
        email: String(data.email ?? ''),
        phone: String(data.phone ?? ''),
        createdAt: toMillis(data.createdAt),
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/* ---------------- Products (Firestore collection: products/{slug}) ---------------- */

export type ProductDoc = {
  slug: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  isPhysicalProduct: boolean;
  stock: number;
  price: number;
  comparePrice: number | null;
  tag: string | null;
  youtubeVideoUrl: string | null;
  category: { name: string; slug: string };
  features: string[];
  pricingOptions: PricingOption[];
  active: boolean;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function listProducts(): Promise<ProductDoc[]> {
  const { db } = requireFirebase();
  const snap = await getDocs(query(collection(db, 'products'), limit(500)));
  return snap.docs
    .map((entry) => {
      const d = entry.data();
      return {
        slug: entry.id,
        name: String(d.name ?? ''),
        description: String(d.description ?? ''),
        image: String(d.image ?? ''),
        gallery: Array.isArray(d.gallery) ? d.gallery.map(String) : [],
        isPhysicalProduct: Boolean(d.isPhysicalProduct),
        stock: Number(d.stock ?? 0),
        price: Number(d.price ?? 0),
        comparePrice: d.comparePrice == null ? null : Number(d.comparePrice),
        tag: d.tag ? String(d.tag) : null,
        youtubeVideoUrl: d.youtubeVideoUrl ? String(d.youtubeVideoUrl) : null,
        category: {
          name: String(d.category?.name ?? ''),
          slug: String(d.category?.slug ?? ''),
        },
        features: Array.isArray(d.features) ? d.features.map(String) : [],
        pricingOptions: Array.isArray(d.pricingOptions) ? (d.pricingOptions as PricingOption[]) : [],
        active: d.active !== false,
      } satisfies ProductDoc;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveProduct(product: ProductDoc, isNew: boolean): Promise<void> {
  const { db } = requireFirebase();
  const ref = doc(db, 'products', product.slug);
  if (isNew) {
    const existing = await getDoc(ref);
    if (existing.exists()) throw new Error('A product with this slug already exists.');
    await setDoc(ref, { ...product, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { ...product, updatedAt: serverTimestamp() }, { merge: true });
  }
}

export async function deleteProduct(slug: string): Promise<void> {
  const { db } = requireFirebase();
  await deleteDoc(doc(db, 'products', slug));
}

/** Copies the built-in catalog into Firestore. Products that already exist are
 *  skipped, so running it twice never overwrites edits. Returns how many were added. */
export async function importCatalog(catalog: Product[]): Promise<{ added: number; skipped: number }> {
  const { db } = requireFirebase();
  const existing = new Set((await getDocs(collection(db, 'products'))).docs.map((entry) => entry.id));
  const fresh = catalog.filter((product) => !existing.has(product.slug));
  for (let i = 0; i < fresh.length; i += 400) {
    const batch = writeBatch(db);
    for (const product of fresh.slice(i, i + 400)) {
      batch.set(doc(db, 'products', product.slug), {
        ...product,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  }
  return { added: fresh.length, skipped: catalog.length - fresh.length };
}

/* ---------------- Publish link (Firestore: settings/publish, admin-only) ---------------- */

export async function getPublishHook(): Promise<string> {
  const { db } = requireFirebase();
  const snap = await getDoc(doc(db, 'settings', 'publish'));
  return snap.exists() ? String(snap.data().hookUrl ?? '') : '';
}

export async function savePublishHook(hookUrl: string): Promise<void> {
  const { db } = requireFirebase();
  await setDoc(doc(db, 'settings', 'publish'), { hookUrl, updatedAt: serverTimestamp() });
}

/* ---------------- Categories (Firestore collection: categories/{slug}) ---------------- */

export type CategoryDoc = {
  slug: string;
  name: string;
  image: string;
  order: number;
  hidden: boolean;
};

export async function listCategoryDocs(): Promise<CategoryDoc[]> {
  const { db } = requireFirebase();
  const snap = await getDocs(query(collection(db, 'categories'), limit(200)));
  return snap.docs
    .map((entry, index) => {
      const d = entry.data();
      return {
        slug: entry.id,
        name: String(d.name ?? entry.id),
        image: String(d.image ?? ''),
        order: Number.isFinite(Number(d.order)) ? Number(d.order) : 1000 + index,
        hidden: Boolean(d.hidden),
      } satisfies CategoryDoc;
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export async function saveCategoryDoc(category: CategoryDoc): Promise<void> {
  const { db } = requireFirebase();
  await setDoc(
    doc(db, 'categories', category.slug),
    { ...category, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function saveCategoryOrder(categories: CategoryDoc[]): Promise<void> {
  const { db } = requireFirebase();
  const batch = writeBatch(db);
  categories.forEach((category, index) => {
    batch.set(doc(db, 'categories', category.slug), { order: index, updatedAt: serverTimestamp() }, { merge: true });
  });
  await batch.commit();
}

/** Copies the built-in categories into Firestore; ones that already exist are skipped. */
export async function importCategories(seed: { slug: string; name: string; image: string }[]): Promise<number> {
  const { db } = requireFirebase();
  const existing = new Set((await getDocs(collection(db, 'categories'))).docs.map((entry) => entry.id));
  const fresh = seed.filter((category) => !existing.has(category.slug));
  if (fresh.length === 0) return 0;
  const batch = writeBatch(db);
  fresh.forEach((category, index) => {
    batch.set(doc(db, 'categories', category.slug), {
      slug: category.slug,
      name: category.name,
      image: category.image,
      order: existing.size + index,
      hidden: false,
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return fresh.length;
}

/* ---------------- Site settings (Firestore: settings/site, publicly readable) ---------------- */

export type LinkItem = { href: string; label: string };

export type SiteSettings = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  phone: string;
  phoneDigits: string;
  whatsappDigits: string;
  email: string;
  facebook: string;
  instagram: string;
  address: string;
  announcements: string[];
  navLinks: LinkItem[];
  footerServiceLinks: LinkItem[];
  footerAboutLinks: LinkItem[];
  footerBottomLinks: LinkItem[];
};

export async function getSiteSettings(): Promise<Partial<SiteSettings> | null> {
  const { db } = requireFirebase();
  const snap = await getDoc(doc(db, 'settings', 'site'));
  return snap.exists() ? (snap.data() as Partial<SiteSettings>) : null;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const { db } = requireFirebase();
  await setDoc(doc(db, 'settings', 'site'), { ...settings, updatedAt: serverTimestamp() });
}

/** Deletes a category. If `withProducts` is true, every product in it is deleted too. */
export async function deleteCategory(slug: string, withProducts: boolean): Promise<number> {
  const { db } = requireFirebase();
  let removed = 0;
  if (withProducts) {
    const snap = await getDocs(query(collection(db, 'products'), where('category.slug', '==', slug)));
    for (let i = 0; i < snap.docs.length; i += 400) {
      const batch = writeBatch(db);
      for (const entry of snap.docs.slice(i, i + 400)) batch.delete(entry.ref);
      await batch.commit();
    }
    removed = snap.docs.length;
  }
  await deleteDoc(doc(db, 'categories', slug));
  return removed;
}

/* ---------------- Pages (Firestore collection: pages/{slug}, publicly readable) ---------------- */

export type PageDoc = {
  title: string;
  subtitle: string;
  updated: string;
  sections: { heading: string; paragraphs: string[]; bullets: string[] }[];
  steps?: { title: string; text: string }[];
};

export async function getPageDoc(slug: string): Promise<PageDoc | null> {
  const { db } = requireFirebase();
  const snap = await getDoc(doc(db, 'pages', slug));
  return snap.exists() ? (snap.data() as PageDoc) : null;
}

export async function savePageDoc(slug: string, page: PageDoc): Promise<void> {
  const { db } = requireFirebase();
  await setDoc(doc(db, 'pages', slug), { ...page, updatedAt: serverTimestamp() });
}

/** Removes the saved edits so the page goes back to its original text. */
export async function resetPageDoc(slug: string): Promise<void> {
  const { db } = requireFirebase();
  await deleteDoc(doc(db, 'pages', slug));
}
