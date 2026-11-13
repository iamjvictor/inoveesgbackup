# Validação — webhook Mercado Pago

## Implementação

- **AC-001:** controlador valida `x-signature`, `x-request-id` e `data.id` (query oficial, com fallback para `body.data.id`), calcula HMAC-SHA256 pelo manifest oficial e compara em tempo constante. Requisições sem assinatura válida terminam em 401 antes da consulta de pagamento. Removidos logs de body, assinatura e headers do webhook. Configuração: `MERCADOPAGO_WEBHOOK_SECRET`, preenchido com a chave secreta de Webhooks do Mercado Pago; não registrar nem versionar o valor.
- **AC-002:** `CheckoutService.confirmPayment` faz claim condicional de `PENDING_PAYMENT` via `updateMany` dentro da mesma transação que grava pagamento e aplica os efeitos de confirmação. Só a transação vencedora aplica os efeitos. Uma exceção reverte o claim para permitir retry. Um pedido terminal, inclusive `PAID`, não é rebaixado por evento posterior. Testes mockados usam um pedido `ONE_TIME` sem itens e cobrem pagamento/promoção de role em repetição, concorrência na condição do claim, retry após falha de gravação e evento tardio de falha. As ramificações de diagnóstico, plano, orçamento e `INVITE_PACK` estão na transação, mas não têm cobertura direta nesses testes.
- **AC-003:** não foi alterado `backend/src/lib/mercadopago.ts`; o valor de teste `checkoutUnitPrice = 0.01` (R$ 0,01) permanece como estava.
- **AC-004:** adicionados testes unitários de assinatura, rota HTTP simulada e confirmação com Prisma mockado. Não houve chamada real ao Mercado Pago nem pagamento.

## Evidências

- Documentação oficial consultada: [Webhooks — Mercado Pago Developers](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/your-integrations/notifications/webhooks) e [notificações Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications). O padrão documentado usa `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`, HMAC-SHA256 hexadecimal e comparação em tempo constante.
- `npx tsx --test src/modules/webhooks/controllers/mercadopagoWebhookController.test.ts src/modules/webhooks/services/mercadopagoWebhookSignature.test.ts` — 5/5 testes passaram. O teste configura um segredo aleatório temporário antes de importar a aplicação; não depende de valor fixo de ambiente. Inclui inválida/ausente sem `fetch`, assinatura válida via query e estados não finais.
- `npx tsx --test src/modules/checkout/services/checkoutService.confirmPayment.test.ts` — 4/4 testes passaram: repetição, duas confirmações concorrentes, falha no pagamento com rollback e retry, e preservação de PAID após falha tardia.
- `npx tsx --test src/modules/checkout/services/productCatalogPrices.test.ts src/modules/checkout/services/bioimpactoPricing.test.ts` — 3/3 testes passaram.
- `npx tsc -p tsconfig.json --noEmit` — passou.

## Lacunas e riscos

- Concorrência e rollback foram simulados por mocks; não foi executada integração contra PostgreSQL. O mock testa que `updateMany` com condição `status=PENDING_PAYMENT` permite apenas um vencedor, mas não comprova as garantias do nível de isolamento/locking no banco de produção. Um teste de integração concorrente contra PostgreSQL continua pendente.
- Não foi executado teste end-to-end de confirmação PAID/convites, pois requer banco e não foi autorizado executar pagamentos.
- Em deploy é necessário configurar `MERCADOPAGO_WEBHOOK_SECRET` pelo gerenciador de segredos. Sem ele, a rota rejeita notificações com 401.
- Nenhuma migration foi criada ou aplicada.
