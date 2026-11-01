import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'The terms that apply when you shop with Humble Subscription Hub.',
};

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms & Conditions"
      subtitle="By ordering from Humble Subscription Hub you agree to the terms below."
      updated="1 November 2026"
      sections={[
        {
          heading: 'Orders and acceptance',
          paragraphs: [
            'An order is an offer to buy. We confirm it after payment verification and stock check. If an item is unavailable we will contact you to offer an alternative, a delay or a full refund.',
            'Prices and availability can change without notice. The price shown at the time you place your order is the price that applies.',
          ],
        },
        {
          heading: 'Payments',
          paragraphs: [
            'We accept bKash, Nagad and cash on delivery. For mobile payments, the transaction ID you provide must match the amount and sender. Orders with unverifiable payments are held until resolved.',
            'All prices are in Bangladeshi Taka and include applicable taxes unless stated otherwise.',
          ],
        },
        {
          heading: 'Subscriptions',
          paragraphs: [
            'Subscription products are activated on the account details you provide. You are responsible for the accuracy of those details. Sharing or reselling access outside the purchased plan is not permitted and may result in termination without refund.',
            'Renewal reminders are a courtesy, not a guarantee. It is your responsibility to renew before your plan expires.',
          ],
        },
        {
          heading: 'Product information',
          paragraphs: [
            'We describe products as accurately as possible, including specifications and warranty details supplied by the manufacturer. Colours may differ slightly from photos due to lighting and screen settings.',
          ],
        },
        {
          heading: 'Limitation of liability',
          paragraphs: [
            'Our liability for any order is limited to the amount you paid for it. We are not liable for indirect losses such as lost data, lost income or missed deadlines arising from product failure or service interruption.',
          ],
        },
        {
          heading: 'Governing law',
          paragraphs: [
            'These terms are governed by the laws of Bangladesh. Any dispute will first be addressed through good-faith communication with our support team.',
          ],
        },
      ]}
    />
  );
}
