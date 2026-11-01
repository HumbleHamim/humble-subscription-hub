'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { authErrorMessage, useStore } from '@/components/store/StoreProvider';
import {
  AuthButton,
  AuthSetupNote,
  AuthField,
  AuthShell,
} from '@/components/auth/AuthShell';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, firebaseConfigured } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/profile');
    } catch (nextError) {
      setError(authErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
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
        />
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p> : null}
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
      <AuthSetupNote configured={firebaseConfigured} />
    </AuthShell>
  );
}
