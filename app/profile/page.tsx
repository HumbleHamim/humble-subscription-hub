'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Heart,
  LogIn,
  LogOut,
  Package,
  Sparkles,
  Trophy,
  User as UserIcon,
} from 'lucide-react';
import { useStore } from '@/components/store/StoreProvider';
import { products, formatPrice } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

const tabs = ['Orders', 'Wishlist', 'Account'] as const;

export default function ProfilePage() {
  const router = useRouter();
  const { user, orders, wishlist, hydrated, authReady, logout } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>('Orders');

  const savedProducts = products.filter((product) => wishlist.includes(product.slug));

  const aura = useMemo(() => {
    const spent = orders.reduce((sum, order) => sum + order.total, 0);
    return Math.round(spent / 10) + orders.length * 25;
  }, [orders]);

  if (!hydrated || !authReady) {
    return (
      <div className="site-container py-20">
        <div className="mx-auto h-72 max-w-4xl animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon={<UserIcon className="h-10 w-10" strokeWidth={1.5} />}
        title="Please Sign In"
        description="Sign in to view your orders, wishlist and Aura points."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-theme-primary px-8 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
            >
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center rounded-lg border-2 border-[#141414] px-8 py-3 text-sm font-extrabold uppercase tracking-wider text-[#141414] transition-colors hover:bg-[#141414] hover:text-white"
            >
              Create Account
            </Link>
          </div>
        }
      />
    );
  }

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-[70vh] bg-gray-50/70 pb-16">
      <div className="site-container py-8 md:py-10">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="relative flex flex-col gap-4 bg-[#141414] p-6 text-white sm:flex-row sm:items-center sm:justify-between md:p-8">
            <div className="relative flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-theme-primary text-lg font-black text-white sm:size-16 sm:text-xl">
                {initials || 'HS'}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
                  My Account
                </p>
                <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">
                  {user.name}
                </h1>
                <p className="truncate text-xs text-[#a3a3a3]">{user.email}</p>
              </div>
            </div>
            <div className="relative flex flex-wrap items-center gap-2">
              <Link
                href="/aura-leaderboard"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-xs font-bold text-white transition-colors hover:bg-white/20"
              >
                <Trophy className="h-4 w-4 text-theme-primary" />
                View Leaderboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-xs font-bold text-white transition-colors hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <div className="p-4 text-center sm:p-5">
              <p className="text-xl font-black text-[#141414] sm:text-2xl">{orders.length}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Orders
              </p>
            </div>
            <div className="p-4 text-center sm:p-5">
              <p className="text-xl font-black text-[#141414] sm:text-2xl">{aura.toLocaleString()}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Aura
              </p>
            </div>
            <div className="p-4 text-center sm:p-5">
              <p className="text-xl font-black text-[#141414] sm:text-2xl">{wishlist.length}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Saved
              </p>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto p-3">
            {tabs.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`shrink-0 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                  tab === item
                    ? 'bg-[#141414] text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#141414]'
                }`}
              >
                {item}
                {item === 'Orders' && orders.length > 0 ? ` (${orders.length})` : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {tab === 'Orders' ? (
            orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-gray-100 text-gray-300">
                  <Package className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-black text-[#141414]">No orders yet</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Your placed orders will appear here with live status.
                </p>
                <Link
                  href="/product"
                  className="mt-5 inline-flex h-10 items-center rounded-lg bg-theme-primary px-5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-gray-100 pb-3">
                      <div>
                        <p className="text-sm font-black text-[#141414]">{order.id}</p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          · {order.payment}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-600">
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2.5">
                      {order.items.map((item) => (
                        <div key={item.key} className="flex items-center gap-3">
                          <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                            <img src={item.image} alt="" className="size-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-xs font-bold text-[#141414]">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {item.planLabel ?? item.optionLabel ?? 'Standard'} × {item.quantity}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-bold text-[#141414]">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-dashed border-gray-100 pt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Total
                      </span>
                      <span className="text-base font-black text-theme-primary">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}

          {tab === 'Wishlist' ? (
            savedProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-gray-100 text-gray-300">
                  <Heart className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-black text-[#141414]">Nothing saved yet</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Tap the heart on a product to keep it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
                {savedProducts.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            )
          ) : null}

          {tab === 'Account' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#141414]">
                  <UserIcon className="h-4 w-4 text-theme-primary" /> Personal Details
                </h2>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Full name
                    </dt>
                    <dd className="font-bold text-[#141414]">{user.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Email
                    </dt>
                    <dd className="font-bold text-[#141414]">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Phone
                    </dt>
                    <dd className="font-bold text-[#141414]">{user.phone || 'Not provided'}</dd>
                  </div>
                </dl>
                <p className="mt-4 rounded-xl bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-500">
                  Your account profile is synchronized with the Firebase project connected to this
                  environment. Cart and order history remain local until the commerce data stage.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#141414]">
                  <Sparkles className="h-4 w-4 text-theme-primary" /> Aura Summary
                </h2>
                <div className="rounded-2xl bg-[#141414] p-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
                    Total Aura
                  </p>
                  <p className="mt-1 text-3xl font-black text-theme-primary">
                    {aura.toLocaleString()}
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#a3a3a3]">
                    You earn 1 Aura for every ৳10 spent, plus 25 bonus Aura per order. Climb the
                    leaderboard for early access drops.
                  </p>
                </div>
                <Link
                  href="/aura-leaderboard"
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#141414] text-xs font-extrabold uppercase tracking-wider text-[#141414] transition-colors hover:bg-[#141414] hover:text-white"
                >
                  <Trophy className="h-4 w-4" /> See Leaderboard
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
