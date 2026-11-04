'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { discountPercent, formatPrice, planLabel } from '@/lib/data';
import { useStore } from '@/components/store/StoreProvider';
import { Rating } from '@/components/ui/Rating';

export function ProductCard({
  product,
  variant = 'grid',
}: {
  product: Product;
  variant?: 'grid' | 'carousel';
}) {
  const { addToCart, toggleWishlist, isWishlisted, hydrated } = useStore();
  const isSubscription = !product.isPhysicalProduct;
  const discount = discountPercent(product);
  const saved = hydrated && isWishlisted(product.slug);

  const handleAdd = () => {
    const plan = product.pricingOptions[0];
    const firstType = product.variations[0];
    const option = firstType?.options.reduce(
      (cheapest, current) => (current.price < cheapest.price ? current : cheapest),
      firstType.options[0],
    );
    addToCart({
      slug: product.slug,
      name: product.name,
      image: option?.image || product.image,
      price: plan?.price ?? option?.price ?? product.price,
      optionLabel: option && firstType ? `${firstType.name}: ${option.label}` : undefined,
      planLabel: plan ? planLabel(plan.type) : undefined,
      isPhysicalProduct: product.isPhysicalProduct,
    });
  };

  return (
    <div
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition duration-300 ease-out hover:-translate-y-1 hover:border-gray-200 hover:shadow-[0_18px_36px_-18px_rgba(0,0,0,0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        variant === 'carousel' ? 'rounded-2xl' : ''
      }`}
    >
      <Link
        href={`/product/${product.slug}`}
        aria-label={product.name}
        className="relative block aspect-square w-full overflow-hidden bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <div className="flex flex-col gap-1">
            {discount ? (
              <span className="rounded-full bg-[#ef4630] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                -{discount}%
              </span>
            ) : null}
            {!product.isPhysicalProduct ? (
              <span className="rounded-full bg-[#1b1e1d] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                Digital
              </span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(product.slug);
          }}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={saved}
          className={`absolute right-2.5 top-2.5 z-10 grid size-8 place-items-center rounded-full border shadow-sm backdrop-blur-sm transition-colors ${
            saved
              ? 'border-red-200 bg-white text-red-500'
              : 'border-white/60 bg-white/85 text-[#1b1e1d] hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} strokeWidth={2} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-theme-primary">
          {product.category.name}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className={`mt-1 min-h-9 text-[13px] font-bold leading-[18px] text-[#1b1e1d] transition-colors group-hover:text-theme-primary sm:min-h-10 sm:text-sm sm:leading-5 ${
            variant === 'grid' ? 'line-clamp-1 min-h-0' : 'line-clamp-2'
          }`}
        >
          {product.name}
        </Link>

        <div className="mt-1.5">
          <Rating rating={product.rating} count={product.reviewsCount} size="xs" />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            {product.comparePrice ? (
              <p className="text-[11px] font-semibold leading-none text-gray-400 line-through">
                {formatPrice(product.comparePrice)}
              </p>
            ) : null}
            <p
              className={`text-[15px] font-black leading-tight text-[#1b1e1d] sm:text-base ${
                product.comparePrice ? 'mt-1' : ''
              }`}
            >
              {formatPrice(product.price)}
              {isSubscription ? (
                <span className="ml-0.5 text-[11px] font-semibold text-gray-400 sm:text-xs">
                  /mo
                </span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1b1e1d]/[0.06] text-[#1b1e1d] transition-colors duration-300 hover:bg-theme-primary hover:text-white"
          >
            {isSubscription ? (
              <ShoppingBag className="h-4 w-4" strokeWidth={2} />
            ) : (
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
