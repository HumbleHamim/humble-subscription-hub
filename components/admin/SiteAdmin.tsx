'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/components/store/StoreProvider';
import { PublishPanel } from '@/components/admin/PublishPanel';
import { Card, Field, inputClass } from '@/components/admin/ui';
import { getSiteSettings, saveSiteSettings, type LinkItem, type SiteSettings } from '@/lib/admin';
import { announcements, footerAboutLinks, footerServiceLinks, navLinks, site } from '@/lib/constants';

/** What the store shows right now (defaults + anything already published). */
function currentSettings(): SiteSettings {
  return {
    name: site.name,
    shortName: site.shortName,
    tagline: site.tagline,
    description: site.description,
    phone: site.phone,
    phoneDigits: site.phoneHref.replace(/\D/g, ''),
    whatsappDigits: site.whatsapp.replace(/\D/g, ''),
    email: site.email,
    facebook: site.facebook,
    instagram: site.instagram,
    address: site.address,
    announcements: [...announcements],
    navLinks: navLinks.map((link) => ({ ...link })),
    footerServiceLinks: footerServiceLinks.map((link) => ({ ...link })),
    footerAboutLinks: footerAboutLinks.map((link) => ({ ...link })),
  };
}

const SAFE_HREF = /^(\/|https?:\/\/|mailto:|tel:)/i;

function validate(form: SiteSettings): string {
  if (!form.name.trim()) return 'The site name cannot be empty.';
  if (!/^https:\/\//i.test(form.facebook.trim())) return 'The Facebook link must start with https://';
  if (!/^https:\/\//i.test(form.instagram.trim())) return 'The Instagram link must start with https://';
  if (form.phoneDigits.replace(/\D/g, '').length < 8) return 'Enter the phone number with country code, e.g. 8801300741882.';
  if (form.whatsappDigits.replace(/\D/g, '').length < 8) return 'Enter the WhatsApp number with country code, e.g. 8801300741882.';
  if (form.announcements.filter((line) => line.trim()).length === 0) return 'Keep at least one announcement line.';
  for (const [title, list] of [
    ['Menu', form.navLinks],
    ['Customer service links', form.footerServiceLinks],
    ['About links', form.footerAboutLinks],
  ] as const) {
    if (list.length === 0) return `${title}: keep at least one link.`;
    for (const link of list) {
      if (!link.label.trim()) return `${title}: every link needs a label.`;
      if (!SAFE_HREF.test(link.href.trim())) {
        return `${title}: "${link.label}" needs a link starting with /, https://, mailto: or tel:`;
      }
    }
  }
  return '';
}

function LinkEditor({
  title,
  links,
  onChange,
}: {
  title: string;
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
}) {
  function setLink(index: number, patch: Partial<LinkItem>) {
    onChange(links.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }
  return (
    <div className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</span>
      {links.map((link, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input
            className={inputClass}
            value={link.label}
            onChange={(event) => setLink(index, { label: event.target.value })}
            placeholder="Label"
            aria-label={`${title} label ${index + 1}`}
          />
          <input
            className={inputClass}
            value={link.href}
            onChange={(event) => setLink(index, { href: event.target.value })}
            placeholder="/page or https://…"
            aria-label={`${title} link ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => onChange(links.filter((_, i) => i !== index))}
            className="rounded-lg border border-slate-300 px-3 text-sm font-bold text-red-600"
            aria-label={`Remove ${link.label || 'link'}`}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...links, { label: '', href: '/' }])}
        className="w-fit rounded-full border border-slate-300 px-4 py-1.5 text-xs font-bold"
      >
        + Add link
      </button>
    </div>
  );
}

export function SiteAdmin() {
  const { notify } = useStore();
  const [form, setForm] = useState<SiteSettings>(() => currentSettings());
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getSiteSettings()
      .then((stored) => {
        if (cancelled) return;
        if (stored) setForm((current) => ({ ...current, ...stored }));
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
        notify('Could not read saved settings. Publish the latest Firestore rules.', 'error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSave() {
    const problem = validate(form);
    setError(problem);
    if (problem) return;
    setSaving(true);
    try {
      await saveSiteSettings({
        ...form,
        name: form.name.trim(),
        shortName: form.shortName.trim() || form.name.trim(),
        announcements: form.announcements.map((line) => line.trim()).filter(Boolean),
        navLinks: form.navLinks.map((l) => ({ label: l.label.trim(), href: l.href.trim() })),
        footerServiceLinks: form.footerServiceLinks.map((l) => ({ label: l.label.trim(), href: l.href.trim() })),
        footerAboutLinks: form.footerAboutLinks.map((l) => ({ label: l.label.trim(), href: l.href.trim() })),
      });
      notify('Saved. Tap Publish to website to put it live.', 'success');
    } catch {
      notify('Could not save. Check your connection and the Firestore rules.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PublishPanel />
      <h2 className="mb-1 text-lg font-black text-[#1b1e1d]">Site settings</h2>
      <p className="mb-4 text-sm text-slate-500">
        Edit your store name, text, contact details and links. Save here, then tap{' '}
        <strong>Publish to website</strong> to put it live.
        {loaded ? '' : ' Loading saved settings…'}
      </p>

      <Card title="Store name and text">
        <Field label="Store name">
          <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Short name">
          <input className={inputClass} value={form.shortName} onChange={(e) => set('shortName', e.target.value)} />
        </Field>
        <Field label="Tagline">
          <input className={inputClass} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
        </Field>
        <Field label="Description" hint="Shown in the footer, on the login page and in Google results.">
          <textarea
            className={`${inputClass} min-h-24`}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
      </Card>

      <Card title="Contact and social links">
        <Field label="Phone (as shown)" hint="For example: +880 1300-741882">
          <input className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone for calls (digits)" hint="Country code first, no + or spaces: 8801300741882">
            <input
              className={inputClass}
              inputMode="numeric"
              value={form.phoneDigits}
              onChange={(e) => set('phoneDigits', e.target.value)}
            />
          </Field>
          <Field label="WhatsApp number (digits)" hint="Customers are sent to wa.me/ this number.">
            <input
              className={inputClass}
              inputMode="numeric"
              value={form.whatsappDigits}
              onChange={(e) => set('whatsappDigits', e.target.value)}
            />
          </Field>
        </div>
        <Field label="Email">
          <input className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Address">
          <input className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} />
        </Field>
        <Field label="Facebook page link" hint="Starts with https://">
          <input className={inputClass} value={form.facebook} onChange={(e) => set('facebook', e.target.value)} />
        </Field>
        <Field label="Instagram link" hint="Starts with https://">
          <input className={inputClass} value={form.instagram} onChange={(e) => set('instagram', e.target.value)} />
        </Field>
      </Card>

      <Card title="Announcement bar" note="These lines rotate at the very top of every page.">
        <div className="grid gap-2">
          {form.announcements.map((line, index) => (
            <div key={index} className="grid grid-cols-[1fr_auto] gap-2">
              <input
                className={inputClass}
                value={line}
                onChange={(e) =>
                  set(
                    'announcements',
                    form.announcements.map((item, i) => (i === index ? e.target.value : item)),
                  )
                }
                aria-label={`Announcement ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => set('announcements', form.announcements.filter((_, i) => i !== index))}
                className="rounded-lg border border-slate-300 px-3 text-sm font-bold text-red-600"
                aria-label={`Remove announcement ${index + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set('announcements', [...form.announcements, ''])}
            className="w-fit rounded-full border border-slate-300 px-4 py-1.5 text-xs font-bold"
          >
            + Add line
          </button>
        </div>
      </Card>

      <Card title="Menu and footer links" note="Labels are what visitors read. A link starts with / for a page on your site, or https:// for another site.">
        <LinkEditor title="Top menu" links={form.navLinks} onChange={(links) => set('navLinks', links)} />
        <LinkEditor
          title="Footer: Customer Service"
          links={form.footerServiceLinks}
          onChange={(links) => set('footerServiceLinks', links)}
        />
        <LinkEditor
          title="Footer: About"
          links={form.footerAboutLinks}
          onChange={(links) => set('footerAboutLinks', links)}
        />
      </Card>

      {error ? <p className="mb-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        disabled={saving}
        onClick={() => void onSave()}
        className="rounded-full bg-[#2f7d57] px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </section>
  );
}
