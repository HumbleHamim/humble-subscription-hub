import overridesJson from '@/data/pages.json';
import defaultsJson from '@/data/pages-defaults.json';

export type PageSection = { heading: string; paragraphs: string[]; bullets?: string[] };
export type PageStep = { title: string; text: string };
export type PageContent = {
  title: string;
  subtitle: string;
  updated?: string;
  sections: PageSection[];
  steps?: PageStep[];
};

/** The original page text (used to pre-fill the admin editor). */
export const pageDefaults = defaultsJson as unknown as Record<string, PageContent>;

const str = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);
const strList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.trim() !== '').map((v) => v.trim()) : [];

/**
 * Page text saved from the admin panel (data/pages.json, written at build time).
 * Returns only the parts that were edited, already cleaned, or undefined if nothing was saved.
 */
export function getPageOverride(slug: string): Partial<PageContent> | undefined {
  const raw = (overridesJson as Record<string, unknown>)[slug];
  if (!raw || typeof raw !== 'object') return undefined;
  const data = raw as Record<string, unknown>;
  const result: Partial<PageContent> = {};

  const title = str(data.title)?.trim();
  if (title) result.title = title;
  const subtitle = str(data.subtitle)?.trim();
  if (subtitle) result.subtitle = subtitle;
  if (typeof data.updated === 'string') result.updated = data.updated.trim();

  if (Array.isArray(data.sections)) {
    const sections = data.sections
      .map((item): PageSection | null => {
        if (!item || typeof item !== 'object') return null;
        const section = item as Record<string, unknown>;
        const heading = str(section.heading)?.trim();
        if (!heading) return null;
        const bullets = strList(section.bullets);
        return { heading, paragraphs: strList(section.paragraphs), ...(bullets.length ? { bullets } : {}) };
      })
      .filter((section): section is PageSection => section !== null);
    if (sections.length > 0) result.sections = sections;
  }

  if (Array.isArray(data.steps)) {
    const steps = data.steps
      .map((item): PageStep | null => {
        if (!item || typeof item !== 'object') return null;
        const step = item as Record<string, unknown>;
        const stepTitle = str(step.title)?.trim();
        return stepTitle ? { title: stepTitle, text: str(step.text)?.trim() ?? '' } : null;
      })
      .filter((step): step is PageStep => step !== null);
    if (steps.length > 0) result.steps = steps;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}
