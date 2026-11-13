# Janelas mensais de evidências do Bioimpacto

## Intenção
Ancorar as janelas de envio do Plano Bioimpacto Empresarial à conclusão do diagnóstico. A primeira janela começa na data de conclusão e permanece aberta por 15 dias corridos; janelas futuras repetem o mesmo intervalo de dia em cada mês.

## Critérios de aceite
- AC-001: A primeira janela inicia no dia em que o diagnóstico é concluído e termina 15 dias depois, no fuso de São Paulo (ex.: conclusão dia 4, janela do dia 4 ao dia 19).
- AC-002: Cada janela mensal seguinte inicia no mesmo dia do mês e dura 15 dias, respeitando meses curtos.
- AC-003: Upload autorizado no período, bloqueado fora dele e após o fim da assinatura anual.
- AC-004: A interface de histórico e a validação de upload usam os mesmos limites e mostram datas coerentes.

## Abordagem
Usar `Diagnostic.completedAt` do diagnóstico vinculado ao pedido Bioimpacto como âncora, mantendo a vigência anual vinculada ao pagamento. Centralizar cálculos backend e refletir as datas retornadas na interface.
