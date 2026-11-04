import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '@/lib/data';
import { Carousel } from '@/components/home/Carousel';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function CategoryCarousel() {
  return (
    <section id="categories" className="scroll-mt-20 py-10 sm:py-12 lg:py-14">
      <div className="site-container">
        <SectionHeading title="Explore Categories" />
        <Carousel label="categories">
          {categories.map((category) => (
            <li key={category.slug} className="carousel-item">
              <Link
                href={`/product/category/${category.slug}`}
                className="group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-2xl bg-[#141414] p-3 text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_-18px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-4"
              >
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-black/50"
                />
                <div className="relative flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="wrap-break-word line-clamp-2 text-xs font-black uppercase leading-tight tracking-wide sm:text-sm sm:tracking-wider">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-[11px] font-medium text-white/70">
                      {category.count} {category.count === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="hidden size-8 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition-colors duration-300 group-hover:bg-theme-primary sm:grid"
                  >
                    <ArrowUpRight className="size-4" strokeWidth={2.25} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
