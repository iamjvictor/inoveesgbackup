"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { cn } from "@/lib/utils";

type HeroSectionESGProps = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    body: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
    trust: string;
  };
  onLoginClick: () => void;
};

export function HeroSectionESG({ hero, onLoginClick }: HeroSectionESGProps) {
  return (
    <section id="hero" className="relative overflow-hidden border-b border-border bg-surface">
      <HeroHeader onLoginClick={onLoginClick} />

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 [background:radial-gradient(1000px_circle_at_18%_-8%,color-mix(in_oklab,var(--accent)_22%,transparent)_0%,transparent_58%),radial-gradient(900px_circle_at_85%_25%,color-mix(in_oklab,var(--accent-2)_18%,transparent)_0%,transparent_62%),linear-gradient(180deg,var(--surface-2)_0%,var(--surface)_45%,var(--background)_100%)]" />
        <div className="absolute inset-0 opacity-[0.16] [background:repeating-linear-gradient(102deg,transparent_0px,transparent_16px,color-mix(in_oklab,var(--accent)_22%,transparent)_16px,color-mix(in_oklab,var(--accent)_22%,transparent)_17px)]" />
        <BackgroundPaths
          className="opacity-75"
          lineColor="rgba(184, 213, 65, 0.72)"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-14 pt-28 sm:pt-30 md:pt-32 lg:pb-16 lg:pt-36 xl:pb-20 xl:pt-44">
        <AnimatedGroup preset="blur-slide" className="grid items-center gap-12 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-xs font-semibold text-foreground/80">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              {hero.eyebrow}
            </p>
            <h1 className="mt-6 text-balance text-4xl font-bold font-display leading-tight tracking-tight sm:text-5xl md:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-xl font-medium text-foreground/80">{hero.subtitle}</p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/75">{hero.body}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full">
                <a href={hero.ctaPrimary.href}>{hero.ctaPrimary.label}</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <a href={hero.ctaSecondary.href}>{hero.ctaSecondary.label}</a>
              </Button>
            </div>

            <p className="mt-4 text-xs text-foreground/60">{hero.trust}</p>
          </div>

          <div aria-hidden className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-radial from-accent/25 to-transparent blur-2xl" />

            <div className="absolute inset-0 z-0 translate-x-4 -translate-y-8 rounded-[2rem] border border-border/70 bg-white/75 p-2 [mask-image:linear-gradient(to_bottom,#000_58%,transparent_96%)] backdrop-blur-xl" />

            <div className="relative z-10 rounded-[2rem] border border-border bg-white/90 p-3 shadow-[0_24px_60px_-38px_rgba(0,0,0,0.35)]">
              <div className="rounded-[1.4rem] border border-border bg-surface p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-foreground">Painel de maturidade ESG</div>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Live</span>
                </div>

                <div className="mt-6 space-y-4">
                  <ProgressRow label="Ambiental" value="72%" width="72%" />
                  <ProgressRow label="Social" value="64%" width="64%" accentClass="bg-accent-2" />
                  <ProgressRow label="Governança" value="58%" width="58%" accentClass="bg-accent/80" />
                </div>
              </div>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}

function ProgressRow({
  label,
  value,
  width,
  accentClass = "bg-accent",
}: {
  label: string;
  value: string;
  width: string;
  accentClass?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-foreground/65">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-foreground/10">
        <div className={cn("h-2 rounded-full", accentClass)} style={{ width }} />
      </div>
    </div>
  );
}

function HeroHeader({ onLoginClick }: { onLoginClick: () => void }) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const navItems = [
    { label: "Categorias", href: "#categorias" },
    { label: "Problema", href: "#problema" },
    { label: "Features", href: "#features" },
    { label: "Prova social", href: "#prova-social" },
    { label: "Planos", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ] as const;

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav className="fixed z-50 w-full px-2">
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-4 transition-all duration-300 lg:px-6",
            isScrolled && "max-w-5xl rounded-2xl border border-border bg-white/75 backdrop-blur-xl"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3">
            <Link href="#hero" aria-label="home" className="inline-flex items-center">
              <Image
                src="/logo_inove_transparent.png"
                alt="Inove ESG"
                width={1472}
                height={832}
                className="h-12 w-auto sm:h-14"
                priority
              />
            </Link>

            <ul className="hidden items-center gap-5 text-sm md:flex lg:gap-7">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="font-medium text-foreground transition-all duration-300 hover:text-accent-2 relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-accent-2 after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <button
              onClick={onLoginClick}
              aria-label="Login"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/25 bg-accent/[0.08] text-accent-2 transition-colors duration-200 hover:bg-accent/15 hover:text-accent"
            >
              <User className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
