import { Banknote, MessagesSquare, ShieldCheck, Zap } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const reasons = [
  {
    title: 'Instant Activation',
    description: 'Get your subscription activated within minutes of purchase.',
    icon: Zap,
  },
  {
    title: '100% Genuine',
    description: 'All subscriptions are authentic and officially sourced.',
    icon: ShieldCheck,
  },
  {
    title: 'Best Prices in BD',
    description: 'Most affordable subscription prices across Bangladesh.',
    icon: Banknote,
  },
  {
    title: '24/7 Support',
    description: 'Round-the-clock customer support via WhatsApp and Facebook.',
    icon: MessagesSquare,
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-gray-50 py-12 sm:py-16">
      <div className="site-container relative">
        <SectionHeading title="Why Choose Us" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="rounded-2xl bg-white/60 p-4 shadow-[0_2px_24px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-black/5 backdrop-blur-2xl backdrop-saturate-150 transition duration-300 hover:-translate-y-1 hover:bg-white/80 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6"
              >
                <div className="mb-3 grid size-10 place-items-center rounded-xl bg-theme-primary/12 sm:mb-4 sm:size-11">
                  <Icon className="size-5 text-theme-primary" strokeWidth={1.5} />
                </div>
                <h3 className="mb-1 text-xs font-black uppercase tracking-wider text-[#1b1e1d] sm:text-sm">
                  {reason.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
