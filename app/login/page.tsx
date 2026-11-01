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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const name = email.split('@')[0].replace(/[._-]+/g, ' ');
    const pretty = name
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    login({ name: pretty || 'Humble Customer', email });
    window.setTimeout(() => router.push('/profile'), 300);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track orders, renew subscriptions and manage your wishlist."
      footer={
        <>
          New to Humble?{' '}
          <Link href="/register" className="font-bold text-theme-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          hint="Demo mode — any password works."
        />
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-500">
            <input
              type="checkbox"
              defaultChecked
              className="size-4 rounded border-gray-300 accent-theme-primary"
            />
            Remember me
          </label>
          <Link href="/contact" className="text-xs font-bold text-theme-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <AuthButton loading={loading}>Sign In</AuthButton>
      </form>
      <AuthDemoNote />
    </AuthShell>
  );
}
