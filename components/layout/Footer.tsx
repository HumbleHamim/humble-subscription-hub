import Link from 'next/link';
import { categories } from '@/lib/data';
import { FacebookIcon, InstagramIcon } from '@/components/ui/SocialIcons';
import { footerAboutLinks, footerServiceLinks, site } from '@/lib/constants';
import { Logo } from '@/components/ui/Logo';

function WhatsAppIcon({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title} className="min-w-0 space-y-4">
      <h4 className="border-l-2 border-theme-primary pl-3 text-[11px] font-black uppercase tracking-widest text-white">
        {title}
      </h4>
      <ul className="space-y-1 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex rounded-sm py-1.5 text-[#8e9bb4] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary md:py-1"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const shopLinks = categories.slice(0, 8).map((category) => ({
    href: `/product/category/${category.slug}`,
    label: category.name,
  }));

  return (
    <footer className="bg-[#1b253c] text-[#8e9bb4]">
      <div className="site-container pb-40 pt-12 md:pb-24 md:pt-14 xl:pb-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] lg:gap-x-10">
          <div className="col-span-2 max-w-sm space-y-5 md:col-span-3 lg:col-span-1">
            <Logo variant="light" />
            <p className="text-sm leading-relaxed text-[#a6b0c3]">{site.description}</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={site.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition-colors duration-200 hover:border-theme-primary hover:bg-theme-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
              >
                <FacebookIcon className="h-[18px] w-[18px]" />
              </a>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition-colors duration-200 hover:border-theme-primary hover:bg-theme-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
              >
                <InstagramIcon className="h-[18px] w-[18px]" />
              </a>
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition-colors duration-200 hover:border-theme-primary hover:bg-theme-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
              >
                <WhatsAppIcon />
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e9bb4]">
                We accept
              </span>
              <span className="inline-flex h-7 items-center rounded-md bg-white px-2.5 text-[11px] font-black tracking-wide text-[#e2136e]">
                bKash
              </span>
              <span className="inline-flex h-7 items-center rounded-md bg-white px-2.5 text-[11px] font-black tracking-wide text-[#ec1c24]">
                Nagad
              </span>
            </div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Customer Service" links={footerServiceLinks} />
          <FooterColumn title="About" links={footerAboutLinks} />
        </div>

        <div className="mt-12 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-[#8e9bb4]">
            © 2026 <span className="font-semibold text-white">{site.name}</span>. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
            <li>
              <Link href="/privacy" className="inline-flex rounded-sm py-1.5 text-[#8e9bb4] transition-colors hover:text-white md:py-1">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="inline-flex rounded-sm py-1.5 text-[#8e9bb4] transition-colors hover:text-white md:py-1">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="inline-flex rounded-sm py-1.5 text-[#8e9bb4] transition-colors hover:text-white md:py-1">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
