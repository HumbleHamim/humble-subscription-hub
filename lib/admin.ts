import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import type { PricingOption } from '@/lib/types';
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
