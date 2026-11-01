'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useStore } from '@/components/store/StoreProvider';
import {
  AuthButton,
  AuthDemoNote,
  AuthField,
  AuthShell,
} from '@/components/auth/AuthShell';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    login({ name: name.trim() || 'Humble Customer', email: email.trim(), phone: phone.trim() });
    window.setTimeout(() => router.push('/profile'), 300);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your details, track orders and earn Aura points on every purchase."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-theme-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="name"
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Your full name"
          autoComplete="name"
        />
        <AuthField
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="your@email.com"
          autoComplete="email"
        />
        <AuthField
          id="phone"
          label="Phone number"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="01XXXXXXXXX"
          autoComplete="tel"
          required={false}
          hint="Optional, used for delivery updates."
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-relaxed text-gray-500">
          <input
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 rounded border-gray-300 accent-theme-primary"
          />
          <span>
            I agree to the{' '}
            <Link href="/terms" className="font-bold text-theme-primary hover:underline">
              Terms &amp; Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-bold text-theme-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <AuthButton loading={loading}>Create Account</AuthButton>
      </form>
      <AuthDemoNote />
    </AuthShell>
  );
}
