
# 📐 Arquitetura e Modelagem - Plataforma ESG

---

## 📑 Índice
1. [Análise de Requisitos](#análise-de-requisitos)
2. [Modelagem de Entidades](#modelagem-de-entidades)
3. [Relacionamentos](#relacionamentos)
4. [Diagrama Entidade-Relacionamento](#diagrama-entidade-relacionamento)
5. [Schema do Banco de Dados](#schema-do-banco-de-dados)
6. [Arquitetura do Sistema](#arquitetura-do-sistema)
7. [Fluxos de Dados](#fluxos-de-dados)

---

## 🔍 Análise de Requisitos

### Conceitos-Chave Identificados:
- **Modelo Multitenant**: Cada empresa é um tenant independente
- **Múltiplos Papéis**: Uma empresa pode ser avaliada, assinante ou convidada
- **Monetização**: Diagnóstico, convites, assinatura
- **Cadeia de Fornecedores**: Avaliação em rede
- **Pontuação Automática**: Cálculo de maturidade ESG
- **Relatórios**: Geração automática com análise

---

## 🏗️ Modelagem de Entidades

### ⚠️ **CONCEITO IMPORTANTE**
**O usuário final da plataforma é a EMPRESA!** A autenticação é feita pela empresa (CNPJ + senha). Usuários administrativos dentro de uma empresa têm papéis diferentes, mas sempre vinculados à company.

### 1. **COMPANY** (Empresa - Usuário Principal)
**Entidade central e usuário autenticável da plataforma.** A empresa se autentica via CNPJ + senha. Pode assumir múltiplos papéis (avaliada, assinante, fornecedor convidado).

```
Company
├── id: UUID (PK)
├── legal_name: String (NOT NULL) [Razão Social]
├── trade_name: String [Nome Fantasia]
├── cnpj: String (UNIQUE, NOT NULL) [Identificador de login]
├── password_hash: String (NOT NULL) [Senha da empresa]
├── company_type_id: UUID (FK → CompanyType, NOT NULL) [Define formulário ESG]
├── industry_segment: String [Ex: Agronegócio, Civil, Tecnologia, etc]
├── size: ENUM ['micro', 'small', 'medium', 'large', 'enterprise']
├── website: String
├── phone: String
├── contact_email: String [Email principal da empresa]
├── address: String
├── city: String
├── state: String
├── postal_code: String
├── country: String (DEFAULT: 'BR')
├── latitude: Decimal
├── longitude: Decimal
├── email_verified: Boolean (DEFAULT: false)
├── email_verified_at: DateTime
├── status: ENUM ['active', 'inactive', 'suspended'] (DEFAULT: 'active')
├── subscription_plan_id: UUID (FK → SubscriptionPlan)
├── subscription_started_at: DateTime
├── subscription_ended_at: DateTime
├── invite_balance: Integer (DEFAULT: 0) [Saldo de convites adquiridos]
├── password_reset_token: String
├── password_reset_expires_at: DateTime
├── last_login_at: DateTime
├── last_login_ip: String
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

**Obs:** Usuários administrativos dentro da empresa são gerenciados separadamente via COMPANY_USER (abaixo)
```

### 1.5 **COMPANY_USER** (Usuários Administrativos da Empresa)
Usuários internos que podem gerenciar dados da empresa (usuários administrativos, auditores).

```
CompanyUser
├── id: UUID (PK)
├── company_id: UUID (FK → Company, NOT NULL)
├── email: String (NOT NULL)
├── password_hash: String (NOT NULL)
├── full_name: String (NOT NULL)
├── phone: String
├── role: ENUM ['admin', 'auditor', 'viewer'] (DEFAULT: 'viewer')
├── email_verified: Boolean (DEFAULT: false)
├── email_verified_at: DateTime
├── status: ENUM ['active', 'inactive', 'suspended'] (DEFAULT: 'active')
├── last_login_at: DateTime
├── password_reset_token: String
├── password_reset_expires_at: DateTime
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
├── deleted_at: DateTime (SOFT DELETE)
└── created_by_company_user_id: UUID (FK → CompanyUser) [Quem criou este usuário]
```

### 2. **COMPANY_TYPE** (Tipo/Segmento de Empresa)
**Define diferentes formulários ESG por segmento de negócio.** Exemplos: Agronegócio, Civil, Tecnologia, Varejo, etc. **Cada tipo tem seu próprio formulário ESG customizado!**

```
CompanyType
├── id: UUID (PK)
├── name: String (NOT NULL, UNIQUE) [Ex: 'Agronegócio', 'Construção Civil', 'Tecnologia']
├── slug: String (UNIQUE) [Ex: 'agro', 'civil', 'tech']
├── description: String [Descrição do segmento]
├── icon_url: String [Ícone do segmento]
├── form_template_id: UUID (FK → FormTemplate, NOT NULL)
├── status: ENUM ['active', 'inactive'] (DEFAULT: 'active')
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 3. **FORM_TEMPLATE** (Template de Formulário ESG por Segmento)
**Define a estrutura do questionário ESG customizado por tipo de empresa.** 
- **Agronegócio** responde perguntas sobre práticas agrícolas sustentáveis, recursos hídricos, etc.
- **Construção Civil** responde sobre segurança, impacto ambiental de obras, etc.
- **Tecnologia** responde sobre governança de dados, privacidade, diversidade, etc.

```
FormTemplate
├── id: UUID (PK)
├── name: String (NOT NULL) [Ex: 'ESG Agronegócio v1.0']
├── company_type_id: UUID (FK → CompanyType, NOT NULL) [Qual segmento usa este formulário]
├── version: Integer (DEFAULT: 1) [Permite versionamento de formulários]
├── description: String
├── axes: JSONB (Estrutura completa dos eixos e perguntas)
│   ├── environmental: [ questionários ambientais específicos ]
│   ├── social: [ questionários sociais específicos ]
│   └── governance: [ questionários de governança específicos ]
├── total_questions: Integer [Total de perguntas do formulário]
├── estimated_completion_time: Integer [Tempo estimado em minutos]
├── is_active: Boolean (DEFAULT: true)
├── created_by_admin: Boolean (DEFAULT: false)
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

**Exemplo da estrutura AXES (JSON):**
```json
{
  "environmental": {
    "category": "Ambiental",
    "questions": [
      {
        "number": 1,
        "text": "Sua empresa possui certificação ambiental?",
        "type": "multiple_choice",
        "options": ["Sim, ISO 14001", "Sim, outra", "Não"],
        "weight": 10
      },
      {
        "number": 2,
        "text": "Qual o volume de resíduos gerado mensalmente?",
        "type": "text",
        "weight": 8
      }
    ]
  },
  "social": { ... },
  "governance": { ... }
}
```

### 5. **DIAGNOSTIC** (Diagnóstico)
Contrato do diagnóstico ESG com status e pagamento.

```
Diagnostic
├── id: UUID (PK)
├── company_id: UUID (FK → Company, NOT NULL)
├── form_template_id: UUID (FK → FormTemplate)
├── contract_number: String (UNIQUE)
├── status: ENUM ['pending_payment', 'active', 'completed', 'cancelled'] (DEFAULT: 'pending_payment')
├── price: Decimal (NOT NULL)
├── paid_at: DateTime
├── completed_at: DateTime
├── expires_at: DateTime [Validade do diagnóstico]
├── percentage_completion: Integer (DEFAULT: 0) [0-100%]
├── started_at: DateTime
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 6. **DIAGNOSTIC_RESPONSE** (Resposta do Diagnóstico)
**Respostas da empresa ao formulário ESG do seu segmento específico.** Cada pergunta corresponde a uma questão do FormTemplate da empresa.

```
DiagnosticResponse
├── id: UUID (PK)
├── diagnostic_id: UUID (FK → Diagnostic, NOT NULL)
├── form_template_id: UUID (FK → FormTemplate, NOT NULL)
├── question_number: Integer (NOT NULL) [Número da pergunta no formulário]
├── axis: ENUM ['environmental', 'social', 'governance'] (NOT NULL)
├── question_text: String (NOT NULL) [Pergunta formulada (cópia do template)]
├── question_type: ENUM ['multiple_choice', 'text', 'numeric', 'date'] [Tipo de resposta esperada]
├── answer: String [Resposta da empresa - pode ser multipla escolha ou texto livre]
├── answer_json: JSONB [Dados estruturados da resposta]
├── score: Integer [0-100, pontuação automática da resposta]
├── weight: Integer [Peso da pergunta no cálculo final]
├── evidence_ids: UUID[] [Array de evidências/documentos relacionados]
├── comment: String [Observação/justificativa do respondente]
├── auto_calculated_score: Boolean [Se o score foi calculado automaticamente]
├── answered_at: DateTime
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 7. **EVIDENCE** (Evidência/Documento)
Upload de documentos comprobatórios.

```
Evidence
├── id: UUID (PK)
├── diagnostic_response_id: UUID (FK → DiagnosticResponse)
├── diagnostic_id: UUID (FK → Diagnostic) [Ref geral]
├── file_name: String (NOT NULL)
├── file_path: String (NOT NULL) [Caminho no storage]
├── file_size: Integer (Bytes)
├── file_type: String [MIME type]
├── file_url: String [URL de acesso]
├── upload_status: ENUM ['pending', 'uploading', 'completed', 'failed'] (DEFAULT: 'pending')
├── description: String
├── verification_status: ENUM ['pending', 'verified', 'rejected'] (DEFAULT: 'pending')
├── uploaded_at: DateTime
├── verified_at: DateTime
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 8. **DIAGNOSTIC_SCORE** (Pontuação do Diagnóstico)
Cálculo automático de scores ESG.

```
DiagnosticScore
├── id: UUID (PK)
├── diagnostic_id: UUID (FK → Diagnostic, NOT NULL, UNIQUE)
├── overall_score: Decimal (0-100, NOT NULL)
├── environmental_score: Decimal (0-100)
├── social_score: Decimal (0-100)
├── governance_score: Decimal (0-100)
├── maturity_level: ENUM ['nascent', 'developing', 'established', 'managed', 'optimized']
├── strengths: JSON [Array de pontos fortes]
├── opportunities: JSON [Array de oportunidades de melhoria]
├── calculation_method: String [Documentação do cálculo]
├── calculated_at: DateTime (NOT NULL)
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 9. **DIAGNOSTIC_REPORT** (Relatório ESG)
Relatório gerado com análise e recomendações.

```
DiagnosticReport
├── id: UUID (PK)
├── diagnostic_id: UUID (FK → Diagnostic, NOT NULL, UNIQUE)
├── diagnostic_score_id: UUID (FK → DiagnosticScore)
├── report_title: String (NOT NULL)
├── executive_summary: String [Resumo executivo]
├── detailed_analysis: String [Análise detalhada em HTML/Markdown]
├── recommendations: JSON [Array de recomendações]
├── benchmark_comparison: JSON [Comparação com benchmark]
├── report_file_path: String [Arquivo PDF/HTML gerado]
├── generated_at: DateTime
├── viewed_at: DateTime
├── download_count: Integer (DEFAULT: 0)
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 10. **INVITE** (Convite para Fornecedor)
Convite enviado para avaliação de fornecedores.

```
Invite
├── id: UUID (PK)
├── from_company_id: UUID (FK → Company, NOT NULL) [Empresa que convida]
├── to_company_id: UUID (FK → Company) [Empresa convidada - pode ser NULL]
├── to_email: String (NOT NULL) [Email do destinatário]
├── invite_token: String (UNIQUE, NOT NULL)
├── status: ENUM ['sent', 'accepted', 'rejected', 'expired', 'revoked'] (DEFAULT: 'sent')
├── diagnostic_id: UUID (FK → Diagnostic) [Diagnóstico gerado do convidado]
├── invited_at: DateTime (NOT NULL)
├── accepted_at: DateTime
├── expires_at: DateTime
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 11. **INVITE_PACKAGE** (Pacote de Convites)
Pacotes de convites adquiridos.

```
InvitePackage
├── id: UUID (PK)
├── company_id: UUID (FK → Company, NOT NULL)
├── package_name: String (NOT NULL)
├── package_type: ENUM ['starter', 'professional', 'enterprise'] (DEFAULT: 'starter')
├── quantity: Integer (NOT NULL) [Quantidade de convites]
├── used: Integer (DEFAULT: 0) [Convites já utilizados]
├── remaining: Integer [Convites restantes = quantity - used]
├── unit_price: Decimal
├── total_price: Decimal
├── status: ENUM ['active', 'exhausted', 'expired', 'cancelled'] (DEFAULT: 'active')
├── expires_at: DateTime
├── purchased_at: DateTime
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 12. **SUBSCRIPTION_PLAN** (Plano de Assinatura)
Planos de assinatura para acesso avançado.

```
SubscriptionPlan
├── id: UUID (PK)
├── name: String (NOT NULL, UNIQUE)
├── slug: String (UNIQUE) [Ex: 'pro', 'enterprise']
├── description: String
├── price: Decimal (NOT NULL)
├── billing_cycle: ENUM ['monthly', 'yearly'] (DEFAULT: 'monthly')
├── features: JSON [Array de features desbloqueadas]
├── max_users: Integer [Limite de usuários, -1 para ilimitado]
├── max_diagnostics: Integer [-1 para ilimitado]
├── max_invite_packages: Integer [-1 para ilimitado]
├── full_report_access: Boolean (DEFAULT: false) [Acesso completo ao relatório]
├── benchmark_access: Boolean (DEFAULT: false)
├── priority_support: Boolean (DEFAULT: false)
├── status: ENUM ['active', 'inactive'] (DEFAULT: 'active')
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 13. **SUBSCRIPTION** (Assinatura Ativa)
Assinaturas ativas de empresas.

```
Subscription
├── id: UUID (PK)
├── company_id: UUID (FK → Company, NOT NULL)
├── subscription_plan_id: UUID (FK → SubscriptionPlan, NOT NULL)
├── subscription_number: String (UNIQUE)
├── status: ENUM ['active', 'paused', 'cancelled', 'expired'] (DEFAULT: 'active')
├── started_at: DateTime (NOT NULL)
├── ended_at: DateTime
├── next_billing_date: DateTime
├── auto_renew: Boolean (DEFAULT: true)
├── payment_method_id: UUID (FK → PaymentMethod)
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 14. **PAYMENT** (Pagamento)
Registro de transações de pagamento.

```
Payment
├── id: UUID (PK)
├── company_id: UUID (FK → Company, NOT NULL)
├── payment_reference: String (UNIQUE, NOT NULL)
├── payment_type: ENUM ['diagnostic', 'invite_package', 'subscription'] (NOT NULL)
├── related_id: UUID [ID do diagnóstico, pacote de convites ou assinatura]
├── amount: Decimal (NOT NULL)
├── currency: String (DEFAULT: 'BRL')
├── payment_method: ENUM ['pix', 'credit_card', 'debit_card', 'boleto'] (NOT NULL)
├── status: ENUM ['pending', 'processing', 'completed', 'failed', 'refunded'] (DEFAULT: 'pending')
├── gateway_reference: String [ID da transação no gateway]
├── gateway_response: JSON [Resposta completa do gateway]
├── paid_at: DateTime
├── refunded_at: DateTime
├── refund_reason: String
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 15. **PAYMENT_METHOD** (Método de Pagamento)
Métodos de pagamento salvos.

```
PaymentMethod
├── id: UUID (PK)
├── company_id: UUID (FK → Company, NOT NULL)
├── payment_type: ENUM ['credit_card', 'debit_card', 'pix_key', 'bank_account'] (NOT NULL)
├── is_default: Boolean (DEFAULT: false)
├── masked_value: String [Ex: ****1234, ***@email.com]
├── gateway_token: String (ENCRYPTED) [Token do gateway]
├── status: ENUM ['active', 'inactive', 'expired'] (DEFAULT: 'active')
├── expires_at: DateTime
├── created_at: DateTime (NOT NULL)
├── updated_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

### 16. **AUDIT_LOG** (Log de Auditoria)
Rastreamento de ações importantes.

```
AuditLog
├── id: UUID (PK)
├── user_id: UUID (FK → User)
├── company_id: UUID (FK → Company)
├── entity_type: String [Ex: 'Diagnostic', 'Payment', 'Invite']
├── entity_id: UUID [ID da entidade afetada]
├── action: String [Ex: 'created', 'updated', 'deleted', 'paid']
├── changes: JSON [Antes e depois das alterações]
├── ip_address: String
├── user_agent: String
├── created_at: DateTime (NOT NULL)
└── deleted_at: DateTime (SOFT DELETE)
```

---

## 🔗 Relacionamentos

### Relacionamentos Principal:

```
⭐ COMPANY É O USUÁRIO FINAL DA PLATAFORMA (não há User)

CompanyType (1) ──────> (N) Company [Empresa do tipo Agro, Civil, Tech, etc]
CompanyType (1) ──────> (1) FormTemplate [Cada tipo tem seu formulário ESG]

Company (1) ──────> (N) CompanyUser [Usuários administrativos da empresa]
Company (1) ──────> (N) Diagnostic [Diagnósticos contratados]
Company (1) ──────> (N) Subscription [Assinaturas ativas]
Company (1) ──────> (N) InvitePackage [Pacotes de convites adquiridos]
Company (1) ──────> (N) Invite [Convites que ENVIA para fornecedores]
Company (1) ──────> (N) Invite [Convites que RECEBE de clientes (invertido)]
Company (1) ──────> (N) Payment [Pagamentos da empresa]
Company (1) ──────> (N) PaymentMethod [Métodos de pagamento salvos]

FormTemplate (1) ──────> (N) Diagnostic [Diagnóstico usa formulário do tipo da empresa]
FormTemplate (1) ──────> (N) DiagnosticResponse [Respostas são para perguntas do formulário]

Diagnostic (1) ──────> (N) DiagnosticResponse [Todas as respostas da empresa]
Diagnostic (1) ──────> (1) DiagnosticScore [Pontuação única por diagnóstico]
Diagnostic (1) ──────> (1) DiagnosticReport [Relatório único por diagnóstico]
Diagnostic (1) ──────> (N) Evidence [Documentos enviados como prova]
Diagnostic (1) ──────> (N) Invite [Convites gerados a partir deste diagnóstico]

DiagnosticResponse (1) ──────> (N) Evidence [Evidências ligadas a uma resposta específica]

DiagnosticScore (1) ──────> (1) DiagnosticReport [Score alimenta o relatório]

SubscriptionPlan (1) ──────> (N) Subscription [Plano oferecido]
Subscription (1) ──────> (N) Payment [Pagamentos da assinatura]

InvitePackage (1) ──────> (N) Invite [Convites saem de um pacote]

PaymentMethod (1) ──────> (N) Payment [Método de pagamento usado]

CompanyUser (1) ──────> (N) CompanyUser [Um admin pode criar outro admin]
```

---

## 📊 Diagrama Entidade-Relacionamento

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PLATAFORMA ESG - DER (ATUALIZADO)                    │
│         ⭐ COMPANY É O USUÁRIO PRINCIPAL (Autenticável)                │
└─────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────┐
                         │ COMPANY_TYPE     │
                         ├──────────────────┤
                         │ id (PK)          │
                         │ name (AGRO,      │
                         │ CIVIL, TECH...)  │
                         │ slug             │
                         │ icon_url         │
                         │ form_template_id │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┼────────────────┐
                    │             │                │
                    ▼             ▼                ▼
         ┌──────────────────┐ ┌──────────────────┐
         │ COMPANY (User)   │ │ FORM_TEMPLATE    │
         ├──────────────────┤ ├──────────────────┤
         │ id (PK)          │ │ id (PK)          │
         │ cnpj (LOGIN)     │ │ name             │
         │ password_hash    │ │ company_type_id  │
         │ legal_name       │ │ version          │
         │ company_type_id  │ │ axes (JSON)      │
         │ contact_email    │ │ total_questions  │
         │ invite_balance   │ │ is_active        │
         │ subscription_id  │ └────────┬─────────┘
         │ status           │          │
         └────────┬─────────┘          │
                  │                    │
         ┌────────┼────────┐           │
         │        │        │           │
         ▼        ▼        ▼           ▼
    ┌──────────────────┐ ┌──────────────────────┐
    │ COMPANY_USER     │ │   DIAGNOSTIC         │
    ├──────────────────┤ ├──────────────────────┤
    │ id (PK)          │ │ id (PK)              │
    │ company_id (FK)  │ │ company_id (FK)      │
    │ email            │ │ form_template_id (FK)│
    │ password_hash    │ │ contract_number      │
    │ full_name        │ │ status               │
    │ role (admin/     │ │ price                │
    │  auditor/viewer) │ │ paid_at              │
    │ status           │ │ percentage_complete  │
    └──────────────────┘ └────────┬─────────────┘
                                  │
                    ┌─────────────┼────────────────┐
                    │             │                │
                    ▼             ▼                ▼
         ┌──────────────────┐ ┌──────────────────────┐ ┌──────────────────┐
         │ DIAGNOSTIC_      │ │ DIAGNOSTIC_RESPONSE  │ │ DIAGNOSTIC_      │
         │   SCORE          │ ├──────────────────────┤ │   REPORT         │
         ├──────────────────┤ │ id (PK)              │ ├──────────────────┤
         │ id (PK)          │ │ diagnostic_id (FK)   │ │ id (PK)          │
         │ diagnostic_id(FK)│ │ question_number      │ │ diagnostic_id(FK)│
         │ overall_score    │ │ axis (ENV/SOC/GOV)   │ │ score_id         │
         │ env_score        │ │ question_text        │ │ title            │
         │ social_score     │ │ answer               │ │ executive_       │
         │ gov_score        │ │ score (auto)         │ │   summary        │
         │ maturity_level   │ │ weight               │ │ detailed_        │
         │ strengths (JSON) │ │ evidence_ids[]       │ │   analysis       │
         │ opportunities    │ │ answered_at          │ │ recommendations  │
         └──────────────────┘ └────────┬─────────────┘ └──────────────────┘
                                       │
                                       ▼
                              ┌──────────────────────┐
                              │   EVIDENCE/DOCS      │
                              ├──────────────────────┤
                              │ id (PK)              │
                              │ response_id (FK)     │
                              │ diagnostic_id (FK)   │
                              │ file_name            │
                              │ file_path (Cloud)    │
                              │ file_size            │
                              │ upload_status        │
                              │ verification_status  │
                              └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  FORNECEDORES & CONVITES                            │
└─────────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────┐      ┌──────────────────────┐
         │      INVITE              │      │  INVITE_PACKAGE      │
         ├──────────────────────────┤      ├──────────────────────┤
         │ id (PK)                  │      │ id (PK)              │
         │ from_company_id (FK)     │      │ company_id (FK)      │
         │ to_company_id (FK)       │      │ package_name         │
         │ to_email                 │      │ package_type         │
         │ invite_token             │◄─────│ quantity             │
         │ status (sent/accepted)   │      │ used / remaining     │
         │ diagnostic_id (FK)       │      │ status               │
         │ accepted_at              │      │ expires_at           │
         └──────────────────────────┘      └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      MONETIZAÇÃO                                     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐    ┌───────────────────────────┐
│ SUBSCRIPTION_PLAN    │    │    SUBSCRIPTION           │
├──────────────────────┤    ├───────────────────────────┤
│ id (PK)              │◄───│ id (PK)                   │
│ name (PRO, ENTER..)  │    │ company_id (FK)           │
│ slug                 │    │ subscription_plan_id (FK) │
│ price                │    │ subscription_number       │
│ billing_cycle        │    │ status                    │
│ features (JSON)      │    │ started_at                │
│ max_users            │    │ ended_at                  │
│ full_report_access   │    │ next_billing_date         │
│ benchmark_access     │    │ auto_renew                │
└──────────────────────┘    └────────┬──────────────────┘
                                     │
                    ┌────────────────┼──────────────────┐
                    │                │                  │
                    ▼                ▼                  ▼
         ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
         │    PAYMENT       │ │ PAYMENT_METHOD   │ │   AUDIT_LOG      │
         ├──────────────────┤ ├──────────────────┤ ├──────────────────┤
         │ id (PK)          │ │ id (PK)          │ │ id (PK)          │
         │ company_id (FK)  │ │ company_id (FK)  │ │ company_id (FK)  │
         │ payment_ref      │ │ payment_type     │ │ company_user_id  │
         │ payment_type     │ │ masked_value     │ │ entity_type      │
         │ amount           │ │ gateway_token    │ │ entity_id        │
         │ payment_method   │ │ status           │ │ action           │
         │ status           │ │ expires_at       │ │ changes (JSON)   │
         │ gateway_ref      │ └──────────────────┘ │ ip_address       │
         │ paid_at          │                      │ created_at       │
         └──────────────────┘                      └──────────────────┘
```

---

## 🗄️ Schema do Banco de Dados

### Tabelas e Índices Essenciais

```sql
-- ============================================
-- TABELA: company_types (SEGMENTOS)
-- ============================================
CREATE TABLE company_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    icon_url TEXT,
    form_template_id UUID,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_company_types_name ON company_types(name);
CREATE INDEX idx_company_types_slug ON company_types(slug);
CREATE INDEX idx_company_types_status ON company_types(status);

-- ============================================
-- TABELA: companies (USUÁRIO PRINCIPAL)
-- ✅ AUTENTICAÇÃO: CNPJ + password_hash
-- ============================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    company_type_id UUID NOT NULL REFERENCES company_types(id),
    industry_segment VARCHAR(255),
    size VARCHAR(50),
    website VARCHAR(255),
    phone VARCHAR(20),
    contact_email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'BR',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    subscription_plan_id UUID,
    subscription_started_at TIMESTAMP,
    subscription_ended_at TIMESTAMP,
    invite_balance INTEGER DEFAULT 0,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_companies_cnpj ON companies(cnpj);
CREATE INDEX idx_companies_company_type_id ON companies(company_type_id);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_subscription_plan_id ON companies(subscription_plan_id);
CREATE INDEX idx_companies_email_verified ON companies(email_verified);

-- ============================================
-- TABELA: company_users (Usuários internos da empresa)
-- ============================================
CREATE TABLE company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'viewer',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    last_login_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    created_by_company_user_id UUID REFERENCES company_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT unique_email_per_company UNIQUE(company_id, email)
);

CREATE INDEX idx_company_users_company_id ON company_users(company_id);
CREATE INDEX idx_company_users_email ON company_users(email);
CREATE INDEX idx_company_users_role ON company_users(role);
CREATE INDEX idx_company_users_status ON company_users(status);

-- ============================================
-- TABELA: form_templates (POR TIPO/SEGMENTO)
-- ✅ Agro, Civil, Tech, etc tem formulários diferentes
-- ============================================
CREATE TABLE form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company_type_id UUID NOT NULL REFERENCES company_types(id),
    version INTEGER DEFAULT 1,
    description TEXT,
    axes JSONB NOT NULL,
    total_questions INTEGER,
    estimated_completion_time INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT unique_template_per_type UNIQUE(company_type_id, version)
);

CREATE INDEX idx_form_templates_company_type_id ON form_templates(company_type_id);
CREATE INDEX idx_form_templates_is_active ON form_templates(is_active);
CREATE INDEX idx_form_templates_version ON form_templates(company_type_id, version);

-- ============================================
-- TABELA: diagnostics
-- ============================================
CREATE TABLE diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    form_template_id UUID NOT NULL REFERENCES form_templates(id),
    contract_number VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending_payment',
    price DECIMAL(12, 2) NOT NULL,
    paid_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    percentage_completion INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_diagnostics_company_id ON diagnostics(company_id);
CREATE INDEX idx_diagnostics_status ON diagnostics(status);
CREATE INDEX idx_diagnostics_contract_number ON diagnostics(contract_number);

-- ============================================
-- TABELA: diagnostic_responses (RESPOSTAS DO FORMULÁRIO)
-- ============================================
CREATE TABLE diagnostic_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_id UUID NOT NULL REFERENCES diagnostics(id),
    form_template_id UUID NOT NULL REFERENCES form_templates(id),
    question_number INTEGER NOT NULL,
    axis VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50),
    answer TEXT,
    answer_json JSONB,
    score INTEGER,
    weight INTEGER,
    evidence_ids UUID[] DEFAULT ARRAY[]::UUID[],
    comment TEXT,
    auto_calculated_score BOOLEAN DEFAULT FALSE,
    answered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT unique_response_per_question UNIQUE(diagnostic_id, question_number)
);

CREATE INDEX idx_diagnostic_responses_diagnostic_id ON diagnostic_responses(diagnostic_id);
CREATE INDEX idx_diagnostic_responses_axis ON diagnostic_responses(axis);
CREATE INDEX idx_diagnostic_responses_answered_at ON diagnostic_responses(answered_at);

-- ============================================
-- TABELA: evidences
-- ============================================
CREATE TABLE evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_response_id UUID REFERENCES diagnostic_responses(id),
    diagnostic_id UUID NOT NULL REFERENCES diagnostics(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    file_url TEXT,
    upload_status VARCHAR(50) DEFAULT 'pending',
    description TEXT,
    verification_status VARCHAR(50) DEFAULT 'pending',
    uploaded_at TIMESTAMP,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_evidences_diagnostic_id ON evidences(diagnostic_id);
CREATE INDEX idx_evidences_diagnostic_response_id ON evidences(diagnostic_response_id);
CREATE INDEX idx_evidences_upload_status ON evidences(upload_status);

-- ============================================
-- TABELA: diagnostic_scores
-- ============================================
CREATE TABLE diagnostic_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_id UUID NOT NULL UNIQUE REFERENCES diagnostics(id),
    overall_score DECIMAL(5, 2) NOT NULL,
    environmental_score DECIMAL(5, 2),
    social_score DECIMAL(5, 2),
    governance_score DECIMAL(5, 2),
    maturity_level VARCHAR(50),
    strengths JSONB DEFAULT '[]'::JSONB,
    opportunities JSONB DEFAULT '[]'::JSONB,
    calculation_method TEXT,
    calculated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_diagnostic_scores_diagnostic_id ON diagnostic_scores(diagnostic_id);

-- ============================================
-- TABELA: diagnostic_reports
-- ============================================
CREATE TABLE diagnostic_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_id UUID NOT NULL UNIQUE REFERENCES diagnostics(id),
    diagnostic_score_id UUID REFERENCES diagnostic_scores(id),
    report_title VARCHAR(255) NOT NULL,
    executive_summary TEXT,
    detailed_analysis TEXT,
    recommendations JSONB DEFAULT '[]'::JSONB,
    benchmark_comparison JSONB,
    report_file_path TEXT,
    generated_at TIMESTAMP,
    viewed_at TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_diagnostic_reports_diagnostic_id ON diagnostic_reports(diagnostic_id);

-- ============================================
-- TABELA: invites
-- ============================================
CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_company_id UUID NOT NULL REFERENCES companies(id),
    to_company_id UUID REFERENCES companies(id),
    to_email VARCHAR(255) NOT NULL,
    invite_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'sent',
    diagnostic_id UUID REFERENCES diagnostics(id),
    invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_invites_from_company_id ON invites(from_company_id);
CREATE INDEX idx_invites_to_company_id ON invites(to_company_id);
CREATE INDEX idx_invites_invite_token ON invites(invite_token);
CREATE INDEX idx_invites_status ON invites(status);

-- ============================================
-- TABELA: invite_packages
-- ============================================
CREATE TABLE invite_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(50) DEFAULT 'starter',
    quantity INTEGER NOT NULL,
    used INTEGER DEFAULT 0,
    remaining INTEGER GENERATED ALWAYS AS (quantity - used) STORED,
    unit_price DECIMAL(12, 2),
    total_price DECIMAL(12, 2),
    status VARCHAR(50) DEFAULT 'active',
    expires_at TIMESTAMP,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_invite_packages_company_id ON invite_packages(company_id);
CREATE INDEX idx_invite_packages_status ON invite_packages(status);

-- ============================================
-- TABELA: subscription_plans
-- ============================================
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    billing_cycle VARCHAR(50) DEFAULT 'monthly',
    features JSONB DEFAULT '[]'::JSONB,
    max_users INTEGER DEFAULT -1,
    max_diagnostics INTEGER DEFAULT -1,
    max_invite_packages INTEGER DEFAULT -1,
    full_report_access BOOLEAN DEFAULT FALSE,
    benchmark_access BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_subscription_plans_status ON subscription_plans(status);

-- ============================================
-- TABELA: subscriptions
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    subscription_number VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    next_billing_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- TABELA: payment_methods
-- ============================================
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    payment_type VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    masked_value VARCHAR(255),
    gateway_token TEXT,
    status VARCHAR(50) DEFAULT 'active',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_payment_methods_company_id ON payment_methods(company_id);

-- ============================================
-- TABELA: payments
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    payment_reference VARCHAR(255) UNIQUE NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    related_id UUID,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BRL',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    gateway_reference VARCHAR(255),
    gateway_response JSONB,
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_payments_payment_reference ON payments(payment_reference);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- TABELA: audit_logs (RASTREAMENTO)
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_user_id UUID REFERENCES company_users(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    entity_type VARCHAR(100),
    entity_id UUID,
    action VARCHAR(100),
    changes JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_audit_logs_company_user_id ON audit_logs(company_user_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- FOREIGN KEYS ADICIONAIS
-- ============================================
ALTER TABLE companies ADD CONSTRAINT fk_companies_subscription_plan_id 
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id);

ALTER TABLE form_templates ADD CONSTRAINT fk_form_templates_company_type_id 
    FOREIGN KEY (company_type_id) REFERENCES company_types(id);

ALTER TABLE diagnostic_responses ADD CONSTRAINT fk_diagnostic_responses_diagnostic_id 
    FOREIGN KEY (diagnostic_id) REFERENCES diagnostics(id);

ALTER TABLE diagnostic_responses ADD CONSTRAINT fk_diagnostic_responses_form_template_id 
    FOREIGN KEY (form_template_id) REFERENCES form_templates(id);

ALTER TABLE subscriptions ADD CONSTRAINT fk_subscriptions_payment_method_id 
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id);
    
ALTER TABLE company_types ADD CONSTRAINT fk_company_types_form_template_id 
    FOREIGN KEY (form_template_id) REFERENCES form_templates(id);
```

---

## 🏛️ Arquitetura do Sistema

### Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Frontend (Web) | Dashboard Admin | Mobile App (Futuro)     │   │
│  │  - React.js / Vue.js / Next.js                              │   │
│  │  - TypeScript                                                │   │
│  │  - State Management (Redux/Zustand)                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ API REST/GraphQL
┌─────────────────────────────────────────────────────────────────────┐
│                      CAMADA DE API (Backend)                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  API Gateway / Load Balancer                                 │   │
│  │  - Validação de requisições                                 │   │
│  │  - Rate limiting                                             │   │
│  │  - CORS / Segurança                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Rotas e Controllers                                          │   │
│  │  - AuthController (login empresa, registro, recuperação)   │   │
│  │  - CompanyController (CRUD empresa - usuário principal)     │   │
│  │  - CompanyUserController (gerenciar usuários da empresa)    │   │
│  │  - DiagnosticController (CRUD diagnóstico)                  │   │
│  │  - PaymentController (processamento de pagamentos)          │   │
│  │  - ReportController (geração de relatórios)                 │   │
│  │  - InviteController (gerenciamento de convites)             │   │
│  │  - SubscriptionController (assinatura)                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     CAMADA DE NEGÓCIOS (Services)                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Services de Domínio                                          │   │
│  │  - AuthService (autenticação e autorização)                 │   │
│  │  - DiagnosticService (lógica de diagnóstico)                │   │
│  │  - ScoringService (cálculo de pontuações)                   │   │
│  │  - ReportGenerationService (geração de relatórios)         │   │
│  │  - PaymentService (processamento de pagamentos)             │   │
│  │  - SubscriptionService (gerenciamento de assinaturas)      │   │
│  │  - InviteService (envio e controle de convites)             │   │
│  │  - NotificationService (envio de emails)                    │   │
│  │  - StorageService (gerenciamento de arquivos)              │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   CAMADA DE PERSISTÊNCIA (Repositories)              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Repositories (ORM ou Query Builder)                         │   │
│  │  - CompanyRepository (autenticação e CRUD)                  │   │
│  │  - CompanyUserRepository (usuários internos)                 │   │
│  │  - FormTemplateRepository (templates por segmento)          │   │
│  │  - DiagnosticRepository                                       │   │
│  │  - DiagnosticResponseRepository                               │   │
│  │  - DiagnosticScoreRepository                                  │   │
│  │  - PaymentRepository                                          │   │
│  │  - SubscriptionRepository                                     │   │
│  │  - InviteRepository                                           │   │
│  │  - EvidenceRepository                                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      CAMADA DE DADOS                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                          │   │
│  │  - Tabelas normalizadas                                      │   │
│  │  - Índices otimizados                                        │   │
│  │  - Triggers para auditoria                                   │   │
│  │  - Full-text search                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Cache (Redis)                                                │   │
│  │  - Sessões de usuários                                       │   │
│  │  - Cache de relatórios                                       │   │
│  │  - Cache de scores                                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Cloud Storage (S3/GCS)                                       │   │
│  │  - Armazenamento de evidências                               │   │
│  │  - PDFs de relatórios                                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Integrações Externas

```
┌─────────────────────────────────────────────────────────────────┐
│                   SERVIÇOS EXTERNOS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐      ┌─────────────────────────────┐ │
│  │ Payment Gateway      │      │ Email Service               │ │
│  │ - Stripe/PagSeguro   │      │ - SendGrid / AWS SES        │ │
│  │ - Integração PIX     │      │ - Envio de emails           │ │
│  │ - Boleto             │      │ - Templates                 │ │
│  └──────────────────────┘      └─────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────┐      ┌─────────────────────────────┐ │
│  │ SMS/Notificações     │      │ Analytics                   │ │
│  │ - Twilio             │      │ - Google Analytics          │ │
│  │ - OTP                │      │ - Mixpanel / Amplitude      │ │
│  └──────────────────────┘      └─────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────┐      ┌─────────────────────────────┐ │
│  │ Cloud Services       │      │ Logging & Monitoring        │ │
│  │ - AWS/GCP/Azure      │      │ - Datadog / New Relic       │ │
│  │ - File Storage (S3)  │      │ - Sentry (Error tracking)   │ │
│  └──────────────────────┘      └─────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxos de Dados Principais

### 1. Fluxo de Contratação de Diagnóstico

```
┌─────────────┐
│  Empresa    │
│   Acessa    │
│ Plataforma  │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ Seleciona Diagnóstico│
│ (FormTemplate)       │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Cria Diagnostic             │
│ status = pending_payment     │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Redirecionado para   │
│ Payment Gateway      │
└──────┬───────────────┘
       │
       ▼
┌────────────────────────────┐
│ Processa Payment           │
│ (PIX, Cartão, Boleto)      │
└──────┬─────────────────────┘
       │
       ├─ SUCESSO ──┐
       │            │
       ▼            ▼
   ┌─────────┐  ┌──────────────┐
   │ Payment │  │ Diagnostic   │
   │ stored  │  │ status =     │
   │ BDD     │  │ active       │
   └─────────┘  └──────────────┘
                     │
                     ▼
            ┌────────────────────┐
            │ Empresa começa     │
            │ a responder ao     │
            │ diagnóstico        │
            └────────────────────┘
```

### 2. Fluxo de Resposta do Diagnóstico

```
┌──────────────────┐
│ Empresa Responde │
│ Questionário ESG │
└──────┬───────────┘
       │
       ├─ Para cada resposta ─┐
       │                      │
       ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│ Cria             │  │ Pode enviar      │
│ DiagnosticResponse   │ Evidence (docs)  │
└──────┬───────────┘  └──────┬───────────┘
       │                     │
       │                ┌────▼──────┐
       │                │ Upload    │
       │                │ Arquivo   │
       │                └────┬──────┘
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Salva Resposta  │
         │ e Evidências    │
         │ (BDD + Storage) │
         └────────┬────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Atualiza         │
         │ percentage_      │
         │ completion       │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Todas respostas? │
         └────────┬─────────┘
                  │
          ┌───────┴────────┐
          │                │
       SIM                 NÃO
          │                │
          ▼                ▼
    ┌─────────────┐  [Continua respondendo]
    │ Calcula     │
    │ Scores      │
    │ (ScoringService)
    └──────┬──────┘
           │
           ▼
      ┌──────────────────┐
      │ Cria             │
      │ DiagnosticScore  │
      └──────┬───────────┘
             │
             ▼
      ┌──────────────────┐
      │ Gera             │
      │ DiagnosticReport │
      └──────┬───────────┘
             │
             ▼
      ┌──────────────────┐
      │ Diagnostic       │
      │ status =         │
      │ completed        │
      └──────────────────┘
```

### 3. Fluxo de Monetização (Pacote de Convites)

```
┌────────────────────────┐
│ Empresa quer convidar  │
│ fornecedores           │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────┐
│ Compra pacote de   │
│ convites           │
└──────┬─────────────┘
       │
       ▼
┌──────────────────────────┐
│ Cria InvitePackage       │
│ (quantity, price)        │
└──────┬───────────────────┘
       │
       ▼
┌────────────────────┐
│ Processa pagamento │
│ do pacote          │
└──────┬─────────────┘
       │
       ├─ SUCESSO ──┐
       │            │
       ▼            ▼
   ┌─────────┐  ┌──────────────────┐
   │ Payment │  │ InvitePackage    │
   │ stored  │  │ status = active   │
   │ BDD     │  │ balance atualizado│
   └─────────┘  └──────────────────┘
                     │
                     ▼
            ┌────────────────────┐
            │ Empresa envia      │
            │ convites           │
            │ para fornecedores  │
            └────────┬───────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌────────┐  ┌──────────┐
   │ Cria   │  │ Reduz  │  │ Envia    │
   │ Invite │  │ usado  │  │ Email    │
   │ record │  │ (used) │  │ com link │
   └────────┘  └────────┘  └──────────┘
        │
        ▼
   ┌────────────────┐
   │ Fornecedor     │
   │ clica no link  │
   │ (Invite token) │
   └────┬───────────┘
        │
        ├─ Já tem conta?
        │  │
        │  ├─ SIM: Login
        │  │
        │  └─ NÃO: Registra nova empresa
        │
        ▼
   ┌────────────────────┐
   │ Começa Diagnóstico │
   │ (com company_id    │
   │ preenchido)        │
   └────────────────────┘
```

### 4. Fluxo de Assinatura

```
┌──────────────────────┐
│ Empresa faz upgrade  │
│ para plano pago      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Seleciona            │
│ SubscriptionPlan     │
└──────┬───────────────┘
       │
       ▼
┌────────────────────┐
│ Processa pagamento │
└──────┬─────────────┘
       │
       ├─ SUCESSO ──┐
       │            │
       ▼            ▼
   ┌─────────┐  ┌───────────────────────┐
   │ Payment │  │ Cria Subscription     │
   │ stored  │  │ status = active       │
   │ BDD     │  │ Atualiza subscription │
   │         │  │ _plan_id em Company   │
   └─────────┘  └───────────┬───────────┘
                            │
                            ▼
                   ┌────────────────────┐
                   │ Desbloqueia         │
                   │ funcionalidades     │
                   │ (Full report access)│
                   │ (Benchmark access)  │
                   └────────────────────┘
```

---

## 📋 Resumo da Arquitetura

### Stack Tecnológico Recomendado

**Backend:**
- Node.js / TypeScript ou Python / FastAPI
- Express.js / NestJS para API
- PostgreSQL para banco de dados
- Redis para cache
- AWS S3 / Google Cloud Storage

**Frontend:**
- React.js / Next.js
- TypeScript
- Tailwind CSS / Material UI
- Redux / Zustand para state management

**Infraestrutura:**
- Docker e Docker Compose
- Kubernetes (para produção)
- CI/CD: GitHub Actions / GitLab CI
- Monitoring: Datadog / New Relic
- Logging: ELK Stack / Cloudwatch

### Segurança

- ✅ Autenticação: JWT + Refresh Tokens
- ✅ Autorização: RBAC (Role-Based Access Control)
- ✅ Criptografia: bcrypt para senhas, HTTPS
- ✅ Validação: Input validation em todas as rotas
- ✅ Rate limiting para APIs
- ✅ Soft deletes para integridade de dados
- ✅ Audit logs para rastreamento

### Performance

- ✅ Índices no banco de dados
- ✅ Pagination em listagens
- ✅ Cache de relatórios
- ✅ Lazy loading de evidências
- ✅ Compressão de respostas (gzip)
- ✅ CDN para assets estáticos

---

## 🎯 Próximos Passos

1. **Definir tecnologias específicas**: Node.js + Express vs NestJS
2. **Criar modelos ORM**: Sequelize, TypeORM ou Prisma
3. **Implementar migrations do banco de dados**
4. **Desenvolver camada de serviços de domínio**
5. **Implementar gateway de pagamento**
6. **Criar frontend com componentes reutilizáveis**
7. **Implementar sistema de autenticação**
8. **Testes unitários e de integração**
9. **Deploy e devops**

---

**Documento criado em 17/04/2026**
