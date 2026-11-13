# QA independente — Checkout Mercado Pago — 20261104-checkout-r8

- **Ambiente:** UI `http://localhost:3000` e API `http://localhost:4000` ativas.
- **Resultado:** bloqueado antes da criação da preferência e do acesso ao Mercado Pago.
- **Pagamento:** nenhum.

## Execução pela interface

- Confirmei o vendedor como conta Mercado Pago de teste pela resposta `GET /users/me` (HTTP 200, tag `test_user`). A documentação oficial do Checkout Pro confirma que a credencial do vendedor de teste pode começar por `APP_USR` e que o fluxo requer também comprador de teste: [Contas de teste do Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/test-accounts).
- O usuário forneceu conta compradora identificada no painel como **Buyer Test User**. Não registrei senha ou código de verificação.
- Cadastro sintético Inove feito pela UI persistiu no Supabase de teste (dois registros `qa-*@example.invalid`; não registrei emails). No contexto Playwright único, o login UI respondeu HTTP 200 e as consultas `/api/auth/me` e `/api/auth/me/access` responderam HTTP 200.
- Em `/app/upgrade`, a UI exibiu o serviço **Pré-Diagnóstico ESG Autodeclarável** e o detalhe abriu ao clicar em **Comprar**. O preço apresentado foi R$ 250,00 e o detalhe mostrou **Comprar Agora**. Evidência: [produto selecionado](../artifacts/20261104-checkout-r8/upgrade-product-selected.png).

## Bloqueio de retorno à produção

Não cliquei em **Comprar Agora** porque a configuração local `backend/.env:10` define `FRONTEND_URL` como `https://www.inove-esg.com.br`, domínio de produção. O código em [checkoutService.ts:99](/home/joaov/Documents/01_Projetos_Desenvolvimento/InoveESG/backend/src/modules/checkout/services/checkoutService.ts:99) constrói as URLs de sucesso, falha e pendência a partir de `env.frontendUrl`. Portanto, uma preferência criada agora enviaria os retornos do checkout para a aplicação de produção, em desacordo com o escopo de teste local.

Esse é um bloqueio de ambiente, não uma transação concluída. Não criei preferência, não abri o checkout e não enviei dados de pedido ao Mercado Pago nesta rodada.

## Cenários e estado

| Cenário | Estado | Resultado |
|---|---|---|
| Frontend/backend locais | PASS | Portas 3000/4000 disponíveis |
| Vendedor de teste | PASS | `/users/me` HTTP 200 com `test_user` |
| Comprador de teste | PASS | Conta explicitamente fornecida pelo usuário; nenhum segredo registrado |
| Cadastro/login Inove sintético | PASS | UI login 200; `/auth/me` e contexto 200 |
| Selecionar produto na UI | PASS | Pré-Diagnóstico e preço R$ 250,00 mostrados |
| Criar preferência/confirmar URL sandbox | BLOCKED | `FRONTEND_URL` aponta para domínio de produção |
| Compra e tela de retorno | BLOCKED | Nenhuma preferência/transação; retorno configurado para produção |
| Permissões pós-compra | BLOCKED | Sem compra |

## Correção de ambiente necessária

Configurar `FRONTEND_URL` local para a URL HTTPS de teste que sirva o frontend local (túnel autorizado), confirmar que não é o domínio de produção e reiniciar o backend. Depois repetir **Comprar Agora**, inspecionar host de checkout sandbox e os três domínios de retorno antes de prosseguir. A tela do provedor e o resultado de pagamento ainda não foram validados.

## Segurança e integridade

Nenhum arquivo de produção, migration ou código de implementação foi alterado. A senha local do usuário QA sintético foi redefinida via credencial administrativa apenas no Supabase de teste para permitir autenticação pela UI; o valor não foi registrado. Credenciais Mercado Pago, senhas e códigos de verificação não aparecem no relatório ou nos artefatos.
