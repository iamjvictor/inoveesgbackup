# PROJECT.md — Plataforma ESG

---

# 📌 1. Resumo do Projeto

## Visão Geral

Este projeto consiste no desenvolvimento de uma **plataforma web SaaS para diagnóstico ESG (Environmental, Social and Governance)**, permitindo que empresas avaliem seu nível de maturidade em práticas ambientais, sociais e de governança.

A solução tem como objetivo estruturar, automatizar e escalar o processo de avaliação ESG, transformando um processo manual e consultivo em uma plataforma digital acessível e monetizável.

---

## 🎯 Objetivo do Sistema

O sistema tem como principais objetivos:

* Permitir que empresas realizem um **diagnóstico ESG estruturado**
* Gerar uma **pontuação automática baseada em respostas**
* Permitir envio de **evidências documentais**
* Gerar um **relatório com análise e recomendações**
* Expandir a avaliação para a **cadeia de fornecedores**
* Criar um modelo de **monetização baseado em diagnóstico, convites e assinatura**

---

## 🧠 Modelo de Negócio

A plataforma opera como um **SaaS com múltiplas fontes de receita**:

* Venda de diagnóstico ESG
* Venda de pacotes de convites para fornecedores
* Assinatura para desbloqueio de funcionalidades avançadas

---

## 🏢 Estrutura do Sistema

Todas as entidades são tratadas como **empresas**, podendo assumir diferentes papéis:

* Empresa avaliada
* Fornecedor convidado
* Empresa assinante

---

## 🔑 Pilares do Sistema

O MVP da plataforma é estruturado em quatro pilares:

1. Diagnóstico ESG
2. Evidências e documentos
3. Avaliação de fornecedores
4. Monetização (diagnóstico, convites e assinatura)

---

# 📋 2. Requisitos Funcionais

A seguir estão definidos os requisitos funcionais do sistema:

---

## RF001 — Sistema de Acesso e Autenticação

Permitir cadastro, login e recuperação de senha com controle de acesso por perfil.

---

## RF002 — Cadastro e Gestão de Empresas

Permitir cadastro, edição e gestão de dados institucionais das empresas.

---

## RF003 — Seleção de Tipo de Empresa e Formulário ESG

Associar automaticamente formulários ESG diferentes conforme o segmento da empresa.

---

## RF004 — Contratação de Diagnóstico ESG

Permitir contratação do diagnóstico com controle de status e liberação após pagamento.

---

## RF005 — Integração com Gateway de Pagamento

Permitir pagamentos via PIX, cartão e boleto, com liberação automática dos serviços.

---

## RF006 — Aplicação do Diagnóstico ESG

Permitir que a empresa responda ao questionário ESG com navegação e salvamento.

---

## RF007 — Sistema de Pontuação ESG

Calcular automaticamente pontuações por eixo e pontuação geral.

---

## RF008 — Upload de Evidências e Documentos

Permitir envio e associação de documentos às respostas do diagnóstico.

---

## RF009 — Painel de Resultados ESG

Exibir pontuação geral, por eixo e indicadores visuais.

---

## RF010 — Geração de Relatório ESG

Gerar relatório consolidado com análise, pontos fortes e melhorias.

---

## RF011 — Convite de Empresas (Fornecedores)

Permitir envio de convites e acompanhamento do status.

---

## RF012 — Controle de Convites

Controlar quantidade adquirida, utilizada e bloquear envio ao atingir limite.

---

## RF013 — Avaliação ESG de Empresas Convidadas

Permitir que fornecedores realizem o diagnóstico completo.

---

## RF014 — Monitoramento da Cadeia de Fornecedores

Exibir status de fornecedores (convidados, respondidos e pendentes).

---

## RF015 — Venda de Pacotes de Convites

Permitir compra de pacotes e atualização automática de saldo.

---

## RF016 — Controle de Acesso do Fornecedor

Restringir acesso ao relatório completo sem assinatura.

---

## RF017 — Assinatura para Acesso Completo

Permitir contratação de plano para desbloqueio de funcionalidades.

---

## RF018 — Painel Administrativo

Permitir gestão de empresas, diagnósticos e dados operacionais.

---

# 📊 Status do Desenvolvimento (Checklist)

> **Atualizado em 23/08/2026.** O status abaixo foi revisado com base no código atual do frontend, backend, schema Prisma, migrations e integrações existentes.

**Legenda:** 🟢 implementado no fluxo principal; 🟡 parcialmente implementado ou dependente de configuração/integração final; 🔴 ainda não implementado de forma funcional.

Abaixo está o checklist do progresso de implementação dos Requisitos Funcionais (RF) para o MVP da plataforma:

* 🟢 **RF001 — Sistema de Acesso e Autenticação**
  * *Status:* 🟢 Implementado com Supabase Auth, cadastro, login, login administrativo, recuperação e redefinição de senha.
* 🟢 **RF002 — Cadastro e Gestão de Empresas**
  * *Status:* 🟢 Implementado com persistência de `User`, `Organization`, papéis/membros e atualização de perfil no backend.
* 🟢 **RF003 — Seleção de Tipo de Empresa e Formulário ESG**
  * *Status:* 🟢 Implementado. O cadastro seleciona categoria e segmento, esses dados são persistidos e o backend escolhe o conjunto de perguntas conforme o perfil da empresa/fornecedor.
* 🟢 **RF004 — Contratação de Diagnóstico ESG**
  * *Status:* 🟢 Implementado. Há `BudgetRequest`, fluxo de orçamento, produtos de diagnóstico, pedidos persistidos e ativação do diagnóstico após confirmação de pagamento.
* � **RF005 — Integração com Gateway de Pagamento**
  * *Status:* 🟢 Implementado. O checkout Mercado Pago, pedidos, PIX/cartão/boleto e webhook estão preparados, mas o fluxo de confirmação disponível na interface também usa simulação; ainda é necessário validar o ciclo completo em produção com credenciais, notificações e tratamento operacional de todos os estados.
* 🟢 **RF006 — Aplicação do Diagnóstico ESG**
  * *Status:* 🟢 Implementado. O questionário é carregado pelo backend, possui navegação, salvamento/upsert de respostas, retomada, declaração de responsabilidade e finalização.
* 🟢 **RF007 — Sistema de Pontuação ESG**
  * *Status:* 🟢 Implementado no backend. O cálculo usa respostas persistidas, pesos por pergunta, pontuação por eixo, pontuação geral e nível de maturidade.
* 🟢 **RF008 — Upload de Evidências e Documentos**
  * *Status:* 🟢 Implementado. Arquivos são enviados ao Supabase Storage, associados ao diagnóstico/categoria e registrados com status de upload e verificação.
* 🟢 **RF009 — Painel de Resultados ESG**
  * *Status:* 🟢 Implementado. A tela consulta o diagnóstico atual/histórico e exibe pontuação real por eixo, pontuação geral, maturidade e indicadores de evidências.
* 🟢 **RF010 — Geração de Relatório ESG**
  * *Status:* 🟢 Implementado. O backend gera PDF a partir do diagnóstico concluído, pontuações, recomendações, evidências e cadeia de fornecedores.
* � **RF011 — Convite de Empresas (Fornecedores)**
  * *Status:* 🟢 Parcialmente implementado. Backend, convite público, aceite, persistência e serviços estão funcionais; a tela principal `/app/fornecedores` ainda monta parte do conteúdo com `mock-data` e precisa ser ligada integralmente aos dados reais.
* 🟢 **RF012 — Controle de Convites**
  * *Status:* 🟢 Parcialmente implementado. O backend controla carteira, transações, consumo, limites e estatísticas, mas a experiência de saldo/compra ainda possui componentes mockados e o fluxo precisa ser consolidado no frontend.
* 🟢 **RF013 — Avaliação ESG de Empresas Convidadas**
  * *Status:* 🟢 Implementado no fluxo principal. O fornecedor pode aceitar o convite, receber o papel de fornecedor e executar um diagnóstico associado ao seu segmento e relacionamento.
*  **RF014 — Monitoramento da Cadeia de Fornecedores**
  * *Status:* 🟢 Parcialmente implementado. Existem `Invite`, `SupplierLink`, status, ranking, estatísticas, histórico e  consultas administrativas; a visão principal da cadeia ainda depende de dados mockados em alguns componentes.
* 🟢 **RF015 — Venda de Pacotes de Convites**
  * *Status:* 🟢 Parcialmente implementado. O produto, pedido, pagamento, webhook e atualização de carteira existem no backend, porém a tela de compra ainda usa view model mockado e o fluxo de produção precisa substituir a confirmação simulada.
* 🟢 **RF016 — Controle de Acesso do Fornecedor**
  * *Status:* 🟢 Parcialmente implementado. Há separação de papéis e bloqueios visuais por plano no frontend, mas o endpoint de relatório ainda não aplica uma autorização server-side explícita para impedir o acesso ao conteúdo completo sem assinatura; hoje a diferenciação ocorre principalmente pela ausência das pontuações comprovadas.
* 🟢 **RF017 — Assinatura para Acesso Completo**
  * *Status:* 🟢 Parcialmente implementado. Schema de planos, assinaturas, entitlements, contexto de acesso e tela de upgrade já existem, mas o produto `PRE_DIAGNOSTIC_PLUS` ainda é tratado como compra avulsa e não há um ciclo completo de assinatura recorrente/cobrança e cancelamento integrado ao gateway.
* 🟢 **RF018 — Painel Administrativo**
  * *Status:* 🟢 Implementado. Há autenticação administrativa, rotas protegidas, visão geral, clientes, fornecedores, evidências, análises, financeiro, orçamentos, consultoria e livros, com consultas ao backend.

### Pendências técnicas identificadas

* O `frontend` ainda não passa no `npm run lint`: há erros de `any`, efeitos React e componentes administrativos que precisam de correção.
* As áreas de fornecedores, perfil, compra de convites e alguns view models ainda mantêm dados de demonstração em `frontend/src/features/company-area/models/mock-data.ts`.
* O pagamento precisa de homologação ponta a ponta no Mercado Pago, incluindo webhook, idempotência operacional, estados pendentes/recusados e configuração de produção.
* O controle de acesso ao relatório completo deve ser reforçado no backend, não apenas na navegação e apresentação do frontend.

---

# 🚀 3. Resultado Esperado

Ao final da implementação, a plataforma deverá:

* Estar operacional como um produto SaaS
* Permitir geração de receita através da plataforma
* Oferecer diagnóstico ESG completo e automatizado
* Permitir expansão em rede via fornecedores
* Servir como base para evolução futura (ranking, marketplace, certificação)

---

# 🔮 4. Evoluções Futuras (fora do MVP)

* Ranking ESG público
* Marketplace de fornecedores
* Certificação ESG
* Benchmark entre empresas
* Dashboard analítico avançado
* Histórico de evolução ESG

---

# 🧠 5. Observações Estratégicas

Este sistema não é apenas um software, mas uma **infraestrutura digital para estruturação de ESG em empresas**, podendo evoluir para um ecossistema de dados, certificação e relacionamento entre empresas.

---
