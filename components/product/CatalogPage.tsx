'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, SlidersHorizontal, Search, X } from 'lucide-react';
import type { Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';

type SortValue = 'newest' | 'price-low' | 'price-high' | 'rating';

function CategoryButton({
  active,
  onClick,
  label,
  count,
  compact = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
          active
            ? 'bg-theme-primary text-white shadow-sm'
            : 'border border-gray-200 bg-white text-[#1b253c] hover:border-gray-300'
        }`}
      >
        {label} ({count})
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-left text-xs font-bold transition-all ${
        active
          ? 'bg-theme-primary text-white shadow-sm'
          : 'bg-gray-50 text-[#1b253c] hover:bg-gray-100'
      }`}
    >
      {label} ({count})
    </button>
  );
}

export function CatalogPage({
  title,
  subtitle,
  products,
  categories,
  initialSearch = '',
  initialCategory = 'all',
  allLabel = 'All Products',
  hideCategoryFilter = false,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  categories: Category[];
  initialSearch?: string;
  initialCategory?: string;
  allLabel?: string;
  hideCategoryFilter?: boolean;
}) {
  const [search, setSearch] = useState(initialSearch);

  // Static export: read ?q= in the browser instead of on the server.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setSearch(q);
  }, []);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortValue>('newest');
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);

    const result = products.filter((product) => {
      if (category !== 'all' && product.category.slug !== category) return false;
      if (term && !`${product.name} ${product.category.name}`.toLowerCase().includes(term)) {
        return false;
      }
      if (min !== null && !Number.isNaN(min) && product.price < min) return false;
      if (max !== null && !Number.isNaN(max) && product.price > max) return false;
      return true;
    });

    switch (sort) {
      case 'price-low':
        return [...result].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...result].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...result].sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
      default:
        return result;
    }
  }, [products, search, category, minPrice, maxPrice, sort]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      map.set(product.category.slug, (map.get(product.category.slug) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const visibleCategories = categories.filter((item) => counts.has(item.slug));
  const resetFilters = () => {
    setSearch('');
    setCategory(initialCategory);
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="hidden bg-gradient-to-r from-[#1b253c] to-[#2a3a5c] py-12 text-white md:block md:py-16">
        <div className="site-container space-y-3 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">{title}</h1>
          <p className="mx-auto max-w-xl text-sm font-medium text-gray-300 md:text-base">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="site-container mt-4 md:mt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-8">
          <div className="hidden space-y-6 lg:block">
            <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1b253c]">
                Search Catalog
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="What are you looking for?"
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-[#1b253c] outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/10"
                />
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={2.5} />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1b253c]">
                Price Range
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="Min"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-[#1b253c] outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/10"
                />
                <span className="shrink-0 text-xs font-bold text-gray-400">—</span>
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Max"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-[#1b253c] outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/10"
                />
              </div>
            </div>

            {!hideCategoryFilter ? (
              <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1b253c]">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2 lg:flex-col">
                  <CategoryButton
                    active={category === 'all'}
                    onClick={() => setCategory('all')}
                    label={allLabel}
                    count={products.length}
                  />
                  {visibleCategories.map((item) => (
                    <CategoryButton
                      key={item.slug}
                      active={category === item.slug}
                      onClick={() => setCategory(item.slug)}
                      label={item.name}
                      count={counts.get(item.slug) ?? 0}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 space-y-4 lg:space-y-6">
            <div className="space-y-3 lg:hidden">
              <h1 className="text-xl font-black uppercase tracking-tight text-[#1b253c]">{title}</h1>
              <div className="relative">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-[#1b253c] outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={2.5} />
              </div>
              {!hideCategoryFilter ? (
                <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
                  <CategoryButton
                    compact
                    active={category === 'all'}
                    onClick={() => setCategory('all')}
                    label={allLabel}
                    count={products.length}
                  />
                  {visibleCategories.map((item) => (
                    <CategoryButton
                      key={item.slug}
                      compact
                      active={category === item.slug}
                      onClick={() => setCategory(item.slug)}
                      label={item.name}
                      count={counts.get(item.slug) ?? 0}
                    />
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setMobileFilters((open) => !open)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-[#1b253c]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Price
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${mobileFilters ? 'rotate-180' : ''}`} />
              </button>
              {mobileFilters ? (
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-3">
                  <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="Min"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs outline-none focus:border-theme-primary"
                  />
                  <span className="text-xs font-bold text-gray-400">—</span>
                  <input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="Max"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs outline-none focus:border-theme-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    aria-label="Clear price filter"
                    className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex flex-row items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
              <div className="shrink-0 text-xs font-bold text-gray-500">
                <span className="hidden sm:inline">Showing </span>
                {filtered.length} of {products.length}
                <span className="hidden sm:inline"> items</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden shrink-0 text-xs font-bold text-[#1b253c] sm:inline">
                  Sort By:
                </span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortValue)}
                  aria-label="Sort products"
                  className="h-9 w-40 rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-[#1b253c] outline-none transition-all focus:border-theme-primary sm:w-48"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
                {filtered.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-gray-100 text-gray-300">
                  <Search className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-black text-[#1b253c]">No products found</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Try a different search term or widen your price range.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 inline-flex h-10 items-center rounded-lg bg-theme-primary px-5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
                >
                  Reset Filters
                </button>
              </div>
            )}

            <p className="pt-1 text-center text-xs text-gray-400">
              Looking for something specific?{' '}
              <Link href="/contact" className="font-bold text-theme-primary hover:underline">
                Message us
              </Link>{' '}
              and we will find it for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
