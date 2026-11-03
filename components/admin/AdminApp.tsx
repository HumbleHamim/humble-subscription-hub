'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/store/StoreProvider';
import { checkIsAdmin, listCustomers, type Customer } from '@/lib/admin';

type Status = 'loading' | 'signed-out' | 'denied' | 'ok' | 'error';

const TABS = ['Dashboard', 'Products', 'Orders', 'Customers', 'Content'] as const;
type Tab = (typeof TABS)[number];

// Covers the storefront header/footer so the admin area looks like its own app.
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-50 text-slate-900">{children}</div>
  );
}

function Message({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <Shell>
      <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-2xl font-black text-[#1b253c]">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{body}</p>
        {children ? <div className="mt-6 w-full">{children}</div> : null}
      </div>
    </Shell>
  );
}

export function AdminApp() {
  const { user, authReady, firebaseConfigured, logout, notify } = useStore();
  const [status, setStatus] = useState<Status>('loading');
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [customersError, setCustomersError] = useState('');

  useEffect(() => {
    if (!authReady) return;
    if (!firebaseConfigured) {
      setStatus('error');
      return;
    }
    if (!user?.uid) {
      setStatus('signed-out');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    checkIsAdmin(user.uid)
      .then((ok) => !cancelled && setStatus(ok ? 'ok' : 'denied'))
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [authReady, firebaseConfigured, user?.uid]);

  useEffect(() => {
    if (status !== 'ok') return;
    let cancelled = false;
    listCustomers()
      .then((rows) => !cancelled && setCustomers(rows))
      .catch(() => !cancelled && setCustomersError('Could not load customers. Check the Firestore rules.'));
    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === 'loading') {
    return <Message title="Loading admin…" body="Checking your account." />;
  }

  if (status === 'error') {
    return (
      <Message
        title="Admin is unavailable"
        body="Firebase is not configured or could not be reached. Check the Firebase settings and try again."
      />
    );
  }

  if (status === 'signed-out') {
    return (
      <Message title="Admin sign-in" body="Sign in with your admin account to continue.">
        <Link
          href="/login"
          className="inline-block rounded-full bg-[#e7933d] px-8 py-3 text-sm font-bold text-white"
        >
          Go to login
        </Link>
      </Message>
    );
  }

  if (status === 'denied') {
    return (
      <Message
        title="Not authorized"
        body="This account is not an admin yet. To make it one, create a document in Firestore at admins / (your user ID) with any field, e.g. role = admin."
      >
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Your user ID</p>
          <p className="mt-1 break-all font-mono text-sm">{user?.uid}</p>
          <button
            type="button"
            className="mt-3 rounded-full border border-slate-300 px-4 py-1.5 text-xs font-bold"
            onClick={() => {
              navigator.clipboard
                ?.writeText(user?.uid ?? '')
                .then(() => notify('User ID copied', 'success'))
                .catch(() => notify('Copy failed — select the ID manually', 'error'));
            }}
          >
            Copy ID
          </button>
        </div>
        <Link href="/" className="mt-6 inline-block text-sm font-bold text-[#c67625]">
          Back to store
        </Link>
      </Message>
    );
  }

  return (
    <Shell>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-base font-black text-[#1b253c]">Humble Admin</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-bold">
              View store
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full bg-[#1b253c] px-4 py-1.5 text-xs font-bold text-white"
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2" aria-label="Admin sections">
          {TABS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setTab(name)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-bold ${
                tab === name ? 'bg-[#e7933d] text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {name}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'Dashboard' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Customers" value={customers ? String(customers.length) : '…'} />
            <Stat label="Products" value="Coming next" muted />
            <Stat label="Orders" value="Coming next" muted />
            <Stat label="Content" value="Coming next" muted />
          </div>
        )}

        {tab === 'Customers' && (
          <section>
            <h2 className="mb-3 text-lg font-black text-[#1b253c]">Customers</h2>
            {customersError ? (
              <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{customersError}</p>
            ) : !customers ? (
              <p className="text-sm text-slate-400">Loading…</p>
            ) : customers.length === 0 ? (
              <p className="text-sm text-slate-400">No customers yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.uid} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-semibold">{c.name || '—'}</td>
                        <td className="px-4 py-3">{c.email}</td>
                        <td className="px-4 py-3">{c.phone || '—'}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {(tab === 'Products' || tab === 'Orders' || tab === 'Content') && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-black text-[#1b253c]">{tab}</h2>
            <p className="mt-1 text-sm text-slate-400">This section is built in a later step.</p>
          </div>
        )}
      </main>
    </Shell>
  );
}

function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 font-black ${muted ? 'text-sm text-slate-300' : 'text-3xl text-[#1b253c]'}`}>
        {value}
      </p>
    </div>
  );
}
