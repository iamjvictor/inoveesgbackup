# E-mails transacionais via Amazon SES

O módulo `src/modules/email` separa templates e regras de notificação do transporte. `EmailService.sendEvent(eventType, recipient, payload)` recebe `WELCOME` ou `DIAGNOSTIC_COMPLETED` e delega para um `EmailProvider`; `SesEmailAdapter` implementa esse contrato via SESv2. O adaptador usa a cadeia padrão de credenciais AWS do SDK e não recebe chaves no código.

O envio vem desativado por padrão. Para configurar o processo de worker e o adaptador:

- `EMAIL_ENABLED=true` habilita chamadas de envio;
- `AWS_REGION` define a região SES;
- `EMAIL_FROM` deve ser um endereço verificado no SES;
- `EMAIL_CONTACT` define o contato exibido nos templates (opcional; padrão institucional);
- o URL da plataforma é o `FRONTEND_URL` já usado pelo backend.

Use uma role/identidade de workload com privilégio mínimo para `ses:SendEmail` no ambiente implantado. Localmente, prefira perfil AWS temporário via AWS CLI/SSO. Nunca coloque access keys em `.env` versionado, `NEXT_PUBLIC_*`, logs ou mensagens. Não habilite o envio antes de configurar SES e testar o adaptador. A conta SES em sandbox só permite destinatários verificados.

`EmailService` foi desenhado para ser chamado pelo worker a partir dos registros de outbox. Aceitação pela API SES não confirma entrega na caixa postal. O worker/outbox e a integração nos eventos de negócio são pacotes separados.


## Worker de outbox

O processo do worker é separado da API e pode ser executado pela imagem de backend com `npm run email:worker`. No ambiente implantado, mantenha uma instância ativa e configure o supervisor para reiniciar em caso de encerramento. `EMAIL_WORKER_POLL_MS` controla o intervalo entre lotes (padrão 5000ms; mínimo 250ms). Com `EMAIL_ENABLED` diferente de `true`, o processo permanece sem reivindicar ou enviar itens.

A reivindicação é atômica no Postgres usando `FOR UPDATE SKIP LOCKED`; cada linha recebe lease e token. Atualizações de resultado exigem o token atual, então uma tentativa atrasada não sobrescreve o dono atual da lease. Após expirar, uma linha `PROCESSING` pode ser recuperada. Retentativas transitórias usam atrasos exponenciais (30s, 60s, 120s...) com teto de 6h; depois de cinco tentativas a mensagem fica `FAILED`. Erros permanentes também ficam `FAILED` para inspeção. `ACCEPTED` significa que SES aceitou a solicitação, não que a mensagem chegou ao destinatário.
