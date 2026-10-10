# Plano de Refatoracao - Rastreio da Cadeia

## Objetivo

Refatorar o cadastro da empresa, o fluxo de convite de fornecedor e a modelagem de relacionamentos da cadeia para suportar:

- categoria e segmento como classificacao estruturada da organizacao
- diagnosticos diferentes por categoria, segmento e contexto de uso
- empresa podendo atuar ao mesmo tempo como ancora e como fornecedora
- historico de vinculos entre organizacoes, inclusive quando um relacionamento for encerrado
- separacao entre diagnostico ESG completo da propria empresa e diagnostico reduzido de risco para fornecedor convidado

## Estado Atual

Hoje o sistema tem estes pontos principais:

- `Organization.industrySegment` armazena o segmento como `String`, sem categoria associada
- o cadastro da empresa usa `industrySegment`, mas nao existe uma hierarquia `categoria -> segmento`
- o vinculo de cadeia hoje fica espalhado entre `Invite`, `SupplierLink` e `Diagnostic`
- `SupplierLink` representa a relacao comprador-fornecedor, mas o modelo atual foi pensado mais para o fluxo inicial do convite do que para historico de relacionamento
- `Diagnostic.kind` distingue `PRE_DIAGNOSTIC`, `FULL_DIAGNOSTIC` e `SUPPLIER_DIAGNOSTIC`, mas a escolha do formulario ainda nao esta estruturada por categoria, segmento e tipo de jornada
- o fornecedor convidado ainda entra em um fluxo muito parecido com o de uma empresa pagante, quando o desejado agora e uma experiencia de risco mais enxuta

## Decisoes de Dominio

### 1. Categoria e segmento deixam de ser texto livre

Vamos tratar isso como catalogo de dominio, nao como string solta na organizacao.

Regra inicial:

- categoria disponivel no cadastro: `Agronegocio`
- segmentos disponiveis para esta categoria: `Agroindustria` e `Producao`

Mesmo com apenas uma categoria por enquanto, o modelo deve nascer pronto para:

- uma categoria possuir varios segmentos
- cada segmento possuir formularios e relatorios diferentes
- futuras categorias entrarem sem retrabalho estrutural

### 2. Papel comercial e papel na cadeia nao sao a mesma coisa

Uma organizacao pode:

- comprar servicos proprios
- ser ancora de uma cadeia
- ser fornecedora de outra empresa
- fazer tudo isso ao mesmo tempo

Por isso:

- o papel da organizacao nao deve depender do fluxo de cadastro
- o papel na cadeia deve ser inferido pelos relacionamentos ativos
- o acesso ao produto deve continuar vindo de compra, entitlement e diagnosticos, nao do vinculo com a cadeia

### 3. Convite e relacionamento devem ser entidades separadas

`Invite` representa a tentativa de conexao.

`SupplierLink` hoje representa a relacao, mas sem um desenho bom para historico e reativacao.

O modelo alvo deve separar:

- convite: evento transacional de onboarding
- relacionamento: ligacao historica entre duas organizacoes

### 4. Diagnostico da ancora e diagnostico do fornecedor sao produtos diferentes

Precisamos assumir duas jornadas distintas:

- `Diagnostico ESG da propria empresa`
  - formulario completo
  - 75 perguntas
  - resultado detalhado exibido para a propria organizacao
- `Diagnostico de risco do fornecedor`
  - formulario menor
  - definido pelo segmento da organizacao fornecedora
  - resultado resumido para o fornecedor
  - analise detalhada e notas por pilar exibidas para a empresa que convidou

## Modelo de Dados Alvo

## 1. Classificacao da organizacao

### Nova tabela `business_categories`

Campos sugeridos:

- `id`
- `code`
- `name`
- `active`
- `createdAt`
- `updatedAt`

Seed inicial:

- `AGRONEGOCIO`

### Nova tabela `business_segments`

Campos sugeridos:

- `id`
- `categoryId`
- `code`
- `name`
- `active`
- `createdAt`
- `updatedAt`

Seed inicial:

- `AGROINDUSTRIA`
- `PRODUCAO`

### Ajuste em `Organization`

Adicionar:

- `businessCategoryId`
- `businessSegmentId`

Opcional para transicao:

- manter `industrySegment` temporariamente apenas para compatibilidade
- remover depois que frontend, backend e dados forem migrados

Decisao recomendada:

- cada organizacao tera um `segmento principal`
- se no futuro houver multi-segmento, isso deve virar tabela relacional separada, nao improviso em array

## 2. Relacionamento de cadeia

### Nova tabela `organization_relationships`

Proposta para substituir a responsabilidade de negocio hoje concentrada em `SupplierLink`.

Campos sugeridos:

- `id`
- `customerOrganizationId`
- `supplierOrganizationId`
- `relationshipType`
- `status`
- `startedAt`
- `endedAt`
- `endedReason`
- `originInviteId`
- `createdByOrganizationId`
- `createdAt`
- `updatedAt`

Enums sugeridos:

- `relationshipType`: `SUPPLIER_NETWORK`
- `status`: `PENDING`, `ACTIVE`, `INACTIVE`, `ENDED`, `REJECTED`

Regras:

- uma mesma dupla de organizacoes pode ter varios registros ao longo do tempo
- apenas um vinculo ativo por par direcional deve existir ao mesmo tempo
- quando o fornecedor deixa a cadeia, o vinculo atual e encerrado com `endedAt`, sem apagar historico
- se a relacao voltar depois, cria-se um novo ciclo de relacionamento

### Papel de `SupplierLink`

Recomendacao:

- migrar `SupplierLink` para `organization_relationships`
- manter `SupplierLink` apenas durante a transicao
- depois remover da aplicacao

Motivo:

- o nome `SupplierLink` ficou estreito demais para a evolucao do dominio
- `organization_relationships` expressa melhor o grafo da cadeia

## 3. Convites continuam existindo

### Tabela `invites`

Deve continuar existindo, mas com papel mais claro:

- registrar o convite
- guardar token e aceite
- servir de origem do relacionamento

Regra:

- aceitar convite nao significa apenas "criar fornecedor"
- aceitar convite significa:
  - criar ou localizar a organizacao
  - classificar categoria e segmento
  - criar relacionamento entre ancora e fornecedora
  - gerar diagnostico reduzido do fornecedor

## 4. Formularios e diagnosticos por contexto

### Ajuste no catalogo de formularios

`FormTemplate` deve deixar de ser apenas um repositorio generico de schema e passar a ser selecionavel por contexto.

Campos adicionais sugeridos:

- `assessmentContext`
- `businessCategoryId`
- `businessSegmentId`
- `diagnosticKind`
- `isDefault`

Enum sugerido para `assessmentContext`:

- `SELF_ESG`
- `SUPPLIER_RISK`

Regras:

- formulario completo da propria empresa:
  - `SELF_ESG`
  - categoria `AGRONEGOCIO`
  - segmento opcionalmente nulo ou especifico
- formulario reduzido de fornecedor:
  - `SUPPLIER_RISK`
  - categoria `AGRONEGOCIO`
  - segmento obrigatorio

### Ajuste em `Diagnostic`

`Diagnostic` ja possui base boa, mas precisa carregar melhor a intencao da jornada.

Recomendacoes:

- manter `kind`
- passar a usar `formTemplateId` de forma obrigatoria nos novos fluxos
- garantir que diagnostico de fornecedor sempre tenha:
  - `requestedByOrganizationId`
  - relacionamento associado
  - formulario de risco do segmento correto

Opcionalmente adicionar:

- `relationshipId`
- `visibilityMode`

`visibilityMode` sugerido:

- `OWNER_FULL`
- `OWNER_SUMMARY_REQUESTER_FULL`

Se preferir manter o schema mais simples, essa regra pode ficar em codigo no primeiro momento.

## 5. Resultado e visibilidade

### Empresa pagante

Pode ver:

- notas por pilar
- score geral
- relatorio ESG completo

### Fornecedor convidado

Pode ver:

- status de envio
- retorno resumido
- sinalizacao de risco ou maturidade simplificada

Nao deve ver:

- relatorio ESG completo
- breakdown detalhado equivalente ao produto pago

### Empresa que convidou

Pode ver do fornecedor:

- status do diagnostico
- visao resumida de risco
- notas por pilar ou score resumido definidos pela regra do produto

## Refatoracao do Cadastro

## Fase 1 - ajuste imediato de UI e payload

Objetivo:

- trocar `industrySegment` por `categoria` e `segmento`
- no cadastro, exibir:
  - categoria fixa `Agronegocio`
  - segmentos `Agroindustria` e `Producao`

Impactos:

- frontend do registro
- DTOs de cadastro
- validacao no backend
- persistencia em `Organization`

Regra de transicao recomendada:

- frontend envia `businessCategoryCode` e `businessSegmentCode`
- backend resolve ids das tabelas de catalogo
- `industrySegment` pode continuar sendo preenchido temporariamente com o nome do segmento para nao quebrar fluxos legados

## Fase 2 - separar cadastro de empresa comum e cadastro vindo de convite

Objetivo:

- manter um unico cadastro de organizacao
- alterar a jornada quando houver `ref` de convite

Fluxo esperado para convite:

1. usuario abre link do convite
2. formulario carrega dados publicos da ancora
3. fornecedor informa dados da pessoa e da sua organizacao
4. obrigatoriamente escolhe categoria e segmento
5. sistema cria ou reaproveita a organizacao
6. sistema cria relacionamento com a ancora
7. sistema gera diagnostico reduzido do fornecedor

## Fase 3 - diagnostico correto por segmento e contexto

Objetivo:

- desacoplar a escolha do formulario do `industrySegment` textual

Nova regra:

- empresa propria: formulario ESG completo da categoria
- fornecedor convidado: formulario reduzido por segmento

Isso exige:

- catalogo de formularios
- mapeamento `categoria + segmento + contexto`
- camada de resolucao do template antes de iniciar diagnostico

## Fase 4 - historico de cadeia

Objetivo:

- permitir encerrar vinculos sem apagar historico
- permitir reativacao futura com novo ciclo

Nova regra:

- `organization_relationships` passa a ser a fonte de verdade da cadeia
- convites aceitos criam relacionamento
- encerramento apenas muda status e data fim

## Estrategia de Migracao

## 1. Catalogo de categoria e segmento

Criar migracao com:

- `business_categories`
- `business_segments`
- colunas novas em `organizations`

Backfill inicial:

- todas as organizacoes existentes recebem categoria `AGRONEGOCIO`
- segmento deve ser inferido de `industrySegment` quando possivel
- quando nao der para inferir, marcar como pendente de revisao manual

## 2. Relacionamentos

Criar migracao com `organization_relationships`.

Backfill:

- migrar cada `SupplierLink` existente para um `organization_relationships`
- carregar `inviteId`, datas e status equivalentes

Observacao:

- se hoje existe `@@unique([buyerOrganizationId, supplierOrganizationId])`, essa regra nao deve ser replicada do mesmo jeito
- a nova restricao deve impedir apenas mais de um vinculo ativo simultaneo

## 3. Formularios

Manter os formularios atuais funcionando durante a transicao.

Passos:

- criar cadastro de templates por contexto
- associar o formulario atual de 75 perguntas ao contexto `SELF_ESG`
- criar placeholders para `SUPPLIER_RISK` por segmento

## 4. Compatibilidade temporaria

Durante a migracao:

- `industrySegment` pode continuar existindo
- `SupplierLink` pode continuar existindo
- o codigo novo deve ler preferencialmente das novas tabelas
- o codigo legado deve ser removido apenas depois do backfill e da troca de fluxo

## Impactos por Modulo

## Backend

- `auth`
  - trocar input de `industrySegment` para `businessCategoryCode` e `businessSegmentCode`
- `invite`
  - aceitar convite passa a criar relacionamento historico
- `diagnostic`
  - selecao de formulario deixa de depender de string solta
- `supplier network`
  - novo repositorio e servico para `organization_relationships`

## Frontend

- cadastro de empresa
  - seletores dependentes `categoria -> segmento`
- fluxo de convite
  - cadastro com contexto da ancora
- painel da cadeia
  - listar relacionamentos ativos e historicos
- painel do fornecedor
  - esconder resultado ESG completo
  - mostrar apenas retorno resumido

## Admin / Operacao

- tela para revisar classificacao de empresas migradas
- tela para consultar historico de relacionamento
- tela para associar templates por categoria, segmento e contexto

## Ordem Recomendada de Implementacao

1. Criar catalogo de categoria e segmento
2. Alterar cadastro para gravar categoria e segmento
3. Criar `organization_relationships`
4. Migrar `SupplierLink` para a nova tabela
5. Refatorar aceite de convite para criar relacionamento
6. Estruturar resolucao de `FormTemplate` por contexto
7. Criar diagnosticos reduzidos por segmento para fornecedor
8. Ajustar regras de visibilidade de resultado
9. Remover dependencias antigas de `industrySegment` e `SupplierLink`

## Riscos e Cuidados

- nao acoplar categoria/segmento diretamente em enum de codigo se voces querem crescer o catalogo depois
- nao reutilizar `organization_roles` para representar a topologia da cadeia
- nao apagar `SupplierLink` antes de migrar os dados e os fluxos
- nao usar o mesmo relatorio da empresa pagante para o fornecedor convidado
- evitar que o fornecedor veja o mesmo nivel de detalhe do produto premium sem compra

## Resumo Executivo

O caminho mais seguro e:

- estruturar categoria e segmento como catalogo
- manter a organizacao como entidade unica
- tratar a cadeia em uma tabela propria de relacionamento historico
- separar convite de relacionamento
- separar diagnostico ESG completo de diagnostico reduzido de risco do fornecedor

Isso permite que uma organizacao seja ancora e fornecedora ao mesmo tempo, preserva historico, prepara o sistema para varios formularios por segmento e alinha o rastreio da cadeia com o produto que voces querem vender.

## Descricao das Fases

### Fase 1 - Estruturar categoria e segmento no cadastro

Status: concluida.

O cadastro da organizacao deixou de depender de um segmento em texto livre e passou a usar um catalogo estruturado de categoria e segmento. O frontend ja envia os codigos de categoria e segmento, e o backend resolve os respectivos IDs.

Checklist desta fase:

- [x] criar catalogo de categoria e segmento
- [x] alterar o payload do cadastro para `businessCategoryCode` e `businessSegmentCode`
- [x] manter `industrySegment` apenas como compatibilidade temporaria
- [x] ajustar validacao do formulario para exigir categoria e segmento
- [x] manter a experiencia do registro funcional enquanto a migracao acontece

Arquivos atuais impactados no frontend:

- `src/features/auth/views/components/register-form.tsx`
- `src/features/auth/models/auth.types.ts`
- `src/features/company-area/context/company-context.tsx`

**Justificativa**

Essa foi a base da refatoracao. Sem classificacao estruturada, nao seria possivel selecionar formularios por contexto, manter consistencia de dados ou ampliar o catalogo de classificacoes no futuro.

#### Fase 2 - Separar o cadastro comum do cadastro originado por convite

Status: Falta testar.

Nesta fase, o sistema continua com um unico fluxo de cadastro de organizacao, mas passa a tratar de forma diferente os casos em que o acesso vem de um convite. O foco aqui nao e criar um segundo cadastro, e sim um onboarding com contexto de cadeia.

O estado atual do sistema ja ajuda nessa transicao:

- a pagina publica de convite ja existe em `src/app/(marketing)/convite/fornecedor/page.tsx`
- ela ja resolve `ref` e `token` via query string
- ela ja chama `GET /invite/public-info`
- o `RegisterForm` ja aceita `refCode`, `initialEmail`, `businessCategoryCode` e `businessSegmentCode`
- a tela interna de fornecedores ja lista convites e estados em `src/features/company-area/views/pages/fornecedores/suppliers-view.tsx`
- o detalhe do fornecedor ja distingue acesso limitado e acesso completo em `src/features/company-area/views/pages/fornecedores/supplier-detail-view.tsx`

Checklist desta fase:

- [ ] consolidar o fluxo publico de convite em uma experiencia unica para `ref` e `token`
- [ ] mostrar o contexto da ancora antes do formulario
- [ ] exibir nome da empresa convidante, mensagem do convite e status de vigencia
- [x] bloquear reuso de convite expirado/cancelado e bloquear link genérico quando o saldo de fornecedores contratados (wallet balance) for excedido
- [ ] pre-preencher email quando o convite carregar esse dado da API
- [ ] impedir cadastro duplicado quando o email ja possuir conta vinculada ao convite
- [ ] manter o cadastro unico de organizacao, mas diferenciar a origem do onboarding
- [ ] apos o submit, criar ou reaproveitar a organizacao do fornecedor
- [ ] vincular o fornecedor a uma empresa ancora sem duplicar organizacao por convite
- [ ] gravar o vinculo inicial com status transacional adequado
- [ ] criar o primeiro registro de diagnostico reduzido do fornecedor
- [ ] redirecionar o fornecedor para o proximo passo correto apos concluir o cadastro

Onde alterar no frontend:

- `src/app/(marketing)/convite/fornecedor/page.tsx`
- `src/features/auth/views/components/register-form.tsx`
- `src/features/auth/models/auth.types.ts`
- `src/features/auth/services/auth.service.ts`
- `src/features/company-area/services/invite.service.ts`
- `src/features/company-area/views/pages/fornecedores/supplier-invite-view.tsx`

Onde alterar no backend/API:

- endpoint de leitura publica do convite
- endpoint de registro de usuario/orgao com origem de convite
- endpoint de aceite do convite
- regra de associacao entre usuario, organizacao e convite
- regra de criacao do diagnostico inicial do fornecedor

Banco nesta fase:

- `invites` continua sendo a entidade transacional do convite
- `invites` precisa guardar claramente:
  - `status`
  - `token`
  - `acceptedAt`
  - `expiredAt`
  - `canceledAt`
  - `createdAt`
- a aceitação do convite nao deve apagar nada
- a acao deve registrar quem aceitou, quando aceitou e de qual convite veio a criacao da cadeia
- se a organizacao ja existir, o sistema deve reaproveitar a organizacao e apenas adicionar o novo papel na cadeia

Status nesta fase:

- convite para a empresa que enviou:
  - `PENDING` ou `SENT` significa aguardando aceite
  - `ACCEPTED` significa que o fornecedor concluiu o onboarding inicial
  - `EXPIRED` significa que o convite perdeu validade
  - `CANCELED` significa que o convite foi invalidado manualmente
- fornecedor para o proprio fornecedor:
  - `cadastro_pendente` significa que o convite foi aberto, mas nao concluido
  - `cadastro_concluido` significa que a conta e a organizacao foram criadas
  - `diagnostico_em_andamento` significa que o questionario ja foi iniciado
  - `diagnostico_concluido` significa que a resposta final foi submetida
- empresa cliente:
  - `convidado` significa convite enviado e ainda sem resposta util
  - `em_andamento` significa cadastro ou diagnostico iniciado
  - `respondido` significa diagnostico concluido
  - `pendente` significa convite criado, mas ainda nao consolidado na jornada
  - `expirado` significa convite vencido ou invalido

Regras de banco e historico que devem existir desde esta fase:

- criar um registro de aceite sempre que o fornecedor concluir o cadastro
- preservar o historico de envio do convite mesmo quando a conta for criada
- nao sobrescrever o convite original com os dados finais do fornecedor
- registrar `firstAccessAt` e `acceptedAt` se isso ainda nao existir
- registrar qual convite originou a criacao da organizacao do fornecedor
- registrar qual empresa ancora criou o convite
- registrar qual usuario aceitou o convite
- criar um ponto unico de verdade para rastrear o estado atual do onboarding

**Justificativa**

O cadastro por convite tem finalidade distinta do cadastro de uma empresa que contrata o produto diretamente. Separar os fluxos reduz friccao, evita duplicidade de dados e permite que a criacao do relacionamento aconteca de forma controlada sem misturar onboarding com relacao permanente.

### Fase 3 - Criar o relacionamento historico da cadeia

Status: Falta testar.

Nesta fase, o sistema passa a registrar a cadeia em uma entidade propria de relacionamento, com inicio, encerramento, status, origem do convite e referencia ao responsavel pela criacao.

Checklist desta fase:

- [ ] criar `organization_relationships`
- [ ] adicionar status operacional do relacionamento
- [ ] impedir mais de um relacionamento ativo entre o mesmo par direcional
- [ ] manter multiplos ciclos historicos para a mesma dupla de organizacoes
- [ ] preservar `startedAt` e `endedAt`
- [ ] registrar motivo de encerramento
- [ ] referenciar o convite que originou o vinculo
- [ ] permitir reativacao futura com novo registro, nao com reuso do mesmo
- [ ] migrar o papel hoje concentrado em `SupplierLink`

Onde alterar:

- camada de relacionamento da cadeia
- servicos que leem fornecedores conectados a uma ancora
- telas de historico e detalhes da cadeia
- consultas administrativas de pipeline

**Justificativa**

O modelo atual nao representa bem a historia da relacao entre organizacoes. Ao separar relacionamento de convite, o sistema ganha rastreabilidade, auditoria e flexibilidade para lidar com reentrada de fornecedores e encerramento de vinculos sem apagar dados.

### Fase 4 - Estruturar diagnosticos por contexto e por segmento

Status: Concluído.

Nesta fase, a selecao de formularios deixa de depender de uma string solta e passa a considerar contexto, categoria, segmento e atividade específica. O sistema distingue o diagnostico ESG completo da propria empresa do diagnostico de fornecedor.

Checklist desta fase:

- [x] criar resolucao de template por `contexto + categoria + segmento` e `specificActivity` (Café Arvoredo)
- [x] separar claramente `SELF_ESG` de `SUPPLIER_RISK` via `SUPPLIER_DIAGNOSTIC`
- [x] garantir que o formulario completo nao seja carregado para fluxo de fornecedor
- [x] criar templates iniciais por segmento do fornecedor (Café Arvoredo)
- [x] permitir fallback controlado quando o segmento ainda nao tiver template
- [x] tratar resolução de formulários sem depender do obsoleto `formTemplateId` (removido do banco)
- [x] associar o diagnostico do fornecedor ao relacionamento da cadeia
- [x] manter a resolucao de formulario previsivel e testavel

Onde alterar:

- catalogo de formularios
- resolucao de template no backend
- inicio de diagnostico no frontend
- tela de preenchimento do fornecedor

**Justificativa**

Os dois casos de uso nao possuem o mesmo nivel de detalhe nem a mesma finalidade. Estruturar a resolucao de formularios por contexto evita inconsistencias, reduz risco de exibicao incorreta de perguntas e garante que cada jornada receba o formulario adequado.

### Fase 5 - Ajustar a visibilidade dos resultados

Status: dependente da fase 4.

Nesta fase, o sistema passa a limitar o que cada perfil pode visualizar. A empresa dona da conta continua vendo o relatorio ESG completo, o fornecedor recebe apenas um retorno resumido e a empresa que convidou enxerga a visao de risco apropriada para acompanhamento da cadeia.

Checklist desta fase:

- [ ] esconder o detalhamento completo do fornecedor para o proprio fornecedor
- [ ] manter visao resumida do resultado para o fornecedor
- [ ] manter visao operacional para a empresa ancora
- [ ] preservar relatorio completo apenas para a organizacao proprietaria do diagnostico
- [ ] separar permissao de leitura de permissao de edicao
- [ ] tratar visibilidade como regra de dominio, nao apenas de interface

Onde alterar:

- views de resultado
- controllers de relatórios
- regras de autorizacao
- componentes de cards e dashboards da cadeia

**Justificativa**

A visibilidade faz parte da separacao entre o produto completo e o produto de cadeia. Sem essa regra, o fornecedor pode acessar informacoes indevidas e o valor do diagnostico pago fica comprometido.

### Fase 6 - Executar a migracao e manter compatibilidade temporaria

Status: fase final da transicao.

Nesta fase, as estruturas novas sao preenchidas e os fluxos legados continuam funcionando apenas durante a transicao. `industrySegment` e `SupplierLink` podem permanecer por um periodo limitado, enquanto o sistema consolida os novos dados e valida a migracao.

Checklist desta fase:

- [ ] backfill de categorias e segmentos
- [ ] backfill de convites e relacionamentos
- [ ] migrar dados antigos para a nova topologia da cadeia
- [ ] manter compatibilidade com leitura do legado durante a transicao
- [ ] remover dependencias antigas somente depois da validacao
- [ ] documentar consultas e jobs de saneamento
- [ ] criar alertas para convites sem aceite e relacionamentos sem status valido

Onde alterar:

- scripts de migracao
- jobs de saneamento
- repositorios que leem legado
- relatórios e dashboards operacionais

**Justificativa**

Essa etapa reduz risco operacional e evita interrupcao dos fluxos existentes. A remoção do legado so deve acontecer depois que os dados antigos tiverem sido migrados e os novos fluxos estiverem estaveis.
