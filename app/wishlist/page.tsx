'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useStore } from '@/components/store/StoreProvider';
import { products } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default function WishlistPage() {
  const { wishlist, hydrated } = useStore();
  const saved = products.filter((product) => wishlist.includes(product.slug));

  if (!hydrated) {
    return (
      <div className="site-container py-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-10 w-10" strokeWidth={1.5} />}
        title="Your Wishlist is Empty"
        description="Tap the heart on any product to save it here for later."
        action={
          <Link
            href="/product"
            className="inline-block rounded-lg bg-theme-primary px-8 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
          >
            Browse Products
          </Link>
        }
      />
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50/70 pb-16">
      <div className="site-container py-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-[#1b1e1d] md:text-3xl">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {saved.length} saved {saved.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
          {saved.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
