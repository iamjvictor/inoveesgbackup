# QA independente — Diagnóstico Estratégico ESG

**Data:** 2026-11-04 (UTC)  
**Status:** parcialmente executado; aguarda handoff do usuário no cadastro.

## Ambiente

- Frontend: `http://localhost:3000` (interativo), acessado em contexto privado Playwright.
- Túnel configurado para retorno: `https://f797-45-65-156-89.ngrok-free.app`.
- Backend QA isolado: porta `4002`, com a URL do túnel em `FRONTEND_URL` e chamadas `/api` do navegador encaminhadas para essa instância.
- Banco/Supabase: configuração de teste local do projeto.
- Seller Mercado Pago: `GET /users/me` retornou HTTP 200, `site_id=MLB`, tag `test_user`.

## Cenários e resultado

| Cenário | Resultado |
| --- | --- |
| Landing via túnel | Carrega, porém os controles React não responderam pelo hostname ngrok; HMR retornou 503. |
| Modal e formulário de cadastro em localhost | Abrem e avançam pelas etapas de dados pessoais, empresa e perfil ESG usando dados sintéticos. |
| Handoff de cadastro | Pronto no passo de consentimento e credenciais; e-mail/senha vazios, checkbox desmarcado e cadastro não submetido. |
| Saúde do backend QA | `GET /api/health` retornou HTTP 200 (`ok: true`). |
| Compra no Mercado Pago | Não iniciada; depende de conclusão do cadastro pelo usuário na janela aberta. |
| Retorno/acesso pós-compra | Pendente da compra. |

## Retomada Playwright — 04 Nov 2026

- Cadastro sintético concluído pela UI: HTTP 201.
- A navegação em `/app/upgrade` mostrou o card Diagnóstico Estratégico ESG; cliquei em `Comprar agora` e confirmei a tela de detalhes.
- Clique no botão de compra iniciou `POST /api/checkout/preference`, que respondeu HTTP 400 antes de criar a preferência Mercado Pago.
- O detalhe exibiu o preço à vista de R$ 7.950,00 (12 parcelas de R$ 662,50). Consulta somente leitura ao catálogo de teste encontrou `FULL_DIAGNOSTIC` ausente, causa concreta compatível com o HTTP 400.
- A instância aponta seis migrações pendentes. Não executei migrações adicionais após instrução de parada; o `migrate deploy` anterior foi interrompido depois de aplicar apenas `20260930_01_add_product_price_cents`.
- Não foi aberta uma sessão de pagamento no Mercado Pago, não houve login do comprador e não houve transação.

Evidências dessa retomada: [card do serviço](03-upgrade-card.png) e [detalhes do serviço](04-detail-modal.png).

## Handoff

A janela Chromium permanece aberta no passo final do cadastro em `localhost:3000`. O usuário deve preencher e confirmar o e-mail e a senha sintéticos diretamente na janela e submeter `Criar Conta`; não envie senha pelo chat. A tela também mostra o termo de consentimento sem aceite. O fluxo Playwright permanece ativo no processo de sessão 57735.

Na retomada, o QA do Plano 2.2 confirmou que sua conta existe no banco, mas o contexto autenticado foi fechado e a senha não está disponível para reutilização. Por isso, não tentei autenticar nessa conta nem criei uma duplicata. O handoff de senha continua necessário para concluir o cadastro desta rodada.

## Evidências

- [Landing inicial](01-home.png)
- [Passo final do cadastro pronto para handoff](02-registration-handoff.png)

## Pagamento sandbox

A documentação oficial do Mercado Pago confirma que cartões de teste simulam pagamentos sem cartão real. Para aprovação em cartão, a tabela oficial usa o titular `APRO` e documento de teste indicado na documentação: [cartões de teste — Mercado Pago Developers](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/resources/test-cards). Nenhum cartão ou pagamento foi submetido nesta execução.
