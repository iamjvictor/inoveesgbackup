# Plano — janelas do Bioimpacto

Objetivo: alinhar o cálculo de autorização, histórico e interface ao dia de conclusão do diagnóstico.

1. Atualizar cálculo das janelas na autorização de upload e serviço de histórico.
2. Atualizar mensagens e cartões do histórico para usar as datas calculadas pelo backend.
3. Cobrir conclusão no dia 4, fim no dia 19, recorrência, mês curto, timezone e expiração anual.

Arquivos prováveis: `backend/src/modules/evidence/services/evidenceUploadWindow.ts`, `bioimpactoHistory.ts`, seus testes, `frontend/src/features/company-area/views/pages/evidencias/evidences-upload-view.tsx`.
