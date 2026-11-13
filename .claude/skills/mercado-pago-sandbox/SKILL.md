---
name: mercado-pago-sandbox
description: Verificação estrita de credenciais e fluxos de pagamento de teste Mercado Pago.
---

# Mercado Pago sandbox

- Antes de qualquer checkout, leia somente em memória as variáveis `MERCADOPAGO_PUBLIC_KEY` e `MERCADOPAGO_ACCESS_TOKEN` (ou aliases documentados no projeto). Não imprima seus valores. Confirme ambas começando por `TEST-`.
- `MERCADOPAGO_SANDBOX=true`, preço de teste, URL localhost ou texto “sandbox” não substituem prefixos `TEST-` nas duas chaves.
- Se qualquer variável estiver ausente, não TEST-, conflitante ou impossível de verificar, bloqueie compra/webhook externo e registre motivo sem revelar valor. Continue testes com mock/fixture local.
- Use só usuários e cartões de teste oficiais do Mercado Pago. Confira a documentação oficial vigente para números/valores; não reutilize cartão de cliente nem envie credenciais em relatório.
- Com sandbox confirmado, valide aprovação, recusa, pendência, erros de formulário, retorno, status de pedido/pagamento e efeitos de acesso. Registre payment_id, status, webhook recebido e estado final, desde que payment_id não seja tratado como credencial; nunca inclua tokens ou cartão.
- Webhook deve alcançar somente backend local/túnel autorizado e validar assinatura se implementação exigir. Não poste evento de teste num domínio de produção nem contorne assinatura.
- Nunca confirme cobrança real. Se a interface indicar modo/live ou houver qualquer ambiguidade, pare antes da confirmação.
