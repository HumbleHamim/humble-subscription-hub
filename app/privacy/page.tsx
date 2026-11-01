import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What information Humble Subscription Hub collects, how it is used, and the control you have over it.',
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      subtitle="We collect only what we need to deliver your order, and we never sell your data."
      updated="1 November 2026"
      sections={[
        {
          heading: 'Information we collect',
          paragraphs: [
            'When you place an order we ask for your name, phone number, email and delivery address. For mobile payments we also receive the transaction ID you provide. For subscriptions we may need the account email associated with the service.',
          ],
          bullets: [
            'Contact details: name, phone, email',
            'Delivery details: address, city, district',
            'Order details: items, plan, amount, payment method',
            'Optional: order notes you choose to share',
          ],
        },
        {
          heading: 'How we use it',
          paragraphs: [
            'Your information is used to confirm orders, arrange delivery, activate subscriptions and provide support. We may contact you about an order by phone, WhatsApp or email.',
            'With your consent we may send occasional offers. You can opt out at any time by replying STOP or messaging support.',
          ],
        },
        {
          heading: 'Who we share it with',
          paragraphs: [
            'We share the minimum necessary with delivery partners to get your parcel to you. Payment information is handled by bKash, Nagad or your bank — we do not store card numbers.',
            'We do not sell, rent or trade personal information with advertisers or data brokers.',
          ],
        },
        {
          heading: 'This demo storefront',
          paragraphs: [
            'This build is a front-end demonstration. Cart, wishlist, account details and orders are stored in your browser localStorage only and are never transmitted to a server. Clearing your browser data removes them permanently.',
          ],
        },
        {
          heading: 'Your rights',
          paragraphs: [
            'You can ask us to correct or delete the information we hold about you. Contact support and we will action verified requests within 7 days, subject to legal record-keeping requirements.',
          ],
        },
        {
          heading: 'Cookies',
          paragraphs: [
            'We use essential browser storage to keep your cart and session working. No third-party advertising cookies are used in this demo.',
          ],
        },
      ]}
    />
  );
}
