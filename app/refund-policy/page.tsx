import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const metadata: Metadata = {
  title: 'Return & Refund Policy',
  description:
    'How returns, replacements and refunds work at Humble Subscription Hub.',
};

export default function RefundPolicyPage() {
  return (
    <ContentPage
      title="Return & Refund Policy"
      subtitle="Fair, written in plain language, and applied the same way for every customer."
      updated="1 November 2026"
      sections={[
        {
          heading: 'Physical products',
          paragraphs: [
            'Physical products can be returned within 7 days of delivery if they are unused, in their original packaging and complete with all accessories. Contact us on WhatsApp before sending anything back.',
          ],
          bullets: [
            'Dead-on-arrival items are replaced at our cost.',
            'Manufacturer warranty applies where stated on the product page.',
            'Items damaged by misuse, water or unauthorised repair are not eligible.',
            'Return shipping is free when the fault is ours.',
          ],
        },
        {
          heading: 'Digital subscriptions',
          paragraphs: [
            'Subscriptions are activated immediately, so they cannot be returned once the plan is live on your account. However, if an activation fails or the service does not work as described, we will fix it or refund you in full.',
          ],
          bullets: [
            'Wrong account activated by us: corrected or refunded.',
            'Shared plan slot released by you: not refundable.',
            'Service discontinued by the provider: pro-rated refund.',
          ],
        },
        {
          heading: 'How refunds are issued',
          paragraphs: [
            'Approved refunds are sent back through the original payment method. bKash and Nagad refunds usually arrive within 24 hours; cash-on-delivery orders are refunded via mobile wallet or bank transfer.',
            'If you paid by card, refunds can take 5–10 business days depending on your bank.',
          ],
        },
        {
          heading: 'How to start a return',
          paragraphs: [
            'Message us on WhatsApp with your order ID and a short description of the issue. Add photos or a short video if the item is damaged. We will confirm eligibility and arrange pickup or replacement.',
          ],
        },
        {
          heading: 'Warranty claims',
          paragraphs: [
            'Products sold with an official warranty carry the warranty stated on the product page. Claims are processed with the brand service centre; we help coordinate the process and keep you updated.',
          ],
        },
      ]}
    />
  );
}
