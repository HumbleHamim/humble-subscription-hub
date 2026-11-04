import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getPopularProducts, getSubscriptions } from '@/lib/data';
import { CategoryCarousel } from '@/components/home/CategoryCarousel';
import { SubscriptionCarousel } from '@/components/home/SubscriptionCarousel';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { ProductCard } from '@/components/product/ProductCard';
import { SectionHeading } from '@/components/ui/SectionHeading';

export default function HomePage() {
  const subscriptions = getSubscriptions();
  const popularProducts = getPopularProducts(24);

  return (
    <div className="min-h-screen bg-white text-[#1b1e1d]">
      <CategoryCarousel />
      <SubscriptionCarousel products={subscriptions} />

      <section
        id="physical-products"
        className="scroll-mt-20 py-10 sm:py-12 lg:py-14"
      >
        <div className="site-container">
          <SectionHeading title="Popular Products" />
          <ul className="grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5 xl:gap-5">
            {popularProducts.map((product, index) => (
              <li
                key={product.slug}
                className={index >= 12 ? 'hidden sm:flex' : 'flex'}
              >
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-center sm:mt-8">
            <Link
              href="/product"
              aria-label="View all products"
              className="group inline-flex h-11 items-center gap-2 rounded-full border border-[#1b1e1d]/15 bg-white px-6 text-sm font-bold text-[#1b1e1d] shadow-sm transition duration-200 hover:border-[#1b1e1d] hover:bg-[#1b1e1d] hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
            >
              View All
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
          </div>
        </div>
      </section>

      <WhyChooseUs />
    </div>
  );
}
