import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getRelatedProducts, products } from '@/lib/data';
import { ProductDetail } from '@/components/product/ProductDetail';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description:
      product.description?.slice(0, 155) ||
      `Buy ${product.name} at Humble Subscription Hub with fast delivery across Bangladesh.`,
    openGraph: {
      title: product.name,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  let related = getRelatedProducts(product, 10);
  if (related.length === 0) {
    related = products.filter((item) => item.slug !== product.slug).slice(0, 5);
  }

  return <ProductDetail product={product} related={related} />;
}
