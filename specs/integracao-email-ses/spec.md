# Integração de e-mails transacionais com Amazon SES

## Objetivo e escopo
Criar no backend um `EmailService` independente de fornecedor, com adaptador Amazon SES, para enviar boas-vindas após o cadastro e uma mensagem após a conclusão do questionário de diagnóstico. Esta especificação descreve trabalho futuro; não configura AWS nem habilita envios.

## Situação atual e pontos de integração
- `backend/src/modules/auth/services/authService.ts`, método `register`: cria usuário no Supabase com `email_confirm: true`, persiste usuário e organização via `AuthRepository.createUserWithOrganization` e só depois tenta login automático. A criação local é transacional no repositório. O cadastro pode estar concluído mesmo se o login automático falhar. Boas-vindas deve depender da criação persistida, não do login. Falha na persistência remove o usuário Supabase e não deve gerar mensagem.
- `backend/src/modules/diagnostic/controllers/diagnosticController.ts`, `submitResponses`: salvar respostas (`finalize=false`) não conclui. Com `finalize=true`, chama `calculateScore`.
- `backend/src/modules/diagnostic/services/diagnosticService.ts`, `calculateScore` e `saveCalculatedScore`: validam respostas e declaração; a transação em `saveCalculatedScore` grava pontuação e status `COMPLETED`. O evento deve ser registrado nessa mesma transação. Diagnóstico já concluído é rejeitado; considerar também finalizações concorrentes.
- Cadastro usa Supabase Admin e confirma automaticamente o e-mail; boas-vindas é mensagem transacional própria, não confirmação de endereço nem recuperação de senha do Supabase.

## Comportamento proposto
- **Boas-vindas:** uma mensagem para o e-mail do usuário recém-criado, com primeiro nome, nome InoveESG, link para a plataforma e contato institucional. Uma por usuário cadastrado com sucesso.
- **Questionário concluído:** uma mensagem ao usuário autenticado que finalizou, com nome, identificação genérica do diagnóstico e link autenticado para a plataforma. Uma por diagnóstico concluído; rascunho, falha de validação e reenvio não geram outra. Um novo diagnóstico gera novo evento.
- No diagnóstico autodeclarável a mensagem informa que o resultado pode ser consultado na plataforma. Para diagnóstico estratégico/Bioimpacto, informa que o questionário foi concluído e orienta sobre evidências, sem afirmar que relatório verificado está pronto.
- Hipótese inicial: o e-mail contém link autenticado, sem anexo nem pontuação; entrega do PDF por e-mail, solicitada no requisito comercial anterior, permanece pendente de definição e implementação. Texto, contato, URL final e remetente serão parametrizados/revisados antes de produção.

## Contrato e arquitetura
- Porta `EmailProvider.send(message: EmailMessage): Promise<SendResult>`; mensagem contém destinatário único, remetente configurado, assunto, HTML e texto puro; resultado contém identificador aceito pelo fornecedor. `EmailService` escolhe template por evento e chama a porta; sem dependência de SES nos módulos de negócio.
- `SesEmailAdapter` usa AWS SDK para JavaScript v3 SESv2 e cadeia padrão de credenciais. Região e remetente verificado são configuração somente de servidor. Sem credenciais em código, logs, frontend ou Git; priorizar identidade de workload e credenciais temporárias; se chave for necessária, configurar diretamente no gerenciador de segredos do ambiente, não pela conversa.
- Adotar outbox no Postgres: gravação do evento e transição de negócio na mesma transação local. Registro único por `welcome:<userId>` ou `diagnostic-completed:<diagnosticId>`, com destinatário, versão de template, dados mínimos, estado, tentativas, próximo processamento, lease e identificador do SES. Sem senha, respostas ou relatório no payload. Criar tabela privada com RLS e privilégios restritos conforme convenções do projeto.
- Worker separado, iniciado explicitamente pelo ambiente de execução, reivindica lote de forma atômica com lease; envia fora da transação; marca aceito, reage a falhas transitórias com backoff limitado e registra falha permanente para intervenção. Não acoplar processamento ao processo HTTP sem estratégia de disponibilidade. Definir implantação e agendamento antes de ativar.
- A criação de usuário no Supabase é externa à transação local. Inserir outbox junto com usuário/organização no repositório; se persistência falhar, não há evento. Envio falho nunca desfaz cadastro ou diagnóstico. Se SES aceitar e o worker cair antes de registrar sucesso, reenvio pode duplicar: chave única evita eventos duplicados, mas SES não garante exatamente uma entrega. Operação e testes devem reconhecer essa limitação.
- Estados distinguem `PENDING`, `PROCESSING`, `ACCEPTED`, `FAILED`; aceito pelo SES não significa entregue. Eventos de bounce/complaint e reconciliação de entrega ficam para etapa futura; não apresentar aceitação como entrega confirmada.
- Em desenvolvimento/testes usar adaptador falso injetável; configuração desativada não envia externamente. Habilitar envio requer configuração válida e worker operacional, com erro explícito e observável se estiver incompleta.

## Critérios de aceite
- **AC-001** Cadastro local concluído grava uma intenção de boas-vindas por usuário na mesma transação; falha local não grava; falha de login posterior não cancela a intenção.
- **AC-002** Finalização válida grava uma intenção por diagnóstico na transação de score/status; salvar parcial, incompleto ou sem declaração não grava; concorrência/repetição não cria duplicata.
- **AC-003** Templates em português têm assunto, HTML e texto puro, link seguro e conteúdo adequado ao tipo de diagnóstico; dados interpolados em HTML são escapados.
- **AC-004** `EmailService` recebe adaptador injetável e SESv2 usa credenciais do ambiente, remetente e região configurados; segredos não aparecem em logs.
- **AC-005** Worker reivindica concorrentemente sem processar o mesmo registro ativo; falhas transitórias geram retry limitado, permanentes ficam visíveis e não revertem negócio; lease expirada permite recuperação.
- **AC-006** Testes isolados cobrem eventos, limites, adaptador, concorrência e recuperação, sem disparar e-mails reais; integração SES em sandbox é validação separada e autorizada.
- **AC-007** Operação registra estado, tentativas e ID de aceitação sem chamar aceitação de entrega; configuração e execução do worker são documentadas.

## Dependências e decisões pendentes
Conta AWS, região SES, domínio/DKIM verificado, remetente, resposta/contato, credenciais de workload, ambiente de hospedagem e execução persistente/agendada do worker. Sandbox SES exige remetentes/destinatários autorizados; acesso de produção é regional. Revisar textos e decidir envio do PDF e destinatários de diagnósticos concluídos por fornecedores antes de ativar. Não modificar SMTP do Supabase nesta fase.
