# Implementation Plan: PIP Progress Tracker

**Branch**: `001-pip-progress-tracker` | **Date**: 2026-07-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-pip-progress-tracker/spec.md`

**Note**: This plan formalizes an existing, working reference implementation already present in the
repository root (`index.html`, `app.js`, `styles.css`, `progress.json`, `progress.data.js`). The
architecture below documents what exists; it does not propose a divergent design.

## Summary

An offline, single-page dashboard that tracks progress toward five Performance Improvement Process
(PIP) goals across eight biweekly checkpoints (2026-07-15 → 2026-10-15). The dashboard renders
entirely from one data document (`progress.json`), computes weighted roll-ups bottom-up
(task → sub-goal → goal → overall) per checkpoint with carry-forward, and persists via explicit
JSON export/import plus transient `localStorage` autosave. It runs directly from `file://` with no
server, build step, framework, or network dependency.

The technical approach is vanilla HTML5 + CSS3 + ES2020+ JavaScript. Because browsers block
`fetch()` of a local `file://` JSON document, the seeded data is loaded from an embedded
`window.__PIP_DATA__` global (generated into `progress.data.js` from `progress.json`), with
`localStorage` working-state taking precedence and an imported file replacing the active state.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2020+ (vanilla, no transpilation)

**Primary Dependencies**: None. No frameworks, no npm packages, no CDN scripts. Uses only standard
browser Web APIs: DOM, `FileReader`, `Blob`, `URL.createObjectURL`, `localStorage`.

**Storage**:
- Canonical source of truth: `progress.json` (single file, versioned via `schemaVersion`).
- Offline load fallback: `progress.data.js` — a generated file assigning `window.__PIP_DATA__` to
  the contents of `progress.json`.
- Transient working state: browser `localStorage` key `pip-progress-working-state`.

**Testing**: Manual browser verification against the acceptance gate (render → roll-up → edit →
export → reimport). No automated test framework (no build step permitted). The `quickstart.md`
enumerates the runnable validation scenarios.

**Target Platform**: Modern evergreen desktop browsers, opened from the filesystem via `file://`.

**Project Type**: Single-page, static, offline client-side web application (no backend).

**Performance Goals**: Instant interactivity for the expected data scale (5 goals, ≤ ~10 sub-goals,
≤ ~50 tasks, 8 checkpoints). Roll-up recompute + full re-render on each edit is comfortably sub-frame
at this scale; no incremental rendering is required.

**Constraints**:
- MUST function fully via `file://` with no server, CORS, or network dependency.
- No build step, bundler, or install step (Principle II, non-negotiable).
- `fetch()` of local JSON is blocked on `file://`, so data MUST load from the embedded global.
- `localStorage` may be unavailable on `file://` in some browsers; autosave failures MUST be silent
  and non-fatal.
- Computation uses unrounded values; rounding is applied for display only.

**Scale/Scope**: Single-user, single-owner personal tracker. Five goals (one seeded: AWS AIP-C01;
four placeholders), eight fixed checkpoints, one HTML page, one stylesheet, one application script,
one data file, one generated data-embed file.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against `.specify/memory/constitution.md` (v1.0.0), which defines six binding principles.

| # | Principle | Status | How this plan satisfies it |
|---|-----------|--------|-----------------------------|
| I | Single Source of Truth (Data-Driven) | PASS | All goals/sub-goals/tasks/weights/checkpoints live in `progress.json`; `app.js` renders exclusively from the loaded document and hardcodes no goal content (FR-001, FR-002). Adding a goal requires editing data only (US5). |
| II | Offline-First, No Build Step (NON-NEGOTIABLE) | PASS | Vanilla HTML/CSS/JS only; no framework, bundler, npm, or transpilation. Runs from `file://` with the embedded `window.__PIP_DATA__` fallback because `fetch()` is CORS-blocked locally (FR-015, Edge Cases). |
| III | Weighted Roll-Up Progress | PASS | `weightedAvg` aggregates bottom-up task → sub-goal → goal → overall by `weight`, falling back to a simple average when weights are equal/absent; task default weight is 1 (FR-003). Math is deterministic from data alone. |
| IV | Biweekly Checkpoint Cadence | PASS | Exactly eight checkpoints, 14 days apart, from 2026-07-15 to 2026-10-15, defined once in data; every task records progress per checkpoint (FR-017, FR-004 carry-forward). |
| V | Traceable, Sourced Content | PASS | Tasks carry `resourceUrl` + `estHours`; goals/sub-goals carry `source`; the AWS goal maps to the official AIP-C01 exam guide and domain weights; placeholder goals are flagged `placeholder: true` until sourced (FR-016, FR-018, FR-019). |
| VI | Non-Destructive Editing with Explicit Persistence | PASS | Edits mutate only in-browser working state (autosaved to `localStorage`); persistence is explicit via Export JSON; every export round-trips through Import with no data loss; a dirty flag warns of unsaved changes (FR-011, FR-012, FR-014, SC-005). |

**Technology Constraints (constitution §Technology Constraints)**: All satisfied — vanilla stack,
single `progress.json` + optional `localStorage`, no runtime network calls (links open in a new tab
only on user action per FR-016), full `file://` operation with no CORS/server dependency.

**Development Workflow (constitution §Development Workflow)**: Followed — spec-kit flow
(constitution → specify → plan → tasks → implement); schema versioned via `schemaVersion`
(FR-020); adding a goal requires zero code changes (verified by US5/SC-006); manual browser
verification is the acceptance gate (see `quickstart.md`).

**Gate result: PASS.** No violations. The Complexity Tracking table below is intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-pip-progress-tracker/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — key technical decisions & rationale
├── data-model.md        # Phase 1 output — progress.json schema & entities
├── quickstart.md        # Phase 1 output — manual validation guide
├── contracts/
│   └── progress.schema.json   # Phase 1 output — JSON Schema for progress.json
├── checklists/
│   └── requirements.md  # Pre-existing spec quality checklist
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
/                        # Repository root — the app runs directly from here via file://
├── index.html           # Page shell: header/ring, toolbar (import/export/checkpoint), goals
│                         #   container, timeline section, footer. Loads progress.data.js then app.js.
├── styles.css           # All presentation: layout, cards, bars (good/warn), badges, ring, timeline.
├── app.js               # IIFE module. Data load precedence, roll-up math, rendering, edit handlers,
│                         #   import/export, localStorage autosave, dirty flag.
├── progress.json        # Single source of truth (schemaVersion, meta, checkpoints[8], goals[5]).
└── progress.data.js     # GENERATED from progress.json: window.__PIP_DATA__ = <contents>;
                          #   Enables offline file:// load since fetch() of local JSON is blocked.
```

**Structure Decision**: This is a flat, static single-page web app rooted at the repository root —
no `src/`, `backend/`, or `frontend/` split, because Principle II forbids a build step and the app
is a single HTML page with one script and one stylesheet. The only "generated" artifact is
`progress.data.js`, produced from `progress.json` by a one-line shell step (documented in
`research.md` and `quickstart.md`); it introduces no build tooling and can be regenerated by hand.

### `app.js` module responsibilities (as implemented)

- **Data loading**: `loadData()` → `localStorage` working-state (`tryLoadLocal`) first, then
  `window.__PIP_DATA__` (deep-cloned) fallback, else empty-state.
- **Roll-up math**: `taskProgressAt` (carry-forward), `weightedAvg`, `subGoalProgressAt`,
  `goalProgressAt`, `overallProgressAt`, `clamp`, `round` (display only).
- **Rendering**: `render` → `renderHeader` (ring), `renderGoals` → `renderSubGoal` → `renderTask`
  (slider), `renderTimeline`, `renderDirty`; `barClass` and `statusFor` apply threshold rules.
- **Checkpoint control**: `buildCheckpointSelect`, `syncCheckpointSelect`; timeline columns and the
  selector both set `selectedCheckpointId`.
- **Persistence**: `exportJson` (stamps `lastUpdated`, downloads `progress.json`, clears dirty),
  `importJson` (validates `checkpoints` + `goals`, replaces state, selects latest checkpoint),
  `saveLocal`/`markDirty` (autosave working state).

## Complexity Tracking

> No constitutional violations. No entries required.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
