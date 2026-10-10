# Casos de teste — Diagnóstico Autodeclarável

## 1. Objetivo

Validar o fluxo completo do produto técnico `PRE_DIAGNOSTIC`, exibido comercialmente como **Diagnóstico Autodeclarável**.

O produto deve:

- criar um diagnóstico empresarial `PRE_DIAGNOSTIC`;
- liberar o acesso após o pagamento;
- garantir o papel `COMPANY` para a organização compradora;
- entregar o questionário empresarial maior, com 75 questões;
- ignorar completamente `specificActivity` na escolha do formulário;
- manter o diagnóstico de fornecedor separado quando a organização também tiver atuado como fornecedora.

## 2. Regras de negócio

### 2.1 Produto

| Campo | Valor esperado |
|---|---|
| Código técnico | `PRE_DIAGNOSTIC` |
| Nome comercial | Diagnóstico Autodeclarável |
| Tipo do produto | `ONE_TIME` |
| Produto pago | Sim |
| Diagnóstico criado | `PRE_DIAGNOSTIC` |

O registro do produto está em `products`. O checkout utiliza o código técnico `PRE_DIAGNOSTIC`; o nome armazenado pode continuar sendo atualizado para refletir o nome comercial.

Arquivos principais:

- `backend/src/modules/checkout/controllers/checkoutController.ts`
- `backend/src/modules/checkout/services/checkoutService.ts`
- `backend/src/modules/diagnostic/repositories/diagnosticRepository.ts`

### 2.2 Papéis

#### Cadastro normal

```text
Cadastro sem convite
→ COMPANY / SELF_SIGNUP
```

#### Cadastro por convite

```text
Cadastro pelo link do comprador
→ SUPPLIER / INVITE
```

#### Fornecedor que compra o autodeclaratório

```text
SUPPLIER / INVITE
→ compra PRE_DIAGNOSTIC
→ COMPANY / UPGRADE é criado automaticamente
→ SUPPLIER é desativado como papel principal
→ organização passa a atuar como COMPANY
```

O relacionamento com a empresa âncora e o diagnóstico de fornecedor são preservados como histórico da cadeia. A compra altera o papel operacional para `COMPANY`, sem apagar os registros históricos.

### 2.3 Escolha do formulário

```text
Diagnóstico empresarial:
PRE_DIAGNOSTIC ou FULL_DIAGNOSTIC
→ formulário maior
→ 75 questões

Diagnóstico de fornecedor:
SUPPLIER_DIAGNOSTIC
→ usar somente businessSegment
→ PRODUCAO: formulário reduzido de produção
→ AGROINDUSTRIA: formulário reduzido agroindustrial
```

`specificActivity` não participa da decisão. Os seguintes valores não podem alterar o formulário:

```text
CAFE
CAFE_ARVOREDO
ARROZ
BANANA
SEMENTES
AGROPROD
qualquer outra atividade específica
```

Arquivos principais:

- `backend/src/modules/diagnostic/services/diagnosticService.ts`
- `backend/src/modules/diagnostic/models/diagnosticModel.ts`

## 3. Fluxo técnico da compra

### 3.1 Criação do checkout

Endpoint:

```http
POST /api/checkout/preference
```

Payload:

```json
{
  "productCode": "PRE_DIAGNOSTIC",
  "quantity": 1
}
```

O serviço:

1. procura o produto `PRE_DIAGNOSTIC`;
2. cria o produto se ainda não existir;
3. cria o diagnóstico `PRE_DIAGNOSTIC` com status `PENDING_PAYMENT`;
4. cria o pedido `ONE_TIME`;
5. grava o `diagnosticId` no metadata do item do pedido;
6. cria a preferência de pagamento.

### 3.2 Confirmação do pagamento

Após pagamento aprovado:

1. o pedido passa para `PAID`;
2. o diagnóstico passa para `ACTIVE`;
3. o papel `COMPANY` é criado ou atualizado com `source = UPGRADE`;
4. os caches de perfil e acesso são invalidados;
5. a organização passa a ter `hasPreDiagnosticAccess = true`.

O resultado esperado para uma organização que entrou como fornecedora e comprou o produto é:

```text
organization_roles:
SUPPLIER / INVITE
COMPANY  / UPGRADE

diagnostics:
SUPPLIER_DIAGNOSTIC / ACTIVE ou COMPLETED
PRE_DIAGNOSTIC      / ACTIVE
```

## 4. Casos principais de negócio

### CP-01 — Empresa se cadastra pelo site e compra o autodeclaratório

```text
Cadastro normal pelo site
→ role COMPANY
→ compra PRE_DIAGNOSTIC
→ pagamento aprovado
→ role COMPANY / UPGRADE
→ cria/ativa PRE_DIAGNOSTIC
→ responde o formulário empresarial de 75 questões
→ recebe score e relatório autodeclaratório
```

`specificActivity` não altera o formulário. A empresa pode ter atividade Café, Arroz, Banana, Sementes ou qualquer outra e continuará recebendo o formulário empresarial maior.

### CP-02 — Usuário recebe convite, cria cadastro e responde como fornecedor

```text
Usuário recebe link da empresa âncora
→ cria cadastro pelo convite
→ role SUPPLIER / INVITE
→ cria/ativa SUPPLIER_DIAGNOSTIC
→ cria relacionamento com a empresa âncora
→ responde sem comprar nenhum produto
→ recebe formulário reduzido conforme businessSegment
```

O fornecedor gratuito não deve receber o formulário empresarial de 75 questões. A seleção deve usar somente `businessSegment`, por exemplo:

```text
PRODUCAO      → formulário reduzido de produção
AGROINDUSTRIA → formulário reduzido agroindustrial
```

### CP-03 — Fornecedor compra um serviço e passa a responder o formulário empresarial

```text
Fornecedor já cadastrado pelo convite
→ possui SUPPLIER / INVITE
→ possui SUPPLIER_DIAGNOSTIC
→ decide melhorar e compra PRE_DIAGNOSTIC
→ pagamento aprovado
→ recebe COMPANY / UPGRADE
→ desativa SUPPLIER / INVITE como papel operacional
→ cria/ativa PRE_DIAGNOSTIC separado
→ responde o formulário empresarial de 75 questões
→ continua relacionado à empresa âncora
```

Esse caso não desfaz a relação de cadeia. A organização passa a ter dois contextos:

```text
SUPPLIER_DIAGNOSTIC → avaliação da cadeia
PRE_DIAGNOSTIC      → diagnóstico empresarial comprado
```

O relacionamento com a empresa âncora deve continuar `ACTIVE`.

### CP-04 — Empresa já diagnosticada recebe convite de rastreio da cadeia

```text
Empresa já cadastrada e com COMPANY
→ já respondeu seu diagnóstico empresarial
→ possui score e relatório salvos
→ recebe convite de rastreio da cadeia
→ aceita o convite
→ apenas cria/ativa o relacionamento com a empresa âncora
→ mantém seu diagnóstico e score existentes
→ não compra nada
→ não cria novo diagnóstico
→ não troca para formulário de fornecedor
```

Nesse caso, a empresa não deve ganhar um novo `SUPPLIER_DIAGNOSTIC` para substituir o diagnóstico já concluído. Ela somente passa a estar vinculada à empresa âncora.

## 5. Casos de teste derivados

### CT-001 — Empresa normal compra o autodeclaratório

**Pré-condições**

- organização cadastrada sem convite;
- papel `COMPANY / SELF_SIGNUP`;
- nenhum diagnóstico ativo;
- categoria `AGRONEGOCIO`;
- qualquer `businessSegment` válido;
- `specificActivity = CAFE` ou outro valor.

**Execução**

1. chamar `POST /api/checkout/preference` com `PRE_DIAGNOSTIC`;
2. confirmar o pagamento;
3. chamar `POST /api/diagnostic/start`.

**Resultado esperado no banco**

```text
organization_roles:
COMPANY / UPGRADE ou COMPANY / SELF_SIGNUP

diagnostics:
kind = PRE_DIAGNOSTIC
status = ACTIVE
```

**Resultado esperado no endpoint de início**

```json
{
  "diagnosticId": "id-do-pre-diagnostic",
  "questions": "75 itens"
}
```

**Validação principal**

`specificActivity = CAFE` não pode produzir 36 perguntas.

### CT-002 — Fornecedor entra gratuitamente por convite

**Pré-condições**

- comprador possui convite disponível;
- novo usuário acessa o link do convite;
- organização ainda não possui papel `COMPANY`;
- fornecedor possui `businessSegment = PRODUCAO`.

**Execução**

1. concluir cadastro com o link do convite;
2. aceitar o convite;
3. chamar `POST /api/diagnostic/start`.

**Resultado esperado no banco**

```text
organization_roles:
SUPPLIER / INVITE

diagnostics:
kind = SUPPLIER_DIAGNOSTIC
status = ACTIVE
```

**Resultado esperado no endpoint de início**

```text
kind de seleção = SUPPLIER_DIAGNOSTIC
businessSegment = PRODUCAO
questionsCount = 36
```

**Validação principal**

O formulário reduzido é determinado por `businessSegment`, não por `specificActivity`.

### CT-003 — Fornecedor de produção compra o autodeclaratório

**Pré-condições**

- organização possui `SUPPLIER / INVITE`;
- existe `SUPPLIER_DIAGNOSTIC` ativo;
- `businessSegment = PRODUCAO`;
- `specificActivity = CAFE`.

**Execução**

1. comprar `PRE_DIAGNOSTIC`;
2. confirmar o pagamento;
3. verificar os papéis;
4. chamar `POST /api/diagnostic/start`;
5. responder o formulário empresarial.

**Resultado esperado nos papéis**

```text
SUPPLIER / INVITE
COMPANY  / UPGRADE
```

**Resultado esperado nos diagnósticos**

```text
SUPPLIER_DIAGNOSTIC
→ permanece histórico/avaliação da cadeia

PRE_DIAGNOSTIC
→ diagnóstico empresarial comprado
```

**Resultado esperado do formulário comprado**

```text
75 questões
```

**Validação principal**

Mesmo com `specificActivity = CAFE` e `businessSegment = PRODUCAO`, a organização que possui `COMPANY` e comprou o produto deve responder 75 questões.

### CT-004 — Fornecedor de agroindústria compra o autodeclaratório

**Pré-condições**

- organização possui `SUPPLIER / INVITE`;
- `businessSegment = AGROINDUSTRIA`;
- existe `SUPPLIER_DIAGNOSTIC` ativo;
- compra do `PRE_DIAGNOSTIC` aprovada.

**Resultado esperado**

```text
SUPPLIER_DIAGNOSTIC → formulário reduzido agroindustrial
PRE_DIAGNOSTIC      → 75 questões
roles               → SUPPLIER + COMPANY
```

### CT-005 — Empresa com categoria Agronegócio e segmento Produção

**Pré-condições**

```text
role = COMPANY
businessCategory = AGRONEGOCIO
businessSegment = PRODUCAO
specificActivity = CAFE
diagnostic.kind = PRE_DIAGNOSTIC
```

**Resultado esperado**

```text
questionsCount = 75
selectedList = agroDiagnosticQuestions
```

O valor `CAFE` deve aparecer apenas nos dados cadastrais/logs, nunca como motivo da seleção do formulário.

### CT-006 — Empresa com atividade específica alterada

**Execução**

Executar o mesmo diagnóstico alterando `specificActivity` entre:

```text
CAFE
ARROZ
BANANA
SEMENTES
```

**Resultado esperado**

```text
COMPANY → sempre 75 questões
```

Alterar a atividade específica não deve alterar o `questionsCount`.

### CT-007 — Dois diagnósticos na mesma organização

**Pré-condições**

```text
SUPPLIER_DIAGNOSTIC → existente
PRE_DIAGNOSTIC      → criado após a compra
COMPANY             → existente após pagamento
SUPPLIER            → permanece existente
```

**Resultado esperado**

O fluxo empresarial deve usar o registro `PRE_DIAGNOSTIC`. O fluxo de fornecedor deve continuar vinculado ao `SUPPLIER_DIAGNOSTIC`.

Não é permitido usar o mesmo `diagnosticId` para armazenar respostas dos dois formulários.

### CT-008 — Fornecedor sem segmento válido

**Pré-condições**

- organização possui somente `SUPPLIER`;
- `businessSegment` nulo ou inválido;
- não comprou o autodeclaratório.

**Resultado esperado recomendado**

```text
bloquear início com mensagem de segmento obrigatório
```

ou utilizar um formulário padrão reduzido de fornecedor. Nunca deve cair silenciosamente no formulário empresarial de 75 questões.

### CT-009 — Empresa sem compra

**Pré-condições**

- organização possui `COMPANY`;
- não possui compra paga;
- não possui assinatura ou entitlement ativo.

**Resultado esperado**

```text
POST /api/diagnostic/start
→ erro de acesso
→ nenhuma sessão nova criada
```

Mensagem esperada:

```text
Você precisa adquirir o Pré-Diagnóstico ou um plano de assessoria para iniciar a avaliação.
```

### CT-010 — Recarregar a página depois da compra

**Execução**

1. concluir a compra;
2. sair e entrar novamente ou recarregar a página;
3. acessar `/app/diagnostico`;
4. observar os logs do backend.

**Resultado esperado nos logs**

```text
hasCompanyRole: true
isSupplierOrg: false
computedKind: PRE_DIAGNOSTIC ou FULL_DIAGNOSTIC
persistedDiagnosticKind: PRE_DIAGNOSTIC
questionsCount: 75
```

O valor de `specificActivity` pode ser exibido, mas não pode aparecer como motivo da seleção.

### CT-011 — Empresa já compradora recebe convite de fornecedor

**Pré-condições**

- organização já possui `COMPANY / UPGRADE`;
- organização já comprou o `PRE_DIAGNOSTIC`;
- organização possui um diagnóstico empresarial `PRE_DIAGNOSTIC` ativo ou concluído;
- outra empresa envia um convite para essa organização;
- a organização aceita o convite.

**Execução**

1. aceitar o convite com a organização já existente;
2. consultar os papéis da organização;
3. consultar os diagnósticos da organização;
4. consultar o relacionamento com o comprador.

**Resultado esperado nos papéis**

Os papéis não devem ser alterados:

```text
COMPANY / UPGRADE
```

Não deve ser criado um novo papel `SUPPLIER` apenas por aceitar o convite, pois a organização já é uma empresa compradora existente.

**Resultado esperado no relacionamento**

Deve ser criado ou ativado somente o vínculo de cadeia:

```text
organization_relationships:
buyerOrganizationId      = empresa que enviou o convite
supplierOrganizationId   = empresa que aceitou o convite
status                   = ACTIVE
inviteId                 = convite aceito
```

**Resultado esperado nos diagnósticos**

O diagnóstico empresarial existente deve permanecer:

```text
PRE_DIAGNOSTIC
```

Não deve ser criado nem selecionado um novo `SUPPLIER_DIAGNOSTIC` para substituir o autodeclaratório comprado.

**Resultado esperado na aplicação**

```text
empresa continua com acesso ao diagnóstico empresarial de 75 questões;
empresa passa a aparecer vinculada ao comprador na cadeia;
empresa não perde o relatório empresarial;
empresa não deve ser redirecionada para o formulário reduzido de fornecedor.
```

Se o diagnóstico empresarial já estiver concluído, o sistema deve reutilizar o resultado existente:

```text
diagnostic.status = COMPLETED
diagnostic.score = score já salvo
```

Nesse caso, aceitar o convite não deve:

- criar outro diagnóstico;
- apagar ou substituir o diagnóstico concluído;
- zerar as respostas;
- recalcular o score automaticamente;
- trocar o relatório empresarial pelo relatório de fornecedor.

O score existente deve continuar sendo usado na tela de resultados e no relatório da empresa.

Esse caso é diferente do fornecedor que compra o produto:

```text
Fornecedor entra por convite e depois compra:
SUPPLIER → COMPANY + SUPPLIER
→ cria/usa PRE_DIAGNOSTIC empresarial

Empresa já compradora recebe convite:
COMPANY permanece COMPANY
→ apenas cria o relacionamento na cadeia
```

## 6. Logs de diagnóstico

Os logs principais estão em:

```text
backend/src/modules/diagnostic/services/diagnosticService.ts
```

Tags:

```text
[diagnostic.question-selection]
[diagnostic.service.startDiagnostic]
```

Para empresa compradora, o log esperado é:

```text
Selected company questionnaire
selectedList: agroDiagnosticQuestions
questionsCount: 75
```

Para fornecedor gratuito de produção:

```text
Selected supplier production questionnaire
selectedList: agroProdQuestionsList
questionsCount: 36
```

Não deve existir mais o log:

```text
Selected questionnaire through specificActivity fallback
```

## 7. Critérios de aceite

- [ ] `PRE_DIAGNOSTIC` é criado após a criação do checkout.
- [ ] O pagamento aprovado ativa o `PRE_DIAGNOSTIC`.
- [ ] O pagamento cria ou atualiza o papel `COMPANY` com `source = UPGRADE`.
- [ ] Um fornecedor comprador mantém seu papel `SUPPLIER`.
- [ ] Um fornecedor comprador recebe um diagnóstico empresarial separado.
- [ ] Empresas `COMPANY` recebem 75 questões.
- [ ] Fornecedores `SUPPLIER_DIAGNOSTIC` recebem o formulário do `businessSegment`.
- [ ] `specificActivity` não muda a quantidade de perguntas.
- [ ] O `SUPPLIER_DIAGNOSTIC` não é reutilizado para respostas do diagnóstico empresarial.
- [ ] O endpoint `/api/diagnostic/start` retorna o `diagnosticId` correto.
- [ ] O cálculo final usa o mesmo conjunto de perguntas apresentado ao usuário.
- [ ] A página recarregada mantém a distribuição correta.
- [ ] Uma `COMPANY` já compradora que aceita convite apenas cria o vínculo de cadeia.
- [ ] Uma `COMPANY` já compradora que aceita convite não perde nem troca seu `PRE_DIAGNOSTIC`.
- [ ] O aceite do convite não redireciona uma empresa compradora para o formulário reduzido.
- [ ] Uma `COMPANY` com diagnóstico concluído reutiliza o `DiagnosticScore` existente após aceitar convite.
- [ ] Uma `COMPANY` com diagnóstico concluído não recebe novo diagnóstico automaticamente.

## 8. Arquivos envolvidos

- `backend/src/modules/checkout/controllers/checkoutController.ts`
- `backend/src/modules/checkout/services/checkoutService.ts`
- `backend/src/modules/auth/repositories/authRepository.ts`
- `backend/src/modules/auth/models/accessContext.ts`
- `backend/src/modules/invite/services/inviteService.ts`
- `backend/src/modules/diagnostic/controllers/diagnosticController.ts`
- `backend/src/modules/diagnostic/services/diagnosticService.ts`
- `backend/src/modules/diagnostic/repositories/diagnosticRepository.ts`
- `backend/src/modules/diagnostic/models/diagnosticModel.ts`
- `backend/prisma/schema.prisma`
- `frontend/src/features/company-area/context/company-context.tsx`
- `frontend/src/features/company-area/services/diagnostic.service.ts`
- `frontend/src/app/(app)/app/diagnostico/page.tsx`
- `frontend/src/app/(app)/app/diagnostico/preencher/page.tsx`

## 9. Matriz completa de cenários possíveis

Esta seção consolida as combinações possíveis da jornada. A regra de decisão é sempre:

```text
diagnóstico empresarial = PRE_DIAGNOSTIC ou FULL_DIAGNOSTIC
→ 75 questões

diagnóstico de cadeia = SUPPLIER_DIAGNOSTIC
→ formulário reduzido definido somente por businessSegment

specificActivity
→ dado cadastral, não participa da distribuição do formulário
```

### 8.1 Cenários por origem do cadastro e compra

| ID | Origem | Compra autodeclaratório | Papéis esperados | Diagnóstico usado | Resultado |
|---|---|---:|---|---|---|
| S01 | Cadastro normal | Não | `COMPANY / SELF_SIGNUP` | Nenhum | Acesso bloqueado para iniciar |
| S02 | Cadastro normal | Pendente | `COMPANY / SELF_SIGNUP` | `PRE_DIAGNOSTIC / PENDING_PAYMENT` | Não inicia até pagar |
| S03 | Cadastro normal | Sim | `COMPANY / UPGRADE` | `PRE_DIAGNOSTIC / ACTIVE` | 75 questões |
| S04 | Convite de fornecedor | Não | `SUPPLIER / INVITE` | `SUPPLIER_DIAGNOSTIC / ACTIVE` | Formulário reduzido por segmento |
| S05 | Convite de fornecedor | Pendente | `SUPPLIER / INVITE` | `SUPPLIER_DIAGNOSTIC` + `PRE_DIAGNOSTIC / PENDING_PAYMENT` | Continua fornecedor até o pagamento |
| S06 | Convite de fornecedor | Sim | `COMPANY / UPGRADE`; `SUPPLIER` desativado | `SUPPLIER_DIAGNOSTIC` + `PRE_DIAGNOSTIC / ACTIVE` | Formulário empresarial de 75 questões |
| S07 | Empresa compradora | Recebe convite depois da compra | `COMPANY / UPGRADE` | Mantém `PRE_DIAGNOSTIC` | Apenas cria relacionamento |
| S08 | Empresa compradora concluída | Recebe convite depois de concluir | `COMPANY / UPGRADE` | Mantém diagnóstico `COMPLETED` | Reutiliza respostas e scores |

### 8.2 Cenários de segmentação do fornecedor

| ID | Papel | `businessCategory` | `businessSegment` | `specificActivity` | Resultado |
|---|---|---|---|---|---|
| F01 | `SUPPLIER` | `AGRONEGOCIO` | `PRODUCAO` | `CAFE` | Formulário reduzido de produção |
| F02 | `SUPPLIER` | `AGRONEGOCIO` | `PRODUCAO` | `ARROZ` | Formulário reduzido de produção |
| F03 | `SUPPLIER` | `AGRONEGOCIO` | `PRODUCAO` | `BANANA` | Formulário reduzido de produção |
| F04 | `SUPPLIER` | `AGRONEGOCIO` | `AGROINDUSTRIA` | `CAFE` | Formulário reduzido agroindustrial |
| F05 | `SUPPLIER` | `AGRONEGOCIO` | `AGROINDUSTRIA` | `EMBALAGEM` | Formulário reduzido agroindustrial |
| F06 | `SUPPLIER` | `AGRONEGOCIO` | `AGROINDUSTRIA` | `MAQUINARIO` | Formulário reduzido agroindustrial |
| F07 | `SUPPLIER` | `AGRONEGOCIO` | Nulo | Qualquer | Bloquear ou usar formulário padrão reduzido |
| F08 | `SUPPLIER` | Nulo | Inválido | Qualquer | Bloquear ou usar formulário padrão reduzido |

Para fornecedores, a atividade específica deve aparecer somente no cadastro/log, nunca como motivo da escolha da lista.

### 8.3 Cenários de categoria da empresa

| ID | Papel | Categoria | Segmento | Diagnóstico | Resultado |
|---|---|---|---|---|---|
| C01 | `COMPANY` | `AGRONEGOCIO` | `PRODUCAO` | `PRE_DIAGNOSTIC` | 75 questões |
| C02 | `COMPANY` | `AGRONEGOCIO` | `AGROINDUSTRIA` | `PRE_DIAGNOSTIC` | 75 questões |
| C03 | `COMPANY` | `AGRONEGOCIO` | Nulo | `PRE_DIAGNOSTIC` | 75 questões empresariais |
| C04 | `COMPANY` | Nulo | `PRODUCAO` | `PRE_DIAGNOSTIC` | 75 questões empresariais |
| C05 | `COMPANY` | `AGRONEGOCIO` | `PRODUCAO` | `FULL_DIAGNOSTIC` | 75 questões |
| C06 | `COMPANY` | `AGRONEGOCIO` | `PRODUCAO` | `PRE_DIAGNOSTIC`, atividade `CAFE` | 75 questões |
| C07 | `COMPANY` | `AGRONEGOCIO` | `PRODUCAO`, atividade `PROUZO_SEMENTES` | `PRE_DIAGNOSTIC` | 75 questões |

Nenhum cenário `COMPANY` deve retornar `agroProdQuestionsList` ou `agroIndQuestionsList` por causa de `specificActivity`.

### 8.4 Cenários de diagnóstico existente

| ID | Diagnóstico existente | Nova compra | Resultado esperado |
|---|---|---|---|
| D01 | Nenhum | Sim | Criar `PRE_DIAGNOSTIC` e ativar após pagamento |
| D02 | `SUPPLIER_DIAGNOSTIC / ACTIVE` | Sim | Criar diagnóstico empresarial separado |
| D03 | `PRE_DIAGNOSTIC / ACTIVE` | Nova tentativa pendente | Reutilizar pedido/diagnóstico pendente quando aplicável |
| D04 | `PRE_DIAGNOSTIC / COMPLETED` | Nova compra sem consultoria | Não criar novo diagnóstico; reutilizar score ou bloquear refazer |
| D05 | `SUPPLIER_DIAGNOSTIC / COMPLETED` | Compra autodeclaratória | Criar `PRE_DIAGNOSTIC` empresarial separado |
| D06 | `PRE_DIAGNOSTIC / COMPLETED` + convite | Não comprar novamente | Manter respostas, score e relatório empresarial |
| D07 | `PRE_DIAGNOSTIC / ACTIVE` + convite | Não comprar novamente | Manter diagnóstico empresarial e criar apenas relacionamento |
| D08 | Dois diagnósticos ativos | Nenhuma compra | Selecionar o diagnóstico compatível com o papel/fluxo, nunca apenas o mais recente |
| D09 | `SUPPLIER_DIAGNOSTIC` + `PRE_DIAGNOSTIC` | Empresa possui `COMPANY` | Usar `PRE_DIAGNOSTIC` para o fluxo empresarial |
| D10 | `SUPPLIER_DIAGNOSTIC` + `PRE_DIAGNOSTIC` | Organização somente `SUPPLIER` | Usar `SUPPLIER_DIAGNOSTIC` |

### 8.5 Cenários de aceite de convite

| ID | Situação antes do convite | Resultado do aceite |
|---|---|---|
| I01 | Organização inexistente | Cadastro cria `SUPPLIER / INVITE` e vínculo |
| I02 | `SUPPLIER` sem compra | Aceita convite e responde formulário reduzido |
| I03 | `SUPPLIER` com compra pendente | Continua fornecedor até pagamento confirmado |
| I04 | `SUPPLIER` com compra paga | Possui `SUPPLIER + COMPANY` e responde formulário empresarial |
| I05 | `COMPANY` sem diagnóstico | Mantém `COMPANY`; apenas cria vínculo |
| I06 | `COMPANY` com `PRE_DIAGNOSTIC / ACTIVE` | Mantém diagnóstico; apenas cria vínculo |
| I07 | `COMPANY` com `PRE_DIAGNOSTIC / COMPLETED` | Mantém score; apenas cria vínculo |
| I08 | `COMPANY` com `FULL_DIAGNOSTIC / COMPLETED` | Mantém score; apenas cria vínculo |
| I09 | Convite já aceito pelo mesmo fornecedor | Não criar relacionamento duplicado |
| I10 | Convite para e-mail diferente | Bloquear aceite |
| I11 | Convite expirado ou cancelado | Bloquear aceite |
| I12 | Convite da própria organização | Bloquear aceite |

### 8.6 Cenários de respostas e score

| ID | Situação | Resultado esperado |
|---|---|---|
| R01 | Empresa inicia 75 questões | Cálculo exige 75 respostas válidas |
| R02 | Fornecedor de produção inicia formulário reduzido | Cálculo exige 36 respostas válidas |
| R03 | Fornecedor de agroindústria inicia formulário reduzido | Cálculo usa a quantidade da lista agroindustrial |
| R04 | Empresa altera `specificActivity` durante o preenchimento | Lista não muda |
| R05 | Empresa aceita convite após concluir | Score não é recalculado |
| R06 | Diagnóstico empresarial recebe respostas de fornecedor | Falha de teste; `diagnosticId` incorreto |
| R07 | Diagnóstico de fornecedor recebe respostas empresariais | Falha de teste; `diagnosticId` incorreto |
| R08 | Respostas incompletas | Não permitir conclusão |
| R09 | Diagnóstico concluído sem nova contratação | Não permitir novo preenchimento sem regra de consultoria |

### 8.7 Cenários de cache e recarregamento

| ID | Situação | Resultado esperado |
|---|---|---|
| K01 | Compra confirmada e página recarregada | Perfil mostra `COMPANY / UPGRADE` |
| K02 | Compra confirmada e cache de acesso antigo | Caches são invalidados; nova consulta mostra `hasPreDiagnosticAccess = true` |
| K03 | Sessão antiga de fornecedor no navegador | Não reutilizar perguntas incompatíveis com o diagnóstico atual |
| K04 | Cache de diagnóstico atual após pagamento | Invalidar `diagnostic:current:<organizationId>` |
| K05 | Duas chamadas simultâneas de `startDiagnostic` | Mesmo diagnóstico e mesma lista devem ser retornados |
| K06 | Página de resultados após compra | Usar diagnóstico e score correspondentes ao fluxo empresarial |

### 8.8 Estados finais esperados

#### Empresa compradora comum

```text
roles:
COMPANY / SELF_SIGNUP ou UPGRADE

diagnostic:
PRE_DIAGNOSTIC / ACTIVE ou COMPLETED

questions:
75
```

#### Fornecedor gratuito

```text
roles:
SUPPLIER / INVITE

diagnostic:
SUPPLIER_DIAGNOSTIC / ACTIVE ou COMPLETED

questions:
quantidade reduzida conforme businessSegment
```

#### Fornecedor que compra

```text
roles:
COMPANY / UPGRADE
SUPPLIER / INVITE com removedAt preenchido

diagnostics:
SUPPLIER_DIAGNOSTIC / histórico da cadeia
PRE_DIAGNOSTIC / diagnóstico empresarial

questions do PRE_DIAGNOSTIC:
75
```

#### Empresa compradora que aceita convite

```text
roles:
COMPANY / UPGRADE

diagnostic:
mantém PRE_DIAGNOSTIC ou FULL_DIAGNOSTIC existente

relationship:
ACTIVE

questions:
não muda; score existente é reutilizado
```
