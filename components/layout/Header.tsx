'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Heart,
  LogIn,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { categories } from '@/lib/data';
import { navLinks, site } from '@/lib/constants';
import { useStore } from '@/components/store/StoreProvider';
import { Logo } from '@/components/ui/Logo';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, wishlist, hydrated, user } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setDrawerOpen(false);
    setMegaOpen(false);
    setMobileSearch(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/product?q=${encodeURIComponent(value)}` : '/product');
    setMobileSearch(false);
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        <div className="header-blur absolute inset-0 -z-10 h-full w-full" />
        <div className="site-container relative flex h-16 items-center gap-4 md:h-[72px]">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="-ml-2 block shrink-0 rounded-lg p-2 text-[#1b253c] transition-colors hover:text-theme-primary focus-visible:outline-2 focus-visible:outline-theme-primary lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-6 lg:static lg:translate-x-0 lg:gap-7 xl:gap-8">
            <Logo />
            <nav className="hidden h-[72px] items-center gap-6 lg:flex xl:gap-7">
              {navLinks.map((link) =>
                link.label === 'PRODUCTS' ? (
                  <div
                    key={link.href}
                    className="relative flex h-full items-center"
                    onMouseEnter={() => setMegaOpen(true)}
                    onMouseLeave={() => setMegaOpen(false)}
                    onFocus={() => setMegaOpen(true)}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setMegaOpen(false);
                      }
                    }}
                  >
                    <Link
                      href={link.href}
                      className={`group relative flex h-full items-center whitespace-nowrap text-[12px] font-extrabold tracking-wider transition-colors duration-200 ${
                        isActive(link.href)
                          ? 'text-theme-primary'
                          : 'text-[#1b253c] hover:text-theme-primary'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className="ml-1 h-3 w-3" />
                      <span
                        className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-theme-primary transition-transform duration-200 ${
                          isActive(link.href) ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </Link>
                    {megaOpen ? (
                      <div className="absolute left-1/2 top-[calc(100%-10px)] w-[620px] -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_24px_60px_-20px_rgba(27,37,60,0.35)]">
                        <div className="grid grid-cols-2 gap-1">
                          {categories.map((category) => (
                            <Link
                              key={category.slug}
                              href={`/product/category/${category.slug}`}
                              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-bold text-[#1b253c] transition-colors hover:bg-gray-50 hover:text-theme-primary"
                            >
                              <span>{category.name}</span>
                              <span className="text-[11px] font-semibold text-gray-400">
                                {category.count}
                              </span>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                          <span className="text-xs font-bold text-gray-500">
                            Everything in one place
                          </span>
                          <Link
                            href="/product"
                            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-theme-primary hover:text-theme-primary-dark"
                          >
                            Browse all <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group relative flex h-full items-center whitespace-nowrap text-[12px] font-extrabold tracking-wider transition-colors duration-200 ${
                      link.label === 'AURA LEADER BOARD'
                        ? 'text-amber-500 hover:text-amber-600'
                        : isActive(link.href)
                          ? 'text-theme-primary'
                          : 'text-[#1b253c] hover:text-theme-primary'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-theme-primary transition-transform duration-200 ${
                        isActive(link.href) ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </Link>
                ),
              )}
            </nav>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:gap-4">
            <form onSubmit={submitSearch} className="relative hidden min-w-0 flex-1 md:block md:max-w-56 lg:max-w-xs xl:max-w-sm">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                aria-label="Search products"
                placeholder="Search subscriptions, earbuds…"
                className="h-10 w-full rounded-full border border-gray-200 bg-white/80 pl-4 pr-11 text-[13px] font-medium text-[#1b253c] outline-none transition-all placeholder:text-gray-400 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#a6b0c3] transition-colors hover:text-theme-primary"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMobileSearch((open) => !open)}
              aria-label="Search"
              className="rounded-lg p-2 text-[#1b253c] transition-colors hover:text-theme-primary md:hidden"
            >
              <Search className="h-6 w-6" strokeWidth={1.5} />
            </button>

            <div className="flex items-center gap-3 lg:gap-4">
              <Link
                href={user ? '/profile' : '/login'}
                aria-label={user ? 'My profile' : 'Login'}
                className="group relative flex flex-col items-center gap-0.5 text-[#1b253c] transition-colors hover:text-theme-primary"
              >
                <User className="h-[22px] w-[22px]" strokeWidth={1.5} />
                <span className="hidden text-[10px] font-bold uppercase tracking-widest xl:block">
                  {user ? 'Account' : 'Login'}
                </span>
              </Link>

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="group relative flex flex-col items-center gap-0.5 text-[#1b253c] transition-colors hover:text-theme-primary"
              >
                <span className="relative">
                  <Heart className="h-[22px] w-[22px]" strokeWidth={1.5} />
                  {hydrated && wishlist.length > 0 ? (
                    <span className="absolute -right-2 -top-1.5 grid size-4 place-items-center rounded-full bg-theme-primary text-[9px] font-black text-white">
                      {wishlist.length}
                    </span>
                  ) : null}
                </span>
                <span className="hidden text-[10px] font-bold uppercase tracking-widest xl:block">
                  Wishlist
                </span>
              </Link>

              <Link
                href="/cart"
                aria-label="Cart"
                className="group relative flex flex-col items-center gap-0.5 text-[#1b253c] transition-colors hover:text-theme-primary"
              >
                <span className="relative">
                  <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.5} />
                  {hydrated && cartCount > 0 ? (
                    <span className="absolute -right-2 -top-1.5 grid size-4 place-items-center rounded-full bg-theme-primary text-[9px] font-black text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </span>
                <span className="hidden text-[10px] font-bold uppercase tracking-widest xl:block">
                  Cart
                </span>
              </Link>
            </div>
          </div>
        </div>

        {mobileSearch ? (
          <form onSubmit={submitSearch} className="border-t border-white/40 bg-white/80 px-4 py-2.5 backdrop-blur-xl md:hidden">
            <div className="relative">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="What are you looking for?"
                className="h-10 w-full rounded-full border border-gray-200 bg-white pl-4 pr-10 text-sm outline-none focus:border-theme-primary"
              />
              <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : null}
      </header>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          />
          <aside className="animate-drawer-in absolute inset-y-0 left-0 flex h-full w-[290px] max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-4">
              <Logo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-1.5 text-[#1b253c] transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Main Menu
              </p>
              <nav className="space-y-0.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex h-11 items-center rounded-xl px-3 text-sm font-bold transition-colors hover:bg-gray-50 ${
                      isActive(link.href) ? 'text-theme-primary' : 'text-[#1b253c]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-3 border-t border-gray-100 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoriesOpen((open) => !open)}
                  className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                >
                  Product Categories
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {categoriesOpen ? (
                  <div className="ml-3 space-y-0.5 border-l-2 border-gray-100 py-1">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/product/category/${category.slug}`}
                        className="block rounded-r-lg px-4 py-2.5 text-[13px] font-medium text-[#4a5568] transition-colors hover:bg-gray-50 hover:text-theme-primary"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-3 border-t border-gray-100 pt-2">
                <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Account
                </p>
                <nav className="space-y-0.5">
                  <Link
                    href={user ? '/profile' : '/login'}
                    className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[#1b253c] transition-colors hover:bg-gray-50"
                  >
                    <LogIn className="h-5 w-5 text-gray-400" />
                    {user ? 'My Profile' : 'Login'}
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[#1b253c] transition-colors hover:bg-gray-50"
                  >
                    <Heart className="h-5 w-5 text-gray-400" />
                    Wishlist
                  </Link>
                  <a
                    href={site.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[#1b253c] transition-colors hover:bg-gray-50"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-green-100 text-[10px] font-black text-green-600">
                      W
                    </span>
                    WhatsApp Support
                  </a>
                </nav>
              </div>
            </div>
            <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 p-4">
              <p className="text-center text-xs font-medium text-gray-500">
                © 2026 {site.name}
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
