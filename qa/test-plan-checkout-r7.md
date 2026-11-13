# Plano de teste independente — compra Mercado Pago Checkout Pro

## Critério de aceitação
Uma conta compradora Mercado Pago de teste compra um produto da aplicação pela UI, chega ao checkout sandbox do vendedor de teste, completa a transação usando cartão oficial de teste e retorna à aplicação. O retorno deve mostrar o estado correto e permitir navegação ao dashboard; a API/backend deve refletir o estado esperado do pedido/pagamento.

## Pré-condições e limites
- Frontend local em `http://localhost:3000` e backend local em `http://localhost:4000`.
- Confirmar identidade de vendedor de teste por `GET /users/me` autenticado, inspecionando apenas tags/padrão de identidade, sem registrar token ou dados pessoais.
- Confirmar conta compradora de teste documentada/fornecida antes de autenticar no Mercado Pago.
- Usar somente cartão oficial de teste e conta de teste. Não submeter formulário se vendedor/comprador não forem comprovadamente de teste.
- Sem produção, dados reais, alteração de produção, migrations ou exposição de segredos.

## Cenários
1. Health e UI: confirmar serviços locais e página de compra.
2. Identidade do vendedor: consulta autenticada `GET /users/me`; resultado deve indicar usuário de teste.
3. Identidade do comprador: localizar credencial explicitamente fornecida ou evidência autorizada; sem adivinhar dados.
4. Seleção de produto e preferência: comprar pela UI; registrar produto, resposta HTTP, domínio/rota sandbox sem query sensível.
5. Checkout: autenticar comprador confirmado e submeter cartão oficial; confirmar resultado no provedor.
6. Retorno: confirmar URL/rota de retorno, estado mostrado, pedido correspondente e navegação ao dashboard.
7. Pós-condição: comparar status no backend com resultado do provedor e registrar webhook, quando alcançável.

## Regra de parada segura
Se não houver comprador de teste verificável, marcar checkout, retorno e pós-condição como bloqueados, não submeter cartão e registrar a dependência necessária.
