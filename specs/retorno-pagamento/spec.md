# Retorno seguro de pagamento
AC-001: retorno real leva à tela de resultado com identificação do pedido; parâmetro de retorno não confirma pagamento.
AC-002: API autenticada fornece somente pedido da organização do usuário e status, produtos, valor contratado e datas reais; inexistente ou outra organização não expõe dados. Não exibir ID/método fabricados como reais.
AC-003: tela mostra aprovado apenas para pedido PAID confirmado pelo backend; pendente, falho, ausente, erro e confirmação em processamento têm mensagens adequadas e botão dashboard.
AC-004: sem ativação via localStorage, sem ciclo de atualizações; acompanhar status pendente por polling limitado e atualizar acesso somente após PAID.
AC-005: preservar compra, parâmetros pertinentes e fluxo de convite, com regressões de autorização e estados verificados.
