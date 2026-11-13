# QA independente — Mercado Pago Checkout Pro — 20261104-checkout-r7

- **Data:** 04/11/2026 (BRT).
- **Ambiente local:** frontend e backend já estavam escutando nas portas 3000 e 4000.
- **Resultado:** bloqueado antes da compra por falta de conta compradora Mercado Pago de teste verificável.
- **Pagamento submetido:** não.

## Pré-condições verificadas

- A documentação oficial do Checkout Pro explica que credenciais do vendedor de teste podem usar prefixo `APP_USR`; o prefixo, isoladamente, não classifica credencial como produção. A fonte também exige pelo menos uma conta vendedora e uma compradora para o fluxo de compra de teste. [Contas de teste — Mercado Pago Developers](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/test-accounts)
- A consulta autenticada `GET /users/me` com a credencial local respondeu HTTP 200 e a resposta, inspecionada em memória, contém tag `test_user` e nickname no padrão de usuário de teste. Identificadores, email e segredo não foram registrados.
- Os relatórios e artefatos QA anteriores não contêm uma conta compradora verificável. O r4 declara `buyer_test_account_confirmed: false`; o r6 também não tinha credencial reutilizável.
- Por isso não foi aberta uma preferência nesta rodada, não houve login no Mercado Pago e nenhum cartão foi submetido.

## Cenários

| Cenário | Resultado | Evidência |
|---|---|---|
| Frontend e backend locais disponíveis | PASS | `artifacts/20261104-checkout-r7/preflight.json` |
| Vendedor de teste validado pela API | PASS | HTTP 200 e `test_user` em `preflight.json`; sem dados pessoais |
| Comprador de teste validado | BLOCKED | Conta/credencial ausente nos registros QA disponíveis |
| Selecionar produto pela UI e abrir checkout | BLOCKED | Pré-condição de comprador indisponível; sem checkout aberto nesta rodada |
| Pagamento sandbox com cartão oficial | BLOCKED | Não submeter sem comprador confirmado |
| Tela de retorno e estado do pedido | BLOCKED | Sem transação |
| Pedido/backend/webhook pós-pagamento | BLOCKED | Sem transação |

## Ação necessária para retomar

Disponibilizar uma conta **compradora de teste Mercado Pago** já criada no painel de testes, com credenciais e eventual código de verificação acessíveis localmente ao QA sem compartilhar segredo em chat. Então repetir seleção do serviço pela UI, verificar o domínio sandbox, concluir com cartão oficial de teste e validar retorno e pedido.

## Integridade

Nenhum arquivo de produção, contrato, banco ou migration foi alterado por esta rodada. Nenhum dado real ou credencial foi registrado. O plano executável está em [test-plan-checkout-r7.md](../test-plan-checkout-r7.md).
