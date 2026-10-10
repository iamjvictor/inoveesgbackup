# Evidence Requests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a requirement/request layer so Agro can request catalog documents in bulk while other categories can link evidence requests to individual diagnostic questions, with multiple files per request and review history.

**Architecture:** Keep the private Storage object separate from database metadata. Add `EvidenceRequirement` for catalog rules, `DiagnosticEvidenceRequest` for diagnostic-specific requests, and `EvidenceReview` for audit history. Refactor `Evidence` to reference the request and uploader while preserving existing fields during migration.

**Tech Stack:** Prisma, PostgreSQL/Supabase, Express, TypeScript, Supabase Storage.

**Spec:** `docs/superpowers/specs/2026-09-15-evidence-requests-design.md`

## Global Constraints

- Do not store Base64 content in the database.
- One `DiagnosticEvidenceRequest` may have many `Evidence` rows.
- Requirement scoring metadata is server-owned and must not be trusted from the browser.
- Existing evidence rows must remain readable during migration.
- Storage failures must clean up uploaded objects.

### Task 1: Add Prisma models and migration

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/20260915_01_add_evidence_requests_and_reviews/migration.sql`

- [ ] Add `EvidenceRequirement`, `DiagnosticEvidenceRequest`, and `EvidenceReview` models.
- [ ] Add nullable `requestId`, `uploadedByUserId`, and `documentType` fields to `Evidence`.
- [ ] Add indexes and the unique constraint `(diagnosticId, requirementId)` on requests.
- [ ] Preserve existing evidence rows by leaving new foreign keys nullable during the first migration.
- [ ] Run `npm run prisma:generate` and inspect the generated client types.

### Task 2: Seed Agro requirements from the frontend mock

**Files:**
- Create: `backend/src/modules/diagnostic/models/evidenceRequirements.ts`
- Test: `backend/src/modules/diagnostic/models/evidenceRequirements.test.ts`

- [ ] Create a server-owned catalog with EV01–EV40 and the fields in `agroEvidences`.
- [ ] Write a failing test asserting EV01–EV40 exist and contain expected document, axes, points, and objectives.
- [ ] Run the focused test and verify the initial failure.
- [ ] Implement the catalog and rerun the focused test.

### Task 3: Generate diagnostic requests

**Files:**
- Modify: `backend/src/modules/diagnostic/services/diagnosticService.ts`
- Modify: `backend/src/modules/diagnostic/repositories/diagnosticRepository.ts`
- Test: `backend/src/modules/diagnostic/services/evidenceRequests.test.ts`

- [ ] Generate one request per Agro requirement for the diagnostic category/segment.
- [ ] Generate question-linked requests for non-Agro question flows.
- [ ] Make generation idempotent through `(diagnosticId, requirementId)`.
- [ ] Test that rerunning generation does not duplicate requests.

### Task 4: Refactor upload endpoint

**Files:**
- Modify: `backend/src/modules/diagnostic/controllers/diagnosticController.ts`
- Modify: `backend/src/modules/diagnostic/services/diagnosticService.ts`
- Modify: `frontend/src/features/company-area/services/evidence-upload.service.ts`

- [ ] Change the payload to send `requestId` and selected `documentType`, not client-supplied scoring data.
- [ ] Validate request ownership and that the document type belongs to the requirement.
- [ ] Compress the file, upload to Storage, then create one `Evidence` row per file linked to the request and uploader.
- [ ] Keep multiple files allowed for the same request.
- [ ] Preserve orphan cleanup on database failure.

### Task 5: Add audit mutation and history

**Files:**
- Modify: `backend/src/routes/admin.routes.ts`
- Modify: `backend/src/modules/admin/controllers/adminController.ts`
- Modify: `backend/src/modules/admin/services/adminService.ts`
- Modify: `backend/src/modules/admin/repositories/adminRepository.ts`
- Test: `backend/src/modules/admin/services/evidenceReview.test.ts`

- [ ] Add an admin-only review endpoint.
- [ ] Update current status and create an `EvidenceReview` row in one transaction.
- [ ] Record reviewer user, timestamp, previous status, new status, and comment.
- [ ] Ensure only authorized admins can review evidence.

### Task 6: Update client reads and verification

**Files:**
- Modify: `frontend/src/features/company-area/services/evidence-upload.service.ts`
- Modify: `frontend/src/features/company-area/views/pages/evidencias/evidences-upload-view.tsx`
- Modify: `frontend/src/features/company-area/views/pages/evidencias/evidence-pillars-accordion.tsx`

- [ ] Load requests and their files for the current diagnostic.
- [ ] Show status, reviewer, review date, and multiple files per request.
- [ ] Verify focused frontend lint/typecheck and backend tests/build.
