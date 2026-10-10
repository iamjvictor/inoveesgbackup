import { Button } from "@/components/ui/button";
import { SectionHeading } from "../../components/section-heading";

export function SupplierInviteView() {
  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Fornecedores"
        title="Novo convite para diagnóstico ESG"
        description="Convide fornecedores individuais ou em lote para ampliar rastreabilidade da cadeia."
      />

      <section className="space-y-5 border border-border bg-white/75 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-foreground/75" htmlFor="company-name">
            <span>Nome da empresa fornecedora</span>
            <input
              id="company-name"
              type="text"
              className="w-full border border-border bg-background px-3 py-2 outline-none focus:border-foreground/35"
              placeholder="Ex: SoluTrans Logística"
            />
          </label>

          <label className="space-y-1 text-sm text-foreground/75" htmlFor="contact-email">
            <span>E-mail de contato</span>
            <input
              id="contact-email"
              type="email"
              className="w-full border border-border bg-background px-3 py-2 outline-none focus:border-foreground/35"
              placeholder="contato@empresa.com"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm text-foreground/75" htmlFor="invite-message">
          <span>Mensagem opcional</span>
          <textarea
            id="invite-message"
            className="min-h-28 w-full border border-border bg-background px-3 py-2 outline-none focus:border-foreground/35"
            placeholder="Contextualize prazo, expectativa e responsável interno."
          />
        </label>

        <label className="space-y-1 text-sm text-foreground/75" htmlFor="bulk-upload">
          <span>Upload em lote (CSV)</span>
          <input
            id="bulk-upload"
            type="file"
            className="w-full border border-dashed border-border bg-surface px-3 py-4 text-sm"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline">Salvar rascunho</Button>
          <Button>Enviar convite</Button>
        </div>
      </section>
    </div>
  );
}
