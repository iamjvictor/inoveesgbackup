# TODO

- [ ] Configurar o keep-alive do Supabase no cron-job.org
  - Publicar as alterações do backend na Railway, incluindo o endpoint `GET /api/health/db`.
  - Testar a URL pública `https://SEU-BACKEND-RAILWAY/api/health/db` e confirmar resposta HTTP `200` com `{ "ok": true }`.
  - Se retornar `503`, verificar a disponibilidade do projeto Supabase; se retornar `429`, aguardar o intervalo do rate limit.
  - Depois que o endpoint estiver validado, cadastrar manualmente no cron-job.org uma tarefa para acessá-lo a cada 6 ou 12 horas.
  - Verificar no histórico do cron-job.org se as execuções estão ocorrendo normalmente.

- [x] Remover o mock da página de detalhe individual do fornecedor
  - Substituir `getSupplierDetailViewModel(supplierId)` em `frontend/src/app/(app)/app/fornecedores/[supplierId]/page.tsx`.
  - Criar/usar uma chamada autenticada ao backend para buscar o convite, a organização fornecedora, o diagnóstico, o progresso e o score do fornecedor pelo `supplierId`.
  - Atualizar `supplier-detail-view.tsx` para consumir o modelo real.
  - Tratar corretamente fornecedor inexistente, convite pendente, diagnóstico em andamento e diagnóstico concluído.
  - Validar que nenhum dado do array `suppliers` em `frontend/src/features/company-area/models/mock-data.ts` seja usado nessa rota.

- [ ] Remover o mock do saldo e do aviso de compra de convites
  - Eliminar a dependência de `inviteBalance` em `frontend/src/features/company-area/controllers/invites.controller.ts`.
  - Usar `inviteService.getStats(token)` para obter saldo disponível, total adquirido e convites consumidos.
  - Tornar o aviso de saldo baixo dependente do saldo real retornado pela API.
  - Remover os pacotes/quantidades fixos da tela e alinhar as opções exibidas com os produtos cadastrados no backend.
  - Garantir estado de carregamento, erro e usuário sem autenticação.

- [ ] Finalizar a compra real de pacotes de convites
  - Substituir o fluxo `simulate-purchase`/`confirm-payment` pela confirmação via webhook do Mercado Pago.
  - Garantir idempotência do webhook e atualização correta de `Order`, `Payment`, `InviteWallet` e `InviteTransaction`.
  - Validar os estados `PAID`, `PENDING`, `REJECTED` e `CANCELED` na interface.
  - Testar o ciclo completo em ambiente de produção com credenciais e notificações reais.

- [ ] Manter como referência: cadeia principal já usa dados reais
  - A lista principal de fornecedores consulta `GET /api/invite`.
  - Os indicadores consultam `GET /api/invite/stats`.
  - Criação, listagem, encerramento e reativação dos relacionamentos já estão conectados ao backend.

- [ ] Permitir contratação independente do rastreamento da cadeia de fornecedores
  - Criar o serviço/produto de rastreamento da cadeia como uma contratação independente, sem exigir a compra de diagnóstico ESG, plano corporativo ou outro serviço da InoveESG.
  - Definir no backend o produto, preço, status de contratação e entitlement específico do rastreamento.
  - Permitir que a empresa compre/ative o rastreamento e, a partir disso, convide e acompanhe fornecedores.
  - Ajustar as regras de acesso do frontend para liberar somente as funcionalidades relacionadas ao rastreamento contratado.
  - Garantir que o saldo de convites e os relacionamentos da cadeia sejam vinculados corretamente à contratação independente.
  - Preparar a estrutura de dados para que, futuramente, o sistema gere um relatório exclusivo do rastreamento da cadeia, separado do relatório do diagnóstico ESG.
  - Definir no relatório futuro indicadores como fornecedores convidados, aceitos, pendentes, respondidos, scores, evidências, riscos e evolução da cadeia.

- [ ] Permitir contratação avulsa de consultoria ESG
  - Criar a consultoria como serviço independente, sem exigir a contratação de diagnóstico, rastreamento da cadeia ou plano corporativo.
  - Permitir a compra de uma reunião individual de consultoria com duração de 1 hora.
  - Criar o produto/preço correspondente no backend e controlar o entitlement ou crédito de consultoria adquirido.
  - Integrar o pagamento real e registrar o pedido com status de pagamento e contratação.
  - Criar fluxo para o cliente solicitar ou escolher a data e o horário da reunião.
  - Permitir que o administrador visualize, confirme, agende, reagende, conclua ou cancele a reunião.
  - Exibir para o cliente o status da solicitação, data, horário e instruções de acesso à reunião.
  - Garantir que a reunião avulsa não libere automaticamente funcionalidades de outros serviços da plataforma.

- [ ] Implementar múltiplos perfis e auditoria no painel administrativo
  - Permitir mais de um usuário administrador na plataforma, cada um com sua própria conta e identificação.
  - Criar perfis/permissões administrativas, por exemplo: administrador geral, financeiro, auditor ESG, comercial e suporte.
  - Restringir telas e ações conforme o perfil do administrador, especialmente aprovação de evidências, orçamentos, pagamentos, convites e consultorias.
  - Registrar em uma trilha de auditoria quem executou cada ação administrativa, incluindo usuário, perfil, data/hora, entidade afetada, ação realizada e resultado.
  - Registrar especificamente quem aprovou, rejeitou, cancelou ou alterou uma solicitação, evidência, pagamento, relacionamento ou agendamento.
  - Permitir consulta e filtros da trilha de auditoria pelo painel administrativo.
  - Garantir que as permissões sejam validadas no backend, não somente ocultadas no frontend.
