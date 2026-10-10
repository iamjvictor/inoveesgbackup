# ServiçosSistema

## Objetivo

Este documento analisa como os serviços e as liberações de acesso estão estruturados hoje no sistema InoveESG e propõe o fluxo ideal com base no `servicos.md`.

A leitura principal aqui é separar três coisas que hoje aparecem misturadas em pontos diferentes do sistema:

- o que é produto comercial
- o que é liberação de uso
- o que é fluxo operacional de diagnóstico, convite e cadeia

## Como o sistema está hoje

### 1. A oferta comercial existe, mas ainda está concentrada em texto e regras de UI

O `servicos.md` descreve bem o portfólio:

- Serviço 01: Pré-Diagnóstico ESG
- Pacote 01: Pré-Diagnóstico + consultoria
- Serviço 02: Diagnóstico Estratégico ESG
- Pacote 2: Diagnóstico Estratégico + consultoria
- Plano 2.1: Bioimpacto de Projetos
- Plano 2.2: Bioimpacto Empresarial
- Serviço 03: Avaliação da cadeia de fornecedores
- Plano 3.1: Avaliação da cadeia + assessoria
- Serviço 4: Capacitação
- Produto 01: Livro Bioeconomia & ESG

Na prática, o sistema ainda não trata essa lista como um catálogo único e formal de produtos. Parte da lógica está no frontend, parte está no backend, e parte ainda é inferida por estado da conta.

### 2. A liberação de acesso hoje é derivada de estado da conta

O fluxo atual usa o contexto da empresa para definir acesso:

- `hasActivePlan`
- `isUnpaid`
- `hasOnlyPreDiagnostic`
- `hasInviteAccess`
- `activeEntitlements`

Na UI, isso controla:

- rotas liberadas
- rotas bloqueadas
- visibilidade de menus
- redirecionamento para upgrade

Ou seja: a liberação não depende só do produto comprado, mas de uma combinação de:

- assinatura ativa
- diagnóstico existente
- convites disponíveis
- entitlements ativos

### 3. A aplicação já separa alguns fluxos, mas ainda não de forma formal

Hoje já existem sinais de separação:

- usuário sem plano cai no fluxo de loja/checkout
- usuário com pré-diagnóstico recebe acesso parcial
- usuário com plano ativo recebe a área completa
- fornecedor convidado tem acesso diferenciado em alguns trechos

Mas essa separação ainda é mais comportamental do que estrutural. O ideal é que os serviços comerciais determinem explicitamente o que libera.

## Como as liberações funcionam hoje

### Acesso `isUnpaid`

Perfil sem plano ativo, sem entitlements e sem diagnóstico ativo.

Liberação observada:

- `/app`
- `/app/perfil`
- `/app/meus-servicos`

Esse estado serve como porta de entrada para compra, mas ainda não representa um catálogo comercial formal.

### Acesso `hasOnlyPreDiagnostic`

Perfil com diagnóstico ativo, mas sem plano ativo e sem perfil exclusivo de fornecedor.

Liberação observada:

- `/app`
- `/app/diagnostico`
- `/app/perfil`
- `/app/upgrade`
- `/app/checkout`
- `/app/meus-servicos`
- algumas exceções temporárias de teste, como `fornecedores` e `evidencias`

Esse é o estado mais importante do funil, porque ele representa a transição entre a entrada barata e a venda de serviços mais completos.

### Acesso com plano ativo

Quando há assinatura ativa, a área completa é liberada.

Em termos de negócio, isso deveria significar:

- diagnóstico completo
- evidências
- resultados completos
- funções avançadas
- expansão da cadeia

Hoje essa liberação existe principalmente como regra de navegação e contexto, e deve ser reforçada no backend.

### Acesso por convites

O sistema também considera o saldo ou a compra de pacote de convites.

Isso libera a jornada de cadeia, mas ainda não está completamente separado de:

- assinatura
- diagnóstico
- relacionamento com fornecedor

## Análise do modelo atual

### Ponto forte

O sistema já tem a base conceitual correta:

- venda de diagnóstico
- venda de consultoria
- venda de plano
- venda de convites
- rastreio de fornecedores

### Ponto fraco

As liberações ainda estão espalhadas entre:

- UI
- contexto de usuário
- estados simulados de checkout
- lógica de diagnóstico
- lógica de convites

Isso gera três riscos:

- uma mesma funcionalidade pode ficar liberada em um lugar e bloqueada em outro
- o backend pode aceitar algo que o frontend bloqueia, ou o contrário
- fica difícil ampliar o catálogo de serviços sem aumentar a complexidade

## Leitura comercial dos serviços

### Serviço 01 - Pré-Diagnóstico ESG

**O que é hoje**

- porta de entrada da plataforma
- diagnóstico leve, automatizado, sem evidências
- ideal para aquisição inicial

**O que deve liberar**

- acesso ao diagnóstico inicial
- visualização do resultado resumido
- entrada no funil de upgrade
- eventual acesso ao hub de serviços contratados

### Pacote 01 - Pré-Diagnóstico + Consultoria

**O que é hoje**

- mesmo serviço 01, acrescido de consultoria

**O que deve liberar**

- tudo do Serviço 01
- agendamento ou registro da consultoria
- rastreio do atendimento como complemento comercial

### Serviço 02 - Diagnóstico Estratégico ESG

**O que é hoje**

- diagnóstico aprofundado
- uso de evidências
- análise mais completa e mais cara

**O que deve liberar**

- upload de evidências
- relatório completo
- roadmap detalhado
- área premium do diagnóstico

### Pacote 2 - Diagnóstico Estratégico + Consultoria

**O que é hoje**

- Serviço 02 com hora(s) de consultoria

**O que deve liberar**

- tudo do Serviço 02
- trilha de acompanhamento consultivo

### Plano 2.1 e 2.2

**O que são hoje**

- assinaturas contínuas
- receita recorrente
- relacionamento de longo prazo

**O que devem liberar**

- acesso recorrente às funcionalidades do plano
- relatórios e acompanhamento contínuo
- recursos adicionais conforme o plano
- manutenção da vigência via assinatura ativa

### Serviço Adicional 2.1

**O que é hoje**

- serviço condicionado ao Plano 2.2

**O que deve liberar**

- só deve existir se a empresa tiver o plano habilitador

### Serviço 03 - Avaliação da cadeia de fornecedores

**O que é hoje**

- produto de cadeia
- usado por empresas que querem rastrear fornecedores

**O que deve liberar**

- criação e envio de convites
- acompanhamento da cadeia
- leitura de status dos fornecedores
- visão analítica da base convidada

### Plano 3.1

**O que é hoje**

- versão contínua do Serviço 03
- modelo de acompanhamento recorrente da cadeia

**O que deve liberar**

- monitoramento recorrente
- reavaliações periódicas
- visão histórica da cadeia

### Serviço 4 - Capacitação

**O que é hoje**

- venda de serviço educacional e consultivo

**O que deve liberar**

- acesso ao módulo de capacitação
- eventuais certificados ou registros

### Produto 01 - Livro Bioeconomia & ESG

**O que é hoje**

- produto avulso
- não deveria afetar o core de acesso da plataforma

**O que deve liberar**

- somente a entrega comercial do produto
- sem impacto em diagnóstico ou cadeia

## Fluxo ideal baseado no `servicos.md`

### 1. Seleção do produto

O usuário escolhe entre:

- diagnóstico
- pacote com consultoria
- assinatura
- convite
- serviço complementar
- produto avulso

### 2. Criação do pedido

O sistema cria um pedido unificado, mesmo que o produto seja diferente.

O pedido deve carregar:

- tipo do item
- valor
- origem
- vínculo com a organização

### 3. Pagamento ou confirmação

Após a confirmação do pagamento:

- o pedido vira liberação válida
- a liberação gera ou atualiza entitlements
- o sistema registra a origem da permissão

### 4. Liberação do acesso

O acesso deve nascer do entitlement, não do texto da página.

Exemplos:

- diagnóstico pago libera o fluxo de diagnóstico
- assinatura ativa libera funcionalidades contínuas
- pacote de convites libera a cadeia de fornecedores
- serviço avulso libera apenas o recurso contratado

### 5. Execução do serviço

Depois da liberação, o usuário entra na jornada correspondente:

- responder diagnóstico
- enviar evidências
- acompanhar resultados
- convidar fornecedores
- consultar histórico
- acompanhar consultoria

### 6. Encerramento ou expiração

Quando o prazo termina ou o pagamento falha:

- a liberação expira
- o histórico permanece
- o acesso premium sai
- os dados operacionais continuam preservados

## Fluxo recomendado por tipo de serviço

| Serviço | Como entra hoje | Como deveria liberar |
|---|---|---|
| Pré-Diagnóstico ESG | Compra simples / checkout | Diagnóstico inicial e resultado resumido |
| Pacote 01 | Compra com complemento | Diagnóstico inicial + consultoria |
| Diagnóstico Estratégico ESG | Orçamento/pagamento maior | Evidências + relatório completo + roadmap |
| Pacote 2 | Diagnóstico + consultoria | Tudo do Serviço 02 + consultoria |
| Plano 2.1 | Assinatura | Acompanhamento contínuo por 6 meses |
| Plano 2.2 | Assinatura | Acompanhamento contínuo por 12 meses + recursos avançados |
| Adicional 2.1 | Dependente do Plano 2.2 | Liberação só com plano habilitador |
| Serviço 03 | Compra da cadeia | Convites + monitoramento de fornecedores |
| Plano 3.1 | Assinatura da cadeia | Monitoramento recorrente da cadeia |
| Serviço 4 | Compra de capacitação | Capacitação + certificado |
| Livro | Compra avulsa | Entrega do produto, sem liberar módulos |

## O que precisa existir para esse fluxo ficar consistente

- catálogo formal de produtos
- catálogo de planos e serviços
- entitlements por funcionalidade
- regra única de autorização no backend
- regra única de navegação no frontend
- separação clara entre diagnóstico, assinatura, convite e serviço avulso

## Conclusão

O sistema já tem a intenção comercial correta, mas ainda está operando com regras de liberação distribuídas. O próximo passo é transformar o `servicos.md` em um modelo operacional:

- produto define o que foi vendido
- pedido define a transação
- entitlement define o que foi liberado
- diagnóstico e cadeia definem o fluxo de uso

Assim o sistema deixa de depender de estados soltos na interface e passa a trabalhar com uma lógica comercial e técnica consistente.
