# Validation

| Critério | Tarefa | Cenário | Resultado |
|---|---|---|---|
| AC-001 | Package 1 | Sandbox usa credenciais dedicadas | Revisão estática aprovada |
| AC-002 | Package 1 | Produção mantém variáveis existentes | Revisão estática aprovada |
| AC-003 | Package 1 | Modo explícito não depende de prefixo | Revisão estática aprovada |
| AC-004 | Package 1 | Variável ausente gera erro sem valor | Revisão estática aprovada |
| AC-005 | Package 1 | Webhook usa segredo do modo selecionado | Revisão estática independente aprovada |

Revisões independentes por `revisor_qa`: sem achados. Confirmado que checkout e consulta de pagamento consomem o mesmo `env.mercadoPagoAccessToken`; a validação HMAC consome `env.mercadoPagoWebhookSecret`, selecionado pelo modo ativo. Testes automatizados não foram executados.
