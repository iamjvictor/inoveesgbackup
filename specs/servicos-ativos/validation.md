# Validação independente

| AC | Cenário | Resultado |
|---|---|---|
| AC-001 | QA-001, QA-003, QA-004, QA-007 | Aprovado por inspeção: lista usa `serviceAccess.purchasedServices`, sem localStorage antigo nem fallback de `company.orders`; deduplica por serviceId. |
| AC-002 | QA-005, QA-006 | Aprovado por inspeção: estatísticas de convites e leitura/API de orçamentos continuam presentes. |
| AC-003 | QA-002 | Aprovado por inspeção: somente itens atuais do access context viram cartões; refreshProfile força atualização do perfil. |

Comando: `npx tsc --noEmit` em `frontend/` — passou (exit 0). Não há teste automatizado específico da tela. Revisão funcional baseada no diff e fluxo; teste visual de navegador não executado.
