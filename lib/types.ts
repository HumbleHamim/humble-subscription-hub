export type PricingOption = {
  type: string;
  price: number;
  durationDays: number;
};

export type VariationOption = {
  label: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  image: string;
};

export type VariationType = {
  name: string;
  options: VariationOption[];
};

export type Review = {
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  isPhysicalProduct: boolean;
  stock: number;
  rating: number;
  reviewsCount: number;
  price: number;
  comparePrice: number | null;
  tag: string | null;
  youtubeVideoUrl: string | null;
  category: {
    name: string;
    slug: string;
  };
  features: string[];
  pricingOptions: PricingOption[];
  variations: VariationType[];
  reviews: Review[];
};

export type Category = {
  slug: string;
  name: string;
  image: string;
  count: number;
};

export type CartItem = {
  key: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  optionLabel?: string;
  planLabel?: string;
  isPhysicalProduct: boolean;
};

export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    district: string;
    note?: string;
  };
  payment: string;
  status: string;
};

export type User = {
  name: string;
  email: string;
  phone?: string;
};
