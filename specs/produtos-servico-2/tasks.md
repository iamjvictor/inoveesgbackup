# Pacotes de trabalho

| Pacote | Objetivo / critérios | Arquivos de responsabilidade | Dependência / verificação |
|---|---|---|---|
| P1 | Inventário e reconciliação AC-001, AC-007 | `backend/prisma/migrations/` e documentação de validação | Inspecionar IDs e referências antes de criar migração; verificar preços e histórico. |
| P2 | Card e compra AC-002, AC-006 | `frontend/src/app/(app)/app/upgrade/`, `frontend/src/features/company-area/views/components/demand-service-detail-modal.tsx`, `frontend/src/features/company-area/views/pages/resultados/results-view.tsx` | Após contrato P1; validar seleção e retorno com/sem adicional. |
| P3 | Checkout e permissões AC-002, AC-003 | `backend/src/modules/checkout/`, `backend/src/modules/auth/`, `backend/src/modules/diagnostic/`, `frontend/src/features/company-area/context/company-context.tsx` | Após P1; verificar pagamento, evidências e consultorias. Arquivos com mudanças preexistentes exigem preservação. |
| P4 | Exibição e admin AC-004, AC-006 | `frontend/src/app/(app)/app/meus-servicos/`, `frontend/src/features/admin/`, `backend/src/modules/admin/`, orçamento se necessário | Após P1/P3; validar registros existentes e duas sessões. |
| P5 | Desenho do Plano 2.2 AC-005 | nova especificação própria, sem implementar cobrança | Após decisões comerciais; não alterar CORPORATE_PLAN por presunção. |
| QA | Revisão independente AC-001 a AC-007 | testes existentes e `validation.md` | Após pacotes; não alterar produção nem enfraquecer testes. |

No máximo dois implementadores ativos; evitar edição simultânea de arquivos compartilhados. Sem commit, deploy ou migração remota sem autorização apropriada.
