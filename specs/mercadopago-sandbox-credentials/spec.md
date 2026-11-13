# Seleção de credenciais sandbox do Mercado Pago

## Intenção
Quando `MERCADOPAGO_SANDBOX=true`, o backend deve autenticar no Mercado Pago e expor a chave pública usando as variáveis sandbox dedicadas. Com o modo desligado, deve usar as variáveis de produção atuais.

## Requisitos e aceite
- **AC-001:** Com sandbox `true`, `MERCADOPAGO_ACESS_TOKEN_SANDBOX` e `MERCADOPAGO_PUBLIC_KEY_SANDBOX` são as únicas fontes das credenciais do Mercado Pago.
- **AC-002:** Com sandbox `false` ou ausente, `MERCADOPAGO_ACESS_TOKEN` e `MERCADOPAGO_PUBLIC_KEY` são as fontes das credenciais.
- **AC-003:** A seleção do checkout sandbox continua seguindo `MERCADOPAGO_SANDBOX` e não depende do prefixo da credencial.
- **AC-004:** A ausência da credencial exigida para o modo selecionado gera erro de configuração apontando o nome da variável ausente, sem imprimir seu valor.
- **AC-005:** O segredo de assinatura do webhook segue o mesmo seletor: sandbox usa `MERCADOPAGO_WEBHOOK_SECRET_SANDBOX`; produção usa `MERCADOPAGO_WEBHOOK_SECRET`.

## Limites
Não alterar os valores das credenciais, configuração no Railway, regras de pagamento ou validação HMAC; não registrar ou expor valores de chaves.

## Abordagens
1. Selecionar credenciais e segredo de webhook em `backend/src/config/env.ts` usando o flag explícito. **Escolhida:** centraliza o comportamento e mantém checkout, consulta de pagamentos e validação HMAC usando os valores do mesmo modo.
2. Escolher credenciais dentro de cada chamada HTTP. Rejeitada por duplicar seleção e permitir divergência entre checkout e consulta.
3. Inferir sandbox pelo prefixo da chave. Rejeitada porque a solicitação exige selecionar por `MERCADOPAGO_SANDBOX`, e credenciais sandbox podem usar prefixos `APP_USR`.
