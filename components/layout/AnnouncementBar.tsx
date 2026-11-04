'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { announcements } from '@/lib/constants';

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % announcements.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const move = (direction: number) => {
    setIndex((current) => (current + direction + announcements.length) % announcements.length);
  };

  return (
    <div className="relative flex min-h-[40px] w-full items-center justify-center overflow-hidden bg-black text-white">
      <div className="site-container flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Previous announcement"
          className="z-10 -ml-2 shrink-0 rounded-full p-2 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div
          className="relative flex min-h-[20px] flex-1 items-center justify-center overflow-hidden"
        >
          <div
            key={index}
            className="animate-fade-up absolute w-full text-center text-xs font-bold tracking-wide sm:text-sm"
          >
            {announcements[index]}
          </div>
        </div>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Next announcement"
          className="z-10 -mr-2 shrink-0 rounded-full p-2 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
