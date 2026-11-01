'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const update = () => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 8);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
  };

  useEffect(() => {
    update();
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      track.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scroll = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.78, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <ul ref={trackRef} aria-label={label} className="carousel-track">
        {children}
      </ul>
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label={`Previous ${label}`}
        disabled={!canScrollLeft}
        className="absolute -left-5 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1b253c] shadow-[0_4px_16px_rgba(27,37,60,0.14)] ring-1 ring-black/5 transition duration-200 hover:bg-[#1b253c] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none lg:flex xl:-left-14 xl:size-11"
      >
        <ChevronLeft className="size-5" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label={`Next ${label}`}
        disabled={!canScrollRight}
        className="absolute -right-5 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1b253c] shadow-[0_4px_16px_rgba(27,37,60,0.14)] ring-1 ring-black/5 transition duration-200 hover:bg-[#1b253c] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none lg:flex xl:-right-14 xl:size-11"
      >
        <ChevronRight className="size-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
