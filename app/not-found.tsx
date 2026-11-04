import Link from 'next/link';
import { ArrowLeft, Home, PackageSearch } from 'lucide-react';
import { categories } from '@/lib/data';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-gray-50/70 py-16">
      <div className="site-container">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-white text-theme-primary shadow-sm ring-1 ring-gray-100">
            <PackageSearch className="h-9 w-9" strokeWidth={1.6} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-theme-primary">
            Error 404
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1b1e1d] sm:text-4xl">
            This page went missing
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
            The link may be old, or the product could have sold out. Try one of these instead.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-theme-primary px-6 text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
            >
              <Home className="h-4 w-4" /> Back Home
            </Link>
            <Link
              href="/product"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#1b1e1d] px-6 text-xs font-extrabold uppercase tracking-wider text-[#1b1e1d] transition-colors hover:bg-[#1b1e1d] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Browse Products
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Popular categories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/product/category/${category.slug}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-[#1b1e1d] transition-colors hover:border-theme-primary hover:text-theme-primary"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
