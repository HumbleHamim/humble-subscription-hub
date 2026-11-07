// Runs before `next build`. Pulls your admin-panel content from Firestore (public read
// rules) and writes it into the data files the store is built from:
//   products   -> data/products.json
//   categories -> data/categories.json   (rename / hide / order / new categories)
//   site text  -> data/site-settings.json (contact, links, announcements, ...)
//   pages      -> data/pages.json         (About, Guide, Policies ... edited text)
//
// Safe by design: if the Firebase settings are missing (e.g. GitHub PR checks) or a part
// cannot be read, the committed files are left as they are and the build carries on.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const base = process.env.FIRESTORE_REST_BASE ?? 'https://firestore.googleapis.com';

const log = (message) => console.log(`[sync] ${message}`);

if (!projectId || !apiKey) {
  log('Firebase settings not set - keeping the committed content.');
  process.exit(0);
}

/* ---------- Firestore REST helpers ---------- */

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
const fromFields = (fields) =>
  Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromValue(value)]));

const documentsUrl = (suffix) =>
  `${base}/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${suffix}`;

async function fetchCollection(name) {
  const docs = [];
  let pageToken = '';
  do {
    const url =
      `${documentsUrl(name)}?pageSize=300&key=${encodeURIComponent(apiKey)}` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${name}: Firestore answered ${response.status}`);
    const body = await response.json();
    docs.push(...(body.documents ?? []));
    pageToken = body.nextPageToken ?? '';
  } while (pageToken);
  return docs;
}

async function fetchDocument(pathInCollection) {
  const response = await fetch(`${documentsUrl(pathInCollection)}?key=${encodeURIComponent(apiKey)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${pathInCollection}: Firestore answered ${response.status}`);
  return response.json();
}

/* ---------- images saved from the admin are data URLs: turn them into files ---------- */

const uploadsDir = path.join(root, 'public', 'uploads');
let writtenImages = 0;

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
const readJson = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const writeJson = (file, data) => writeFile(path.join(root, file), JSON.stringify(data, null, 2));

/* ---------- products ---------- */

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

async function loadProducts() {
  try {
    const documents = await fetchCollection('products');
    if (documents.length === 0) {
      log('No products in the database yet - using the committed product list.');
      return null;
    }
    const all = await Promise.all(documents.map(toProduct));
    const usable = all
      .filter((product) => product.active && product.name && product.image)
      .map(({ active, ...product }) => product);
    if (usable.length === 0) {
      log('Every database product is hidden or incomplete - using the committed product list.');
      return null;
    }
    return usable;
  } catch (error) {
    log(`Could not read products (${error.message}) - using the committed product list.`);
    return null;
  }
}

/* ---------- categories ---------- */

async function loadCategoryDocs() {
  try {
    const documents = await fetchCollection('categories');
    return Promise.all(
      documents.map(async (document, index) => {
        const data = fromFields(document.fields ?? {});
        const slug = document.name.split('/').pop();
        return {
          slug,
          name: typeof data.name === 'string' && data.name.trim() ? data.name.trim() : null,
          image: (await materializeImage(data.image)) || '',
          order: Number.isFinite(Number(data.order)) ? Number(data.order) : 1000 + index,
          hidden: data.hidden === true,
        };
      }),
    );
  } catch (error) {
    log(`Could not read categories (${error.message}) - using the committed categories.`);
    return [];
  }
}

function applyCategories(products, committedCategories, categoryDocs) {
  // slug -> { name, image, order, hidden }
  const meta = new Map();
  committedCategories.forEach((category, index) =>
    meta.set(category.slug, { name: category.name, image: category.image, order: index, hidden: false }),
  );
  for (const doc of categoryDocs) {
    const previous = meta.get(doc.slug);
    meta.set(doc.slug, {
      name: doc.name ?? previous?.name ?? doc.slug,
      image: doc.image || previous?.image || '',
      order: doc.order,
      hidden: doc.hidden,
    });
  }

  const visibleProducts = [];
  for (const product of products) {
    const found = meta.get(product.category.slug);
    if (found?.hidden) continue; // hiding a category hides its products too
    if (!found) {
      meta.set(product.category.slug, {
        name: product.category.name,
        image: product.image,
        order: 5000 + meta.size,
        hidden: false,
      });
    }
    visibleProducts.push({
      ...product,
      category: { slug: product.category.slug, name: meta.get(product.category.slug).name },
    });
  }

  const counts = new Map();
  const firstImage = new Map();
  for (const product of visibleProducts) {
    counts.set(product.category.slug, (counts.get(product.category.slug) ?? 0) + 1);
    if (!firstImage.has(product.category.slug)) firstImage.set(product.category.slug, product.image);
  }

  const categories = [...meta.entries()]
    .filter(([slug, value]) => !value.hidden && (counts.get(slug) ?? 0) > 0)
    .sort((a, b) => a[1].order - b[1].order || a[1].name.localeCompare(b[1].name))
    .map(([slug, value]) => ({
      slug,
      image: value.image || firstImage.get(slug) || '',
      name: value.name,
      count: counts.get(slug),
    }));

  return { products: visibleProducts, categories };
}

/* ---------- site settings ---------- */

const SITE_KEYS = [
  'name', 'shortName', 'tagline', 'description', 'phone', 'phoneDigits', 'whatsappDigits',
  'email', 'facebook', 'instagram', 'address', 'announcements', 'navLinks',
  'footerServiceLinks', 'footerAboutLinks', 'footerBottomLinks',
];

async function syncSiteSettings() {
  try {
    const document = await fetchDocument('settings/site');
    if (!document) {
      log('No saved site settings yet - using the defaults.');
      return;
    }
    const data = fromFields(document.fields ?? {});
    const settings = {};
    for (const key of SITE_KEYS) if (data[key] != null) settings[key] = data[key];
    await writeJson('data/site-settings.json', settings);
    log(`Synced site settings (${Object.keys(settings).length} fields).`);
  } catch (error) {
    log(`Could not read site settings (${error.message}) - using the defaults.`);
  }
}

/* ---------- pages ---------- */

const PAGE_KEYS = ['title', 'subtitle', 'updated', 'sections', 'steps'];

async function syncPages() {
  try {
    const documents = await fetchCollection('pages');
    const pages = {};
    for (const document of documents) {
      const slug = document.name.split('/').pop();
      const data = fromFields(document.fields ?? {});
      const page = {};
      for (const key of PAGE_KEYS) if (data[key] != null) page[key] = data[key];
      pages[slug] = page;
    }
    await writeJson('data/pages.json', pages);
    log(`Synced ${Object.keys(pages).length} edited page(s).`);
  } catch (error) {
    log(`Could not read pages (${error.message}) - using the original page text.`);
  }
}

/* ---------- run ---------- */

try {
  const committedProducts = await readJson('data/products.json');
  const committedCategories = await readJson('data/categories.json');

  const fromDatabase = await loadProducts();
  const categoryDocs = await loadCategoryDocs();
  const result = applyCategories(fromDatabase ?? committedProducts, committedCategories, categoryDocs);

  if (result.products.length === 0) {
    log('Nothing would be left on the store (everything hidden?) - keeping the committed content.');
  } else {
    await writeJson('data/products.json', result.products);
    await writeJson('data/categories.json', result.categories);
    log(
      `Synced ${result.products.length} products, ${result.categories.length} categories, ` +
        `${writtenImages} admin photos.`,
    );
  }
  await syncSiteSettings();
  await syncPages();
} catch (error) {
  log(`Sync stopped (${error instanceof Error ? error.message : error}) - keeping the committed content.`);
}
