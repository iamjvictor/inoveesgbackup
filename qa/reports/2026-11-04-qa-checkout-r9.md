# QA de Checkout Pro — r9

- **Ambiente:** frontend localhost via túnel de teste; backend QA isolado em 4001 apontando para o mesmo Supabase de teste.
- **Resultado:** preferência criada com sucesso; Checkout Pro Sandbox responde 403. A URL `init_point` alternativa leva ao fluxo de identificação no host `www.mercadopago.com.br`; nenhum dado do comprador foi preenchido nela.
- **Pagamento:** não submetido. Pedido permanece `PENDING_PAYMENT`.

## Fluxo validado

1. Login pela UI local respondeu HTTP 200; `/api/auth/me` e `/api/auth/me/access` responderam HTTP 200 após o Playwright encaminhar as chamadas ao backend de teste `localhost:4001`.
2. Na tela `/app/upgrade`, o primeiro card de compra selecionado foi **Pré-Diagnóstico ESG Autodeclarável**. O detalhe exibiu **R$ 250,00** e o botão **Comprar Agora**.
3. `POST /api/checkout/preference` respondeu HTTP 201. O navegador foi redirecionado a `sandbox.mercadopago.com.br/checkout/v1/redirect`.
4. A resposta do host sandbox foi HTTP 403 e mostrou “Hubo un error accediendo a esta pagina…”. Evidência: [tela 403 do sandbox](../artifacts/20261104-checkout-r8/provider-checkout.png).
5. Consulta read-only no Supabase confirmou pedido `PENDING_PAYMENT`, produto `PRE_DIAGNOSTIC`, uma unidade, preço interno R$ 250,00 e nenhum pagamento associado. Nenhum acesso foi liberado.

## Comparação das URLs da mesma preferência

A consulta oficial `GET /checkout/preferences/{id}` retornou HTTP 200. O `init_point` usa `www.mercadopago.com.br/checkout/v1/redirect`; `sandbox_init_point` usa `sandbox.mercadopago.com.br/checkout/v1/redirect`. A implementação selecionou o host sandbox. A resposta registrou ainda valor externo de teste de **R$ 0,01**, moeda BRL, e produto `PRE_DIAGNOSTIC`. Hosts e caminhos, sem preference ID ou query string, estão em [preference-path-comparison.json](../artifacts/20261104-checkout-r8/preference-path-comparison.json).

Em Chrome headful, abrir o `init_point` da mesma preferência navegou para `www.mercadopago.com.br/login/identification`, exibindo o campo de identificação. O usuário orientou parar qualquer preenchimento nessa rota; não inseri usuário, senha, código ou cartão. Não tentei efetuar pagamento nesse host.

## URLs de retorno e webhook

As três `back_urls` da preferência apontam para o frontend de teste `f797-45-65-156-89.ngrok-free.app/app/checkout/success`. `notification_url` aponta para localhost:4001 e não é externamente acessível; webhook pendente. O backend tunnel que estava configurado antes respondeu 404 HTML e não foi usado.

## Estado e bloqueios

| Critério | Estado | Evidência |
|---|---|---|
| Vendedor de teste | PASS | `GET /users/me` com tag `test_user` |
| Comprador de teste fornecido | Identidade confirmada; não autenticado | usuário/código não registrados; preenchimento interrompido ao chegar no host `www` |
| UI de produto e preferência | PASS | HTTP 201; PRE_DIAGNOSTIC; item e valor conferidos na API |
| Destino do checkout sandbox | PASS | domínio `sandbox.mercadopago.com.br` |
| Carregamento do sandbox | FAIL | HTTP 403 reproduzível, screenshot acima |
| `init_point` alternativo | Observado | host www redireciona ao fluxo de identificação; nenhum dado digitado |
| Pagamento/retorno/acesso | BLOCKED | 403 sandbox e política do usuário para não preencher init_point alternativo; pedido continua pendente |
| Webhook | BLOCKED | endpoint do backend não exposto publicamente |

## Fontes oficiais

A [API de preferência](https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-pro-preferences/get-preference/get) documenta que `GET /checkout/preferences/{id}` retorna os dados da preferência. As [contas de teste do Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/test-accounts) exigem vendedor e comprador de teste e confirmam que credenciais de vendedor de teste podem usar prefixo `APP_USR`. Os [testes com cartões](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/integration-test/test-purchases) definem os nomes/titulares que simulam aprovação, recusa e pendência.

## Integridade

Nenhum código de produção, migration ou `.env` permanente foi alterado. O backend temporário 4001 recebeu `FRONTEND_URL` do túnel e webhook local. Nenhuma credencial de comprador, código de verificação, cartão, preference ID ou query string está no relatório. Nenhum pagamento foi submetido.
