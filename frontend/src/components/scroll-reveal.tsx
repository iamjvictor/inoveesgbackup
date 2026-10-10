"use client";

import { useEffect, useRef } from "react";

export function ScrollReveal() {
  const markerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const marker = markerRef.current;
    const root = marker?.closest("[data-scroll-root]") as HTMLElement | null;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (!targets.length) return;

    const pending = new Set(targets);
    const useWindowScroll = root.scrollHeight <= root.clientHeight + 2;

    const revealVisible = () => {
      const rootRect = useWindowScroll
        ? { top: 0, bottom: window.innerHeight, height: window.innerHeight }
        : root.getBoundingClientRect();
      const triggerTop = rootRect.top + rootRect.height * 0.12;
      const triggerBottom = rootRect.bottom - rootRect.height * 0.1;

      pending.forEach((target) => {
        const rect = target.getBoundingClientRect();
        const isInView = rect.top < triggerBottom && rect.bottom > triggerTop;
        if (!isInView) return;
        target.classList.add("is-visible");
        pending.delete(target);
      });
    };

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(revealVisible);
    };

    if (useWindowScroll) {
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      root.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", onScroll, { passive: true });

    const boot = window.setTimeout(revealVisible, 80);
    revealVisible();

    return () => {
      window.clearTimeout(boot);
      cancelAnimationFrame(raf);
      if (useWindowScroll) {
        window.removeEventListener("scroll", onScroll);
      } else {
        root.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <span
      ref={markerRef}
      aria-hidden="true"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
    />
  );
}
