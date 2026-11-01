import fs from 'node:fs';
import path from 'node:path';

const STORE = 'https://dopaminedropsbd.com';
const TEMP = 'C:/Users/GIGABYTE/AppData/Local/Temp/opencode';
const root = process.cwd();
const dataDir = path.join(root, 'data');
const uploadsDir = path.join(root, 'public', 'uploads');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

function cleanText(value = '') {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s*।\s*/g, ' | ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readTemp(file) {
  const buffer = fs.readFileSync(path.join(TEMP, file));
  const text = buffer.toString('utf8');
  // PowerShell redirection writes UTF-16LE; detect the NUL pattern and decode it.
  if (text.includes('\u0000')) return buffer.toString('utf16le');
  return text;
}

function extractSlugs(file) {
  const html = readTemp(file);
  const slugs = new Set();
  for (const match of html.matchAll(/href="\/product\/([a-zA-Z0-9][a-zA-Z0-9-_]*)"/g)) {
    if (match[1] !== 'category') slugs.add(match[1]);
  }
  return [...slugs];
}

function extractCategories() {
  const html = readTemp('rendered-home.html');
  const categories = [];
  const re = /<a class="group relative[^"]*" href="\/product\/category\/([^"]+)"><img src="([^"]+)"[^>]*>[\s\S]*?<h3[^>]*>([^<]+)<\/h3><p[^>]*>(\d+)[\s\S]*?products<\/p>/g;
  for (const match of html.matchAll(re)) {
    categories.push({
      slug: match[1],
      image: match[2],
      name: cleanText(match[3]),
      count: Number(match[4]),
    });
  }
  return categories;
}

function extractProductObject(html) {
  const marker = '\\"product\\":{';
  const start = html.indexOf(marker);
  if (start === -1) return null;
  const rec = html.indexOf(',\\"recommended\\":', start);
  if (rec === -1) return null;
  const raw = html.slice(start + marker.length - 1, rec);
  const unescaped = JSON.parse('"' + raw + '"');
  return JSON.parse(unescaped);
}

async function fetchProduct(slug) {
  const response = await fetch(`${STORE}/product/${slug}`);
  if (!response.ok) throw new Error(`${slug}: HTTP ${response.status}`);
  const html = await response.text();
  const product = extractProductObject(html);
  if (!product) throw new Error(`${slug}: product object not found`);
  return { product, html };
}

function extractDisplayedRating(html) {
  const planIndex = html.indexOf('Choose Plan');
  const scope = planIndex > 0 ? html.slice(0, planIndex) : html;
  const reviewIndex = scope.lastIndexOf('reviews</span>');
  if (reviewIndex === -1) return { rating: 0, reviewsCount: 0 };
  const text = cleanText(scope.slice(Math.max(0, reviewIndex - 700), reviewIndex + 20));
  const match = text.match(/(\d+(?:\.\d+)?)\s+(\d+)\s+reviews/);
  return match
    ? { rating: Number(match[1]), reviewsCount: Number(match[2]) }
    : { rating: 0, reviewsCount: 0 };
}

async function downloadImage(remotePath) {
  if (!remotePath || !remotePath.startsWith('/uploads/')) return remotePath;
  const fileName = path.basename(remotePath);
  const dest = path.join(uploadsDir, fileName);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return `/uploads/${fileName}`;
  const response = await fetch(STORE + remotePath);
  if (!response.ok) {
    console.warn('image failed', remotePath, response.status);
    return remotePath;
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  return `/uploads/${fileName}`;
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

const productSlugs = [...new Set([...extractSlugs('rendered-products.html'), ...extractSlugs('rendered-subs.html')])];
const categories = extractCategories();
console.log(`Slugs: ${productSlugs.length}; categories: ${categories.length}`);

const rawProducts = [];
await mapLimit(productSlugs, 6, async (slug, index) => {
  try {
    const { product, html } = await fetchProduct(slug);
    product.displayedRating = extractDisplayedRating(html);
    rawProducts[index] = product;
    console.log(`[${index + 1}/${productSlugs.length}] ${slug}`);
  } catch (error) {
    console.error(String(error));
  }
});

const savedProducts = rawProducts.filter(Boolean);
const imagePaths = new Set();
for (const category of categories) imagePaths.add(category.image);
for (const product of savedProducts) {
  imagePaths.add(product.image);
  for (const item of product.gallery ?? []) imagePaths.add(item.imageUrl);
}

console.log(`Downloading ${imagePaths.size} images...`);
const imageMap = new Map();
await mapLimit([...imagePaths], 8, async (remotePath) => {
  const localPath = await downloadImage(remotePath);
  imageMap.set(remotePath, localPath);
});
console.log('Images done');

function localize(value) {
  return imageMap.get(value) ?? value;
}

const products = savedProducts.map((product) => {
  const galleryById = new Map((product.gallery ?? []).map((item) => [item.id, item.imageUrl]));
  const variations = (product.variationTypes ?? [])
    .map((type) => ({
      name: type.name,
      options: (type.variations ?? [])
        .filter((variant) => variant.isActive !== false)
        .map((variant) => ({
          label: variant.label,
          price: Number(variant.price),
          comparePrice: variant.comparePrice == null ? null : Number(variant.comparePrice),
          stock: Number(variant.stock ?? 0),
          image: localize(galleryById.get(variant.galleryLinks?.[0]?.galleryImageId) ?? ''),
        })),
    }))
    .filter((type) => type.options.length > 0);

  const allOptions = variations.flatMap((type) => type.options);
  const variantPrice = allOptions.length ? Math.min(...allOptions.map((option) => option.price)) : null;
  const variantCompare = allOptions.find((option) => option.price === variantPrice)?.comparePrice ?? null;
  const planPrice = product.pricingOptions?.length
    ? Math.min(...product.pricingOptions.map((option) => Number(option.price)))
    : null;

  const reviewList = (product.reviews ?? []).map((review) => ({
    rating: Number(review.rating),
    comment: cleanText(review.comment),
    userName: review.userName || 'Customer',
    createdAt: review.createdAt,
  }));

  return {
    id: product.id,
    slug: product.slug,
    name: cleanText(product.name),
    description: (product.description ?? '').trim(),
    image: localize(product.image),
    gallery: [...new Set([product.image, ...(product.gallery ?? []).map((item) => item.imageUrl)])]
      .filter(Boolean)
      .map(localize),
    isPhysicalProduct: Boolean(product.isPhysicalProduct),
    stock: allOptions.length ? allOptions.reduce((sum, option) => sum + option.stock, 0) : (product.stock ?? 0),
    rating: reviewList.length
      ? Math.round((reviewList.reduce((sum, review) => sum + review.rating, 0) / reviewList.length) * 10) / 10
      : 0,
    reviewsCount: reviewList.length,
    price: variantPrice ?? planPrice ?? 0,
    comparePrice: variantCompare,
    tag: product.tag ?? null,
    youtubeVideoUrl: product.youtubeVideoUrl ?? null,
    category: {
      name: product.category?.name ?? 'Uncategorized',
      slug: product.category?.slug ?? 'uncategorized',
    },
    features: (product.features ?? []).map((feature) => cleanText(feature.text)).filter(Boolean),
    pricingOptions: (product.pricingOptions ?? []).map((option) => ({
      type: option.type,
      price: Number(option.price),
      durationDays: Number(option.durationDays ?? 0),
    })),
    variations,
    reviews: reviewList,
  };
});

const normalizedCategories = categories.map((category) => ({
  ...category,
  image: localize(category.image),
  count: products.filter((product) => product.category.slug === category.slug).length || category.count,
}));

for (const [slug, name] of [
  ['phone-cases', 'Phone Cases'],
  ['portable-fans', 'Portable Fans'],
]) {
  if (normalizedCategories.some((category) => category.slug === slug)) continue;
  const product = products.find((item) => item.category.slug === slug);
  if (!product) continue;
  normalizedCategories.push({
    slug,
    name,
    image: product.image,
    count: products.filter((item) => item.category.slug === slug).length,
  });
}

fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(normalizedCategories, null, 2));
console.log(`Saved ${products.length} products and ${normalizedCategories.length} categories`);
