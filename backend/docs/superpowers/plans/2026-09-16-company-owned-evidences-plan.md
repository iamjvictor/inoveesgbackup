# Evidências pertencentes à empresa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transferir a propriedade das evidências e dos scores comprovados do diagnóstico para a empresa, preservando validade, arquivos e auditorias entre diagnósticos.

**Architecture:** `organizationId` será o proprietário permanente de `evidences` e `evidence_scores`; `diagnosticId` permanecerá como proveniência do upload. Solicitações continuam por diagnóstico, e o admin buscará evidências pela empresa.

**Tech Stack:** TypeScript, Express, Prisma, PostgreSQL/Supabase, Next.js, React, Node test runner.

**Spec:** `backend/docs/superpowers/specs/2026-09-16-company-owned-evidences-design.md`

## Global Constraints

- Nunca aceitar `organizationId` enviado pelo frontend como autoridade.
- Evidência aprovada permanece válida entre diagnósticos da mesma empresa.
- `diagnostic_scores` continua sendo a fonte da nota declarada.
- `evidence_scores` guarda somente a nota comprovada por empresa e pilar.
- Toda tabela exposta nova deve manter RLS habilitado.

### Task 1: Modelo e migration de ownership

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/20260916_04_company_owned_evidences/migration.sql`
- Create: `backend/supabase/migrations/<timestamp>_company_owned_evidences.sql`

**Interfaces:**
- Produces `Evidence.organizationId` obrigatório.
- Produces `EvidenceScore.organizationId` único com `axis`.
- Keeps `Evidence.diagnosticId` as historical provenance.

- [ ] Escrever teste de contrato para a chave lógica `(organizationId, axis)` e executar para confirmar a falha antes da mudança.
- [ ] Adicionar `organizationId` nullable temporário nos dois modelos e relações `Organization -> Evidence/EvidenceScore`.
- [ ] Criar SQL que adiciona colunas, preenche a partir de `diagnostics.organizationId`, migra scores existentes e só então aplica `NOT NULL`, foreign keys e índices.
- [ ] Habilitar RLS em `evidence_scores` e manter acesso exclusivo pela aplicação backend.
- [ ] Executar `prisma validate` e `prisma generate`.
- [ ] Aplicar migration no banco Supabase e consultar contagem por empresa/pilar.

### Task 2: Upload, consulta e revisão por empresa

**Files:**
- Modify: `backend/src/modules/diagnostic/services/diagnosticService.ts`
- Modify: `backend/src/modules/admin/services/adminService.ts`
- Modify: `backend/src/modules/evidence/services/evidenceScore.ts`
- Test: `backend/src/modules/evidence/services/evidenceScore.test.ts`

**Interfaces:**
- Upload derives `organizationId` from authenticated organization.
- `reviewEvidence()` recalculates `evidence_scores` by organization and axis.
- Admin summary loads `organizationId` evidence and scores independent of latest diagnostic.

- [ ] Adicionar teste que duas versões de diagnóstico compartilham o mesmo score da empresa.
- [ ] Fazer o upload persistir `organizationId` e criar scores zerados por empresa com operação idempotente.
- [ ] Alterar o recálculo de aprovação/recusa para consultar requests/evidences da empresa e fazer upsert por `(organizationId, axis)`.
- [ ] Alterar selects e filtros administrativos para não excluir evidências de diagnósticos antigos.
- [ ] Testar isolamento entre empresas e invalidar caches relevantes.

### Task 3: Frontend e verificação final

**Files:**
- Modify: `frontend/src/features/admin/areas/evidences/views/pages/admin-evidences-view.tsx`
- Modify: `frontend/src/features/admin/shared/types.ts`

**Interfaces:**
- Existing company detail screen consumes company-owned scores returned by the admin API.

- [ ] Confirmar que o cabeçalho usa notas declaradas do diagnóstico recente e comprovadas da empresa.
- [ ] Executar `npx tsc --noEmit` e ESLint do arquivo alterado.
- [ ] Executar todos os testes e build do backend.
- [ ] Confirmar no banco que evidências antigas continuam associadas à empresa e que os scores existem por pilar.
