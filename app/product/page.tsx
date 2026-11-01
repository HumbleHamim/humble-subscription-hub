import type { Metadata } from 'next';
import { categories, getPhysicalProducts } from '@/lib/data';
import { CatalogPage } from '@/components/product/CatalogPage';

export const metadata: Metadata = {
  title: 'All Products',
  description:
    'Browse earbuds, neckbands, power banks, chargers, cables, headphones and accessories at Humble Subscription Hub.',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = getPhysicalProducts();
  const physicalCategories = categories.filter((category) => category.slug !== 'subscriptions');

  return (
    <CatalogPage
      title="All Products"
      subtitle="Browse our catalog of physical goods curated for you."
      products={products}
      categories={physicalCategories}
      initialSearch={q ?? ''}
      allLabel="All Products"
    />
  );
}
