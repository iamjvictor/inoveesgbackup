"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type HorizontalServiceRailProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  railClassName?: string;
  itemClassName?: string;
  ariaLabel: string;
};

export function HorizontalServiceRail<T>({
  items,
  renderItem,
  className = "",
  railClassName = "",
  itemClassName = "",
  ariaLabel,
}: HorizontalServiceRailProps<T>) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const pauseTimeoutRef = useRef<number | null>(null);
  const hoveredRef = useRef(false);
  const pointerDownRef = useRef(false);
  const pausedUntilRef = useRef(0);

  const duplicatedItems = useMemo(() => [...items, ...items], [items]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const run = (ts: number) => {
      if (!lastTsRef.current) {
        lastTsRef.current = ts;
      }

      const delta = ts - lastTsRef.current;
      lastTsRef.current = ts;

      const shouldPause = hoveredRef.current || pointerDownRef.current || ts < pausedUntilRef.current;
      if (!shouldPause) {
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0) {
          el.scrollLeft += Math.max(delta * 0.02, 0.25);
          if (el.scrollLeft >= halfWidth) {
            el.scrollLeft -= halfWidth;
          }
        }
      }

      rafRef.current = window.requestAnimationFrame(run);
    };

    rafRef.current = window.requestAnimationFrame(run);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTsRef.current = 0;
    };
  }, [items.length]);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        window.clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };
  }, []);

  const scrollByAmount = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;

    if (pauseTimeoutRef.current) {
      window.clearTimeout(pauseTimeoutRef.current);
    }

    pausedUntilRef.current = Date.now() + 1400;
    const amount = Math.max(el.clientWidth * 0.85, 280);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });

    pauseTimeoutRef.current = window.setTimeout(() => {
      pausedUntilRef.current = 0;
    }, 1200);
  };

  const handlePointerDown = () => {
    pointerDownRef.current = true;
    pausedUntilRef.current = Date.now() + 1600;
  };

  const handlePointerUp = () => {
    pointerDownRef.current = false;
    pausedUntilRef.current = Date.now() + 800;
  };

  return (
    <div className={className}>
      <div className="relative">
        <button
          type="button"
          aria-label="Ver serviços anteriores"
          onClick={() => scrollByAmount(-1)}
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/90 p-2 text-white shadow-lg transition hover:bg-slate-900 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={scrollerRef}
          aria-label={ariaLabel}
          onMouseEnter={() => {
            hoveredRef.current = true;
          }}
          onMouseLeave={() => {
            hoveredRef.current = false;
            pausedUntilRef.current = Date.now() + 300;
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchEnd={handlePointerUp}
          className={`no-scrollbar overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x snap-x snap-mandatory ${railClassName}`}
        >
          <div className={`flex min-w-max gap-4 py-2 ${itemClassName}`}>
            {duplicatedItems.map(renderItem)}
          </div>
        </div>

        <button
          type="button"
          aria-label="Ver próximos serviços"
          onClick={() => scrollByAmount(1)}
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/90 p-2 text-white shadow-lg transition hover:bg-slate-900 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
