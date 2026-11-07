import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'How Humble Subscription Hub grew from a small idea into a store for premium subscriptions and everyday tech in Bangladesh.',
};

export default function StoryPage() {
  return (
    <ContentPage
      pageKey="story"
      title="Our Story"
      subtitle="From one frustrated subscription renewal to a store serving thousands of customers across Bangladesh."
      sections={[
        {
          heading: 'The problem',
          paragraphs: [
            'It started the way most small businesses do — with an annoyance. Paying for a streaming service in Bangladesh usually meant an international card, a currency conversion fee and a price that never quite matched what the service was worth locally.',
            'We figured there had to be a better way. So we tested a few plans with friends, charged a fair price and handled activation ourselves. Word spread faster than we expected.',
          ],
        },
        {
          heading: 'Growing the catalog',
          paragraphs: [
            'As more people asked for more services, we added them one at a time — music, design tools, AI assistants, storage and more. Each addition came with the same rule: only offer it if we can support it properly.',
            'The tech side of the store arrived almost by accident. Customers kept asking where to find reliable earbuds and power banks that were not overpriced. We started sourcing a small selection, and it grew from there.',
          ],
        },
        {
          heading: 'Where we are now',
          paragraphs: [
            'Today Humble Subscription Hub ships nationwide and activates subscriptions within minutes. We remain a small, hands-on team — the same people who answer your WhatsApp message also pack your order.',
            'We are still growing, still adding categories and still keeping the promise we started with: honest prices, genuine access and support you can actually reach.',
          ],
        },
        {
          heading: 'What comes next',
          paragraphs: [
            'We are working on faster renewals, more payment options and a loyalty programme that rewards the customers who have stuck with us. If you have an idea for something we should stock, tell us — most of our catalog came from customer requests.',
          ],
        },
      ]}
    />
  );
}
