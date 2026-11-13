# Validação

- AC-001/002: testes independentes do controlador verificaram autenticação, UUID e 404 para pedido invisível; consulta é limitada à organização. Os retornos carregam orderId também em convites; fluxo de compra real completo não executado.
- AC-003/004: QA executou Chromium/Playwright com API simulada: sem ID e localStorage falso não confirmam; pedido pendente informa processamento; PAID apresenta confirmação, detalhes e botão que navega ao dashboard. Polling limitado; sem erro de console no cenário sem ID.
- AC-005: fluxo de simulação propaga orderId real; IDs fictícios não afirmam aprovação. QA confirmou em Playwright com API simulada: convite com UUID segue à tela e consulta pedido; ID fake não confirma.
- Testes checkout: 13 aprovados, incluindo idempotência e outbox; testes QA do controlador: 3 aprovados. Frontend: ESLint dirigido, TypeScript e build aprovados.
- Suíte completa do backend: 92 testes aprovados e 1 falha em em `src/modules/email/worker.test.ts`: expectativas de payload não incluem propriedades opcionais adicionadas no worker; não relacionada a esta tela. Sem validação end-to-end com Mercado Pago nem valor efetivo cobrado; UI identifica total como valor contratado.
