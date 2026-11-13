# Plano de QA independente

## Escopo
Validar as correções de exibição/proteção de diagnóstico concluído e responsividade tablet, conforme AC-004 e AC-005 e achados BUG-001/BUG-002. Não alterar dados da conta Bioimpacto concluída; sem compras.

## Cenários

- QA-001 (AC-004): autenticar na conta Bioimpacto e abrir `/app/diagnostico/preencher` diretamente. Esperado: conteúdo concluído com 75 respostas e sem formulário vazio/editável.
- QA-002 (AC-004/005): submeter salvamento parcial ou tentar salvar resposta para diagnóstico `COMPLETED` em teste unitário/integration isolado. Esperado: rejeição sem alterar respostas. Não enviar mutação à conta Bioimpacto.
- QA-003 (AC-004): verificar a tela e estado das respostas concluídas via GET, antes/depois de tentativas seguras. Esperado: contagem e respostas preservadas.
- QA-004 (AC-002): com diagnóstico `ACTIVE` da conta Estratégica, abrir preenchimento e validar que edição e salvamento parcial continuam disponíveis; preservar sua resposta de teste existente.
- QA-005 (AC-004): em navegador, abrir Diagnóstico nos viewports desktop, 768x1024 e mobile. Esperado: cartões sem recorte; registrar `scrollWidth`, limites dos cartões e screenshot.
- QA-006 (AC-001/005): verificar ausência de POST automático e comportamento de acesso direto/reload.
- QA-007: executar testes focados existentes e checar lint/typecheck/diff; revisar se testes cobrem gravação concorrente com conclusão.

## Evidência
Registrar versão/commit de trabalho, comandos, status HTTP e métodos/rotas observados, screenshots sanitizados, contagem de respostas antes/depois em consultas apenas de leitura e lacunas. Não registrar tokens, cookies ou credenciais.
