"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface Stat {
  value: string;
  label: string;
}

export interface Testimonial {
  name: string;
  title: string;
  quote?: string;
  avatarSrc: string;
  rating?: number;
}

export interface ClientsSectionProps {
  tagLabel: string;
  title: string;
  description: string;
  stats: Stat[];
  testimonials: Testimonial[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
  clientSideCardTitle?: string;
  clientSideCardItems?: string[];
  className?: string;
  primaryActionHref?: string;
  secondaryActionHref?: string;
}

const StatCard = ({ value, label }: Stat) => (
  <Card className="rounded-2xl border-border/70 bg-gradient-to-br from-white to-surface text-center shadow-[0_12px_35px_-28px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(184,213,65,0.3)] hover:border-accent/30">
    <CardContent className="p-4">
      <p className="text-4xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm leading-5 text-foreground/60">{label}</p>
    </CardContent>
  </Card>
);

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
  return (
    <div
      className={cn(
        "reveal group w-full rounded-3xl border border-border bg-gradient-to-br from-white to-surface p-6 shadow-[0_16px_50px_-38px_rgba(0,0,0,0.2)]",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-24px_rgba(184,213,65,0.2)] hover:border-accent/30",
        index % 2 === 0 ? "reveal-left" : "reveal-right"
      )}
    >
      <div className="flex h-auto w-full flex-col">
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 flex-shrink-0 rounded-xl bg-cover bg-center ring-2 ring-border transition-all duration-300 group-hover:ring-accent/30"
            style={{ backgroundImage: `url(${testimonial.avatarSrc})` }}
            aria-label={`Photo of ${testimonial.name}`}
          />
          <div className="flex-grow">
            <p className="text-lg font-semibold text-foreground">{testimonial.name}</p>
            <p className="text-sm text-muted">{testimonial.title}</p>
          </div>
        </div>

        <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

        {testimonial.quote && <p className="text-base text-muted">{`\u201C${testimonial.quote}\u201D`}</p>}
      </div>
    </div>
  );
};

export const ClientsSection = ({
  tagLabel,
  title,
  description,
  stats,
  testimonials,
  primaryActionLabel,
  secondaryActionLabel,
  clientSideCardTitle = "Perfil dos clientes",
  clientSideCardItems = [],
  className,
  primaryActionHref = "#",
  secondaryActionHref = "#",
}: ClientsSectionProps) => {
  return (
    <section className={cn("w-full py-14 md:py-20", className)}>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-12 px-6 xl:grid-cols-2 xl:gap-16">
        <div className="flex flex-col gap-6 xl:sticky xl:top-24">
          <div className="inline-flex items-center self-start rounded-full border border-accent/20 bg-accent/[0.08] px-3 py-1.5 text-sm shadow-[0_8px_25px_-20px_rgba(47,122,69,0.7)]">
            <div className="mr-2 h-2 w-2 rounded-full bg-accent" />
            <span className="font-medium text-foreground/75">{tagLabel}</span>
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">{title}</h2>
          <p className="max-w-xl text-lg text-muted">{description}</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {clientSideCardItems.length > 0 && (
            <Card className="rounded-2xl border-border bg-card/80">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-foreground">{clientSideCardTitle}</p>
                <ul className="mt-3 space-y-2">
                  {clientSideCardItems.map((item) => (
                    <li key={item} className="text-sm text-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <a href={secondaryActionHref}>{secondaryActionLabel}</a>
            </Button>
            <Button asChild size="lg" className="rounded-full">
              <a href={primaryActionHref}>{primaryActionLabel}</a>
            </Button>
          </div>
        </div>

        <div className="relative flex flex-col gap-5">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={`${testimonial.name}-${index}`} index={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};
