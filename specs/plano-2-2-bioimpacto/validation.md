# Validação

AC-001: migration aplicada ao banco configurado; consulta Prisma confirmou produto ativo, assinatura YEAR e preço-base de R$ 38.000.

AC-002–004/006: implementação local do cálculo, checkout, acesso e janela mensal. Backend: 38 testes passaram; compilação TypeScript de backend e frontend passou após os ajustes. O preço mostrado vem do mesmo cálculo do backend usado na cobrança. Compra real pelo Mercado Pago ainda não foi executada.

AC-005: admin já dispõe de aprovação, rejeição e observações para evidências; agenda de sete reuniões e geração de sete relatórios ainda precisam de implementação específica. QA independente apontou essa lacuna. A revisão apontou também uma mensagem errada no bloqueio transacional da janela; a mensagem foi corrigida e os testes passaram novamente.
