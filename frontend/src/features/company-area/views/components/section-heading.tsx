import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
        {description ? <p className="max-w-3xl text-sm text-foreground/70">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2 flex-wrap sm:flex-nowrap">{action}</div> : null}
    </header>
  );
}
