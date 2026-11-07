import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { getPageOverride } from '@/lib/pages';

export type ContentSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export function ContentPage({
  pageKey,
  title: titleProp,
  subtitle: subtitleProp,
  updated: updatedProp,
  sections: sectionsProp,
  children,
}: {
  /** Name used by the admin panel to save edits for this page. */
  pageKey?: string;
  title: string;
  subtitle: string;
  updated?: string;
  sections?: ContentSection[];
  children?: ReactNode;
}) {
  const override = pageKey ? getPageOverride(pageKey) : undefined;
  const title = override?.title ?? titleProp;
  const subtitle = override?.subtitle ?? subtitleProp;
  const updated = override?.updated !== undefined ? override.updated : updatedProp;
  const sections = override?.sections ?? sectionsProp;

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      <section className="relative overflow-hidden bg-[#1b1e1d] py-12 text-white sm:py-16">
        <div className="site-container relative">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2 text-[11px] font-semibold text-[#8b928f]"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white" aria-current="page">
              {title}
            </span>
          </nav>
          <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#a0a7a4] sm:text-base">
            {subtitle}
          </p>
          {updated ? (
            <p className="mt-4 inline-flex rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#c5cac8]">
              Last updated {updated}
            </p>
          ) : null}
        </div>
      </section>

      <div className="site-container mt-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
            {children}
            {sections?.length ? (
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <section key={section.heading} className={index === 0 ? '' : 'pt-1'}>
                    <h2 className="mb-2.5 flex items-baseline gap-2 text-base font-black tracking-tight text-[#1b1e1d] sm:text-lg">
                      <span className="text-theme-primary">{String(index + 1).padStart(2, '0')}</span>
                      {section.heading}
                    </h2>
                    <div className="space-y-2.5">
                      {section.paragraphs.map((paragraph, pIndex) => (
                        <p
                          key={pIndex}
                          className="text-sm leading-relaxed text-gray-600"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets?.length ? (
                      <ul className="mt-3 space-y-2">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex gap-2.5 text-sm leading-relaxed text-gray-600"
                          >
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-theme-primary" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm sm:flex-row">
            <p className="text-center text-xs text-gray-500 sm:text-left">
              Still have questions? Our team replies on WhatsApp within minutes.
            </p>
            <Link
              href="/contact"
              className="inline-flex h-10 shrink-0 items-center rounded-lg bg-theme-primary px-5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
