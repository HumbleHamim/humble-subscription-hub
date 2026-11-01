'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useStore } from '@/components/store/StoreProvider';
import { formatPrice } from '@/lib/data';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CartPage() {
  const { cart, hydrated, cartSubtotal, updateQuantity, removeFromCart, notify } = useStore();
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');

  const delivery = cartSubtotal >= 3000 ? 0 : 60;
  const total = Math.max(0, cartSubtotal + delivery - discount);

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === 'HUMBLE10') {
      const amount = Math.min(300, Math.round(cartSubtotal * 0.1));
      setDiscount(amount);
      setAppliedCode('HUMBLE10');
      notify(`Promo applied — ${formatPrice(amount)} off`);
    } else {
      notify('Invalid promo code', 'error');
    }
  };

  if (!hydrated) {
    return (
      <div className="site-container py-20">
        <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-10 w-10" strokeWidth={1.5} />}
        title="Your Cart is Empty"
        description="Browse our subscriptions and add something you love!"
        action={
          <Link
            href="/"
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#1b253c] md:text-3xl">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link
            href="/product"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors hover:text-theme-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Continue shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:gap-8">
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.key}
                className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:gap-5 sm:p-4"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="size-24 shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:size-28"
                >
                  <img src={item.image} alt={item.name} className="size-full object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${item.slug}`}
                        className="line-clamp-2 text-sm font-bold text-[#1b253c] transition-colors hover:text-theme-primary sm:text-[15px]"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                        {item.planLabel ? (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                            {item.planLabel}
                          </span>
                        ) : null}
                        {item.optionLabel ? <span>{item.optionLabel}</span> : null}
                        <span>{item.isPhysicalProduct ? 'Physical product' : 'Digital delivery'}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.key)}
                      aria-label={`Remove ${item.name}`}
                      className="shrink-0 rounded-lg p-2 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="grid size-8 place-items-center rounded-full text-gray-500 transition-colors hover:bg-gray-50 hover:text-theme-primary"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-black text-[#1b253c]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="grid size-8 place-items-center rounded-full text-gray-500 transition-colors hover:bg-gray-50 hover:text-theme-primary"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-gray-400">
                        {formatPrice(item.price)} each
                      </p>
                      <p className="text-base font-black text-[#1b253c]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                <Truck className="h-5 w-5 shrink-0 text-theme-primary" />
                <div>
                  <p className="text-xs font-bold text-[#1b253c]">Nationwide delivery</p>
                  <p className="text-[11px] text-gray-400">Free over ৳3,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-theme-primary" />
                <div>
                  <p className="text-xs font-bold text-[#1b253c]">Safe & secure</p>
                  <p className="text-[11px] text-gray-400">bKash, Nagad or cash on delivery</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#1b253c]">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-[#1b253c]">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="font-bold text-[#1b253c]">
                  {delivery === 0 ? 'Free' : formatPrice(delivery)}
                </span>
              </div>
              {discount > 0 ? (
                <div className="flex items-center justify-between text-green-600">
                  <span>Promo ({appliedCode})</span>
                  <span className="font-bold">-{formatPrice(discount)}</span>
                </div>
              ) : null}
              <div className="border-t border-dashed border-gray-200 pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-black uppercase tracking-wider text-[#1b253c]">
                    Total
                  </span>
                  <span className="text-2xl font-black text-theme-primary">{formatPrice(total)}</span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">Including all taxes</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <label
                htmlFor="promo"
                className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-500"
              >
                <Tag className="h-3.5 w-3.5" /> Promo code
              </label>
              <div className="flex gap-2">
                <input
                  id="promo"
                  value={promo}
                  onChange={(event) => setPromo(event.target.value)}
                  placeholder="HUMBLE10"
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs uppercase tracking-wider outline-none focus:border-theme-primary"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  className="h-9 shrink-0 rounded-lg bg-[#1b253c] px-4 text-xs font-bold text-white transition-colors hover:bg-theme-primary"
                >
                  Apply
                </button>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-theme-primary text-sm font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
            >
              Proceed to Checkout
            </Link>
            <p className="mt-3 text-center text-[11px] text-gray-400">
              Secure checkout · No hidden charges
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
