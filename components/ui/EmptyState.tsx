import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="site-container flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 grid size-20 place-items-center rounded-full bg-gray-100 text-gray-300">
        {icon}
      </div>
      <h1 className="text-2xl font-black text-[#1b253c]">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-gray-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
