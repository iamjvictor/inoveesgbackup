# Plano de implementação — e-mails SES

**Objetivo:** registrar e processar com segurança os dois eventos descritos em `spec.md`.
**Arquitetura:** outbox transacional, worker independente, `EmailService` e porta `EmailProvider`, adaptador SESv2 e adaptador falso para testes.
**Tecnologia:** Node/TypeScript, Prisma/Postgres, AWS SDK v3 SESv2; sem execução ou configuração AWS nesta fase.

1. Confirmar os pontos de gravação transacional no `authRepository.createUserWithOrganization` e `saveCalculatedScore`; mapear implantação do backend e configuração do worker. AC-001/002/005.
2. Modelar outbox e migration segundo padrões Prisma/Supabase, com chave única, lease, tentativas, status e acesso privado. Verificar atomicidade e bloqueio concorrente. AC-001/002/005/007.
3. Criar módulo `backend/src/modules/email/` com tipos/porta, `EmailService`, templates, adaptador SES e falso; validar configuração e escapar conteúdo. AC-003/004.
4. Inserir eventos nas transações locais; concluir diagnóstico com atualização condicional/lock para evitar finalizações concorrentes. AC-001/002.
5. Criar worker com reivindicação atômica, lease, retry e limites; adicionar script explícito e documentação operacional. AC-005/007.
6. QA independente executa `test-plan.md`, testes de integração local sem SES e revisão de privacidade e duplicações; registrar lacunas em `validation.md`. AC-006.
7. Depois da configuração da conta, validar sandbox com remetente e destinatário verificados; ativação e validação de produção dependem de infraestrutura e acesso de produção do SES. AC-004/007.

**Restrições:** manter alterações pré-existentes; não publicar, executar migrações remotas ou enviar e-mails reais sem autorização aplicável; não armazenar chaves no repositório. Envio no Supabase Auth e entrega de PDF como anexo não fazem parte desta primeira implementação.
