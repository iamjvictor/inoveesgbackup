# Plano de validação

| Cenário | Critérios | Resultado esperado |
|---|---|---|
| Consultar catálogo após migração e reaplicá-la em ambiente seguro | AC-001, AC-007 | Dois códigos canônicos ativos, preços corretos, sem duplicação ou perda de vínculos. |
| Comprar Serviço 2 sem adicional | AC-002, AC-003, AC-006 | FULL_DIAGNOSTIC, R$ 7.950, diagnóstico e evidências liberados após pagamento, sem duas sessões. |
| Comprar com adicional | AC-002, AC-003, AC-006 | FULL_DIAGNOSTIC_PLUS, R$ 8.750, diagnóstico e evidências, duas sessões. |
| Cancelar ou deixar pagamento pendente; retornar e repetir | AC-002, AC-003 | Nenhum acesso pago antecipado ou duplicação; nome e valor corretos no retorno. |
| Consultar pedido e orçamento antigos, financeiro e cliente no admin | AC-001, AC-004, AC-007 | Histórico e valores preservados; nomes identificáveis e vínculos íntegros. |
| Consultar agenda e consumo de consultorias | AC-003, AC-004 | Limite de duas sessões para pacote; avulso e Serviço 2 obedecem às suas regras. |
| Concluir diagnóstico e verificar janela de upload | AC-003 | Validar acesso e prazo previsto de 20 dias contra implementação efetiva. |
| Revisar Plano 2.2 | AC-005, AC-006 | Plano anual distinto; decisões comerciais pendentes registradas, sem concessão automática. |
