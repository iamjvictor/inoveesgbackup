# Plano de testes

| Cenário | Critério | Evidência esperada |
|---|---|---|
| Assinatura ausente ou inválida | AC-001, AC-004 | 401 antes de consultar o provedor; log categórico com flags de presença, sem valor do segredo/assinatura |
| `data.id` ausente/inválido ou divergente entre query e body | AC-001 | 401 com razão categórica e IDs sanitizados/truncados |
| Assinatura válida e pagamento pendente | AC-001, AC-004 | 200; log indica evento, consulta e status pendente/ignorado |
| Pagamento aprovado | AC-002, AC-004 | log indica paymentId, status, orderId, estado resultante e se a transição mudou o pedido |
| Evento que não é pagamento | AC-001 | 200 ignorado com razão; sem consulta do pagamento |
| Inspeção de logs | AC-001 | nenhum segredo, assinatura completa, header completo ou payload bruto é registrado |
| Regressão de pedidos duplicados/concorrentes | AC-002, AC-004 | executar testes existentes de idempotência/concor­rência |

Comandos de validação independentes: `cd backend && npx tsx --test src/modules/webhooks/controllers/mercadopagoWebhookController.test.ts src/modules/webhooks/services/mercadopagoWebhookSignature.test.ts` e `cd backend && npx tsc --noEmit -p tsconfig.json`. A integração com Mercado Pago real permanece fora do escopo do teste automatizado.
