# Especificação: Serviço 2, Pacote 2 e Plano 2.2

## Objetivo
Alinhar nomes, identificação e vínculos do catálogo ao Serviço 2 e ao seu pacote com consultoria; preparar o Plano 2.2 como oferta distinta. Esta especificação é um plano, não uma alteração de produção.

## Ofertas e contratos

| Identificação visível | Nome | Código técnico proposto | Preço | Modalidade |
|---|---|---|---:|---|
| Serviço 2 | Diagnóstico Estratégico ESG | FULL_DIAGNOSTIC | R$ 7.950,00 | compra avulsa |
| Pacote 2 | Diagnóstico Estratégico ESG + Consultoria | FULL_DIAGNOSTIC_PLUS | R$ 8.750,00 | compra avulsa, Serviço 2 mais duas consultorias de 1h |
| Plano 2.2 | Bioimpacto Empresarial | BIOIMPACTO_EMPRESARIAL (proposta) | sob orçamento, valor a definir | assinatura por 12 meses |

O cliente escolhe o Serviço 2 no card existente e pode adicionar consultoria no detalhe: desmarcado compra FULL_DIAGNOSTIC; marcado compra FULL_DIAGNOSTIC_PLUS como um único produto. O adicional custa R$ 800,00. O Serviço 2 inclui questionário, envio de evidências em até 20 dias, análise e relatório verificado; o prazo informado é 90 dias a partir da contratação. O Plano 2.2 inclui Serviço 2 e acompanhamento por um ano, gestão de evidências, análise de risco e propostas de melhoria. A documentação anterior menciona 12 reuniões mensais e relatório final; confirmar esses entregáveis comerciais antes de disponibilizar a oferta.

## Estado mapeado
- Em consulta anterior ao banco, FULL_DIAGNOSTIC não constava; full-diagnostic estava ativo sem preço. FULL_DIAGNOSTIC_PLUS estava ativo por R$ 8.750; diag-consultoria também estava ativo sem preço. Uma migração local prevê os dois códigos canônicos e seus preços, mas sua existência não demonstra que foi aplicada ao banco consultado.
- Upgrade já alterna os códigos no checkout com o adicional. Há outro card legado de diagnóstico + consultoria com orçamento e nomes/preços divergentes. Resultados possui entrada adicional para o mesmo fluxo.
- O backend usa os códigos em checkout, diagnóstico, evidências, contexto de acesso e consultorias; admin limita o pacote a duas sessões. O frontend atualmente inclui FULL_DIAGNOSTIC na lista de acesso a consultoria, divergência a corrigir e verificar conforme as regras de negócio.
- CORPORATE_PLAN é genérico; assessoria-completa tem regras próprias de cadeia. Nenhum foi confirmado como Bioimpacto Empresarial. Não reaproveitar automaticamente esses registros.

## Critérios de aceite
- **AC-001:** catálogo contém os dois produtos canônicos ativos, nomes, descrições e preços da tabela, sem alterar preço histórico de pedidos; mapear referências dos legados antes de consolidar ou desativar.
- **AC-002:** card e modal exibem Serviço 2, preço e adicional de R$ 800; checkout envia o produto correto e mostra o nome e total correspondentes, inclusive retorno de pagamento e Meus Serviços.
- **AC-003:** ambos concedem acesso ao diagnóstico estratégico e evidências; Serviço 2 não concede as duas consultorias do pacote; Pacote 2 concede duas sessões. Verificar acesso isolado à consultoria avulsa e regras existentes de diagnóstico.
- **AC-004:** admin financeiro, clientes, orçamentos e agenda distinguem nomes e produtos; históricos e pedidos pendentes continuam coerentes.
- **AC-005:** Plano 2.2 é especificado como produto separado anual; sua contratação e acesso contínuo ficam condicionados à definição comercial e à implementação própria. Não conceder acesso por simples renomeação de CORPORATE_PLAN.
- **AC-006:** tags Serviço 2, Pacote 2 e Plano 2.2 aparecem nos pontos relevantes quando cada oferta for apresentada; códigos técnicos permanecem estáveis.
- **AC-007:** migração reproduzível e idempotente, reconciliação documentada e verificação de banco, checkout, acessos e admin; sem excluir registros históricos automaticamente.

## Decisões pendentes
Preço, cobrança/renovação, entrega e ativação do Plano 2.2; confirmação das 12 reuniões mensais e do relatório final; decisão comercial sobre manter card legado de orçamento ou consolidá-lo no card com adicional. O plano não presume implementação completa de SaaS por cadastrar produto.
