import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export type ContentSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export function ContentPage({
  title,
  subtitle,
  updated,
  sections,
  children,
}: {
  title: string;
  subtitle: string;
  updated?: string;
  sections?: ContentSection[];
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      <section className="relative overflow-hidden bg-[#141414] py-12 text-white sm:py-16">
        <div className="site-container relative">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2 text-[11px] font-semibold text-[#8c8c8c]"
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
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#a3a3a3] sm:text-base">
            {subtitle}
          </p>
          {updated ? (
            <p className="mt-4 inline-flex rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#c4c4c4]">
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
                    <h2 className="mb-2.5 flex items-baseline gap-2 text-base font-black tracking-tight text-[#141414] sm:text-lg">
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
