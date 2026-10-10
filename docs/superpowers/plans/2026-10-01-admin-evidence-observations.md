# Admin Evidence Observations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let administrators append and review audited, admin-only observations under each evidence file in the admin evidence screen.

**Architecture:** Add a separate `EvidenceNote` Prisma model and migration, then expose admin-only read/create endpoints. Load notes on demand from an expandable section under each evidence row, keeping review status actions and `EvidenceReview` semantics unchanged.

**Tech Stack:** TypeScript, Express, Prisma, PostgreSQL, Next.js/React, Tailwind CSS, lucide-react.

**Spec:** `docs/superpowers/specs/2026-10-01-admin-evidence-observations-design.md`

## Global Constraints

- Only administrators can read or create evidence observations.
- Enable RLS and revoke table privileges from Supabase `anon` and `authenticated` roles; the trusted backend performs authorized operations.
- Each observation belongs to one evidence and records its author and server-generated creation time.
- Observation text is trimmed, required, and limited to 2,000 characters.
- Observations are append-only in this release.
- Creating an observation does not change evidence status, score, or review history.
- Existing approval/rejection comments remain in `EvidenceReview`.
- Load a document's note history when its section expands, not in the initial company summary.

## Review Focus

- A direct request by a non-admin must be rejected; retain `checkAdmin` on both endpoints and avoid exposing notes through company/diagnostic responses.
- Whitespace-only and over-limit content must be rejected; enforce this in the service/controller boundary.
- Repeated submissions and request failures must not create duplicate notes or discard typed content; disable save while pending and preserve input on failure.
- Expanding multiple documents must not display one document's notes under another; key UI state and requests by evidence ID.
- Expanding/collapsing notes must not open the preview or trigger approval/rejection; render independent buttons outside the existing row button.

---

### Task 1: Persist audited evidence observations

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/20261001_01_add_evidence_notes/migration.sql`
- Create: `backend/supabase/migrations/20261001205835_add_evidence_notes.sql`

**Interfaces:**
- Produces Prisma model `EvidenceNote` with `id`, `evidenceId`, `authorUserId`, `content`, and `createdAt`.
- Adds inverse `notes` relation to `Evidence` and `evidenceNotes` relation to `User`.

- [x] Add the model and inverse relations. Use UUID IDs, `Evidence` cascade deletion, `User` restricted deletion, `createdAt @default(now())`, and an index on `[evidenceId, createdAt]`.
- [x] Add matching SQL migrations in Prisma and Supabase migration directories. Define foreign keys with `ON DELETE CASCADE` for evidence and `ON DELETE RESTRICT` for author, create the composite lookup index, enable RLS, and revoke access from `anon` and `authenticated`.
- [x] Review both migration files against the Prisma model so names, nullability, defaults, and referential actions match.

### Task 2: Add admin-only note read and create API

**Files:**
- Modify: `backend/src/routes/admin.routes.ts`
- Modify: `backend/src/modules/admin/controllers/adminController.ts`
- Modify: `backend/src/modules/admin/services/adminService.ts`
- Modify: admin evidence selection in `backend/src/modules/admin/services/adminService.ts` only if required to ensure note relations are excluded from the initial company summary.

**Interfaces:**
- `GET /admin/evidences/:id/notes` returns `{ notes: Array<{ id: string; content: string; authorName: string; createdAt: string }> }`, oldest first.
- `POST /admin/evidences/:id/notes` accepts `{ content: string }` and returns the created note in the same item shape.
- Both controller methods call `checkAdmin`; service derives `authorUserId` from the admin user resolved by Supabase user ID.

- [x] Add controller methods that validate request content (string, trimmed non-empty, maximum 2,000 characters), check admin authorization, and map missing evidence to `404`.
- [x] Add service methods that verify the evidence exists, select `fullName` then `email` as `authorName`, persist the note with server timestamp, and list notes ordered by `createdAt ASC` with stable ID tie-breaking.
- [x] Register `GET` and `POST` routes at `/evidences/:id/notes` after the static evidence routes and alongside the existing preview/review routes.
- [x] Confirm company and diagnostic response selections do not include `EvidenceNote` relations.

### Task 3: Add frontend API types and service calls

**Files:**
- Modify: `frontend/src/features/admin/shared/types.ts`
- Modify: `frontend/src/features/admin/areas/evidences/services/evidences.service.ts`

**Interfaces:**
- Add `AdminEvidenceNote` with `id`, `content`, `authorName`, and `createdAt`.
- Add `getEvidenceNotes(evidenceId): Promise<AdminEvidenceNote[]>`.
- Add `createEvidenceNote(evidenceId, content): Promise<AdminEvidenceNote>`.

- [x] Define the shared note type and typed GET/POST functions using `adminClientFetch` and the endpoints from Task 2.
- [x] Keep note loading out of `getEvidenceBoardModel` so existing board loading does not fetch note histories.

### Task 4: Add expandable notes below each evidence row

**Files:**
- Modify: `frontend/src/features/admin/areas/evidences/views/pages/admin-evidences-view.tsx`

**Interfaces:**
- Consumes `AdminEvidenceNote`, `getEvidenceNotes`, and `createEvidenceNote` from Task 3.
- The row's preview, note toggle, and status display are independent controls.

- [x] Replace the document-wide `<button>` wrapper with a semantic container and separate preview button, note toggle button, and status badge.
- [x] Add a comment icon beside the status. Use `aria-label` and `aria-expanded`; expand one document's note area directly below its row.
- [x] Fetch notes on first expansion and cache them by evidence ID for the current detail view. Show loading, empty, and read-error states.
- [x] Render notes oldest first with content, author, and pt-BR date/time. Add an input limited to 2,000 characters and a save action.
- [x] Disable duplicate save while pending. On success append the returned note and clear the input; on failure preserve the input and show an error.
- [ ] Verify manually that the comment controls do not open the preview, trigger group review, or modify evidence status, and that collapsing/reopening retains the loaded note history.

## Execution Notes

- Apply the Prisma migration and regenerate the Prisma client before building the API changes.
- This plan does not include automated test additions or test execution. Keep implementation review focused on the API contract, authorization, migration parity, and UI interactions described above.
