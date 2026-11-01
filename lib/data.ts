import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import type { Category, Product } from '@/lib/types';

export const products = productsData as Product[];
export const categories = categoriesData as Category[];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getProductsByCategory(slug: string): Product[] {
  return products.filter((product) => product.category.slug === slug);
}

export function getSubscriptions(): Product[] {
  return products.filter((product) => !product.isPhysicalProduct);
}

export function getPhysicalProducts(): Product[] {
  return products.filter((product) => product.isPhysicalProduct);
}

export function getRelatedProducts(product: Product, limit = 10): Product[] {
  return products
    .filter((item) => item.category.slug === product.category.slug && item.slug !== product.slug)
    .slice(0, limit);
}

export function getPopularProducts(limit = 24): Product[] {
  return [...getPhysicalProducts()]
    .sort((a, b) => {
      const scoreA = a.comparePrice ? (a.comparePrice - a.price) / a.comparePrice : 0;
      const scoreB = b.comparePrice ? (b.comparePrice - b.price) / b.comparePrice : 0;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export function formatPrice(price: number): string {
  const hasDecimals = !Number.isInteger(price);
  return `৳${price.toLocaleString('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export const PLAN_META: Record<string, { label: string; months: number }> = {
  monthly: { label: '1 Month', months: 1 },
  threeMonth: { label: '3 Months', months: 3 },
  sixMonth: { label: '6 Months', months: 6 },
  yearly: { label: '1 Year', months: 12 },
};

export function planLabel(type: string): string {
  return PLAN_META[type]?.label ?? type;
}

export function planMonthlyPrice(type: string, price: number): number {
  const months = PLAN_META[type]?.months ?? 1;
  return Math.round(price / months);
}

export function discountPercent(product: Product): number | null {
  if (!product.comparePrice || product.comparePrice <= product.price) return null;
  return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
}
