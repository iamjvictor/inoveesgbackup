# Webhook Mercado Pago: assinatura e idempotência
AC-001: validar assinatura HMAC oficial em notificações, rejeitar inválidas/ausentes sem consultar ou alterar pagamento; configuração explícita de segredo sem logs.
AC-002: eventos aprovados repetidos e concorrentes não duplicam efeitos, pagamento ou concessão; eventos inválidos/out-of-order não regridem pedido pago.
AC-003: preservar comportamento de checkout e valor de teste atual; sem mudança de produção externa, migração remota, pagamento ou segredos.
AC-004: testes unitários e de integração simulada provam assinatura válida/inválida, duplicidade, concorrência e falhas; riscos de validação real explícitos.
