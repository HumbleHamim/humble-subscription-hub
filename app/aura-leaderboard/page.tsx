'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Crown, Medal, Search, Sparkles, Trophy, Zap } from 'lucide-react';
import { useStore } from '@/components/store/StoreProvider';

type Entry = {
  name: string;
  aura: number;
  orders: number;
  badge: string;
};

type Period = 'all' | 'month' | 'week';

const base: Entry[] = [
  { name: 'Tahmid Hasan', aura: 48250, orders: 64, badge: 'Streaming Royalty' },
  { name: 'Nusrat Jahan', aura: 41780, orders: 58, badge: 'Aura Architect' },
  { name: 'Rafid Chowdhury', aura: 38620, orders: 51, badge: 'Sub Slinger' },
  { name: 'Sadia Islam', aura: 34210, orders: 47, badge: 'Playlist Queen' },
  { name: 'Ayaan Rahman', aura: 31490, orders: 44, badge: 'Early Bird' },
  { name: 'Mehjabin Noor', aura: 28930, orders: 39, badge: 'Binge Master' },
  { name: 'Zarif Ahmed', aura: 26470, orders: 36, badge: 'Gadget Guru' },
  { name: 'Farhan Kabir', aura: 24110, orders: 33, badge: 'Night Owl' },
  { name: 'Ishrat Jahan', aura: 21780, orders: 30, badge: 'Trendsetter' },
  { name: 'Shakib Al Hasan', aura: 19940, orders: 27, badge: 'All Rounder' },
  { name: 'Sumaiya Akter', aura: 18320, orders: 25, badge: 'Aura Collector' },
  { name: 'Nafis Iqbal', aura: 16750, orders: 23, badge: 'Deal Hunter' },
];

const multipliers: Record<Period, number> = { all: 1, month: 0.34, week: 0.11 };

const periodLabels: Record<Period, string> = {
  all: 'All Time',
  month: 'This Month',
  week: 'This Week',
};

function rankColor(rank: number) {
  if (rank === 1) return 'bg-[#2f7d57] text-white';
  if (rank === 2) return 'bg-[#d4d4d4] text-[#141414]';
  if (rank === 3) return 'bg-[#737373] text-white';
  return 'bg-gray-100 text-[#141414]';
}

export default function AuraLeaderboardPage() {
  const { user, orders } = useStore();
  const [period, setPeriod] = useState<Period>('all');
  const [query, setQuery] = useState('');

  const myAura = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0) / 10 + orders.length * 25,
    [orders],
  );

  const entries = useMemo(() => {
    const scaled = base.map((entry) => ({
      ...entry,
      aura: Math.round(entry.aura * multipliers[period]),
      orders: Math.max(1, Math.round(entry.orders * multipliers[period])),
    }));

    if (user && myAura > 0) {
      scaled.push({
        name: user.name,
        aura: Math.round(myAura),
        orders: orders.length,
        badge: myAura >= 500 ? 'Rising Star' : 'Newcomer',
      });
    }

    return scaled.sort((a, b) => b.aura - a.aura);
  }, [period, user, myAura, orders.length]);

  const filtered = entries
    .filter((entry) => entry.name.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 10);

  const podium = entries.slice(0, 3);
  const myRank = user ? entries.findIndex((entry) => entry.name === user.name) + 1 : 0;

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      <section className="relative overflow-hidden bg-[#141414] py-12 text-white sm:py-16">
        <div className="site-container relative text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-theme-primary/40 bg-theme-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-primary">
            <Sparkles className="h-3.5 w-3.5" /> Hall of Aura
          </span>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-4xl md:text-5xl">
            Aura Leaderboard
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-[#a3a3a3] sm:text-base">
            Every order you place builds your Aura. Top supporters unlock early access, exclusive
            discounts and bragging rights.
          </p>

          <div className="mx-auto mt-7 flex max-w-lg items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1 backdrop-blur-md">
            {(Object.keys(periodLabels) as Period[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPeriod(key)}
                className={`flex-1 rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all sm:text-xs ${
                  period === key
                    ? 'bg-theme-primary text-white shadow-lg shadow-theme-primary/25'
                    : 'text-[#c4c4c4] hover:text-white'
                }`}
              >
                {periodLabels[key]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="site-container -mt-8">
        <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
          {[podium[1], podium[0], podium[2]].map((entry, index) => {
            if (!entry) return <div key={index} />;
            const rank = index === 1 ? 1 : index === 0 ? 2 : 3;
            const isFirst = rank === 1;
            return (
              <div
                key={entry.name}
                className={`rounded-2xl border bg-white p-3 text-center shadow-[0_16px_40px_-24px_rgba(0,0,0,0.45)] sm:p-5 ${
                  isFirst ? 'border-theme-primary/40 pb-5 pt-0 sm:pb-8' : 'border-gray-100'
                }`}
              >
                {isFirst ? (
                  <div className="-mt-6 mb-2 flex justify-center sm:-mt-8 sm:mb-3">
                    <span className="relative grid size-12 place-items-center rounded-full bg-[#2f7d57] text-white shadow-lg sm:size-16">
                      <Crown className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={1.8} />
                    </span>
                  </div>
                ) : (
                  <div className="mb-2 flex justify-center sm:mb-3">
                    <span
                      className={`grid size-10 place-items-center rounded-full sm:size-12 ${rankColor(rank)}`}
                    >
                      <Medal className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                  </div>
                )}
                <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                  Rank #{rank}
                </span>
                <p className="mt-0.5 truncate text-xs font-black text-[#141414] sm:text-sm">
                  {entry.name}
                </p>
                <p className="mt-1 text-base font-black text-theme-primary sm:text-xl">
                  {entry.aura.toLocaleString()}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Aura
                </p>
                <span className="mt-2 hidden truncate rounded-full bg-gray-50 px-2 py-1 text-[9px] font-bold text-gray-500 sm:block">
                  {entry.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="site-container mt-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#141414]">
                <Trophy className="h-4 w-4 text-theme-primary" /> Top 10
              </h2>
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="search"
                  placeholder="Search a name..."
                  aria-label="Search leaderboard"
                  className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-xs text-[#141414] outline-none transition-all focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/10"
                />
              </div>
            </div>

            <div className="hidden grid-cols-[3rem_minmax(0,1fr)_5.5rem_4.5rem] gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-gray-400 sm:grid">
              <span>Rank</span>
              <span>Supporter</span>
              <span className="text-right">Aura</span>
              <span className="text-right">Orders</span>
            </div>

            <ol>
              {filtered.map((entry, index) => {
                const rank = entries.indexOf(entry) + 1;
                const isMe = Boolean(user && entry.name === user.name);
                return (
                  <li
                    key={`${entry.name}-${index}`}
                    className={`grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[3rem_minmax(0,1fr)_5.5rem_4.5rem] sm:px-5 ${
                      isMe ? 'bg-theme-primary/[0.07]' : 'odd:bg-white even:bg-gray-50/40'
                    }`}
                  >
                    <span
                      className={`grid size-7 place-items-center rounded-full text-[11px] font-black ${
                        rank <= 3
                          ? rankColor(rank)
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {rank}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-xs font-bold text-[#141414] sm:text-sm">
                        {entry.name}
                        {isMe ? (
                          <span className="rounded-full bg-theme-primary px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                            You
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-[10px] text-gray-400">{entry.badge}</p>
                    </div>
                    <span className="text-right text-xs font-black text-theme-primary sm:text-sm">
                      {entry.aura.toLocaleString()}
                    </span>
                    <span className="hidden text-right text-xs font-bold text-gray-500 sm:block">
                      {entry.orders}
                    </span>
                  </li>
                );
              })}
              {filtered.length === 0 ? (
                <li className="px-5 py-12 text-center text-sm text-gray-400">
                  No supporters match “{query}”.
                </li>
              ) : null}
            </ol>
          </div>

          <aside className="h-fit space-y-4">
            <div className="rounded-2xl bg-[#141414] p-5 text-white shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
                Your standing
              </p>
              {user ? (
                <>
                  <p className="mt-2 text-3xl font-black text-theme-primary">
                    {Math.round(myAura).toLocaleString()}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#a3a3a3]">
                    Aura earned
                  </p>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.08] px-3 py-2.5">
                    <span className="text-xs font-bold">Current rank</span>
                    <span className="text-sm font-black text-theme-primary">
                      {myRank > 0 ? `#${myRank}` : 'Unranked'}
                    </span>
                  </div>
                  {myAura === 0 ? (
                    <p className="mt-3 text-[11px] leading-relaxed text-[#a3a3a3]">
                      Place your first order to enter the leaderboard.
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-relaxed text-[#c4c4c4]">
                    Sign in to see where you rank against the Humble community.
                  </p>
                  <Link
                    href="/login"
                    className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-theme-primary text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-theme-primary-dark"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#141414]">
                <Zap className="h-4 w-4 text-theme-primary" /> How Aura works
              </h3>
              <ul className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-gray-500">
                <li className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-theme-primary" />
                  Earn 1 Aura for every ৳10 you spend.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-theme-primary" />
                  Get 25 bonus Aura each time you complete an order.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-theme-primary" />
                  Top 10 supporters get early access to new drops.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-theme-primary" />
                  Rankings reset monthly — every month is a fresh race.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
