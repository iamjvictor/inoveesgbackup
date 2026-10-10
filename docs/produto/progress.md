# Registro de Progresso & Módulos (InoveESG)

Este documento atua como a memória técnica ativa do projeto **InoveESG**. Ele deve ser mantido e atualizado ao final de cada iteração de desenvolvimento para que o contexto de progresso e as prioridades fiquem evidentes para qualquer agente ou desenvolvedor que assumir a sequência do projeto.

---

## 📅 Última Atualização: Maio de 2026

## 🚀 1. Módulos Concluídos

### 🛡️ **Autenticação, Sessões e Rotas Protegidas**
*   **Middleware do Next.js**: Proteção de nível edge cobrindo as rotas `/app` e `/admin`.
*   **AppShell client-side**: Proteção baseada em resposta do backend. Redirecionamento instantâneo em caso de token JWT inválido ou expirado (Supabase Auth).
*   **Frictionless UX Redirect**: Redirecionamento unificado para `/?auth=true`, abrindo a Landing Page com o modal de login posicionado na aba correspondente à entrada do usuário.

### 📊 **Contexto e Lógica de Acesso (CompanyContext)**
*   **Prevenção de Flickering**: Introduzido estado de `isLoading` no `CompanyProvider` que mostra um indicador visual suave até validar a resposta do servidor, eliminando a exibição rápida de telas restritas.
*   **Categorias de Acesso Corporativo**:
    *   `isUnpaid`: Identificação robusta de novos usuários sem serviços ativos.
    *   `hasOnlyPreDiagnostic`: Fluxo de visualização básico para quem realizou a triagem.
    *   `isSupplierOnly`: Dashboard focado no fornecedor.
    *   `hasActivePlan`: Liberação do ecossistema SaaS completo.

### 🔒 **Restrição de Acesso e Fluxo de Upgrade (Pré-Diagnóstico)**
*   **Bloqueio de Abas na AppSidebar**: Itens de navegação restritos da sidebar exibem um ícone de cadeado e opacidade reduzida para usuários no plano Pré-Diagnóstico. O clique nesses itens bloqueados redireciona o usuário de forma ativa para a nova página de upgrade de plano corporativo.
*   **Nova Página de Upgrade (/app/upgrade)**: Interface de alta fidelidade que apresenta os caminhos de atualização corporativa (Diagnóstico Estratégico, Diagnóstico + Consultoria, Assessoria ESG) exibindo investimento sob orçamento para adequação ao porte da empresa. Inclui uma barra de rolagem horizontal infinita (Marquee) exibindo os outros Serviços Sob Demanda que pausa ao passar o mouse.
*   **Integração com Formulário de Orçamento**: O botão de upgrade em cada card adiciona o plano selecionado ao carrinho e dispara o `BudgetModal` de cotação corporativa de forma transparente.
*   **Proteção de Rotas Cliente (AppShell)**: Impede o acesso direto digitando a URL para rotas protegidas (como `/app/evidencias`, `/app/resultados`, etc.) redirecionando usuários sob o plano Pré-Diagnóstico diretamente para `/app/upgrade`.

### 🛒 **Dashboard de Vendas / Conversão (PurchaseView)**
*   **Interface Single-Screen**: Redução do layout de vendas para caber na tela sem rolagem de janela global.
*   **Identidade Visual e Branding**: Substituído o placeholder de texto "InoveESG" no header de checkout por uma renderização otimizada com o componente `<Image />` do Next.js utilizando a logo real da marca (`/logo_inove_transparent.png`), mantendo a consistência do branding.
*   **Scroll Infinito Vertical com Hover-Pause**: Sidebar lateral de serviços sob demanda com rolagem infinita contínua em loop sem falhas (incluindo o livro Bioeconomia & ESG e todos os serviços adicionais). O movimento é interrompido instantaneamente ao pousar o mouse, facilitando a interação e leitura.
*   **Gradientes de Fade Glassmorphic**: Adicionados overlays transparentes nas bordas superior e inferior do scroll para criar uma estética premium.
*   **Paridade de Catálogo**: Inclusão de todos os serviços bioeconômicos (Avaliação de Fornecedores, Capacitação de Lideranças, Livro Bioeconomia & ESG).
*   **Clareza Comercial**: Utilização do prefixo *"A partir de"* para precificações sob medida.
*   **Simplificação do Fluxo da Landing Page**: Removido por completo o componente `CartModal` da landing page. O clique em qualquer plano ou serviço sob demanda na landing page agora abre diretamente o modal de autenticação (`AuthModal` na aba de cadastro), guiando o usuário de forma fluida para a área restrita do aplicativo (`/app`) após a criação da conta.

### 💼 **Meus Serviços e Contratações (/app/meus-servicos)**
*   **Painel Central de Serviços**: Nova página `/app/meus-servicos` que serve como o hub de contratações do usuário, exibindo o status do plano principal (ex: Pré-Diagnóstico ESG, Plano Corporativo) e serviços adicionais.
*   **Persistência de Compras Simuladas**: Modificamos a barra lateral do carrinho (`CartSidebar`) para guardar compras pendentes em `localStorage`. No sucesso da simulação do checkout (`/app/checkout/success`), as compras pendentes são convertidas em serviços ativos (ex: *Livro Bioeconomia & ESG*, *Capacitação ESG*) com status **ATIVO**, listando-os dinamicamente na página de serviços.
*   **Rastreabilidade de Orçamentos Solicitados**: No envio do formulário de orçamento pelo `BudgetModal`, as solicitações de cotação corporativa de planos e serviços adicionais sob medida são persistidas localmente e exibidas como propostas **Em Análise**, permitindo que o usuário acompanhe o status de negociação e inicie um contato direto com consultores via WhatsApp.
*   **Navegação e Rotas**: Adicionado o link "Meus Serviços" com ícone de pasta/portfólio (`Briefcase`) na `AppSidebar` e configurado no middleware do `AppShell` como rota totalmente liberada e desbloqueada para todos os níveis de acesso (incluindo usuários não-pagantes `isUnpaid` e com apenas Pré-Diagnóstico `hasOnlyPreDiagnostic`).

---

## 🛠️ 2. Módulos Em Andamento

### 🌱 **Diagnóstico ESG com 4 Pilares**
*   **Status Atual**: A estrutura do diagnóstico foi migrada para considerar `Ambiental`, `Bioeconomia Circular`, `Social` e `Governança` como pilares de primeira classe.
*   **Backend**: O schema Prisma, o model estático de perguntas e o cálculo/persistência de score já reconhecem o eixo `BIOECONOMY_CIRCULAR`.
*   **Frontend**: As telas de início, preenchimento, resultados, relatório, fornecedores e pré-diagnóstico passaram a exibir o quarto pilar.
*   **Validação**: O backend recompilou com sucesso; o frontend passou no `tsc --noEmit`. O `next build` ainda fica bloqueado pelo fetch de fontes remotas do `next/font`.

### 💳 **Checkout & Gateway de Pagamentos**
*   **Simulação Concluída**: O fluxo simulado está 100% interativo, funcional e persistente no lado do cliente.
*   **Próxima Etapa**:
    *   Integrar com um gateway de pagamento de produção (Stripe ou Pix real).
    *   Configurar Webhooks no backend para escutar eventos de pagamento concluído.
    *   Atualizar o banco de dados via Prisma para converter `isUnpaid` em `hasActivePlan` automaticamente após a validação do Webhook.

### 🧩 **Segmentação de Empresa e Fluxo de Diagnóstico**
*   **Seleção de Segmento no Cadastro**: O campo `industrySegment` do formulário de cadastro ainda é um seletor textual hardcoded no frontend.
*   **Fluxo de Diagnóstico Dinâmico**: O backend já resolve o usuário logado, identifica a empresa e seleciona o bloco estático de perguntas correspondente no `diagnosticModel`.
*   **Próxima Etapa**:
    *   Transformar `industrySegment` em `enum` no banco via Prisma.
    *   Validar os tipos de categoria no backend no momento do cadastro e atualização.
    *   Substituir o texto livre por um catálogo centralizado de segmentos suportados.

---

## 📅 3. Próximos Passos (Histórico de Prioridades)

1.  **Enum de Segmentos de Empresa**: Normalizar `industrySegment` como enum no banco e aplicar validação backend antes de persistir.
2.  **Geração de Certificados e Materiais**: Habilitar o download real dos relatórios de diagnóstico e arquivos PDF associados aos produtos adquiridos.
3.  **Relatórios de Diagnóstico Final**: Estruturar a geração de relatórios avançados baseados nos dados coletados após a migração do usuário para planos ativos.

---

*Mantenha este arquivo atualizado a cada nova funcionalidade integrada!*
