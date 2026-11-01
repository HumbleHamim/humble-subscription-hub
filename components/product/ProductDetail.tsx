'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Heart,
  Package,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice, planLabel, planMonthlyPrice } from '@/lib/data';
import { useStore } from '@/components/store/StoreProvider';
import { ProductCard } from '@/components/product/ProductCard';
import { Rating } from '@/components/ui/Rating';

const tabs = ['Description', 'Reviews'] as const;

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted, hydrated } = useStore();
  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedPlan, setSelectedPlan] = useState(product.pricingOptions[0]?.type ?? '');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const type of product.variations) {
      const cheapest = type.options.reduce(
        (best, current) => (current.price < best.price ? current : best),
        type.options[0],
      );
      if (cheapest) initial[type.name] = cheapest.label;
    }
    return initial;
  });
  const [tab, setTab] = useState<(typeof tabs)[number]>('Description');

  const selectedVariant = useMemo(() => {
    for (const type of product.variations) {
      const label = selectedOptions[type.name];
      const option = type.options.find((item) => item.label === label);
      if (option) return option;
    }
    return null;
  }, [product.variations, selectedOptions]);

  const plan = product.pricingOptions.find((option) => option.type === selectedPlan);
  const price = plan?.price ?? selectedVariant?.price ?? product.price;
  const comparePrice = selectedVariant?.comparePrice ?? product.comparePrice;
  const stock = selectedVariant?.stock ?? product.stock;
  const saved = hydrated && isWishlisted(product.slug);
  const isSubscription = !product.isPhysicalProduct;
  const gallery = product.gallery.length ? product.gallery : [product.image];
  const description = product.description?.trim();
  const hasUsefulDescription = description && description.length > 40;
  const videoUrl = product.youtubeVideoUrl
    ? product.youtubeVideoUrl.replace('watch?v=', 'embed/').split('&')[0]
    : null;

  const currentLabel = plan
    ? planLabel(plan.type)
    : selectedVariant
      ? `${product.variations[0].name}: ${selectedVariant.label}`
      : '';

  const buildCartItem = () => ({
    slug: product.slug,
    name: product.name,
    image: selectedVariant?.image || product.image,
    price,
    optionLabel: selectedVariant
      ? product.variations
          .map((type) => `${type.name}: ${selectedOptions[type.name]}`)
          .join(' • ')
      : undefined,
    planLabel: plan ? planLabel(plan.type) : undefined,
    isPhysicalProduct: product.isPhysicalProduct,
  });

  const handleAdd = () => {
    addToCart(buildCartItem());
  };

  const handleBuyNow = () => {
    addToCart(buildCartItem());
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-white text-[#1b253c]">
      <div className="site-container hidden py-4 md:block">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="transition-colors hover:text-theme-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/product" className="transition-colors hover:text-theme-primary">
            Products
          </Link>
          <span>/</span>
          <span className="truncate font-semibold text-[#1b253c]" aria-current="page">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="site-container pb-10 pt-4 md:pt-0">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="flex gap-3">
            {gallery.length > 1 ? (
              <div className="flex w-16 shrink-0 flex-col gap-2">
                {gallery.slice(0, 5).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={activeImage === image}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                      activeImage === image
                        ? 'border-theme-primary shadow-md'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <img src={image} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
              <img
                src={activeImage}
                alt={product.name}
                className="size-full object-cover transition-opacity duration-300"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-widest text-theme-primary">
                {product.category.name}
              </span>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-[#1b253c] sm:text-3xl">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 pt-0.5">
                <Rating rating={product.rating} size="md" />
                {product.reviewsCount > 0 ? (
                  <span className="text-sm text-gray-400">
                    {product.rating.toFixed(1)} · {product.reviewsCount} reviews
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">No reviews yet</span>
                )}
              </div>
            </div>

            {product.features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.features.slice(0, 4).map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-[#1b253c] transition-colors hover:bg-theme-primary/10"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            ) : null}

            {stock > 0 && stock < 15 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                <span className="size-1.5 rounded-full bg-orange-500" />
                Only {stock} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                <span className="size-1.5 rounded-full bg-green-500" />
                In stock
              </span>
            )}

            {product.variations.map((type) => (
              <div key={type.name} className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1b253c]">
                  Choose {type.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {type.options.map((option) => {
                    const active = selectedOptions[type.name] === option.label;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() =>
                          setSelectedOptions((current) => ({
                            ...current,
                            [type.name]: option.label,
                          }))
                        }
                        className={`rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all ${
                          active
                            ? 'border-theme-primary bg-theme-primary/5 text-[#1b253c]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {product.pricingOptions.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1b253c]">
                  Choose Plan
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.pricingOptions.map((option) => {
                    const active = selectedPlan === option.type;
                    return (
                      <button
                        key={option.type}
                        type="button"
                        onClick={() => setSelectedPlan(option.type)}
                        className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                          active
                            ? 'border-theme-primary bg-theme-primary/5 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {planLabel(option.type)}
                          <span className="ml-1 normal-case tracking-normal text-gray-400">
                            ({formatPrice(planMonthlyPrice(option.type, option.price))}/month)
                          </span>
                        </span>
                        <span className="text-xl font-black text-[#1b253c]">
                          {formatPrice(option.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="glass-panel flex items-center justify-between rounded-2xl p-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {currentLabel || 'Your price'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-theme-primary">{formatPrice(price)}</span>
                  {comparePrice && comparePrice > price ? (
                    <span className="text-sm font-semibold text-gray-400 line-through">
                      {formatPrice(comparePrice)}
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleWishlist(product.slug)}
                aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={saved}
                className={`shrink-0 rounded-full border-2 p-3 transition-all duration-200 ${
                  saved
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-500'
                }`}
              >
                <Heart className={`h-6 w-6 ${saved ? 'fill-current' : ''}`} strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 rounded-xl border-2 border-theme-primary px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-theme-primary transition-all hover:bg-theme-primary hover:text-white hover:shadow-lg hover:shadow-theme-primary/25"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 rounded-xl bg-[#1b253c] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white transition-all hover:bg-theme-primary hover:shadow-lg hover:shadow-[#1b253c]/20"
              >
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: Zap, label: 'Instant delivery' },
                { icon: ShieldCheck, label: 'Genuine access' },
                { icon: Truck, label: 'Nationwide' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-1.5 rounded-xl bg-gray-50 p-3 text-center"
                  >
                    <Icon className="h-4 w-4 text-theme-primary" strokeWidth={1.8} />
                    <span className="text-[10px] font-bold text-gray-500">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="site-container pb-12">
        <div className="glass-panel mb-7 inline-flex max-w-full overflow-x-auto rounded-2xl p-1.5">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-wider transition-all duration-300 sm:px-7 ${
                tab === item
                  ? 'bg-[#1b253c] text-white shadow-md'
                  : 'text-gray-500 hover:text-[#1b253c]'
              }`}
            >
              {item}
              {item === 'Reviews' ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    tab === item ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {product.reviews.length}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {tab === 'Description' ? (
          <div className="glass-panel space-y-8 rounded-3xl p-6 md:p-10">
            {videoUrl ? (
              <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '16/9' }}>
                <iframe
                  src={videoUrl}
                  title="Product video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 size-full border-0"
                />
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-3 lg:col-span-2">
                <h2 className="text-lg font-black text-[#1b253c]">About this product</h2>
                <div className="space-y-2 text-sm leading-relaxed text-gray-600">
                  {hasUsefulDescription ? (
                    description.split('\n').filter(Boolean).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : (
                    <>
                      <p>
                        {product.name} is part of our hand-picked {product.category.name.toLowerCase()}{' '}
                        collection. Every item is checked before dispatch so you get exactly what you
                        ordered.
                      </p>
                      <p>
                        Order online with bKash or Nagad, or choose cash on delivery. Our team is
                        available on WhatsApp for any questions before and after your purchase.
                      </p>
                    </>
                  )}
                  <p>Thank you!</p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-[#1b253c]/10 bg-[#1b253c]/[0.04] p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#1b253c]">
                  What&apos;s Included
                </h3>
                <ul className="space-y-2.5">
                  {(product.features.length
                    ? product.features
                    : ['Checked before dispatch', 'Genuine product', 'Support via WhatsApp']
                  ).map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-theme-primary/10">
                        <Check className="h-3 w-3 text-theme-primary" strokeWidth={2.5} />
                      </span>
                      <span className="text-xs font-semibold text-[#1b253c]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-6 md:p-10">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-[#1b253c]">Customer Reviews</h2>
                <div className="mt-1 flex items-center gap-2">
                  <Rating rating={product.rating} size="md" />
                  <span className="text-sm text-gray-400">
                    {product.rating.toFixed(1)} out of 5 · {product.reviews.length} reviews
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5">
                <Package className="h-4 w-4 text-theme-primary" />
                <span className="text-xs font-bold text-gray-500">Verified purchases</span>
              </div>
            </div>

            {product.reviews.length > 0 ? (
              <div className="space-y-3">
                {product.reviews.map((review, index) => (
                  <div
                    key={`${review.userName}-${index}`}
                    className="rounded-2xl border border-gray-100 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-9 place-items-center rounded-full bg-[#1b253c] text-xs font-black text-white">
                          {review.userName.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-[#1b253c]">{review.userName}</p>
                          <p className="text-[10px] font-semibold text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <Rating rating={review.rating} size="sm" showEmpty={false} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center">
                <p className="text-sm font-bold text-[#1b253c]">No reviews yet</p>
                <p className="mt-1 text-xs text-gray-400">
                  Be the first to share your experience after ordering.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {related.length > 0 ? (
        <section className="border-t border-gray-100 bg-gray-50/70 py-10 sm:py-12">
          <div className="site-container">
            <div className="mb-5 flex flex-col items-center gap-2.5 text-center sm:mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-[#1b253c] sm:text-2xl">
                You May Also Like
              </h2>
              <span aria-hidden="true" className="h-[3px] w-10 rounded-full bg-theme-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {related.slice(0, 10).map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Link
                href={`/product/category/${product.category.slug}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#1b253c]/15 bg-white px-6 text-sm font-bold text-[#1b253c] shadow-sm transition hover:border-[#1b253c] hover:bg-[#1b253c] hover:text-white"
              >
                View More <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
