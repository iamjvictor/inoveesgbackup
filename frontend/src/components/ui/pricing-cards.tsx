"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: PricingFeature[];
  button: {
    text: string;
    url: string;
  };
  type?: string; // "servico" | "plano"
}

interface Pricing2Props {
  heading?: string;
  description?: string;
  plans?: PricingPlan[];
}

function toAnnual(price: string) {
  const numeric = Number(price.replace(/[^\d.,]/g, "").replace(",", "."));
  if (Number.isNaN(numeric) || numeric <= 0) return "Sob consulta";
  return `R$ ${(numeric * 12).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

const Pricing2 = ({
  heading = "Planos e Preços",
  description = "Escolha o plano ideal para o estágio ESG da sua empresa.",
  plans = [],
}: Pricing2Props) => {
  const [isYearly, setIsYearly] = useState(false);
  const [activeTab, setActiveTab] = useState("servicos");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect?.width ?? window.innerWidth));
      const h = Math.max(1, Math.floor(rect?.height ?? window.innerHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setSize();

    type Particle = { x: number; y: number; speed: number; alpha: number };
    let particles: Particle[] = [];
    let raf = 0;

    const makeParticle = (): Particle => ({
      x: Math.random() * (canvas.width / (window.devicePixelRatio || 1)),
      y: Math.random() * (canvas.height / (window.devicePixelRatio || 1)),
      speed: Math.random() * 0.35 + 0.08,
      alpha: Math.random() * 0.2 + 0.08,
    });

    const initParticles = () => {
      particles = [];
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const count = Math.floor((w * h) / 14000);
      for (let index = 0; index < count; index += 1) particles.push(makeParticle());
    };

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);
      particles.forEach((particle) => {
        particle.y -= particle.speed;
        if (particle.y < 0) {
          particle.x = Math.random() * w;
          particle.y = h + Math.random() * 30;
          particle.speed = Math.random() * 0.35 + 0.08;
          particle.alpha = Math.random() * 0.2 + 0.08;
        }
        ctx.fillStyle = `rgba(47,122,69,${particle.alpha})`;
        ctx.fillRect(particle.x, particle.y, 0.8, 2.3);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      initParticles();
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas.parentElement || document.body);

    initParticles();
    raf = requestAnimationFrame(draw);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const filteredPlans = plans.filter((plan) => plan.type === activeTab);

  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-white px-6 py-8 md:px-10 md:py-10">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_60%_at_50%_0%,color-mix(in_oklab,var(--accent)_10%,transparent),transparent_65%)]" />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
      />

      <div className="relative">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 text-center">
          <h2 className="text-pretty text-3xl font-bold md:text-5xl font-display">{heading}</h2>
          <p className="max-w-2xl text-foreground/70 md:text-lg">{description}</p>

          {/* Abas para alternar entre Serviços e Planos */}
          <div className="flex p-1 bg-surface border border-border rounded-lg gap-1">
            <button
              onClick={() => setActiveTab("servicos")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "servicos"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-surface/50"
              }`}
            >
              Serviços Pontuais
            </button>
            <button
              onClick={() => setActiveTab("planos")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "planos"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-surface/50"
              }`}
            >
              Planos de Gestão
            </button>
          </div>

          {/* Toggle Mensal/Anual - Só aparece para Planos */}
          {activeTab === "planos" && (
            <div className="flex items-center gap-3 text-sm font-medium text-foreground/75">
              Mensal
              <Switch checked={isYearly} onCheckedChange={() => setIsYearly(!isYearly)} />
              Anual
            </div>
          )}

          <div className="mt-2 flex flex-col items-center justify-center gap-6 lg:flex-row lg:items-stretch w-full">
            {filteredPlans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`reveal card-animate flex w-full max-w-[22rem] flex-col justify-between border-border bg-surface/90 text-left backdrop-blur ${
                  index % 2 === 0 ? "reveal-left" : "reveal-right"
                }`}
              >
                <CardHeader>
                  <CardTitle>
                    <p className="text-foreground font-display">{plan.name}</p>
                  </CardTitle>
                  <p className="text-sm text-foreground/70">{plan.description}</p>
                  <span className="text-4xl font-bold text-accent">
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  {activeTab === "planos" && (
                    <p className="text-sm text-foreground/60">
                      Cobrança anual: {toAnnual(isYearly ? plan.yearlyPrice : plan.monthlyPrice)}
                    </p>
                  )}
                </CardHeader>

                <CardContent>
                  <Separator className="mb-6 bg-border" />
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-2 text-sm text-foreground/85">
                        <CircleCheck className="size-4 text-accent" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto">
                  <Button
                    asChild
                    className="w-full rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <a href={plan.button.url}>
                      {plan.button.text}
                      <ArrowRight className="ml-2 size-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Pricing2 };
