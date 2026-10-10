# Evidence Requests Design

## Goal

Support evidence requests generated from a requirement catalog, allowing one request to receive multiple uploaded files and preserving the relationship with the diagnostic, question, organization, and responsible user.

## Design

`EvidenceRequirement` stores the business rule for a requested document. `DiagnosticEvidenceRequest` instantiates that rule for one diagnostic and optionally links to a diagnostic question. `Evidence` stores each physical file and links to one request, so multiple files can answer the same request. Review history is kept separately in `EvidenceReview`.

Agro diagnostics use one request per `agroEvidences` item. Other categories use one request per question/evidence requirement and populate `diagnosticResponseId`.

The Storage object is created only after the request is validated. Database metadata stores the request, uploader, file name, status, and audit fields; the binary remains in the private Storage bucket.

## Audit and scoring

The requirement owns `documentType`, `expectedDocument`, `primaryAxis`, `scoringAxes`, `points`, and strategic objectives. Uploaded files inherit these rules through `requestId`; the client cannot override scoring metadata. `EvidenceReview` records reviewer identity, previous status, new status, comment, and timestamp.
