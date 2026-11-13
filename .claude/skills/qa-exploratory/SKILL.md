---
name: qa-exploratory
description: Matriz de testes exploratórios e regressivos de cadastro, autenticação, compras e permissões.
---

# QA exploratório

Crie matriz cenário → pré-condição → ação → resultado esperado → evidência → estado (PASS/FAIL/BLOCKED). Use somente dados sintéticos exclusivos da rodada.

## Cobertura mínima

- Cadastro: válido, inválido, campos ausentes, e-mail duplicado sintético, senha inválida, caracteres especiais, duplo envio e retorno após erro.
- Login/logout: sucesso, senha incorreta, sessão expirada, acesso após logout e recuperação de conta. Não dispare recuperação para endereços de terceiros; use caixa de teste controlada.
- Navegação e autorização: rotas por tipo de conta, acesso cruzado entre organizações sintéticas, evidências bloqueadas/liberadas conforme produto e resposta sem sessão.
- Compra: produtos disponíveis, preço/quantidade, resumo, redirecionamento, retorno, pendente/rejeitado/aprovado em provedor sandbox, cancelamento e repetição. Sem credenciais TEST- válidas, marque checkout como BLOCKED e continue demais casos.
- Cartão de teste oficial Mercado Pago: aprovado, recusado, pendente, CVV inválido e expirado, conforme dados oficiais atuais acessados sem registrar dados sensíveis. Não invente dados de cartão.
- Webhook: somente destino local ou túnel explicitamente autorizado. Teste assinatura válida/inválida quando suportado, ID inexistente, payload inválido, evento repetido/fora de ordem, atraso e reprocessamento. Use fixture local se a integração externa estiver indisponível.
- Resiliência/UI: reload, voltar, duplo submit, campos vazios, limites e caracteres especiais; acessibilidade básica com labels, foco, erros visíveis e teclado.

Para cada falha, reproduza uma vez sem dano, guarde passos exatos, screenshot, logs e requests sanitizados; classifique crítica/alta/média/baixa e se é bug de produto, ambiente ou limitação do teste. Não corrija produção; encaminhe reprodução ao orquestrador. Não faça carga sem duração, concorrência, taxa e custo máximos definidos.
