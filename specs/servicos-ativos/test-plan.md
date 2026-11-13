# Plano de QA independente: Serviços ativos

| Caso | AC | Entrada/estado | Resultado esperado | Evidência |
|---|---|---|---|---|
| QA-001 | AC-001 | localStorage tem `FULL_DIAGNOSTIC`; backend não o retorna como comprado | cartão estratégico ausente | inspeção do agregador de serviços |
| QA-002 | AC-003 | pedido cancelado e serviço ainda em cache local | cartão ausente após refreshProfile | inspeção de fontes de estado e refresh |
| QA-003 | AC-001 | backend retorna Bioimpacto pago e vigente | cartão Bioimpacto presente | filtro de `serviceAccess.purchasedServices` |
| QA-004 | AC-001 | backend não retorna Bioimpacto expirado | cartão ausente mesmo se `company.orders`/localStorage tiverem linha antiga | verificar que lista não reintroduz as fontes obsoletas |
| QA-005 | AC-002 | convites confirmados via estatísticas | serviço de convites continua visível | fluxo de stats preservado |
| QA-006 | AC-002 | orçamento salvo localmente e/ou atualizado pela API | lista de orçamentos preservada | verificar leitura/setter existentes |
| QA-007 | AC-001 | vários pedidos ativos com mesmo productCode | cartão deduplicado por serviceId | inspeção do dedupe |
| QA-008 | AC-001 | `serviceAccess` muda depois de refresh | lista recalculada | dependências do effect e estado |

Verificações: leitura do diff, TypeScript e teste existente pertinente (se disponível). QA não altera código de produção.
