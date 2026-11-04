'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/components/store/StoreProvider';
import { getPublishHook, savePublishHook } from '@/lib/admin';

/** "Publish to website": asks Cloudflare to rebuild the store so it picks up
 *  the latest products from the database. The deploy-hook link is stored in
 *  Firestore (settings/publish), which only admins can read. */
export function PublishPanel() {
  const { notify } = useStore();
  const [hook, setHook] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastPublish, setLastPublish] = useState('');

  useEffect(() => {
    let cancelled = false;
    getPublishHook()
      .then((value) => {
        if (cancelled) return;
        setHook(value);
        setEditing(!value);
      })
      .catch(() => {
        if (cancelled) return;
        setHook('');
        setEditing(true);
        notify('Could not read the publish link. Publish the latest Firestore rules.', 'error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSaveHook() {
    const value = draft.trim();
    if (!value.startsWith('https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/')) {
      notify('That does not look like a Cloudflare deploy hook link.', 'error');
      return;
    }
    setBusy(true);
    try {
      await savePublishHook(value);
      setHook(value);
      setDraft('');
      setEditing(false);
      notify('Publish link saved', 'success');
    } catch {
      notify('Could not save the link', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function onPublish() {
    if (!hook) return;
    setBusy(true);
    try {
      // Fire-and-forget: Cloudflare does not allow reading the reply from a browser.
      await fetch(hook, { method: 'POST', mode: 'no-cors' });
      setLastPublish(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      notify('Publish started. The store updates in about 2 minutes.', 'success');
    } catch {
      notify('Could not reach Cloudflare. Check your internet and try again.', 'error');
    } finally {
      setBusy(false);
    }
  }

  if (hook === null) return null;

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#141414]">Publish to website</p>
          <p className="text-xs text-slate-500">
            Changes you make here show on the store after you publish (about 2 minutes).
            {lastPublish ? ` Last started at ${lastPublish}.` : ''}
          </p>
        </div>
        {hook && !editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onPublish()}
              className="rounded-full bg-[#141414] px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy ? 'Working…' : 'Publish to website'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold"
            >
              Change link
            </button>
          </div>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-3 grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500" htmlFor="deploy-hook">
            Cloudflare deploy hook link
          </label>
          <input
            id="deploy-hook"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#2f7d57]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onSaveHook()}
              className="rounded-full bg-[#2f7d57] px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Save link
            </button>
            {hook ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraft('');
                }}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
