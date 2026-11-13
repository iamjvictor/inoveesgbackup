# Plano de implementação: produtos Serviço 2 e Plano 2.2

> Para execução por agentes: seguir o fluxo de subagentes do projeto e revisar cada pacote. Spec: `specs/produtos-servico-2/spec.md`.

**Objetivo:** alinhar catálogo, compra e acesso do Serviço 2 e Pacote 2; preparar definição separada do Plano 2.2.

**Arquitetura:** conservar códigos canônicos que dirigem checkout e permissões; distinguir rótulos comerciais de identificadores. Reconciliar produtos legados por ID e referências, sem apagar histórico. A assinatura anual exige ciclo de vida e permissões próprios.

**Tecnologia:** Next.js, TypeScript, Express, Prisma, PostgreSQL/Supabase, Mercado Pago.

## Sequência
1. Inventariar no banco os IDs, descrições, preços, planos, serviços, pedidos, orçamentos e referências de FULL_DIAGNOSTIC, FULL_DIAGNOSTIC_PLUS, full-diagnostic, diag-consultoria, CORPORATE_PLAN e assessoria-completa. Registrar estado antes da mudança e validar ambiente. Conferir migrações aplicadas. Definir reconciliação por ID; não sobrescrever itens pagos nem desativar registros referenciados sem tratamento.
2. Preparar migração versionada para garantir os produtos canônicos e dados da spec. Escolher entre atualizar o registro legado existente e criar o canônico conforme vínculos reais; migrar referências explicitamente se necessário. Preservar valores históricos dos itens. Validar idempotência e eventual reversão em ambiente seguro.
3. Alinhar card de upgrade, modal e tela de resultados: tag Serviço 2, adicional de consultoria, preços, checkout e identificação no retorno. Revisar card legado e orçamento segundo decisão comercial. Ajustar nome do produto no registro temporário da compra para refletir o adicional selecionado.
4. Revisar checkout, autenticação, diagnóstico, evidências e consultorias para os dois códigos. Corrigir concessão de consultoria ao Serviço 2 isolado e manter duas sessões para o pacote; revisar também o fluxo de consultoria avulsa. Conferir regras e prazos reais antes de prometer comportamento.
5. Alinhar Meus Serviços, financeiro, clientes, orçamentos e agenda administrativa; validar nomes de pedidos novos e históricos, contagem de sessões e estados de pagamento.
6. Especificar separadamente implementação do Plano 2.2 após decisões comerciais: cadastro, período anual, contratação, vigência, renovação/cancelamento, permissões, evidências e acompanhamento. Exibir tag somente onde houver oferta efetivamente implementada. Não inferir que CORPORATE_PLAN seja o plano.
7. QA independente executa cenários do test-plan e documenta resultados em validation.md. Aplicação da migração no banco remoto exige autorização específica no momento da execução.

## Foco da revisão
- Checkout sem adicional encontra produto ativo com preço, mesmo em banco que só possui código legado.
- Checkout com adicional registra somente pacote e R$ 8.750, sem cobrança duplicada.
- Serviço 2 não ganha sessões do pacote; pacote recebe exatamente duas.
- Pedidos pagos e pendentes, orçamentos e histórico continuam legíveis após reconciliação.
- Assinatura anual não recebe acesso indefinido nem é confundida com assessoria de cadeia.
