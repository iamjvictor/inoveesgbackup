# Test plan

| Cenário | AC | Verificação |
|---|---|---|
| Sandbox true seleciona token e chave pública `_SANDBOX` | AC-001 | Revisar a seleção no carregamento da configuração |
| Sandbox false ou ausente seleciona nomes de produção | AC-002 | Revisar o ramo de configuração |
| Token `APP_USR` com sandbox true preserva modo sandbox | AC-003 | Verificar que o modo não é inferido pelo prefixo |
| Falta variável do modo ativo | AC-004 | Confirmar que `required()` informa o nome da variável sem revelar valor |
| Criação de preferência e consulta de pagamento usam token selecionado | AC-001 | Confirmar que ambos consomem `env.mercadoPagoAccessToken` |
| Sandbox true seleciona segredo de webhook `_SANDBOX` | AC-005 | Revisar a seleção de `MERCADOPAGO_WEBHOOK_SECRET_SANDBOX` |
| Sandbox false/ausente seleciona segredo de webhook sem sufixo | AC-005 | Revisar a seleção de `MERCADOPAGO_WEBHOOK_SECRET` |

Não executar testes automatizados nesta tarefa sem solicitação explícita; validação independente pode fazer revisão estática.
