import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2f7d57]';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

export function Card({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="text-base font-black text-[#1b1e1d]">{title}</h3>
      {note ? <p className="mt-0.5 text-xs text-slate-500">{note}</p> : null}
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}
