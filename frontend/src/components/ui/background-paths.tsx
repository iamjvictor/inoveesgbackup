"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function FloatingPaths({
  position,
  lineColor,
}: {
  position: number;
  lineColor: string;
}) {
  const paths = Array.from({ length: 34 }, (_, index) => ({
    id: index,
    d: `M-${380 - index * 5 * position} -${189 + index * 6}C-${
      380 - index * 5 * position
    } -${189 + index * 6} -${312 - index * 5 * position} ${216 - index * 6} ${
      152 - index * 5 * position
    } ${343 - index * 6}C${616 - index * 5 * position} ${470 - index * 6} ${
      684 - index * 5 * position
    } ${875 - index * 6} ${684 - index * 5 * position} ${875 - index * 6}`,
    width: 0.45 + index * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full"
        viewBox="0 0 696 316"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        {paths.map((path) => (
          <motion.path
            key={`${position}-${path.id}`}
            d={path.d}
            stroke={lineColor}
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.02}
            initial={{ pathLength: 0.28, opacity: 0.35 }}
            animate={{
              pathLength: 1,
              opacity: [0.22, 0.48, 0.22],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 18 + path.id * 0.18,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths({
  className,
  lineColor = "rgba(184, 213, 65, 0.75)",
}: {
  className?: string;
  lineColor?: string;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <FloatingPaths position={1} lineColor={lineColor} />
      <FloatingPaths position={-1} lineColor={lineColor} />
    </div>
  );
}
