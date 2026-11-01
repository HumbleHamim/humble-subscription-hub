'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Home, LayoutGrid, Sparkles, User } from 'lucide-react';
import { useStore } from '@/components/store/StoreProvider';

export function MobileNav() {
  const pathname = usePathname();
  const { cartCount, hydrated } = useStore();

  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/product', label: 'Products', icon: LayoutGrid },
    { href: '/subscriptions', label: 'Subs', icon: Sparkles },
    { href: '/wishlist', label: 'Saved', icon: Heart },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
      }}
      aria-label="Mobile navigation"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative flex h-[60px] flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors ${
                  active ? 'text-theme-primary' : 'text-[#6b7280]'
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.7} />
                  {item.href === '/wishlist' && hydrated && cartCount > 0 ? (
                    <span className="absolute -right-2 -top-1 size-1.5 rounded-full bg-theme-primary" />
                  ) : null}
                </span>
                {item.label}
                {active ? (
                  <span className="absolute top-0 h-0.5 w-6 rounded-full bg-theme-primary" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
