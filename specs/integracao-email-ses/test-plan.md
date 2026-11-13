# Plano de testes

| Cenário | Critério | Resultado esperado |
|---|---|---|
| Cadastro concluído; login automático falha | AC-001 | Uma intenção persistida para o usuário; login não apaga intenção. |
| Falha Supabase ou transação local | AC-001 | Nenhuma intenção persistida; compensação existente preservada. |
| Salvar parcial, respostas incompletas ou sem declaração | AC-002 | Nenhuma intenção de conclusão. |
| Finalizar diagnóstico válido, repetir e executar solicitações concorrentes | AC-002 | Score/status e exatamente uma intenção por diagnóstico; novo diagnóstico gera outra. |
| Renderizar dois tipos com caracteres especiais | AC-003 | HTML escapado, texto puro e links corretos; estratégico não promete relatório pronto. |
| SES simulado com remetente/região/credenciais configurados | AC-004 | Mensagem correta e ID de aceitação; nenhuma credencial exposta. |
| Configuração desativada ou inválida | AC-004/007 | Sem envio externo inadvertido; erro observável quando habilitada incorretamente. |
| Duas instâncias do worker e lease expirada | AC-005 | Uma reivindicação ativa; recuperação após expiração. |
| SES indisponível, erro permanente, falha após aceitação | AC-005/007 | Retry limitado ou falha visível; negócio permanece concluído; janela de duplicação é documentada. |
| Testes locais e sandbox | AC-006/007 | Local usa falso; sandbox usa somente identidades verificadas e registra evidência de aceitação e, se disponível, entrega. |
