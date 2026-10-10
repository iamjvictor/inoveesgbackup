import Link from "next/link";
import { type ComponentProps } from "react";

export function ButtonLink({
  className = "",
  variant = "primary",
  ...props
}: ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";
  const styles =
    variant === "primary"
      ? "bg-linear-to-r from-accent to-accent-2 text-accent-foreground shadow-[0_10px_30px_-14px_color-mix(in_oklab,var(--accent)_65%,transparent)] hover:-translate-y-0.5 hover:brightness-110"
      : variant === "secondary"
        ? "border border-accent/25 bg-white/75 text-accent-2 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/[0.08]"
        : "text-foreground hover:bg-accent/[0.08]";

  return <Link className={`${base} ${styles} ${className}`} {...props} />;
}
