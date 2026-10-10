import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { getDiagnosticReviewViewModel } from "../../../controllers/diagnostic.controller";
import { SectionHeading } from "../../components/section-heading";

type DiagnosticReviewViewModel = ReturnType<typeof getDiagnosticReviewViewModel>;

export function DiagnosticReviewView({ model }: { model: DiagnosticReviewViewModel }) {
  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Diagnóstico ESG"
        title="Revisão antes do envio"
        description="Valide respostas obrigatórias e complete as evidências pendentes antes de gerar o score final."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="border border-border bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-foreground/55">Perguntas totais</p>
          <p className="mt-2 text-3xl font-semibold">{model.totalQuestions}</p>
        </article>
        <article className="border border-border bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-foreground/55">Sem resposta</p>
          <p className="mt-2 text-3xl font-semibold text-red-600">{model.missingAnswers.length}</p>
        </article>
        <article className="border border-border bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-foreground/55">Sem evidência</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{model.missingEvidence.length}</p>
        </article>
      </section>

      <section className="space-y-4 border border-border bg-white/70 p-5">
        <h2 className="text-lg font-semibold tracking-tight">Pendências de resposta</h2>
        {model.missingAnswers.length === 0 ? (
          <p className="text-sm text-foreground/70">Nenhuma pendência de resposta encontrada.</p>
        ) : (
          <ul className="space-y-2 text-sm text-foreground/75">
            {model.missingAnswers.map((question) => (
              <li key={question.id} className="border-b border-border/80 pb-2 last:border-0">
                Eixo {question.axis} • {question.prompt}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4 border border-border bg-white/70 p-5">
        <h2 className="text-lg font-semibold tracking-tight">Pendências de evidência</h2>
        {model.missingEvidence.length === 0 ? (
          <p className="text-sm text-foreground/70">Todas as respostas concluídas possuem evidência vinculada.</p>
        ) : (
          <ul className="space-y-2 text-sm text-foreground/75">
            {model.missingEvidence.map((question) => (
              <li key={question.id} className="border-b border-border/80 pb-2 last:border-0">
                Eixo {question.axis} • {question.prompt}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/app/diagnostico/preencher">Voltar ao preenchimento</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/app/evidencias">Completar evidências</Link>
        </Button>
        <Button>Finalizar diagnóstico</Button>
      </div>
    </div>
  );
}
