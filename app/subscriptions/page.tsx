import type { Metadata } from 'next';
import { categories, getSubscriptions } from '@/lib/data';
import { CatalogPage } from '@/components/product/CatalogPage';

export const metadata: Metadata = {
  title: 'All Subscriptions',
  description:
    'Netflix, Spotify, Canva Pro, YouTube Premium, Gemini AI, Crunchyroll and more premium subscriptions in Bangladesh.',
};

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = getSubscriptions();
  const subscriptionCategories = categories.filter((category) => category.slug === 'subscriptions');

  return (
    <CatalogPage
      title="All Subscriptions"
      subtitle="Browse our catalog of premium digital subscriptions curated for you."
      products={products}
      categories={subscriptionCategories}
      initialSearch={q ?? ''}
      allLabel="All Subscriptions"
      hideCategoryFilter
    />
  );
}
