# Categoria Infraestrutura Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar a categoria Infraestrutura, seu questionário ESG de 75 perguntas e a seleção completa no backend/frontend.

**Architecture:** O backend continuará como fonte de verdade. A categoria será registrada no catálogo, enums e banco; o questionário será representado como `infrastructureDiagnosticQuestions` no modelo de diagnóstico; os dois formulários do frontend apenas enviarão os códigos da categoria e do segmento.

**Tech Stack:** TypeScript, Node.js test runner via `tsx --test`, Prisma/PostgreSQL, React/Next.js.

**Spec:** `docs/superpowers/specs/2026-10-07-infrastructure-category-design.md`

## Global Constraints

- Usar `INFRAESTRUTURA` para categoria e segmento.
- Manter `modelos_diagnostico/pre_diagnostico_infraestrutura.md` como fonte funcional das perguntas.
- O questionário terá 75 perguntas: 21 Ambiental, 17 Social, 23 Governança e 14 Bioeconomia Circular.
- Não alterar o mock legado `frontend/src/features/company-area/models/mock-data.ts`.
- Não criar lista reduzida de fornecedor de Infraestrutura nesta implementação.
- Aplicar TDD: teste falha antes da implementação e passa depois.

## Review Focus

- Seleção por categoria sem segmento: deve retornar Infraestrutura.
- Seleção com código/nome em minúsculas e espaços: deve normalizar e retornar Infraestrutura.
- Distribuição dos eixos: deve permanecer exatamente 21/17/23/14.
- Migration/seed repetidos: não devem duplicar categoria ou segmento.
- Fluxos Agro e Óleo e Gás: devem continuar selecionando seus questionários.

### Task 1: Catálogo e contrato de seleção

**Files:**
- Modify: `backend/src/config/businessCatalog.ts`
- Test: `backend/src/config/businessCatalog.test.ts`
- Modify: `backend/src/modules/diagnostic/services/diagnosticService.ts`
- Test: `backend/src/modules/diagnostic/services/diagnosticService.test.ts`

**Interfaces:**
- Produces `BUSINESS_CATEGORIES` com `{ code: "INFRAESTRUTURA", name: "Infraestrutura" }`.
- Produces `BUSINESS_SEGMENTS.INFRAESTRUTURA` com o segmento homônimo.
- Consumes `infrastructureDiagnosticQuestions` da Task 2.

- [x] Escrever testes de catálogo e seleção, incluindo seleção por categoria, segmento, nome normalizado e não regressão de Agro/Óleo e Gás.
- [x] Rodar `npm test -- --test-name-pattern='infraestrutura|Infraestrutura'` no diretório `backend` e confirmar falha por ausência do catálogo/lista.
- [x] Adicionar Infraestrutura ao catálogo central e à função de seleção.
- [x] Rodar os testes específicos e confirmar aprovação.

### Task 2: Questionário de Infraestrutura

**Files:**
- Modify: `backend/src/modules/diagnostic/models/diagnosticModel.ts`
- Test: `backend/src/modules/diagnostic/models/diagnosticModel.test.ts`

**Interfaces:**
- Produces `infrastructureDiagnosticQuestions: DiagnosticQuestion[]` com 75 itens numerados de 1 a 75.
- Cada item possui `axis`, `category`, `type`, `weight` e cinco opções de maturidade.

- [x] Escrever testes de contrato para tamanho, numeração, distribuição por eixo, campos obrigatórios, pesos e textos-chave do documento funcional.
- [x] Rodar o teste e confirmar falha porque a exportação ainda não existe.
- [x] Converter as 75 perguntas de `modelos_diagnostico/pre_diagnostico_infraestrutura.md` para o contrato TypeScript, mantendo a ordem e os pesos.
- [x] Rodar o teste do modelo e confirmar aprovação.
- [x] Rodar os testes de catálogo/seleção para consumir a lista real e confirmar aprovação.

### Task 3: Persistência, migration e seed

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/20261007_01_add_infrastructure_catalog/migration.sql`
- Modify: `backend/src/scripts/seed-business-categories.ts`
- Test: `backend/src/config/businessCatalog.test.ts`

**Interfaces:**
- Produces enum Prisma `BusinessCategoryCode.INFRAESTRUTURA`.
- Produces enum Prisma `BusinessSegmentCode.INFRAESTRUTURA`.
- Persists an active category and active segment named `Infraestrutura`.

- [x] Estender o teste de catálogo/contrato para pinçar os códigos aceitos.
- [x] Rodar o teste antes da migration/schema e registrar a falha ou a limitação de geração do Prisma Client.
- [x] Adicionar os valores aos enums Prisma e criar migration idempotente com upsert da categoria/segmento.
- [x] Adicionar upsert idempotente no seed sem backfill de organizações existentes.
- [x] Gerar o Prisma Client e rodar os testes do backend.

### Task 4: Seletores de cadastro e perfil

**Files:**
- Modify: `frontend/src/features/auth/views/components/register-form.tsx`
- Modify: `frontend/src/features/company-area/views/pages/perfil/profile-view.tsx`

**Interfaces:**
- Produces `businessCategoryCode = "INFRAESTRUTURA"` e `businessSegmentCode = "INFRAESTRUTURA"` no payload dos formulários.

- [x] Inspecionar a infraestrutura de testes frontend; se não houver runner de componentes, usar verificação estática e build.
- [x] Adicionar Infraestrutura às listas de categoria e segmento nos dois componentes.
- [x] Rodar lint/typecheck/build disponíveis no frontend.
- [x] Confirmar que o mock legado não foi alterado.

### Task 5: Verificação final

**Files:**
- Verify: todos os arquivos das Tasks 1–4

- [x] Rodar `npm test` no backend.
- [x] Rodar `npm run build` no backend.
- [x] Rodar os checks disponíveis no frontend.
- [x] Revisar diff/arquivos alterados e confirmar os critérios da spec.
