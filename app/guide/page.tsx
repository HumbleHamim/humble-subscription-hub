import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const metadata: Metadata = {
  title: 'How to Order',
  description:
    'A step-by-step guide to ordering subscriptions and products from Humble Subscription Hub.',
};

const steps = [
  {
    title: 'Pick your item',
    text: 'Browse subscriptions or products. Choose a plan or variant — the price updates instantly.',
  },
  {
    title: 'Add to cart',
    text: 'Use Add to Cart to keep browsing, or Buy Now to head straight to checkout.',
  },
  {
    title: 'Enter details',
    text: 'Give us your name, phone and delivery address. For subscriptions we only need your contact info.',
  },
  {
    title: 'Pay securely',
    text: 'Choose bKash, Nagad or cash on delivery. For mobile payments, send the total and enter the transaction ID.',
  },
  {
    title: 'Get activated',
    text: 'Our team verifies the payment and activates your subscription, usually within 15–30 minutes.',
  },
];

export default function GuidePage() {
  return (
    <ContentPage
      title="How to Order"
      subtitle="Ordering takes about two minutes. Here is exactly what happens after you click checkout."
      sections={[
        {
          heading: 'Paying with bKash or Nagad',
          paragraphs: [
            'At checkout, select your wallet and you will see the payment number and total amount. Send the exact amount using the Send Money option, then paste the transaction ID into the field provided.',
            'We verify every payment manually. If the transaction ID does not match, we will message you on WhatsApp before dispatch or activation.',
          ],
          bullets: [
            'Use Send Money — not Payment or Cash Out.',
            'Keep the transaction ID from your confirmation SMS.',
            'No extra charge is added for mobile wallet payments.',
          ],
        },
        {
          heading: 'Cash on delivery',
          paragraphs: [
            'Cash on delivery is available for physical products anywhere in Bangladesh. Keep the exact amount ready for the rider — our team cannot always provide change.',
          ],
        },
        {
          heading: 'Digital subscriptions',
          paragraphs: [
            'Subscriptions are delivered digitally, so no shipping is charged. Once payment is confirmed, we activate the plan on your account or send the access details by WhatsApp and email.',
            'If you are buying a shared plan, you will receive an invite link. Accept it within 24 hours so the slot is not released.',
          ],
        },
        {
          heading: 'Changing or cancelling an order',
          paragraphs: [
            'Message us on WhatsApp as soon as possible. We can change an address or cancel an order before it is dispatched or activated. Once a subscription is activated, it cannot be cancelled.',
          ],
        },
      ]}
    >
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
          >
            <span className="grid size-9 place-items-center rounded-full bg-[#1b253c] text-xs font-black text-white">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-3 text-sm font-black text-[#1b253c]">{step.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{step.text}</p>
          </div>
        ))}
      </div>
    </ContentPage>
  );
}
