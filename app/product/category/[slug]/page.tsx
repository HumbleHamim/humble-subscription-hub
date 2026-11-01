import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  categories,
  getCategory,
  getPhysicalProducts,
  getProductsByCategory,
  getSubscriptions,
} from '@/lib/data';
import { CatalogPage } from '@/components/product/CatalogPage';

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: 'Category not found' };
  return {
    title: category.name,
    description: `Shop ${category.name.toLowerCase()} at Humble Subscription Hub. Genuine products, honest prices and nationwide delivery.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const category = getCategory(slug);
  if (!category) notFound();

  const isSubscriptionCategory = slug === 'subscriptions';
  const products = isSubscriptionCategory ? getSubscriptions() : getPhysicalProducts();
  const visibleCategories = isSubscriptionCategory
    ? categories.filter((item) => item.slug === 'subscriptions')
    : categories.filter((item) => item.slug !== 'subscriptions');
  const categoryProducts = getProductsByCategory(slug);

  return (
    <CatalogPage
      title={category.name}
      subtitle={
        isSubscriptionCategory
          ? 'Premium digital subscriptions with instant activation and genuine access.'
          : `Browse ${categoryProducts.length} ${category.name.toLowerCase()} hand-picked for you.`
      }
      products={products}
      categories={visibleCategories}
      initialSearch={q ?? ''}
      initialCategory={slug}
      allLabel={isSubscriptionCategory ? 'All Subscriptions' : 'All Products'}
      hideCategoryFilter={isSubscriptionCategory}
    />
  );
}
