# Tasks

## Package 1 — Backend environment selection
- **Objective:** Select the sandbox or production Mercado Pago credentials and webhook secret using the explicit mode flag.
- **Acceptance:** AC-001 through AC-005.
- **Files:** `backend/src/config/env.ts`, `backend/.env.example`.
- **Dependencies:** None.
- **Limits:** Preserve existing unrelated edits; never read values from `.env` into output or logs.
- **Verification:** Static review of selected variable names and backend typecheck/build if permitted.
