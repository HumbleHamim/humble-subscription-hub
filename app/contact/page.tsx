'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import { site } from '@/lib/constants';
import { FacebookIcon, InstagramIcon } from '@/components/ui/SocialIcons';

const channels = [
  {
    icon: Phone,
    label: 'Call us',
    value: site.phone,
    href: site.phoneHref,
    hint: 'Sat–Thu, 10am–9pm',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Chat instantly',
    href: site.whatsapp,
    hint: 'Fastest response',
  },
  {
    icon: Mail,
    label: 'Email',
    value: site.email,
    href: `mailto:${site.email}`,
    hint: 'Replies within 24h',
  },
  {
    icon: MapPin,
    label: 'Visit',
    value: site.address,
    href: '#',
    hint: 'By appointment',
  },
];

const topics = [
  'Order enquiry',
  'Subscription activation',
  'Delivery update',
  'Return or refund',
  'Bulk / business order',
  'Something else',
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    topic: topics[0],
    message: '',
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      <section className="relative overflow-hidden bg-[#141414] py-12 text-white sm:py-16">
        <div className="site-container relative">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2 text-[11px] font-semibold text-[#8c8c8c]"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white" aria-current="page">
              Contact Us
            </span>
          </nav>
          <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Contact Us</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#a3a3a3] sm:text-base">
            Order questions, activation help or delivery updates — message us and a real person will
            reply.
          </p>
        </div>
      </section>

      <div className="site-container mt-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-theme-primary/10 text-theme-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  {channel.label}
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-[#141414] group-hover:text-theme-primary">
                  {channel.value}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">{channel.hint}</p>
              </a>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            {sent ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-green-50 text-green-500">
                  <CheckCircle2 className="h-8 w-8" strokeWidth={1.8} />
                </div>
                <h2 className="text-xl font-black text-[#141414]">Message sent</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                  Thanks {form.name.split(' ')[0] || 'there'} — we have your message and will reply
                  shortly. For urgent issues, WhatsApp gets the fastest response.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                  <a
                    href={site.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-theme-primary px-6 text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
                  >
                    Chat on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setForm({ name: '', phone: '', email: '', topic: topics[0], message: '' });
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-lg border-2 border-[#141414] px-6 text-xs font-extrabold uppercase tracking-wider text-[#141414] transition-colors hover:bg-[#141414] hover:text-white"
                  >
                    Send another
                  </button>
                </div>
                <p className="mt-5 text-[11px] text-gray-400">
                  Demo storefront — this form does not send a real message.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-[#141414]">
                    Send a message
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Tell us what you need and include your order ID if you have one.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-xs font-bold text-[#141414]">
                      Full name *
                    </label>
                    <input
                      id="name"
                      required
                      value={form.name}
                      onChange={(event) => update('name', event.target.value)}
                      placeholder="Your name"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-xs font-bold text-[#141414]">
                      Phone *
                    </label>
                    <input
                      id="phone"
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(event) => update('phone', event.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-[#141414]">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => update('email', event.target.value)}
                      placeholder="your@email.com"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
                    />
                  </div>
                  <div>
                    <label htmlFor="topic" className="mb-1.5 block text-xs font-bold text-[#141414]">
                      Topic
                    </label>
                    <select
                      id="topic"
                      value={form.topic}
                      onChange={(event) => update('topic', event.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none transition-all focus:border-theme-primary"
                    >
                      {topics.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="mb-1.5 block text-xs font-bold text-[#141414]">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(event) => update('message', event.target.value)}
                      placeholder="How can we help?"
                      className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-theme-primary px-6 text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
                >
                  <Send className="h-4 w-4" /> Send Message
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-[#141414] p-5 text-white shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
                <Clock className="h-4 w-4 text-theme-primary" /> Support hours
              </h2>
              <ul className="mt-4 space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-[#a3a3a3]">Saturday – Thursday</span>
                  <span className="font-bold">10am – 9pm</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[#a3a3a3]">Friday</span>
                  <span className="font-bold">2pm – 9pm</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[#a3a3a3]">WhatsApp</span>
                  <span className="font-bold text-theme-primary">24/7</span>
                </li>
              </ul>
              <p className="mt-4 text-[11px] leading-relaxed text-[#a3a3a3]">
                Subscription activations are processed manually by our team. Orders placed during
                off-hours go live first thing the next morning.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#141414]">
                Follow us
              </h2>
              <div className="mt-3 flex gap-2">
                <a
                  href={site.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="grid size-10 place-items-center rounded-full bg-gray-50 text-[#141414] transition-colors hover:bg-theme-primary hover:text-white"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid size-10 place-items-center rounded-full bg-gray-50 text-[#141414] transition-colors hover:bg-theme-primary hover:text-white"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="grid size-10 place-items-center rounded-full bg-gray-50 text-[#141414] transition-colors hover:bg-theme-primary hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
                Sunday drops, restocks and giveaways are announced on our social pages first.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
