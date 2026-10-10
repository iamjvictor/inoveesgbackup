# Categoria Infraestrutura — Especificação Técnica

**Status:** implementada  
**Data:** 2026-10-07  
**Fonte funcional das perguntas:** `modelos_diagnostico/pre_diagnostico_infraestrutura.md`

## Objetivo

Adicionar a categoria de negócio **Infraestrutura** ao fluxo existente de cadastro e edição de perfil, fazendo com que o backend selecione um questionário ESG específico para essa categoria.

A implementação deve preservar a arquitetura atual: o frontend coleta os códigos da categoria e do segmento, enquanto o backend é a fonte de verdade para catálogo, validação, seleção e execução das perguntas. O mock legado em `frontend/src/features/company-area/models/mock-data.ts` permanece fora do escopo.

## Resultado esperado

Uma organização pode ser cadastrada ou atualizada com:

```ts
businessCategoryCode: "INFRAESTRUTURA"
businessSegmentCode: "INFRAESTRUTURA"
industrySegment: "Infraestrutura"
```

Ao iniciar um diagnóstico, o backend deve retornar as 75 perguntas definidas no documento funcional de Infraestrutura, distribuídas assim:

| Eixo | Quantidade | Enum backend |
|---|---:|---|
| Ambiental | 21 | `ENVIRONMENTAL` |
| Social | 17 | `SOCIAL` |
| Governança | 23 | `GOVERNANCE` |
| Bioeconomia Circular | 14 | `BIOECONOMY_CIRCULAR` |
| Total | 75 | — |

## Fluxo atual que deve ser estendido

1. O formulário de cadastro mantém uma lista local de opções e envia `businessCategoryCode` e `businessSegmentCode` para a API.
2. O formulário de perfil repete a mesma lista para edição da organização.
3. `backend/src/config/businessCatalog.ts` é o catálogo central usado pela validação Zod da API.
4. O Prisma persiste a categoria e o segmento em `business_categories` e `business_segments`.
5. `getDiagnosticQuestionsForSegment()` seleciona a lista de perguntas com base no código do segmento, código da categoria e nome normalizado.
6. As perguntas seguem `DiagnosticQuestion`:

```ts
interface DiagnosticQuestion {
  number: number;
  prompt: string;
  axis: Axis;
  category: string;
  weight?: number;
  type?: DiagnosticQuestionPriority;
  options: DiagnosticOption[];
}
```

## Contrato da nova categoria

### Códigos e nomes

| Conceito | Código | Nome exibido |
|---|---|---|
| Categoria | `INFRAESTRUTURA` | `Infraestrutura` |
| Segmento | `INFRAESTRUTURA` | `Infraestrutura` |

O código deve ser usado em maiúsculas, sem acentos e com sublinhado, seguindo o padrão de `AGRONEGOCIO` e `OLEO_E_GAS`.

### Questionário

Adicionar em `backend/src/modules/diagnostic/models/diagnosticModel.ts`:

```ts
export const infrastructureDiagnosticQuestions: DiagnosticQuestion[] = [...];
```

Cada item deve ser convertido a partir de uma pergunta do arquivo funcional, mantendo:

- numeração sequencial de `1` a `75`;
- texto integral da pergunta no campo `prompt`;
- eixo ESG correspondente no campo `axis`;
- classificação funcional no campo `type`:
  - `Essencial` → `ESSENTIAL`;
  - `Estratégica` → `STRATEGIC`;
  - `Diferencial` → `DIFFERENTIAL`;
  - `Complementar` → `COMPLEMENTARY`, caso apareça no documento;
- peso numérico exatamente como definido no documento:
  - Essencial → `1.5`;
  - Estratégica → `1.25`;
  - Diferencial → `1.0`;
  - Complementar → peso explicitamente informado no documento;
- opções padronizadas de maturidade, equivalentes às usadas pelo questionário de Óleo e Gás, salvo se uma pergunta de Infraestrutura exigir opções específicas documentadas.

Os textos das perguntas não devem ser recriados a partir do questionário Agro ou Óleo e Gás. O documento `modelos_diagnostico/pre_diagnostico_infraestrutura.md` é a fonte funcional e deve ser atualizado antes do código caso alguma pergunta seja alterada.

### Seleção pelo backend

Estender `getDiagnosticQuestionsForSegment()` com uma regra explícita para Infraestrutura:

```ts
if (
  normalizedCode === "INFRAESTRUTURA" ||
  normalizedCategoryCode === "INFRAESTRUTURA" ||
  normalizedSegment === "Infraestrutura"
) {
  return infrastructureDiagnosticQuestions;
}
```

A regra deve ficar junto da seleção específica de Óleo e Gás, antes do fallback para `agroDiagnosticQuestions`.

A seleção deve funcionar nos seguintes casos:

| Entrada | Resultado |
|---|---|
| `categoryCode = INFRAESTRUTURA` | Questionário de Infraestrutura |
| `segmentCode = INFRAESTRUTURA` | Questionário de Infraestrutura |
| `segmentName = Infraestrutura` | Questionário de Infraestrutura |
| valores em minúsculas ou com espaços externos | Questionário de Infraestrutura após normalização |
| categoria/segmento Agro | Questionário Agro existente |
| categoria/segmento Óleo e Gás | Questionário Óleo e Gás existente |

Para o escopo inicial, Infraestrutura usará a lista completa de 75 perguntas também quando o diagnóstico for iniciado como fornecedor, porque não existe uma lista reduzida de fornecedor de Infraestrutura neste documento. Se posteriormente for necessário um questionário reduzido, ele deverá ser adicionado como contrato separado, sem alterar silenciosamente esta lista.

## Persistência e catálogo

### Prisma e migration

Adicionar os valores aos enums:

```prisma
enum BusinessCategoryCode {
  AGRONEGOCIO
  OLEO_E_GAS
  INFRAESTRUTURA
}

enum BusinessSegmentCode {
  AGROINDUSTRIA
  PRODUCAO
  OLEO_E_GAS
  INFRAESTRUTURA
}
```

Criar uma migration incremental equivalente às migrations de Óleo e Gás:

- `ALTER TYPE "BusinessCategoryCode" ADD VALUE IF NOT EXISTS 'INFRAESTRUTURA'`;
- `ALTER TYPE "BusinessSegmentCode" ADD VALUE IF NOT EXISTS 'INFRAESTRUTURA'`;
- upsert de `business_categories` com nome `Infraestrutura`;
- upsert de `business_segments` vinculado à categoria `INFRAESTRUTURA`.

Não deve haver backfill automático de organizações existentes para Infraestrutura. Organizações atuais permanecem com seus códigos já persistidos.

### Catálogo central e seed

Atualizar `backend/src/config/businessCatalog.ts`:

```ts
BUSINESS_CATEGORIES += { code: "INFRAESTRUTURA", name: "Infraestrutura" };

BUSINESS_SEGMENTS.INFRAESTRUTURA = [
  { code: "INFRAESTRUTURA", name: "Infraestrutura" },
];
```

Atualizar `backend/src/scripts/seed-business-categories.ts` para fazer `upsert` da nova categoria e do novo segmento. A operação deve ser idempotente.

## Frontend

Adicionar a opção nos dois locais existentes:

- `frontend/src/features/auth/views/components/register-form.tsx`;
- `frontend/src/features/company-area/views/pages/perfil/profile-view.tsx`.

O comportamento esperado é:

- categoria aparece no seletor como `Infraestrutura`;
- ao selecionar a categoria, segmento `Infraestrutura` aparece automaticamente;
- trocar de categoria limpa o segmento e a atividade específica, como já ocorre hoje;
- o formulário envia os códigos `INFRAESTRUTURA`;
- nenhuma pergunta deve ser copiada para o frontend.

Como o catálogo está duplicado nos dois componentes, a implementação deve manter os dois pontos sincronizados. Uma refatoração para consumir o catálogo via endpoint compartilhado é desejável, mas fica fora do escopo desta categoria.

## Camada de TDD

A implementação deve seguir o ciclo red/green/refactor. Cada grupo abaixo precisa ter teste escrito antes do código correspondente.

### TDD 1 — Catálogo

Arquivo: `backend/src/config/businessCatalog.test.ts`

Teste inicial:

```ts
test("expõe infraestrutura como categoria com segmento próprio", () => {
  assert.deepEqual(BUSINESS_CATEGORIES.find((item) => item.code === "INFRAESTRUTURA"), {
    code: "INFRAESTRUTURA",
    name: "Infraestrutura",
  });

  assert.deepEqual(BUSINESS_SEGMENTS.INFRAESTRUTURA, [
    { code: "INFRAESTRUTURA", name: "Infraestrutura" },
  ]);
});
```

Resultado esperado antes da implementação: falha porque a categoria não existe. Depois da implementação: passa.

### TDD 2 — Questionário e contrato

Adicionar teste no módulo de diagnóstico para verificar:

- lista exportada;
- exatamente 75 itens;
- números únicos de `1` a `75`;
- contagem por eixo `21/17/23/14`;
- todos os itens possuem `prompt`, `axis`, `category`, `type`, `weight` e cinco opções;
- pesos válidos pertencem a `{1, 1.25, 1.5}`;
- os itens de Infraestrutura usam os textos derivados do documento funcional.

O teste deve falhar antes de a lista ser criada e passar após a conversão do markdown para o contrato TypeScript.

### TDD 3 — Seleção

Adicionar testes para `getDiagnosticQuestionsForSegment()` cobrindo:

```ts
assert.equal(
  getDiagnosticQuestionsForSegment("Infraestrutura", "INFRAESTRUTURA", "INFRAESTRUTURA").length,
  75,
);

assert.equal(
  getDiagnosticQuestionsForSegment("infraestrutura", " infraestrutura ", " infraestrutura ")[0].prompt,
  infrastructureDiagnosticQuestions[0].prompt,
);
```

Também preservar testes de não regressão para Agro e Óleo e Gás. O teste deve confirmar que a lista retornada é a lista de Infraestrutura, não apenas outra lista de 75 itens.

### TDD 4 — Validação da API

Adicionar teste ao controlador/serviço de autenticação ou ao teste de contrato existente para confirmar que:

- `INFRAESTRUTURA` é aceito como categoria;
- `INFRAESTRUTURA` é aceito como segmento;
- códigos desconhecidos continuam sendo rejeitados.

### TDD 5 — Frontend

Adicionar ou ajustar o teste de componente existente, se houver infraestrutura de testes para esses formulários, para verificar:

- opção `Infraestrutura` no seletor de categoria;
- opção `Infraestrutura` no seletor de segmento depois da categoria;
- payload contém os dois códigos corretos.

Se não houver runner de testes de componentes configurado no frontend, registrar a verificação como teste manual automatizado de build/lint e não criar uma nova infraestrutura de testes apenas para esta mudança.

## Critérios de aceite

- [ ] `INFRAESTRUTURA` existe nos enums Prisma e na migration incremental.
- [ ] Categoria e segmento são criados por migration/seed idempotente.
- [ ] A API aceita os dois códigos no cadastro e na edição de perfil.
- [ ] Os dois seletores exibem Infraestrutura e seu segmento.
- [ ] O backend seleciona o questionário de Infraestrutura por código de categoria, código de segmento e nome normalizado.
- [ ] O questionário tem exatamente 75 perguntas e a distribuição `21/17/23/14`.
- [ ] Cada pergunta implementa integralmente `DiagnosticQuestion`.
- [ ] A seleção Agro e Óleo e Gás permanece funcionando.
- [ ] O mock legado do frontend não é alterado nem usado como fonte das perguntas.
- [ ] Testes TDD de catálogo, contrato, seleção e validação passam.
- [ ] `npm test` e `npm run build` do backend passam.

## Fora do escopo

- Criar questionário reduzido de Infraestrutura para fornecedores.
- Alterar o cálculo de score ou os níveis de maturidade.
- Migrar o catálogo duplicado do frontend para um endpoint novo.
- Atualizar o mock legado `frontend/src/features/company-area/models/mock-data.ts`.
- Criar catálogo de evidências específico de Infraestrutura.
- Alterar a estrutura das tabelas de respostas de diagnóstico.

## Riscos e decisões

1. **Duplicação do catálogo no frontend:** mantida por compatibilidade com o desenho atual; deve ser sincronizada nos dois componentes.
2. **Ambiguidade de fornecedor:** sem lista reduzida definida, Infraestrutura usa o questionário completo de 75 perguntas.
3. **Fonte das perguntas:** o markdown funcional é a referência humana; o TypeScript é a representação executável. Mudanças futuras devem atualizar ambos no mesmo change set.
4. **Enum PostgreSQL:** a migration deve ser aplicada antes de gerar o Prisma Client/build que referencia os novos valores.
