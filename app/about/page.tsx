import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Humble Subscription Hub brings premium subscriptions and everyday tech to Bangladesh at honest prices.',
};

export default function AboutPage() {
  return (
    <ContentPage
      pageKey="about"
      title="About Us"
      subtitle="We make premium digital subscriptions and dependable everyday tech affordable for everyone in Bangladesh."
      sections={[
        {
          heading: 'Who we are',
          paragraphs: [
            'Humble Subscription Hub is a Dhaka-based store built around a simple belief: great entertainment, tools and gadgets should not come with a premium markup. We started with a handful of streaming plans and grew into a full catalog of digital subscriptions and everyday tech.',
            'Every order is handled by real people. From the moment you check out to the day your subscription renews, someone on our team is available to help.',
          ],
        },
        {
          heading: 'What we sell',
          paragraphs: [
            'Our catalog spans two sides of the same idea — things you enjoy and things you use every day.',
          ],
          bullets: [
            'Digital subscriptions: streaming, music, design, AI and productivity tools with instant activation.',
            'Everyday tech: earbuds, neckbands, headphones, power banks, chargers, cables, styluses and accessories.',
            'Genuine products sourced through authorised channels, checked before dispatch.',
          ],
        },
        {
          heading: 'How we work',
          paragraphs: [
            'We keep pricing transparent. The price you see is the price you pay, with delivery shown clearly at checkout and no surprise charges. Payments run through bKash, Nagad or cash on delivery.',
            'If something goes wrong, we fix it. Our refund and replacement policy is written in plain language so you always know where you stand.',
          ],
        },
        {
          heading: 'Why Humble',
          paragraphs: [
            'We are not trying to be the biggest store — just the one you come back to. That means honest advice, quick replies, fair prices and support that does not disappear after checkout.',
          ],
        },
      ]}
    />
  );
}
