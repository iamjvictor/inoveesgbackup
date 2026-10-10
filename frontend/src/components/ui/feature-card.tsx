import React from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const FeatureCard = ({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "group bg-gradient-to-br from-white to-surface text-card-foreground rounded-xl border p-8",
        "flex flex-col items-center text-center",
        "transition-all duration-300 ease-in-out",
        "hover:-translate-y-2 hover:shadow-[0_20px_60px_-20px_rgba(184,213,65,0.25)] hover:border-accent/30",
        className
      )}
    >
      <div className="mb-6 rounded-full bg-gradient-to-br from-surface-2 to-accent/10 p-4 text-accent transition-all duration-300 group-hover:bg-accent/20 group-hover:scale-110">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight transition-colors duration-200 group-hover:text-accent">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
};
