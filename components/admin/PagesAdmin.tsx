'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/components/store/StoreProvider';
import { PublishPanel } from '@/components/admin/PublishPanel';
import { Card, Field, inputClass } from '@/components/admin/ui';
import { getPageDoc, resetPageDoc, savePageDoc, type PageDoc } from '@/lib/admin';
import { pageDefaults } from '@/lib/pages';

const PAGES = [
  { slug: 'about', name: 'About Us' },
  { slug: 'story', name: 'Our Story' },
  { slug: 'guide', name: 'How to Order' },
  { slug: 'shipping', name: 'Shipping & Delivery' },
  { slug: 'refund-policy', name: 'Refund Policy' },
  { slug: 'privacy', name: 'Privacy Policy' },
  { slug: 'terms', name: 'Terms & Conditions' },
] as const;

type SectionForm = { heading: string; paragraphs: string; bullets: string };
type Form = {
  title: string;
  subtitle: string;
  updated: string;
  sections: SectionForm[];
  steps: { title: string; text: string }[];
};

const toForm = (page: Partial<PageDoc> | undefined): Form => ({
  title: page?.title ?? '',
  subtitle: page?.subtitle ?? '',
  updated: page?.updated ?? '',
  sections: (page?.sections ?? []).map((section) => ({
    heading: section.heading,
    paragraphs: (section.paragraphs ?? []).join('\n\n'),
    bullets: (section.bullets ?? []).join('\n'),
  })),
  steps: (page?.steps ?? []).map((step) => ({ title: step.title, text: step.text })),
});

const splitParagraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
const splitLines = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

export function PagesAdmin() {
  const { notify } = useStore();
  const [slug, setSlug] = useState<string>(PAGES[0].slug);
  const [form, setForm] = useState<Form | null>(null);
  const [edited, setEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setForm(null);
    setError('');
    const original = pageDefaults[slug];
    getPageDoc(slug)
      .then((saved) => {
        if (cancelled) return;
        setEdited(Boolean(saved));
        setForm(toForm(saved ?? original));
      })
      .catch(() => {
        if (cancelled) return;
        setForm(toForm(original));
        notify('Could not read saved edits. Publish the latest Firestore rules.', 'error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function patch(next: Partial<Form>) {
    setForm((current) => (current ? { ...current, ...next } : current));
  }

  function patchSection(index: number, next: Partial<SectionForm>) {
    setForm((current) =>
      current
        ? { ...current, sections: current.sections.map((s, i) => (i === index ? { ...s, ...next } : s)) }
        : current,
    );
  }

  function moveSection(index: number, direction: -1 | 1) {
    setForm((current) => {
      if (!current) return current;
      const target = index + direction;
      if (target < 0 || target >= current.sections.length) return current;
      const sections = [...current.sections];
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...current, sections };
    });
  }

  async function onSave() {
    if (!form) return;
    if (!form.title.trim()) {
      setError('The page needs a title.');
      return;
    }
    if (form.sections.some((section) => !section.heading.trim())) {
      setError('Every section needs a heading. Remove empty sections.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const page: PageDoc = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        updated: form.updated.trim(),
        sections: form.sections.map((section) => ({
          heading: section.heading.trim(),
          paragraphs: splitParagraphs(section.paragraphs),
          bullets: splitLines(section.bullets),
        })),
        ...(slug === 'guide'
          ? { steps: form.steps.filter((step) => step.title.trim()).map((step) => ({ title: step.title.trim(), text: step.text.trim() })) }
          : {}),
      };
      await savePageDoc(slug, page);
      setEdited(true);
      notify('Saved. Tap Publish to website to put it live.', 'success');
    } catch {
      notify('Could not save. Check your connection and the Firestore rules.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function onReset() {
    if (!window.confirm('Remove your edits and go back to the original text of this page?')) return;
    setBusy(true);
    try {
      await resetPageDoc(slug);
      setEdited(false);
      setForm(toForm(pageDefaults[slug]));
      notify('Back to the original text. Publish to put it live.', 'success');
    } catch {
      notify('Could not reset the page.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <PublishPanel />
      <h2 className="mb-1 text-lg font-black text-[#1b1e1d]">Pages</h2>
      <p className="mb-4 text-sm text-slate-500">
        Edit the text of your information pages. Save, then tap <strong>Publish to website</strong>.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {PAGES.map((page) => (
          <button
            key={page.slug}
            type="button"
            onClick={() => setSlug(page.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              slug === page.slug ? 'bg-[#2f7d57] text-white' : 'border border-slate-300 text-slate-600'
            }`}
          >
            {page.name}
          </button>
        ))}
      </div>

      {!form ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          <p className="mb-3 text-xs text-slate-500">
            {edited ? 'This page has your edits.' : 'This page still has the original text.'}
          </p>

          <Card title="Top of the page">
            <Field label="Title">
              <input className={inputClass} value={form.title} onChange={(e) => patch({ title: e.target.value })} />
            </Field>
            <Field label="Subtitle">
              <textarea
                className={`${inputClass} min-h-20`}
                value={form.subtitle}
                onChange={(e) => patch({ subtitle: e.target.value })}
              />
            </Field>
            <Field label="“Last updated” date" hint="Leave empty to hide it. For example: 7 November 2026">
              <input className={inputClass} value={form.updated} onChange={(e) => patch({ updated: e.target.value })} />
            </Field>
          </Card>

          {slug === 'guide' ? (
            <Card title="Step cards" note="The numbered boxes at the top of the page.">
              {form.steps.map((step, index) => (
                <div key={index} className="grid gap-2 rounded-lg border border-slate-200 p-3">
                  <input
                    className={inputClass}
                    value={step.title}
                    placeholder="Step title"
                    onChange={(e) =>
                      patch({ steps: form.steps.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)) })
                    }
                  />
                  <textarea
                    className={`${inputClass} min-h-16`}
                    value={step.text}
                    placeholder="Short explanation"
                    onChange={(e) =>
                      patch({ steps: form.steps.map((s, i) => (i === index ? { ...s, text: e.target.value } : s)) })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => patch({ steps: form.steps.filter((_, i) => i !== index) })}
                    className="w-fit rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600"
                  >
                    Remove step
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => patch({ steps: [...form.steps, { title: '', text: '' }] })}
                className="w-fit rounded-full border border-slate-300 px-4 py-1.5 text-xs font-bold"
              >
                + Add step
              </button>
            </Card>
          ) : null}

          {form.sections.map((section, index) => (
            <Card key={index} title={`Section ${index + 1}`}>
              <Field label="Heading">
                <input
                  className={inputClass}
                  value={section.heading}
                  onChange={(e) => patchSection(index, { heading: e.target.value })}
                />
              </Field>
              <Field label="Text" hint="Leave an empty line between paragraphs.">
                <textarea
                  className={`${inputClass} min-h-32`}
                  value={section.paragraphs}
                  onChange={(e) => patchSection(index, { paragraphs: e.target.value })}
                />
              </Field>
              <Field label="Bullet points (optional)" hint="One per line.">
                <textarea
                  className={`${inputClass} min-h-20`}
                  value={section.bullets}
                  onChange={(e) => patchSection(index, { bullets: e.target.value })}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveSection(index, -1)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold disabled:opacity-30"
                >
                  ▲ Move up
                </button>
                <button
                  type="button"
                  disabled={index === form.sections.length - 1}
                  onClick={() => moveSection(index, 1)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold disabled:opacity-30"
                >
                  ▼ Move down
                </button>
                <button
                  type="button"
                  onClick={() => patch({ sections: form.sections.filter((_, i) => i !== index) })}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600"
                >
                  Remove section
                </button>
              </div>
            </Card>
          ))}

          <button
            type="button"
            onClick={() => patch({ sections: [...form.sections, { heading: '', paragraphs: '', bullets: '' }] })}
            className="mb-4 rounded-full border border-slate-300 px-4 py-1.5 text-xs font-bold"
          >
            + Add section
          </button>

          {error ? <p className="mb-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onSave()}
              className="rounded-full bg-[#2f7d57] px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy ? 'Working…' : 'Save page'}
            </button>
            {edited ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void onReset()}
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-bold disabled:opacity-50"
              >
                Back to original text
              </button>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
