// Runs before `next build`. Pulls the product catalog from Firestore (public read
// rules) and writes it to data/products.json + data/categories.json, so the store
// is built as fast static pages from whatever you saved in the admin panel.
//
// Safe by design: if the Firebase settings are missing (e.g. GitHub PR checks), the
// database cannot be reached, or it has no products yet, the committed JSON files
// are left untouched and the build carries on.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

function log(message) {
  console.log(`[sync-products] ${message}`);
}

if (!projectId || !apiKey) {
  log('Firebase settings not set - keeping the committed product list.');
  process.exit(0);
}

function fromValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(fromValue);
  if ('mapValue' in value) return fromFields(value.mapValue.fields ?? {});
  return null;
}

function fromFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromValue(value)]));
}

async function fetchAllProducts() {
  const docs = [];
  let pageToken = '';
  do {
    const url =
      `${process.env.FIRESTORE_REST_BASE ?? "https://firestore.googleapis.com"}/v1/projects/${encodeURIComponent(projectId)}` +
      `/databases/(default)/documents/products?pageSize=300&key=${encodeURIComponent(apiKey)}` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Firestore answered ${response.status}`);
    const body = await response.json();
    docs.push(...(body.documents ?? []));
    pageToken = body.nextPageToken ?? '';
  } while (pageToken);
  return docs;
}

const uploadsDir = path.join(root, 'public', 'uploads');
let writtenImages = 0;

/** Photos saved from the admin panel are data URLs; turn them into real image files. */
async function materializeImage(src) {
  if (typeof src !== 'string' || !src.startsWith('data:image/')) return src;
  const match = /^data:image\/(webp|jpeg|jpg|png);base64,(.+)$/s.exec(src);
  if (!match) return '';
  const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const name = `admin-${createHash('sha1').update(buffer).digest('hex').slice(0, 16)}.${extension}`;
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, name), buffer);
  writtenImages += 1;
  return `/uploads/${name}`;
}

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

async function toProduct(document, index) {
  const slug = document.name.split('/').pop();
  const data = fromFields(document.fields ?? {});
  const gallerySource = Array.isArray(data.gallery) && data.gallery.length ? data.gallery : [data.image];
  const gallery = (await Promise.all(gallerySource.filter(Boolean).map(materializeImage))).filter(Boolean);
  const image = (await materializeImage(data.image)) || gallery[0] || '';
  return {
    id: num(data.id, 100000 + index),
    slug,
    name: String(data.name ?? slug),
    description: String(data.description ?? ''),
    image,
    gallery: gallery.length ? gallery : image ? [image] : [],
    isPhysicalProduct: Boolean(data.isPhysicalProduct),
    stock: num(data.stock),
    rating: num(data.rating),
    reviewsCount: num(data.reviewsCount),
    price: num(data.price),
    comparePrice: data.comparePrice == null ? null : num(data.comparePrice),
    tag: data.tag ? String(data.tag) : null,
    youtubeVideoUrl: data.youtubeVideoUrl ? String(data.youtubeVideoUrl) : null,
    category: {
      name: String(data.category?.name ?? 'Other'),
      slug: String(data.category?.slug ?? 'other'),
    },
    features: Array.isArray(data.features) ? data.features.map(String) : [],
    pricingOptions: Array.isArray(data.pricingOptions) ? data.pricingOptions : [],
    variations: Array.isArray(data.variations) ? data.variations : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    active: data.active !== false,
  };
}

try {
  const documents = await fetchAllProducts();
  if (documents.length === 0) {
    log('No products in the database yet - keeping the committed product list.');
    process.exit(0);
  }

  const all = await Promise.all(documents.map(toProduct));
  const products = all
    .filter((product) => product.active && product.name && product.image)
    .map(({ active, ...product }) => product);

  if (products.length === 0) {
    log('Every database product is hidden or incomplete - keeping the committed product list.');
    process.exit(0);
  }

  // Categories: keep existing category cards, refresh counts, add new ones.
  const categoriesPath = path.join(root, 'data', 'categories.json');
  const existing = JSON.parse(await readFile(categoriesPath, 'utf8'));
  const bySlug = new Map(existing.map((category) => [category.slug, category]));
  const counts = new Map();
  for (const product of products) {
    counts.set(product.category.slug, (counts.get(product.category.slug) ?? 0) + 1);
    if (!bySlug.has(product.category.slug)) {
      bySlug.set(product.category.slug, {
        slug: product.category.slug,
        name: product.category.name,
        image: product.image,
        count: 0,
      });
    }
  }
  const categories = [...bySlug.values()]
    .map((category) => ({ ...category, count: counts.get(category.slug) ?? 0 }))
    .filter((category) => category.count > 0);

  await writeFile(path.join(root, 'data', 'products.json'), JSON.stringify(products, null, 2));
  await writeFile(categoriesPath, JSON.stringify(categories, null, 2));
  log(`Synced ${products.length} products, ${categories.length} categories, ${writtenImages} admin photos.`);
} catch (error) {
  log(`Could not sync from Firebase (${error instanceof Error ? error.message : error}) - keeping the committed product list.`);
}
