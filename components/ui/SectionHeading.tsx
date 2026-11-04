import type { ReactNode } from 'react';

export function SectionHeading({
  title,
  subtitle,
  action,
  align = 'center',
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  const centered = align === 'center';
  return (
    <div
      className={`mb-5 flex flex-col gap-2.5 sm:mb-6 ${
        centered ? 'items-center text-center' : 'items-start text-left'
      } ${className}`}
    >
      <div className={`flex w-full items-end gap-3 ${centered ? 'justify-center' : 'justify-between'}`}>
        <div className={centered ? '' : 'min-w-0'}>
          <h2 className="text-xl font-black uppercase tracking-tight text-[#141414] sm:text-2xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 max-w-2xl text-sm font-medium text-gray-500">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <span aria-hidden="true" className="h-[3px] w-10 rounded-full bg-theme-primary" />
    </div>
  );
}
