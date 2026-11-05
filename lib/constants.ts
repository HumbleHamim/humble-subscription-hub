import siteOverridesJson from '@/data/site-settings.json';

export type NavLink = { href: string; label: string };

type SiteOverrides = Partial<{
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  phone: string;
  phoneDigits: string;
  whatsappDigits: string;
  email: string;
  facebook: string;
  instagram: string;
  address: string;
  announcements: string[];
  navLinks: NavLink[];
  footerServiceLinks: NavLink[];
  footerAboutLinks: NavLink[];
}>;

// Written at build time from the admin panel (data/site-settings.json). Empty = defaults below.
const overrides = siteOverridesJson as SiteOverrides;

const text = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;
const digits = (value: unknown): string => (typeof value === 'string' ? value.replace(/\D/g, '') : '');
const safeHref = (href: string): boolean => /^(\/|https?:\/\/|mailto:|tel:)/i.test(href);
const secureUrl = (value: unknown, fallback: string): string =>
  typeof value === 'string' && /^https:\/\//i.test(value.trim()) ? value.trim() : fallback;
const linkList = (value: unknown, fallback: NavLink[]): NavLink[] => {
  if (!Array.isArray(value)) return fallback;
  const clean = value
    .filter(
      (item): item is NavLink =>
        !!item &&
        typeof item.label === 'string' &&
        typeof item.href === 'string' &&
        item.label.trim() !== '' &&
        safeHref(item.href.trim()),
    )
    .map((item) => ({ label: item.label.trim(), href: item.href.trim() }));
  return clean.length > 0 ? clean : fallback;
};
const stringList = (value: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(value)) return fallback;
  const clean = value.filter((item): item is string => typeof item === 'string' && item.trim() !== '');
  return clean.length > 0 ? clean.map((item) => item.trim()) : fallback;
};

const siteDefaults = {
  name: 'Humble Subscription Hub',
  shortName: 'Humble',
  tagline: 'Premium subscriptions. Honest prices.',
  description:
    'Premium streaming, music, AI and productivity subscriptions at prices that make sense in Bangladesh. Genuine access, quick activation, easy bKash or Nagad payment, and real people ready to help.',
  phone: '+880 1300-741882',
  phoneHref: 'tel:+8801300741882',
  whatsapp: 'https://wa.me/8801300741882',
  email: 'hello@humblesubscriptions.com',
  facebook: 'https://www.facebook.com/',
  instagram: 'https://www.instagram.com/',
  address: 'Dhaka, Bangladesh',
};

const phoneDigits = digits(overrides.phoneDigits);
const whatsappDigits = digits(overrides.whatsappDigits);

export const site = {
  name: text(overrides.name, siteDefaults.name),
  shortName: text(overrides.shortName, siteDefaults.shortName),
  tagline: text(overrides.tagline, siteDefaults.tagline),
  description: text(overrides.description, siteDefaults.description),
  phone: text(overrides.phone, siteDefaults.phone),
  phoneHref: phoneDigits ? `tel:+${phoneDigits}` : siteDefaults.phoneHref,
  whatsapp: whatsappDigits ? `https://wa.me/${whatsappDigits}` : siteDefaults.whatsapp,
  email: text(overrides.email, siteDefaults.email),
  facebook: secureUrl(overrides.facebook, siteDefaults.facebook),
  instagram: secureUrl(overrides.instagram, siteDefaults.instagram),
  address: text(overrides.address, siteDefaults.address),
};

const announcementDefaults = [
  'ORDER TO INCREASE YOUR AURA 10,000+',
  'INSTANT ACTIVATION • 24/7 SUPPORT',
  'bKash & NAGAD ACCEPTED • NATIONWIDE DELIVERY',
];

const navLinkDefaults: NavLink[] = [
  { href: '/', label: 'HOME' },
  { href: '/subscriptions', label: 'SUBSCRIPTIONS' },
  { href: '/product', label: 'PRODUCTS' },
  { href: '/aura-leaderboard', label: 'AURA LEADER BOARD' },
];

export const footerShopLinks = [
  { href: '/product/category/subscriptions', label: 'Digital Subscriptions' },
  { href: '/product/category/earbuds', label: 'Earbuds' },
  { href: '/product/category/neckbands', label: 'Neckbands' },
  { href: '/product/category/powerbanks', label: 'Powerbanks' },
  { href: '/product/category/chargers', label: 'Chargers' },
  { href: '/product/category/cables', label: 'Cables' },
  { href: '/product/category/headphones', label: 'Headphones' },
  { href: '/product/category/stylus', label: 'Stylus' },
];

const footerServiceDefaults: NavLink[] = [
  { href: '/guide', label: 'How to Order' },
  { href: '/shipping', label: 'Shipping & Delivery' },
  { href: '/refund-policy', label: 'Return & Refund Policy' },
  { href: '/contact', label: 'Contact Us' },
];

const footerAboutDefaults: NavLink[] = [
  { href: '/about', label: 'About Us' },
  { href: '/story', label: 'Our Story' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
];

export const announcements = stringList(overrides.announcements, announcementDefaults);
export const navLinks = linkList(overrides.navLinks, navLinkDefaults);
export const footerServiceLinks = linkList(overrides.footerServiceLinks, footerServiceDefaults);
export const footerAboutLinks = linkList(overrides.footerAboutLinks, footerAboutDefaults);
