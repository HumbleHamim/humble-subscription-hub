'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Check, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { site } from '@/lib/constants';

const perks = [
  { icon: Zap, text: 'Instant activation on every subscription' },
  { icon: ShieldCheck, text: 'Genuine access with warranty support' },
  { icon: Sparkles, text: 'Aura points on every order you place' },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-[80vh] bg-gray-50/70 py-8 md:py-14">
      <div className="site-container">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_24px_60px_-40px_rgba(0,0,0,0.5)] lg:grid-cols-2">
          <div className="relative hidden flex-col justify-between overflow-hidden bg-[#1b1e1d] p-10 text-white lg:flex">
            <div className="relative">
              <Logo variant="light" />
              <h2 className="mt-10 text-3xl font-black leading-tight tracking-tight">
                Your subscriptions,
                <br />
                <span className="text-theme-primary">all in one place.</span>
              </h2>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#a0a7a4]">
                {site.description}
              </p>
            </div>
            <ul className="relative mt-10 space-y-4">
              {perks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <li key={perk.text} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-theme-primary/15 text-theme-primary">
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="text-sm font-medium text-[#d2d6d5]">{perk.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#1b1e1d] sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
            <div className="mt-7">{children}</div>
            <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-[#1b1e1d]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-[#1b1e1d] outline-none transition-all placeholder:text-gray-400 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15"
      />
      {hint ? <p className="mt-1 text-[11px] text-gray-400">{hint}</p> : null}
    </div>
  );
}

export function AuthButton({ children, loading }: { children: ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-theme-primary text-sm font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark disabled:opacity-60"
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : null}
      {children}
    </button>
  );
}

export function AuthSetupNote({ configured }: { configured: boolean }) {
  return (
    <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p className="text-[11px] leading-relaxed text-amber-800">
        {configured
          ? 'Your account is secured by Firebase Authentication. Your profile is stored in your Firebase project.'
          : 'Firebase is not configured for this environment yet. Add the local Firebase values from docs/firebase-setup.md before creating an account.'}
      </p>
    </div>
  );
}
