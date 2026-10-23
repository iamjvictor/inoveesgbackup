import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

export interface PDFGeneratorOptions {
  isSupplierOrg: boolean;
  model: {
    globalScore: number;
    globalProvenScore: number;
    isPreDiagnostic: boolean;
    axisScores: Array<{
      axis: string;
      score: number;
      provenScore: number;
      interpretation: string;
    }>;
  };
  companyName: string;
  cnpj: string;
  tradeName?: string;
  segment?: string;
  invites: any[];
  porte?: string;
  localizacao?: string;
  naturezaJuridica?: string;
  responsibleName?: string;
  responsibleRole?: string;
  responsibleEmail?: string;
  responsiblePhone?: string;
  participationLevel?: string;
  address?: string;
  website?: string;
  numberOfCollaborators?: string;
  operationTime?: string;
  companyLogoUrl?: string;
}

const maturityLevels: Record<
  number,
  { name: string; subtitle: string; description: string; recommendation: string }
> = {
  1: {
    name: "Nível 1 – Elementar",
    subtitle: "Estágio Inicial de Sustentabilidade",
    description:
      "O presente diagnóstico indica que a organização se encontra em estágio inicial de maturidade em sustentabilidade, apresentando práticas ainda incipientes relacionadas aos critérios ambientais, sociais, de governança e bioeconomia.\n\nNeste nível, observa-se predominância do atendimento a requisitos regulatórios mínimos, quando aplicáveis, ou ações pontuais ainda não estruturadas de forma sistêmica dentro do modelo de gestão organizacional.\n\nEmbora os critérios ESG e bioeconômicos ainda não estejam plenamente incorporados às operações, este estágio representa uma fase estratégica de sensibilização e construção de bases institucionais para evolução sustentável do negócio. A organização demonstra potencial para iniciar processos estruturados de fortalecimento da governança, mitigação de riscos socioambientais e ampliação da capacidade adaptativa frente às transformações do mercado.\n\nSob a perspectiva da bioeconomia, recomenda-se iniciar o reconhecimento dos principais impactos associados à cadeia produtiva, à origem de matérias-primas, ao uso de recursos naturais, aos resíduos gerados e às oportunidades de circularidade, rastreabilidade e eficiência operacional. Mesmo em modelos de negócio não diretamente vinculados ao setor biotecnológico, a incorporação gradual de princípios bioeconômicos pode contribuir para maior resiliência e inovação organizacional.",
    recommendation:
      "Priorizar a estruturação inicial de políticas, responsabilidades e mecanismos básicos de acompanhamento ESG, bem como iniciar o mapeamento dos impactos socioambientais e bioeconômicos relacionados ao modelo de negócio, cadeia de valor e relacionamento com stakeholders.",
  },
  2: {
    name: "Nível 2 – Estruturante",
    subtitle: "Estruturação das Práticas ESG",
    description:
      "O presente diagnóstico indica que a organização se encontra em uma fase de estruturação inicial dos critérios ESG e bioeconômicos, apresentando iniciativas relevantes, porém ainda fragmentadas, sem integração sistêmica ao modelo de gestão e à estratégia organizacional.\n\nNeste estágio, observam-se ações pontuais relacionadas à sustentabilidade, conformidade regulatória, responsabilidade social ou melhoria operacional, mas ainda sem mecanismos consistentes de governança, monitoramento e mensuração de resultados.\n\nA organização demonstra avanço em relação ao estágio elementar, evidenciando maior conscientização sobre os impactos ambientais, sociais, econômicos e reputacionais associados às suas operações. Entretanto, as iniciativas existentes ainda tendem a ocorrer de forma descentralizada, muitas vezes dependentes de esforços isolados, sem definição clara de indicadores, metas estruturadas ou responsabilidades institucionais formalizadas.\n\nSob a perspectiva da bioeconomia, este estágio representa uma oportunidade estratégica para aprofundar a compreensão sobre os fluxos de recursos utilizados no modelo de negócio, origem de matérias-primas, eficiência produtiva, geração de resíduos, potencial de circularidade e impactos territoriais relacionados às atividades da organização.",
    recommendation:
      "Priorizar a integração das práticas ESG e bioeconômicas ao modelo de gestão, estabelecendo metas, indicadores e mecanismos de monitoramento contínuo, além de fortalecer processos internos relacionados à governança, gestão de riscos, cadeia de valor e tomada de decisão sustentável.",
  },
  3: {
    name: "Nível 3 – Gerencial",
    subtitle: "Gestão Integrada ESG e Bioeconômica",
    description:
      "O presente diagnóstico indica que a organização apresenta um nível gerencial de maturidade ESG e bioeconômica, demonstrando integração progressiva dos princípios de sustentabilidade ao modelo de gestão e às operações organizacionais.\n\nNeste estágio, observam-se processos mais estruturados, mecanismos de controle definidos e uma compreensão ampliada sobre os impactos ambientais, sociais, econômicos e de governança relacionados ao negócio e à cadeia de valor.\n\nA organização evidencia maior capacidade de planejamento e execução de práticas sustentáveis, incorporando progressivamente critérios ESG nos processos de tomada de decisão, gestão de pessoas, relacionamento com stakeholders, cadeia produtiva e monitoramento de riscos e oportunidades. Este estágio representa um marco relevante de maturidade, uma vez que as ações deixam de ocorrer de forma isolada e passam a compor uma lógica organizacional mais integrada e orientada à melhoria contínua.\n\nSob a perspectiva da bioeconomia, observa-se potencial para consolidação de estratégias voltadas ao uso mais eficiente de recursos, valorização de ativos biológicos, redução de desperdícios, rastreabilidade de processos e fortalecimento de práticas relacionadas à circularidade, regeneração e inovação sustentável.",
    recommendation:
      "Fortalecer a integração dos critérios ESG e bioeconômicos à estratégia organizacional, ampliando a gestão de riscos e oportunidades, consolidando indicadores de desempenho e promovendo maior alinhamento entre sustentabilidade, inovação e geração de valor para stakeholders e cadeia de valor.",
  },
  4: {
    name: "Nível 4 – Estratégico",
    subtitle: "Sustentabilidade Estratégica e Competitiva",
    description:
      "O presente diagnóstico indica que a organização apresenta um nível estratégico de maturidade ESG e bioeconômica, incorporando de maneira consistente princípios ambientais, sociais, de governança e sustentabilidade produtiva aos processos decisórios e ao direcionamento do negócio.\n\nNeste estágio, a sustentabilidade deixa de representar apenas um conjunto de práticas operacionais e passa a constituir um elemento estratégico relevante para geração de valor, mitigação de riscos e fortalecimento da competitividade organizacional.\n\nA organização demonstra capacidade de integrar critérios ESG à gestão de riscos e oportunidades, considerando impactos positivos e negativos associados às suas operações, cadeia de suprimentos, stakeholders e contexto territorial em que está inserida. Observa-se maior alinhamento entre propósito organizacional, desempenho econômico e responsabilidade socioambientais, favorecendo tomadas de decisão mais resilientes e orientadas ao longo prazo.\n\nSob a perspectiva da bioeconomia, este estágio evidencia potencial para fortalecimento de estratégias relacionadas ao uso eficiente de recursos biológicos, valorização da biodiversidade, circularidade produtiva, rastreabilidade e inovação regenerativa.",
    recommendation:
      "Consolidar a sustentabilidade como eixo estruturante do modelo de negócio, ampliando a influência positiva sobre stakeholders, cadeia de valor e ecossistemas de inovação, bem como fortalecer práticas regenerativas, métricas de impacto e mecanismos de colaboração interinstitucional para geração de valor compartilhado.",
  },
  5: {
    name: "Nível 5 – Transformador",
    subtitle: "Liderança Transformadora e Regenerativa",
    description:
      "O presente diagnóstico indica que a organização apresenta um nível transformador de maturidade ESG e bioeconômica, posicionando a sustentabilidade como elemento estruturante do modelo de negócio, da cultura organizacional e da estratégia de longo prazo.\n\nNeste estágio, os princípios ambientais, sociais, de governança e bioeconomia encontram-se amplamente integrados às operações, à tomada de decisão, à inovação e às relações estabelecidas ao longo da cadeia de valor.\n\nA organização demonstra elevada capacidade de antecipação frente a riscos emergentes, mudanças regulatórias, transformações climáticas e novas exigências de mercado, utilizando os critérios ESG não apenas como instrumento de conformidade, mas como mecanismo de geração de valor, diferenciação competitiva e fortalecimento da resiliência organizacional.\n\nSob a perspectiva da bioeconomia, este estágio reflete uma integração avançada de princípios relacionados ao uso sustentável e regenerativo de recursos biológicos, inovação baseada em biodiversidade, circularidade, rastreabilidade, eficiência produtiva e valorização dos ativos naturais e territoriais.",
    recommendation:
      "Fortalecer mecanismos de inovação regenerativa, mensuração de impacto e colaboração interinstitucional, ampliando a influência positiva sobre cadeias produtivas e ecossistemas de inovação, além de consolidar práticas que promovam não apenas sustentabilidade, mas regeneração socioambiental e criação de valor sistêmico no longo prazo.",
  },
};

// --- Helpers de dados ---

function classifyScore(score: number): { name: string; levelIndex: number } {
  if (score >= 90) return { name: "Nível 5 – Transformador", levelIndex: 5 };
  if (score >= 80) return { name: "Nível 4 – Estratégico", levelIndex: 4 };
  if (score >= 60) return { name: "Nível 3 – Gerencial", levelIndex: 3 };
  if (score >= 40) return { name: "Nível 2 – Estruturante", levelIndex: 2 };
  return { name: "Nível 1 – Elementar", levelIndex: 1 };
}

function buildStarsHtml(score: number): { html: string; value: string } {
  const raw = score / 20; // 0-100 → 0-5
  const full = Math.floor(raw);
  const half = raw - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const star = (fill: string, opacity = "1") => {
    const stroke = fill === "none" ? "#aebdcd" : "#f6a51a";
    const emptyFill = fill === "none" ? "#f4f7fa" : fill;
    return `<svg class="star-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3z" fill="${emptyFill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" opacity="${opacity}"/></svg>`;
  };
  const html =
    star("#f6a51a").repeat(full) +
    (half ? star("#f6a51a", "0.5") : "") +
    star("none", "0.35").repeat(empty);
  return { html, value: raw.toFixed(1) };
}

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function displayValue(value: string | number | null | undefined, fallback = "Não informado"): string {
  const normalized = String(value ?? "").trim();
  return escapeHtml(normalized || fallback);
}

function formatCnpjCpf(value: string | number | null | undefined): string {
  if (!value) return "";
  const str = String(value).trim();
  const digits = str.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return str;
}

function formatPhone(value: string | number | null | undefined): string {
  if (!value) return "";
  const str = String(value).trim();
  let digits = str.replace(/\D/g, "");
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    digits = digits.slice(2);
  }
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return str;
}

// Calcula coordenadas SVG a partir de score (0-100), centro 100,100, raio 80
function radarPoint(
  score: number,
  angleDeg: number,
  cx = 100,
  cy = 100,
  maxR = 80
): { x: number; y: number } {
  const r = (score / 100) * maxR;
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: Math.round((cx + r * Math.cos(rad)) * 10) / 10,
    y: Math.round((cy + r * Math.sin(rad)) * 10) / 10,
  };
}

function buildRadarPoints(axisScores: PDFGeneratorOptions["model"]["axisScores"], globalScore: number): string {
  const getScore = (key: string) =>
    axisScores?.find((a) => a.axis === key)?.score ?? globalScore;

  // ângulos: Ambiental=0°(topo), Bioeconomia=72°, Social=144°, Governança=216°, Nota Geral=288°
  const scores = [
    { key: "E", angle: 0 },
    { key: "B", angle: 72 },
    { key: "S", angle: 144 },
    { key: "G", angle: 216 },
    { key: "GLOBAL", angle: 288 },
  ];

  return scores
    .map((s) => {
      const sc = s.key === "GLOBAL" ? globalScore : getScore(s.key);
      const p = radarPoint(sc, s.angle);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

function buildAxesCards(axisScores: PDFGeneratorOptions["model"]["axisScores"]): string {
  const axes = [
    {
      key: "E",
      icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4C11 4 5 8 4 17c4 1 8-1 10-4"/><path d="M4 20c3-6 7-9 13-12"/></svg>`,
      name: "Ambiental",
      cls: "ambient",
      color: "#059669",
    },
    {
      key: "B",
      icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8a8 8 0 0 1 13-2l2 2"/><path d="M20 4v4h-4"/><path d="M19 16a8 8 0 0 1-13 2l-2-2"/><path d="M4 20v-4h4"/></svg>`,
      name: "Bioeconomia Circular",
      cls: "bio",
      color: "#d97706",
    },
    {
      key: "S",
      icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15 15a5 5 0 0 1 6 5"/></svg>`,
      name: "Social",
      cls: "social",
      color: "#2563eb",
    },
    {
      key: "G",
      icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20V9h12v11M4 9l8-5 8 5M9 12v2M12 12v2M15 12v2"/></svg>`,
      name: "Governança",
      cls: "gov",
      color: "#7c3aed",
    },
  ];

  return axes
    .map((ax) => {
      const item = axisScores?.find((a) => a.axis === ax.key) ?? {
        score: 0,
        provenScore: 0,
        interpretation: "Informação em análise.",
      };
      return `
      <div class="axis-card ${ax.cls}">
        <div class="axis-header">
          <span class="axis-title" style="color:${ax.color};">
            <span class="axis-icon">${ax.icon}</span>
            <span class="axis-name">${ax.name}</span>
          </span>
        </div>
        <div class="bar-group">
          <div class="bar-label"><strong>Declarado</strong><span>${item.score}%</span></div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill fill-declarado" style="width:${item.score}%;"></div>
          </div>
        </div>
        <div class="bar-group">
          <div class="bar-label"><strong>Comprovado</strong><span>${item.provenScore}%</span></div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill fill-comprovado" style="width:${item.provenScore}%;"></div>
          </div>
        </div>
        <p class="axis-interpretation">${escapeHtml(item.interpretation || "")}</p>
      </div>`;
    })
    .join("\n");
}

function buildPriorityHtml(axisScores: PDFGeneratorOptions["model"]["axisScores"]): string {
  const labels: Record<string, string> = {
    E: "Ambiental",
    B: "Bioeconomia Circular",
    S: "Social",
    G: "Governança",
  };

  const priorities = [...(axisScores ?? [])]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item, index) => {
      const priorityLabel = index === 0 ? "Prioridade Alta" : index === 1 ? "Prioridade Média" : "Prioridade de Apoio";
      return `
        <div class="priority-item">
          <span>${priorityLabel}: ${labels[item.axis] ?? item.axis}</span>
          <strong>${item.score}%</strong>
        </div>`;
    })
    .join("");

  return priorities || `
    <div class="priority-item">
      <span>Prioridades em processamento</span>
      <strong>—</strong>
    </div>`;
}

function buildCardComprovado(hasVerified: boolean, scoreComprovado: number): string {
  const badgeText = hasVerified ? "Verificado InoveESG" : "Verificado InoveESG";
  const noteText = hasVerified
    ? "Evidências validadas e auditadas"
    : "Evidências validadas e auditadas";
  return `
  <div class="result-score-card proven">
    <div style="display:flex; justify-content:center; align-items:center;">
      <div class="proof-ring">${scoreComprovado}%</div>
    </div>
    <div>
      <div class="score-label">Score Comprovado</div>
      <div class="score-number">${scoreComprovado}%</div>
      <div class="score-note">${noteText}</div>
      <span class="verified-pill">${badgeText}</span>
    </div>
  </div>`;
}

function buildSupplyChainHtml(invites: any[]): string {
  if (!invites || invites.length === 0) {
    return `
    <div class="supply-chain-box">
      <h3>Rastreamento da Cadeia de Fornecedores Indisponível</h3>
      <p>A organização não possui rastreamento da cadeia de valor ativo neste relatório. O mapeamento da cadeia de suprimentos permite monitorar e gerenciar os riscos socioambientais de seus parceiros comerciais, garantindo a conformidade e promovendo a bioeconomia circular ao longo de todo o ciclo de valor.</p>
      <p style="margin-top:12px;">Para iniciar o monitoramento, adquira convites na plataforma InoveESG e convide seus fornecedores para realizarem o diagnóstico corporativo gratuito.</p>
    </div>`;
  }

  const completed = invites.filter(
    (i: any) => i.requestedDiagnostics?.[0]?.status === "COMPLETED"
  );

  let rows = invites
    .slice(0, 15)
    .map((inv: any) => {
      const diag = inv.requestedDiagnostics?.[0];
      const status = diag?.status === "COMPLETED" ? "✓ Concluído" : "Pendente";
      const score = diag?.model?.globalScore ?? "-";
      const name = inv.supplierOrg?.name ?? inv.email ?? "-";
      return `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(status)}</td><td>${score !== "-" ? escapeHtml(score) + "%" : "-"}</td></tr>`;
    })
    .join("");

  return `
  <p style="font-size:9.5pt; color:#475569; margin-bottom:14px;">
    A organização possui <strong>${invites.length}</strong> fornecedor(es) mapeado(s), dos quais <strong>${completed.length}</strong> concluíram o diagnóstico ESG.
  </p>
  <table class="supplier-table">
    <thead><tr><th>Fornecedor</th><th>Status</th><th>Score ESG</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function buildLevelNarrative(levelIndex: number): {
  title: string;
  subtitle: string;
  nextLevel: number;
  description: string;
  recommendationTitle: string;
  recommendation: string;
} {
  const level = maturityLevels[levelIndex] ?? maturityLevels[1];
  const nextLevel = Math.min(levelIndex + 1, 5);
  const nextLevelLabel = nextLevel > levelIndex ? `ao Nível ${nextLevel}` : "para manutenção do Nível 5";

  const analysisContinuation =
    "Empresas neste nível tendem a desenvolver maior capacidade de adaptação às demandas emergentes por modelos produtivos mais resilientes, eficientes e alinhados às transformações da economia verde.\n\n" +
    "A organização poderá se beneficiar da ampliação de mecanismos de monitoramento e mensuração de desempenho ESG e bioeconômico, incluindo definição de indicadores-chave, estabelecimento de metas progressivas e fortalecimento de instrumentos de transparência, como relatórios internos ou demonstrações periódicas de resultados.\n\n" +
    "A consolidação desses mecanismos favorece maior previsibilidade organizacional, mitigação de riscos operacionais e reputacionais, além de fortalecer a credibilidade institucional perante parceiros estratégicos.";

  const recommendationLeadIn =
    "À medida que a maturidade evolui, empresas neste nível tendem a ampliar sua competitividade e capacidade de inserção em mercados que demandam maior conformidade socioambiental, rastreabilidade e inovação responsável.\n\n" +
    "Esse avanço pode fortalecer o acesso a ambientes de aceleração, programas de inovação, cadeias produtivas sustentáveis, investimentos orientados à sustentabilidade e oportunidades vinculadas à transição para modelos econômicos de menor impacto socioambiental.";

  const strategicContinuation =
    "O resultado obtido neste pré-diagnóstico representa o ponto de partida da jornada ESG da organização.\n\n" +
    "Recomenda-se que a empresa realize uma avaliação técnica aprofundada para validação das evidências, identificação de lacunas e elaboração de um Plano Estratégico ESG personalizado, contemplando ações de curto, médio e longo prazo, indicadores de desempenho, metas mensuráveis e mecanismos de monitoramento contínuo.\n\n" +
    "A depender do nível de maturidade identificado, a organização poderá avançar para etapas como inventário de emissões, estruturação de indicadores ESG, implantação de programas de Bioeconomia Circular, desenvolvimento de políticas corporativas, rastreabilidade da cadeia de fornecedores, preparação para certificações, elaboração de Relatórios de Sustentabilidade e implementação de soluções tecnológicas de monitoramento.\n\n" +
    "A evolução contínua dessas práticas contribui para fortalecer a governança, reduzir riscos, ampliar a eficiência operacional, aumentar a atratividade para investidores e gerar valor compartilhado para clientes, parceiros, colaboradores, sociedade e meio ambiente.";

  return {
    title: level.name,
    subtitle: level.subtitle,
    nextLevel,
    description: `${level.description}\n\n${analysisContinuation}`,
    recommendationTitle: `Recomendação Estratégica para Evolução ${nextLevelLabel}:`,
    recommendation: `${level.recommendation}\n\n${recommendationLeadIn}\n\n${strategicContinuation}`,
  };
}

function buildFooterHtml(): string {
  return `
    <div class="page-footer">
      <div class="footer-bar-left"></div>
      <div class="footer-text">
        <a href="http://www.inoveesg.com.br/" class="footer-link">WWW.INOVEESG.COM.BR</a>
        <span class="footer-sep">&nbsp;|&nbsp;</span>
        <span class="footer-phone">(22) 99808-7323</span>
      </div>
      <div class="footer-bar-right"></div>
    </div>`;
}

// --- Função principal ---

export async function generateESGReportPDF({
  model,
  companyName,
  cnpj,
  tradeName,
  segment,
  invites,
  porte,
  localizacao,
  naturezaJuridica,
  responsibleName,
  responsibleRole,
  responsibleEmail,
  responsiblePhone,
  participationLevel,
  address,
  website,
  numberOfCollaborators,
  operationTime,
  companyLogoUrl,
}: PDFGeneratorOptions): Promise<Buffer> {
  const scoreGeral = model.globalScore ?? 0;
  const scoreComprovado = model.globalProvenScore ?? 0;
  const hasVerifiedScore = scoreComprovado > 0;

  const { name: levelName, levelIndex } = classifyScore(scoreGeral);
  const levelNarrative = buildLevelNarrative(levelIndex);
  const stars = buildStarsHtml(scoreGeral);

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const dateExtenso = now.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const __dir = path.dirname(fileURLToPath(import.meta.url));

  // Função auxiliar para carregar imagens em Base64
  const toBase64 = (filePath: string, mime = "image/png"): string => {
    return fs.existsSync(filePath)
      ? `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`
      : "";
  };

  // Imagens oficiais do modelo Word (assets/img)
  const coverLogoImage =
    toBase64(path.join(__dir, "../models/assets/img/image14.png")) ||
    toBase64(path.join(__dir, "../models/assets/img/image3.png"));
  const headerLogoImage =
    toBase64(path.join(__dir, "../models/assets/img/image15.png")) || coverLogoImage;
  const headerBarImage = toBase64(path.join(__dir, "../models/assets/img/image8.png"));
  const watermarkImage =
    toBase64(path.join(__dir, "../models/assets/img/image11.png")) ||
    toBase64(path.join(__dir, "../models/assets/img/image4.png"));
  const bisImage =
    toBase64(path.join(__dir, "../models/assets/img/image16.png")) ||
    toBase64(path.join(__dir, "../models/assets/img/image22.png"));
  const footerBannerImage = toBase64(path.join(__dir, "../models/assets/img/image9.png"));
  const signatureLineImage = toBase64(path.join(__dir, "../models/assets/img/image5.png"));
  const iconInstagram = toBase64(path.join(__dir, "../models/assets/img/image7.png"));
  const iconEmail = toBase64(path.join(__dir, "../models/assets/img/image13.png"));
  const iconWeb = toBase64(path.join(__dir, "../models/assets/img/image10.png"));
  const iconPhone = toBase64(path.join(__dir, "../models/assets/img/image6.png"));
  const signatureDanieleImage = toBase64(
    path.join(__dir, "../models/assets/img/assinatura_daniele.jpg"),
    "image/jpeg"
  );

  // Logo da Empresa não é mais exibida no cabeçalho conforme alinhamento com modelo oficial
  const companyLogoHtml = "";

  // Status badge
  const statusClass = hasVerifiedScore ? "auditado" : "declaratorio";
  const statusText = hasVerifiedScore
    ? "✓ STATUS: RELATÓRIO AUDITADO E VERIFICADO (SELO ESG)"
    : "⚠ STATUS: RELATÓRIO DECLARATÓRIO (SEM COMPROVAÇÃO DE EVIDÊNCIAS)";
  const statusBadge = hasVerifiedScore ? "Verificado" : "Declaratório";

  // Destacar linha da tabela de maturidade
  const highlights: Record<number, string> = {};
  for (let i = 1; i <= 5; i++) {
    highlights[i] = i === levelIndex ? 'class="highlight-row"' : "";
  }

  // Score comprovado label
  const scoreComprovadoLabel = hasVerifiedScore
    ? `| Score Comprovado: <strong>${scoreComprovado}%</strong>`
    : "";

  // Ler template HTML
  const templatePath = path.join(__dir, "../models/assets/template_relatorio.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  const reportTitle = "Relatório de Pré-Diagnóstico<br>ESG &amp; Bioeconomia Circular";

  // Substituir placeholders
  html = html
    .replace(/\{\{REPORT_TITLE\}\}/g, reportTitle)
    .replace(/\{\{COMPANY_NAME\}\}/g, displayValue(companyName, "Nome do Cliente (empresa)"))
    .replace(/\{\{TRADE_NAME\}\}/g, displayValue(tradeName, ""))
    .replace(/\{\{RESPONSIBLE_NAME\}\}/g, displayValue(responsibleName, "Nome completo do responsável respondente"))
    .replace(/\{\{RESPONSIBLE_ROLE\}\}/g, displayValue(responsibleRole, "Cargo / Função"))
    .replace(/\{\{RESPONSIBLE_EMAIL\}\}/g, displayValue(responsibleEmail, ""))
    .replace(/\{\{RESPONSIBLE_PHONE\}\}/g, displayValue(formatPhone(responsiblePhone), ""))
    .replace(/\{\{PARTICIPATION_LEVEL\}\}/g, displayValue(participationLevel, ""))
    .replace(/\{\{CNPJ\}\}/g, displayValue(formatCnpjCpf(cnpj), ""))
    .replace(/\{\{LOCALIZACAO\}\}/g, displayValue(localizacao, ""))
    .replace(/\{\{ADDRESS\}\}/g, displayValue(address, ""))
    .replace(/\{\{WEBSITE\}\}/g, displayValue(website, ""))
    .replace(/\{\{NATUREZA_JURIDICA\}\}/g, displayValue(naturezaJuridica, ""))
    .replace(/\{\{SEGMENT\}\}/g, displayValue(segment, ""))
    .replace(/\{\{PORTE\}\}/g, displayValue(porte, ""))
    .replace(/\{\{NUMBER_OF_COLLABORATORS\}\}/g, displayValue(numberOfCollaborators, ""))
    .replace(/\{\{OPERATION_TIME\}\}/g, displayValue(operationTime, ""))
    .replace(/\{\{DATE\}\}/g, dateStr)
    .replace(/\{\{DATE_EXTENSO\}\}/g, dateExtenso)
    .replace(/\{\{COVER_LOGO_IMAGE\}\}/g, coverLogoImage)
    .replace(/\{\{HEADER_LOGO_IMAGE\}\}/g, headerLogoImage)
    .replace(/\{\{HEADER_BAR_IMAGE\}\}/g, headerBarImage)
    .replace(/\{\{WATERMARK_IMAGE\}\}/g, watermarkImage)
    .replace(/\{\{WATERMARK_IMAGE_SECOND\}\}/g, watermarkImage)
    .replace(/\{\{LOGO_IMAGE\}\}/g, coverLogoImage)
    .replace(/\{\{BIS_IMAGE\}\}/g, bisImage)
    .replace(/\{\{FOOTER_BANNER_IMAGE\}\}/g, footerBannerImage)
    .replace(/\{\{SIGNATURE_LINE_IMAGE\}\}/g, signatureLineImage)
    .replace(/\{\{ICON_INSTAGRAM\}\}/g, iconInstagram)
    .replace(/\{\{ICON_EMAIL\}\}/g, iconEmail)
    .replace(/\{\{ICON_WEB\}\}/g, iconWeb)
    .replace(/\{\{ICON_PHONE\}\}/g, iconPhone)
    .replace(/\{\{SIGNATURE_DANIELE_IMAGE\}\}/g, signatureDanieleImage)
    .replace(/\{\{COMPANY_LOGO_HTML\}\}/g, companyLogoHtml)
    .replace(/\{\{FOOTER_HTML\}\}/g, buildFooterHtml())
    .replace(/\{\{STATUS_CLASS\}\}/g, statusClass)
    .replace(/\{\{STATUS_TEXT\}\}/g, statusText)
    .replace(/\{\{STATUS_BADGE\}\}/g, statusBadge)
    .replace(/\{\{SCORE_DECLARADO\}\}/g, String(scoreGeral))
    .replace(/\{\{SCORE_COMPROVADO\}\}/g, String(scoreComprovado))
    .replace(/\{\{LEVEL_NAME\}\}/g, levelName)
    .replace(/\{\{STARS_HTML\}\}/g, stars.html)
    .replace(/\{\{STARS_VALUE\}\}/g, stars.value)
    .replace(/\{\{CARD_COMPROVADO_HTML\}\}/g, buildCardComprovado(hasVerifiedScore, scoreComprovado))
    .replace(/\{\{RADAR_POINTS\}\}/g, buildRadarPoints(model.axisScores, scoreGeral))
    .replace(/\{\{PRIORITY_HTML\}\}/g, buildPriorityHtml(model.axisScores))
    .replace(/\{\{AXES_CARDS_HTML\}\}/g, buildAxesCards(model.axisScores))
    .replace(/\{\{HIGHLIGHT_1\}\}/g, highlights[1])
    .replace(/\{\{HIGHLIGHT_2\}\}/g, highlights[2])
    .replace(/\{\{HIGHLIGHT_3\}\}/g, highlights[3])
    .replace(/\{\{HIGHLIGHT_4\}\}/g, highlights[4])
    .replace(/\{\{HIGHLIGHT_5\}\}/g, highlights[5])
    .replace(/\{\{LEVEL_TITLE\}\}/g, displayValue(levelNarrative.title))
    .replace(/\{\{LEVEL_SUBTITLE\}\}/g, displayValue(levelNarrative.subtitle))
    .replace(/\{\{NEXT_LEVEL\}\}/g, String(levelNarrative.nextLevel))
    .replace(/\{\{LEVEL_DESCRIPTION\}\}/g, escapeHtml(levelNarrative.description))
    .replace(/\{\{LEVEL_RECOMMENDATION_TITLE\}\}/g, displayValue(levelNarrative.recommendationTitle))
    .replace(/\{\{LEVEL_RECOMMENDATION\}\}/g, escapeHtml(levelNarrative.recommendation))
    .replace(/\{\{SCORE_COMPROVADO_LABEL\}\}/g, scoreComprovadoLabel)
    .replace(/\{\{SUPPLY_CHAIN_HTML\}\}/g, buildSupplyChainHtml(invites));

  // Em produção nem sempre existe um Chrome instalado no sistema.
  // Usa o Chrome do sistema localmente e o Chromium empacotado em produção.
  const systemChromePath = "/usr/bin/google-chrome";
  const executablePath = fs.existsSync(systemChromePath)
    ? systemChromePath
    : await chromium.executablePath();

  // Renderizar PDF com Puppeteer
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      ...chromium.args,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
      "--no-zygote",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    try {
      await browser.close();
    } catch (_) {
      // ignora erro no close
    }
  }
}
