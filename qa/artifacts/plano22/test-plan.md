# Plano de teste — Plano 2.2 Bioimpacto Empresarial

Rodada: `plano22-2026-11-04`

## Escopo
Validar pela UI local o preço/faixa do Plano 2.2, criação de checkout sandbox e retorno/status. Se o pagamento for confirmado pelo provedor e pelo backend, verificar liberação do diagnóstico estratégico e evidências para a conta sintética. Não fabricar status pago nem simular webhook por fora do fluxo autorizado.

## Critérios
- AC-001: escolha do produto distinto `BIOIMPACTO_EMPRESARIAL`, descrito como plano anual.
- AC-002: faixa e valor exibidos conforme porte da organização e valor validado pelo servidor.
- AC-003: somente pagamento confirmado libera diagnóstico estratégico e envio de evidências.
- AC-004: checkout aponta para ambiente sandbox, retorno apresenta status real e pedido correto.

## Cenários
| ID | Critérios | Passos | Evidência esperada |
|---|---|---|---|
| P22-01 | AC-001/002 | Abrir upgrade autenticado; inspecionar card, duração, porte/preço. | Snapshot e screenshot sem PII/secrets; resposta de catálogo sanitizada. |
| P22-02 | AC-001/002 | Acionar compra do Plano 2.2. | Requisição de preferência contém código canônico; valor corresponde à faixa e ao preço de teste. |
| P22-03 | AC-004 | Inspecionar URL inicial do Mercado Pago antes de inserir dados. | Host explicitamente de sandbox e sessão de comprador teste. |
| P22-04 | AC-003/004 | Completar apenas com comprador e cartão oficiais de teste se sandbox e conta estiverem confirmados. | Estado no provedor, webhook/backend, retorno e situação final do pedido coerentes. |
| P22-05 | AC-003 | Após pagamento PAID confirmado, acessar diagnóstico e rota/tela de evidências. | Acesso concedido à organização compradora; sem inferir acesso de botão/tela isolada. |
| P22-06 | AC-003 | Caso checkout fique pendente, falhe ou seja cancelado, voltar à aplicação. | Pedido não pago não libera diagnóstico nem upload de evidências. |

## Limites de segurança
Somente localhost/túnel previamente autorizado, Supabase de teste identificado, dados sintéticos, comprador e cartão oficiais de teste. Não imprimir nem salvar credenciais, cookies, OTP, dados de cartão ou tokens. Se prefixos/ambiente de credenciais não comprovarem sandbox, bloquear a compra e continuar observações sem mutação.
