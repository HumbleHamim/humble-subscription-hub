'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';
const STORAGE_KEY = 'humble.theme';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

/** The site is dark by default. The visitor's choice (light) is remembered on their device. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the choice just won't be remembered.
    }
  }

  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid size-10 shrink-0 place-items-center rounded-full text-[#1b253c] transition-colors hover:text-theme-primary focus-visible:outline-2 focus-visible:outline-theme-primary"
    >
      {theme === 'dark' ? (
        <Sun className="h-[22px] w-[22px]" strokeWidth={1.5} />
      ) : (
        <Moon className="h-[22px] w-[22px]" strokeWidth={1.5} />
      )}
    </button>
  );
}
