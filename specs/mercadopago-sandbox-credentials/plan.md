# Mercado Pago sandbox credentials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Select Mercado Pago access/public keys and webhook signing secret from the active environment flag.

**Architecture:** Resolve the active credentials and webhook secret once in backend env configuration. Existing Mercado Pago consumers and webhook validation continue using resolved values.

**Tech Stack:** TypeScript, Node.js environment configuration.

**Spec:** `specs/mercadopago-sandbox-credentials/spec.md`

## Global Constraints
- Never log or expose credential values.
- Keep current production variable names and add dedicated `_SANDBOX` variants.
- `MERCADOPAGO_SANDBOX` is the sole mode selector.

## Review Focus
- Missing credential in selected mode must fail clearly without requiring keys from the other mode.
- Sandbox token prefixes may be `APP_USR`; do not infer environment from prefix.
- Production mode must not accidentally use sandbox keys.
- Webhook HMAC verification must use the secret for the selected mode.
- Both preference creation and payment lookup must use the same selected access token.
- Do not change existing unrelated modifications in `env.ts`.

---

### Task 1: Resolve Mercado Pago credentials by mode

**Files:**
- Modify: `backend/src/config/env.ts`
- Modify: `backend/.env.example`

**Interfaces:**
- Existing consumers continue reading `env.mercadoPagoAccessToken`, `env.mercadoPagoPublicKey`, and `env.mercadoPagoSandbox`.

- [ ] Choose access token, public key, and webhook secret variable names from `MERCADOPAGO_SANDBOX` before constructing exported `env`.
- [ ] Keep production names unchanged; document sandbox keys and webhook secret in `.env.example` with placeholders only.
- [ ] Verify typecheck/build command from `backend/package.json`; do not add or run tests unless requested.
