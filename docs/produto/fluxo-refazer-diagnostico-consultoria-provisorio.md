# Fluxo de Reexecução do Diagnóstico com Consultoria

> Documento provisório. Esta regra ainda não foi confirmada como produto final e pode mudar.

## Objetivo

Registrar o comportamento atual do sistema para o caso em que uma empresa queira refazer um diagnóstico ESG.

## Regra atual implementada

- A empresa pode iniciar um diagnóstico novo se não houver um diagnóstico aberto.
- Se já existir um diagnóstico concluído, o backend bloqueia um novo início quando não identifica acesso válido de consultoria.
- Se houver acesso válido de consultoria, o sistema permite criar um novo `diagnostic`.

## Onde isso acontece

- Início do diagnóstico no backend: [`backend/src/modules/diagnostic/services/diagnosticService.ts`](backend/src/modules/diagnostic/services/diagnosticService.ts)
- Regras de retorno da rota: [`backend/src/modules/diagnostic/controllers/diagnosticController.ts`](backend/src/modules/diagnostic/controllers/diagnosticController.ts)
- Fluxo da tela inicial: [`frontend/src/app/(app)/app/diagnostico/page.tsx`](frontend/src/app/(app)/app/diagnostico/page.tsx)
- Tela de bloqueio / upgrade: [`frontend/src/app/(app)/app/diagnostico/preencher/page.tsx`](frontend/src/app/(app)/app/diagnostico/preencher/page.tsx)

## Como o sistema decide hoje

No backend, a decisão está baseada em sinais já existentes no perfil da organização:

- `subscriptions` ativas
- `entitlements` ativos
- pedidos pagos relacionados a produtos de consultoria

Se nenhum desses sinais existir e já houver um diagnóstico concluído, o início do diagnóstico é bloqueado.

## Observação importante

Essa regra foi criada para evitar que a empresa refaça o diagnóstico sem contratar consultoria, mas ela ainda é uma hipótese de produto.

Antes de consolidar isso, ainda precisa ser validado:

- se o bloqueio deve valer para todos os tipos de diagnóstico
- quais produtos exatamente dão direito a refazer
- se a consultoria libera uma nova execução completa ou apenas uma revisão assistida
- se o acesso deve ser baseado em `subscription`, `entitlement` ou `order`

## Próximo ajuste provável

Quando a regra for fechada, o ideal é substituir essa lógica provisória por uma fonte única de verdade no backend, com um identificador claro do direito de reexecução.
