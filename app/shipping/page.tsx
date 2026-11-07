import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const metadata: Metadata = {
  title: 'Shipping & Delivery',
  description:
    'Delivery timelines, charges and coverage for orders shipped by Humble Subscription Hub.',
};

export default function ShippingPage() {
  return (
    <ContentPage
      pageKey="shipping"
      title="Shipping & Delivery"
      subtitle="Clear timelines and charges — no surprises at the door."
      updated="1 November 2026"
      sections={[
        {
          heading: 'Delivery charges',
          paragraphs: [
            'Delivery is calculated at checkout based on your district and cart total. Orders of ৳3,000 or more ship free anywhere in Bangladesh.',
          ],
          bullets: [
            'Inside Dhaka: ৳60',
            'Outside Dhaka: ৳120',
            'Free delivery on orders over ৳3,000',
            'Digital subscriptions: no delivery charge',
          ],
        },
        {
          heading: 'Timelines',
          paragraphs: [
            'Physical orders are packed within a few hours of confirmation and handed to our delivery partner the same day where possible.',
          ],
          bullets: [
            'Inside Dhaka: 1–2 business days',
            'Outside Dhaka: 2–4 business days',
            'Digital subscriptions: 15–30 minutes after payment verification',
            'Custom or bulk orders: timeline confirmed on WhatsApp',
          ],
        },
        {
          heading: 'Order tracking',
          paragraphs: [
            'You will receive a confirmation call or WhatsApp message once your order is confirmed. Tracking details are shared when the parcel leaves our warehouse.',
            'You can also review your order history any time from your profile page.',
          ],
        },
        {
          heading: 'Failed deliveries',
          paragraphs: [
            'If nobody is available to receive the parcel, the rider will call the number you provided. After two failed attempts the order is returned to us and a re-delivery charge may apply.',
            'Please double-check your phone number and address at checkout — most delivery delays come from incomplete addresses.',
          ],
        },
        {
          heading: 'Damaged or missing items',
          paragraphs: [
            'Inspect your parcel in front of the rider where possible. If something is damaged or missing, message us within 48 hours with photos and we will arrange a replacement or refund.',
          ],
        },
      ]}
    />
  );
}
