# Research: PIP Progress Tracker

**Feature**: `001-pip-progress-tracker` | **Date**: 2026-07-16 | **Phase**: 0 (Outline & Research)

This document captures the key technical decisions behind the existing reference implementation,
with rationale and rejected alternatives. There are no open `NEEDS CLARIFICATION` items: the spec's
Clarifications session and the working code have resolved every unknown. Each decision is stated in
the form Decision / Rationale / Alternatives considered.

## Decision 1 — Load data from an embedded `window.__PIP_DATA__` instead of `fetch()`

**Decision**: Ship the seed data twice: as the canonical `progress.json` and as a generated
`progress.data.js` that executes `window.__PIP_DATA__ = <contents of progress.json>;`. `index.html`
includes `progress.data.js` via a `<script>` tag before `app.js`. On startup, `loadData()` reads
the embedded global (after `localStorage`), never `fetch('progress.json')`.

**Rationale**:
- Modern browsers treat every `file://` document as an opaque origin, so an `XMLHttpRequest` or
  `fetch()` to a sibling `file://` JSON is blocked by the same-origin / CORS policy and fails with a
  network/CORS error. A `<script src="…">` include is *not* subject to that restriction, so embedding
  the data as an assigned global reliably loads offline with zero server.
- This directly satisfies Constitution Principle II (offline-first, no build step, no server) and
  FR-015 (must open and function fully from `file://`), plus the "Filesystem load without a server"
  edge case.
- The embed is a trivial, hand-reproducible transform of the JSON — it adds no build tooling,
  transpilation, or dependency, preserving the no-build guarantee.

**Regeneration step** (run whenever `progress.json` changes; also in `quickstart.md`):

```bash
printf 'window.__PIP_DATA__ = ' > progress.data.js \
  && cat progress.json >> progress.data.js \
  && printf ';\n' >> progress.data.js
```

**Alternatives considered**:
- *`fetch('./progress.json')`*: Rejected — blocked by CORS on `file://`; would require a local HTTP
  server, violating Principle II and FR-015/SC-001.
- *Inline the JSON directly inside `index.html`*: Rejected — couples data to markup and undermines
  Principle I (single source of truth in one data file) and the "edit data only" workflow (FR-002).
  A separate generated embed keeps `progress.json` authoritative while still loading offline.
- *A build step that bundles JSON into JS*: Rejected outright by Principle II (no build step).

## Decision 2 — `localStorage` working-state with silent `file://` fallback

**Decision**: Autosave the active in-browser state to `localStorage` under the key
`pip-progress-working-state` on every edit (`markDirty` → `saveLocal`). Load precedence is:
`localStorage` working-state first, then the embedded `window.__PIP_DATA__`, else an empty-state
message. All `localStorage` reads/writes are wrapped in `try/catch` and fail silently.

**Rationale**:
- Non-destructive editing (Principle VI): edits are held transiently and survive an accidental
  reload without being written back to the file, so nothing is silently and irrecoverably mutated.
  Persistence remains explicit via Export (FR-011, FR-014).
- Some browsers disable or throw on `localStorage` for `file://` origins (or in private modes). The
  spec's "Browser storage unavailable" edge case requires the dashboard to keep working and skip
  autosave silently; the `try/catch` wrappers implement exactly that — the owner then relies on
  Export to persist.
- Load precedence lets in-progress edits (localStorage) take priority over the shipped seed
  (`__PIP_DATA__`), matching FR-015 and the clarified load precedence; an explicit Import replaces
  the active state and overrides both.

**`file://` caveats documented**:
- `localStorage` availability on `file://` is browser-dependent and MUST NOT be assumed.
- Storage is per-origin and, on `file://`, effectively per-path/browser; it is not portable across
  machines or browsers — hence Export/Import is the portable persistence mechanism.
- Autosaved state can grow stale relative to the file on disk; the dirty flag warns the owner, and
  Import always wins when they choose to reload from a file.

**Alternatives considered**:
- *No autosave (export-only)*: Rejected — an accidental reload would lose unsaved edits; autosave
  improves safety without violating "explicit persistence" because the file is only written on Export.
- *IndexedDB*: Rejected — heavier API for no benefit at this data scale and with the same `file://`
  availability caveats.

## Decision 3 — AWS AIP-C01 exam facts drive the AWS goal's sub-goal weights (resolved)

**Decision**: Model the seeded AWS goal as one "Exam Prep & Logistics" sub-goal (`weight: 10`) plus
five exam-domain sub-goals weighted by the official AIP-C01 exam-guide domain percentages that sum
to 100. Treat the exam facts below as already-researched and authoritative; cite them rather than
re-fetching.

**Exam facts (AWS Certified Generative AI Developer – Professional, exam code AIP-C01)**:
- Duration: **180 minutes**.
- Questions: **75 total** — **65 scored** + **10 unscored** (pretest) items.
- Cost: **USD $300**.
- Passing score: **750 / 1000** (scaled).
- Delivery: **Pearson VUE test center or online proctored**.
- Domain weights (drive the sub-goal weights):
  - **D1 — Foundation Model Integration, Data Management & Compliance: 31%**
  - **D2 — Implementation & Integration: 26%**
  - **D3 — AI Safety, Security & Governance: 20%**
  - **D4 — Operational Efficiency & Optimization: 12%**
  - **D5 — Testing, Validation & Troubleshooting: 11%**
  - (31 + 26 + 20 + 12 + 11 = **100**, satisfying FR-019 / SC-003.)
- Authoritative source: official exam guide at
  `https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/`.

**Rationale**:
- Principle III (weights reflect real priority) and Principle V (traceable, sourced content): using
  the published domain percentages makes the roll-up mirror how the exam is actually weighted, and
  each task links to authoritative AWS documentation (FR-016, FR-018, FR-019).
- The prep sub-goal (`weight: 10`) is deliberately excluded from the "sum to 100" constraint, which
  applies only to the five exam-domain sub-goals (FR-019, SC-003); prep is logistics, not an exam
  domain, so weighting it alongside domains would distort the domain roll-up.

**Alternatives considered**:
- *Equal weights across domains*: Rejected — would misrepresent exam emphasis and violate the intent
  of Principle III; the official percentages already differ (31/26/20/12/11).
- *Fold prep into a domain*: Rejected — conflates study logistics with exam-content mastery and
  breaks the exact "sum to 100" domain check.

**Verification note**: These figures are treated as resolved research. Re-fetch the exam guide URL
above only if independently verifying before exam registration; no re-fetch is required for this plan.

## Decision 4 — Weighted roll-up with carry-forward vs. simple task counts

**Decision**: Compute progress bottom-up as a weighted average at each level
(task → sub-goal → goal → overall). A task's value at a checkpoint is the value recorded at that
checkpoint, else the most recent prior recorded value (carry-forward), else 0. Tasks default to
`weight: 1`, yielding a simple/equal average when sibling weights are absent or equal. All math uses
unrounded values; rounding is display-only.

**Rationale**:
- Principle III mandates weighted roll-ups (not simple counts) so that high-impact components (e.g.,
  AWS Domain 1 at 31%) contribute proportionally more than low-impact ones (FR-003).
- Carry-forward (FR-004) produces a monotonic, sensible trend across the eight checkpoints: a task
  recorded at CP3 still counts at CP4–CP8 until updated, instead of collapsing to 0% in gap
  checkpoints — matching the "Missing checkpoint values" edge case and enabling the timeline trend.
- Display-only rounding (clarified in the spec) keeps intermediate aggregates precise; rounding each
  level would accumulate error and make roll-ups fail to reconcile.
- The `weightedAvg` fallback to a simple average when `totalW === 0` keeps the algorithm robust for
  sub-goals/goals whose children have no explicit weights.

**Alternatives considered**:
- *Simple completion counts (tasks done ÷ tasks total)*: Rejected — ignores weight and treats a
  trivial task as equal to a major one, directly contradicting Principle III.
- *No carry-forward (0% in any checkpoint without an explicit value)*: Rejected — produces a
  saw-tooth, misleading trend and contradicts FR-004 and the edge-case requirement.
- *Round at every level*: Rejected — accumulates rounding error; the spec requires unrounded
  computation with display-only rounding.

## Summary of resolved unknowns

| Topic | Resolution |
|-------|-----------|
| Offline data load on `file://` | Embedded `window.__PIP_DATA__` via `progress.data.js`; no `fetch()` (Decision 1) |
| Working-state persistence | `localStorage` autosave with silent `file://` fallback; Export for durable persistence (Decision 2) |
| AWS sub-goal weights | Official AIP-C01 domain percentages 31/26/20/12/11 (sum 100) + prep weight 10 (Decision 3) |
| Roll-up algorithm | Weighted average per level + carry-forward + display-only rounding (Decision 4) |
