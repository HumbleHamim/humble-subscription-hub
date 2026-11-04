import Link from 'next/link';
import { site } from '@/lib/constants';

export function Logo({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const primary = variant === 'dark' ? 'text-[#1b1e1d]' : 'text-white';
  const secondary = variant === 'dark' ? 'text-[#868d8a]' : 'text-[#a0a7a4]';

  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className="group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-theme-primary"
    >
      <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[13px] bg-[#1b1e1d] shadow-[0_4px_14px_-6px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:-rotate-3 sm:size-11">
        <svg viewBox="0 0 44 44" className="size-full" aria-hidden="true">
          <rect width="44" height="44" rx="13" fill="#1b1e1d" />
          <path
            d="M24.6 7.5 13.4 24.3h7.2l-1.2 12.2 11.2-16.8h-7.2l1.2-12.2Z"
            fill="#6dbb90"
          />
          <circle cx="33.5" cy="10.5" r="2" fill="#a8dcc0" opacity="0.75" />
        </svg>
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`text-[17px] font-black tracking-tight sm:text-lg ${primary}`}>
          HUMBLE
        </span>
        <span className={`mt-1 text-[7.5px] font-extrabold uppercase tracking-[0.22em] sm:text-[8px] ${secondary}`}>
          Subscription Hub
        </span>
      </span>
    </Link>
  );
}
