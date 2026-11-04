import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Carousel } from '@/components/home/Carousel';
import { ProductCard } from '@/components/product/ProductCard';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function SubscriptionCarousel({ products }: { products: Product[] }) {
  return (
    <section id="products" className="scroll-mt-20 border-y border-gray-100 bg-gray-50/70 py-10 sm:py-12 lg:py-14">
      <div className="site-container">
        <SectionHeading title="Popular Subscriptions" />
        <Carousel label="popular subscriptions">
          {products.map((product) => (
            <li key={product.slug} className="carousel-item">
              <ProductCard product={product} variant="carousel" />
            </li>
          ))}
        </Carousel>
        <div className="mt-2 flex justify-center sm:mt-3">
          <Link
            href="/subscriptions"
            className="group inline-flex h-11 items-center gap-2 rounded-full border border-[#141414]/15 bg-white px-6 text-sm font-bold text-[#141414] shadow-sm transition duration-200 hover:border-[#141414] hover:bg-[#141414] hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
          >
            View All
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
        </div>
      </div>
    </section>
  );
}
