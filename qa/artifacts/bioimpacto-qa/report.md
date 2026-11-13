# QA Bioimpacto Empresarial — rodada 2026-11-04

## Escopo e ambiente

A execução usou Playwright e dados sintéticos no Supabase configurado para teste. Nenhuma credencial, cookie ou dado de cartão foi capturado em evidências, logs ou relatório.

- Frontend local `http://localhost:3000`: HTTP 200; página inicial renderizada.
- Frontend túnel `https://f797-45-65-156-89.ngrok-free.app`: HTTP 200; a página inicial renderizou depois de aceitar o aviso do ngrok via header indicado na própria tela.
- Backend existente `localhost:4000`: `/api/health` retornou `{"ok":true}`. Para isolar o fluxo, foi iniciada instância de teste em `localhost:4001`, com stdout/stderr descartados; `/api/health` retornou 200.
- Mercado Pago: chamada autenticada `GET /users/me` retornou HTTP 200, tag `test_user` e site `MLB`. O token permaneceu no `.env` e não foi impresso.
- Cadastro autenticado: três registros de conta sintéticos responderam HTTP 201 durante a execução. Não há identificadores ou senhas preservados; as duas primeiras sessões foram descartadas antes da navegação completa. Nenhuma conta real foi usada.

## Critérios e resultados

| Critério | Resultado | Evidência |
|---|---|---|
| AC-001 — Produto Bioimpacto Empresarial anual | Passou parcialmente: card visível na rota autenticada e detalhe aberto; conteúdo anual não foi integralmente verificado | fluxo Playwright; screenshot público `01-home.png` e acesso autenticado sem captura |
| AC-002 — Porte e preço do plano | Parcial: perfil sintético de pequena empresa informado; preço exibido e valor recebido não foram capturados | preferência criada; sem evidência sanitizada de valor |
| AC-003 — Pagamento aprovado libera diagnóstico/evidências | Não executado: pagamento não foi submetido | handoff necessário |
| AC-004 — Checkout sandbox e retorno coerente | Sandbox confirmado: preferência HTTP 201 e host `sandbox.mercadopago.com.br`; retorno não testado | host verificado sem salvar URL completa |
| PRE-001 — Frontend/túnel acessíveis | Passou | `01-home.png`, `03-tunnel-frontend.png` |
| PRE-002 — Rota protegida sem sessão | Passou | `02-upgrade-gate.png` |

## Handoff pendente

O fluxo chegou à página do Mercado Pago Sandbox. Não inseri o login do comprador nem dados de cartão e não confirmei o pagamento. A política de uso do navegador exige que o usuário conclua a ação financeira final. A janela Playwright permanece aberta no checkout e está visível ao usuário, mas não apareceu no inventário CUA. Como não há canal de entrada de segredo que evite colocá-lo em argumento de automação/comando, o login do comprador precisa ser digitado pelo usuário na janela aberta; depois disso, também cabe ao usuário concluir o pagamento. Checkout/retorno/acesso continuam pendentes.

## Evidências

- `01-home.png` — home local, sem sessão.
- `02-upgrade-gate.png` — rota protegida redirecionada para home com solicitação de autenticação.
- `03-tunnel-frontend.png` — home no túnel após aceitar o aviso de visita.

Não foram gravados traces, HAR, cookies, sessões, URLs completas de preferência ou screenshots com dados de cadastro/credenciais/cartão.
