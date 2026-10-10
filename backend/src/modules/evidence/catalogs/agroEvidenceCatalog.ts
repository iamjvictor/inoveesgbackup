import { Axis } from "@prisma/client";

export type AgroEvidenceCatalogEntry = {
  code: string;
  title: string;
  points: 1 | 2 | 3;
  scoringAxes: readonly Axis[];
};

/** Catálogo de evidências do Agro convertido da planilha de evidências. */
export const agroEvidenceCatalog: readonly AgroEvidenceCatalogEntry[] = [
  { code: "EV01", title: "Licenciamento e regularidade ambiental", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.GOVERNANCE] },
  { code: "EV02", title: "Política ambiental", points: 2, scoringAxes: [Axis.ENVIRONMENTAL, Axis.GOVERNANCE] },
  { code: "EV03", title: "Metas e plano ambiental", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV04", title: "Gestão de água", points: 2, scoringAxes: [Axis.ENVIRONMENTAL, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV05", title: "Gestão de energia", points: 2, scoringAxes: [Axis.ENVIRONMENTAL, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV06", title: "Inventário de GEE", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV07", title: "Dados para cálculo de emissões", points: 2, scoringAxes: [Axis.ENVIRONMENTAL, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV08", title: "Plano de redução de GEE", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV09", title: "Dados da cadeia para Scope 3", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV10", title: "Gestão de resíduos", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV11", title: "Comprovantes de destinação", points: 2, scoringAxes: [Axis.ENVIRONMENTAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV12", title: "Reaproveitamento/valorização de resíduos", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV13", title: "Logística reversa", points: 2, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV14", title: "Estudo de ACV", points: 2, scoringAxes: [Axis.ENVIRONMENTAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV15", title: "Dados para ACV", points: 2, scoringAxes: [Axis.ENVIRONMENTAL, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV16", title: "Modelo/prática de economia circular", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV17", title: "Uso de matérias-primas biológicas", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV18", title: "Bioinsumos/soluções biológicas", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV19", title: "Agricultura regenerativa/sustentável", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV20", title: "Biodiversidade e conservação", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV21", title: "Rastreabilidade de produtos/insumos", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV22", title: "Critérios ESG para fornecedores", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV23", title: "Fornecedores locais/comunitários", points: 2, scoringAxes: [Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV24", title: "Saúde e segurança do trabalho", points: 3, scoringAxes: [Axis.SOCIAL, Axis.GOVERNANCE] },
  { code: "EV25", title: "Direitos humanos e código de conduta", points: 3, scoringAxes: [Axis.SOCIAL, Axis.GOVERNANCE] },
  { code: "EV26", title: "Diversidade e inclusão", points: 2, scoringAxes: [Axis.SOCIAL, Axis.GOVERNANCE] },
  { code: "EV27", title: "Capacitação e desenvolvimento", points: 1, scoringAxes: [Axis.SOCIAL] },
  { code: "EV28", title: "Relação com comunidade", points: 2, scoringAxes: [Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV29", title: "Governança e responsabilidades ESG", points: 3, scoringAxes: [Axis.GOVERNANCE] },
  { code: "EV30", title: "Código de ética/integridade", points: 2, scoringAxes: [Axis.SOCIAL, Axis.GOVERNANCE] },
  { code: "EV31", title: "Canal de denúncias/reclamações", points: 2, scoringAxes: [Axis.SOCIAL, Axis.GOVERNANCE] },
  { code: "EV32", title: "Gestão de riscos ESG", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV33", title: "Materialidade e stakeholders", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV34", title: "Indicadores e relatório ESG", points: 2, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV35", title: "Gestão financeira e controles", points: 3, scoringAxes: [Axis.GOVERNANCE] },
  { code: "EV36", title: "Inovação e P&D", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV37", title: "Propriedade intelectual", points: 2, scoringAxes: [Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV38", title: "Parcerias para inovação", points: 2, scoringAxes: [Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV39", title: "Impacto socioambiental e bioeconômico", points: 3, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
  { code: "EV40", title: "Evidências complementares de práticas", points: 1, scoringAxes: [Axis.ENVIRONMENTAL, Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR] },
];

export function getAgroEvidence(code: string) {
  return agroEvidenceCatalog.find((evidence) => evidence.code === code) ?? null;
}

export type EvidenceScoringProfile = {
  catalogCode: "AGRO";
  icebTotalPoints: number;
  pillarTotals: Record<(typeof evidenceScoreAxes)[number], number>;
};

const evidenceScoreAxes = [Axis.ENVIRONMENTAL, Axis.BIOECONOMY_CIRCULAR, Axis.SOCIAL, Axis.GOVERNANCE] as const;

function sumCatalogPoints(axis?: Axis) {
  return agroEvidenceCatalog.reduce((total, evidence) => (
    !axis || evidence.scoringAxes.includes(axis) ? total + evidence.points : total
  ), 0);
}

export const agroEvidenceScoringProfile: EvidenceScoringProfile = {
  catalogCode: "AGRO",
  icebTotalPoints: sumCatalogPoints(),
  pillarTotals: Object.fromEntries(evidenceScoreAxes.map((axis) => [axis, sumCatalogPoints(axis)])) as Record<(typeof evidenceScoreAxes)[number], number>,
};
