---
description: "Task list for PIP Progress Tracker — build + reconcile against existing reference implementation"
---

# Tasks: PIP Progress Tracker

**Input**: Design documents from `/specs/001-pip-progress-tracker/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/progress.schema.json, quickstart.md

**Tests**: No automated test framework is used (Constitution Principle II forbids a build step). Verification is manual browser validation per [quickstart.md](quickstart.md). "Verification" tasks below stand in for tests and map to Success Criteria SC-001..SC-009.

## Reconciliation note (READ FIRST)

A **working reference implementation already exists** at the repository root: `index.html`, `app.js`, `styles.css`, `progress.json`, `progress.data.js`. Accordingly, this list is a **build + reconcile** checklist:

- Tasks marked **[DONE-REF]** have a deliverable that already exists in the reference build. Their action is: *verify against spec; reconcile any drift.* They are not net-new work.
- Tasks marked **[VERIFY]** are explicit spec-to-implementation verification steps mapped to Success Criteria.
- Tasks with no marker are remaining/new work (schema formalization, regeneration hygiene, documented-gap handling).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- **[DONE-REF]**: Deliverable already exists in the reference build — verify, do not rebuild
- **[VERIFY]**: Verification step mapped to a Success Criterion
- File paths are relative to the repository root

## Path Conventions

Flat static single-page app rooted at the repository root (no `src/` split; Principle II forbids a build step). Files: `index.html`, `app.js`, `styles.css`, `progress.json`, `progress.data.js`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the flat, no-build project shell and data pipeline.

- [ ] T001 [DONE-REF] Confirm flat repo-root layout exists (`index.html`, `app.js`, `styles.css`, `progress.json`, `progress.data.js`) with no build tooling, `package.json`, or bundler — already implemented in reference build; verify against plan.md Project Structure and Constitution Principle II.
- [ ] T002 [DONE-REF] Verify `index.html` loads `progress.data.js` before `app.js` via `<script>` tags and includes `styles.css` — already implemented in reference build; verify tag order in `index.html`.
- [ ] T003 [P] [DONE-REF] Verify `styles.css` defines layout, cards, progress bars (good/warn/neutral), status badges, header ring, and timeline styles — already implemented in reference build; verify against FR-006/FR-006a presentation needs.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data contract, seed document, embedded-data pipeline, and roll-up math — everything all user stories depend on.

**⚠️ CRITICAL**: No user story verification can complete until this phase is reconciled.

- [ ] T004 Formalize and validate the JSON Schema in `specs/001-pip-progress-tracker/contracts/progress.schema.json` against the seed `progress.json` (root requires `schemaVersion`, `meta`, `checkpoints`[exactly 8], `goals`; entity `$defs` for metadata/checkpoint/goal/subGoal/task; `progressValue` 0–100). Fix any drift between schema and seed data (FR-020, data-model.md).
- [ ] T005 [DONE-REF] Verify `progress.json` seed document exists with `schemaVersion`, `meta` (title/owner/periodStart/periodEnd/lastUpdated), 8 checkpoints, and 5 goals — already implemented in reference build; verify against data-model.md.
- [ ] T006 [DONE-REF] Verify the 8 biweekly checkpoints in `progress.json` are 14 days apart from `2026-07-15` (baseline) to `2026-10-15` (due), each with `id`/`date`/`label` — already implemented in reference build; verify against FR-017.
- [ ] T007 [DONE-REF] Verify the AWS AIP-C01 goal in `progress.json` has a prep/logistics sub-goal (`weight: 10`) plus five exam-domain sub-goals weighted `31, 26, 20, 12, 11` — already implemented in reference build; verify against FR-019 and research.md Decision 3.
- [ ] T008 [DONE-REF] Verify the four placeholder goals (POCs, chargeable utilization, IBM Band 8, Cloud Solutions reskill) in `progress.json` each have `placeholder: true`, empty `subGoals`, and `weight: 1` — already implemented in reference build; verify against FR-018.
- [ ] T009 Regenerate the embedded data file `progress.data.js` from `progress.json` (`printf 'window.__PIP_DATA__ = ' > progress.data.js && cat progress.json >> progress.data.js && printf ';\n' >> progress.data.js`) and confirm it assigns `window.__PIP_DATA__`; re-run whenever `progress.json` changes (research.md Decision 1, quickstart.md).
- [ ] T010 [DONE-REF] Verify `app.js` data-load precedence in `loadData()`/`tryLoadLocal()`: `localStorage` working-state first, then `window.__PIP_DATA__`, else empty-state; all storage access wrapped in try/catch (silent `file://` fallback) — already implemented in reference build; verify against FR-015 and research.md Decision 2.
- [ ] T011 [DONE-REF] Verify the roll-up math in `app.js` (`taskProgressAt` carry-forward, `weightedAvg` with simple-average fallback, `subGoalProgressAt`, `goalProgressAt`, `overallProgressAt`, `clamp`, display-only `round`; task default weight = 1) computes bottom-up on unrounded values — already implemented in reference build; verify against FR-003/FR-004 and research.md Decision 4.

**Checkpoint**: Contract, seed data, embed pipeline, and math verified — user story reconciliation can proceed.

---

## Phase 3: User Story 1 — Review overall and per-goal progress at a checkpoint (Priority: P1) 🎯 MVP

**Goal**: Opening the dashboard offline shows overall progress in the header plus a card per goal with rolled-up %, colored bar, and status badge for the selected checkpoint.

**Independent Test**: Open `index.html` from the filesystem with seeded data; confirm the header shows an overall % and five goal cards render with correct percentages, bars, and badges for the latest checkpoint — no editing required.

### Implementation for User Story 1

- [ ] T012 [DONE-REF] [US1] Verify `renderHeader` renders the overall progress ring plus tracking period and checkpoint count in `index.html`/`app.js` — already implemented in reference build; verify against FR-005.
- [ ] T013 [DONE-REF] [US1] Verify `renderGoals` renders one card per goal (title, outcome, rolled-up %, progress bar, status badge) in `app.js` — already implemented in reference build; verify against FR-006.
- [ ] T014 [DONE-REF] [US1] Verify `statusFor` badge thresholds (Placeholder precedence → Done ≥ 100 → In progress > 0 → Not started 0) in `app.js` — already implemented in reference build; verify against FR-006.
- [ ] T015 [DONE-REF] [US1] Verify `barClass` color thresholds (good ≥ 80, warn < 34, neutral otherwise) in `app.js`/`styles.css` — already implemented in reference build; verify against FR-006a.
- [ ] T016 [DONE-REF] [US1] Verify placeholder goal cards render the Placeholder badge, 0%, and an "add sub-goals…" note in `app.js` — already implemented in reference build; verify against FR-018.

### Verification for User Story 1 (Success Criteria)

- [ ] T017 [VERIFY] [US1] SC-001: Open `index.html` via `file://` with no server/install/build and confirm the dashboard is fully usable (quickstart.md Scenario 1).
- [ ] T018 [VERIFY] [US1] SC-007: Confirm all five goals render as cards and the four placeholder goals are clearly marked as placeholders.
- [ ] T019 [VERIFY] [US1] SC-009: Inspect goals at known progress values to confirm status badges (Done/In progress/Not started) and bar colors (good ≥ 80 / warn < 34) match thresholds.
- [ ] T020 [VERIFY] [US1] Confirm the header ring reflects overall progress at the active checkpoint and shows period + "8 biweekly checkpoints".

**Checkpoint**: User Story 1 (MVP) is fully functional and independently testable.

---

## Phase 4: User Story 2 — Update task progress and see roll-ups recompute (Priority: P1)

**Goal**: Expanding a sub-goal and moving a task slider recomputes sub-goal, goal, and overall figures deterministically for the active checkpoint.

**Independent Test**: Expand a sub-goal, move a task slider, and confirm task/sub-goal/goal/overall percentages update consistently with a weighted-average calculation for the active checkpoint.

### Implementation for User Story 2

- [ ] T021 [DONE-REF] [US2] Verify `renderSubGoal` renders each sub-goal with weight, rolled-up %, and a collapsible task list in `app.js` — already implemented in reference build; verify against FR-007.
- [ ] T022 [DONE-REF] [US2] Verify `renderTask` renders a per-task slider (range 0–100, step 5) that writes `progressByCheckpoint[selectedCheckpointId]` on input/change in `app.js` — already implemented in reference build; verify against FR-008.
- [ ] T023 [DONE-REF] [US2] Verify slider edits trigger recompute + re-render so sub-goal, goal, and overall figures update live in `app.js` — already implemented in reference build; verify against FR-003 and US2 scenario 3.
- [ ] T024 [DONE-REF] [US2] Verify carry-forward behavior: a task with no value at a later checkpoint retains its most recent prior value (else 0) in `taskProgressAt` — already implemented in reference build; verify against FR-004.

### Verification for User Story 2 (Success Criteria)

- [ ] T025 [VERIFY] [US2] SC-003: Confirm the AWS exam-domain sub-goal weights (31+26+20+12+11) sum to exactly 100 (prep sub-goal excluded).
- [ ] T026 [VERIFY] [US2] SC-004: Move a single task slider and confirm the containing sub-goal, goal, and overall percentages update deterministically and match a weighted-average calculation for the active checkpoint (quickstart.md Scenario 2).

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 — View the biweekly trend and switch checkpoints (Priority: P2)

**Goal**: A timeline shows overall progress across all eight checkpoints; clicking a column or using the selector changes the active checkpoint everywhere.

**Independent Test**: Confirm the timeline renders one column per checkpoint with the correct overall %, then click a checkpoint and verify the header, cards, sliders, and selector all update.

### Implementation for User Story 3

- [ ] T027 [DONE-REF] [US3] Verify `renderTimeline` renders 8 columns in date order, each with the overall % and a bar sized to that value, active checkpoint highlighted, in `app.js` — already implemented in reference build; verify against FR-009.
- [ ] T028 [DONE-REF] [US3] Verify `buildCheckpointSelect`/`syncCheckpointSelect` and timeline column clicks both set `selectedCheckpointId` and trigger a full re-render in `app.js` — already implemented in reference build; verify against FR-010.

### Verification for User Story 3 (Success Criteria)

- [ ] T029 [VERIFY] [US3] SC-002: Confirm all 8 biweekly checkpoints render on the timeline in date order from baseline to due date (quickstart.md Scenario 3).
- [ ] T030 [VERIFY] [US3] Confirm clicking a timeline column and using the selector produce identical active-checkpoint changes across header, cards, sliders, and selector.

**Checkpoint**: User Stories 1–3 are independently functional.

---

## Phase 6: User Story 4 — Export, import, and persist working state (Priority: P2)

**Goal**: Export the current state to `progress.json`, import a file to restore it, and flag unsaved changes with transient `localStorage` autosave.

**Independent Test**: Change a task value (confirm the unsaved indicator appears), export, re-import, and confirm the state matches and the indicator clears.

### Implementation for User Story 4

- [ ] T031 [DONE-REF] [US4] Verify `exportJson` stamps `meta.lastUpdated`, downloads `progress.json` (Blob + `URL.createObjectURL`), and clears the dirty flag in `app.js` — already implemented in reference build; verify against FR-011.
- [ ] T032 [DONE-REF] [US4] Verify `importJson` (via `FileReader`) validates presence of `checkpoints` and `goals`, replaces active state, selects the latest checkpoint, and re-renders in `app.js` — already implemented in reference build; verify against FR-012.
- [ ] T033 [DONE-REF] [US4] Verify import rejects a file missing `checkpoints` or `goals` with an error message and leaves current state unchanged in `app.js` — already implemented in reference build; verify against FR-013.
- [ ] T034 [DONE-REF] [US4] Verify `markDirty`/`saveLocal` autosave working state to `localStorage` on edit and toggle the "Unsaved changes" indicator, clearing on export/import in `app.js` — already implemented in reference build; verify against FR-014.

### Verification for User Story 4 (Success Criteria)

- [ ] T035 [VERIFY] [US4] SC-005: Edit a task, Export JSON, then Import the exported file and confirm an identical state (round-trip, no data loss) with the dirty indicator cleared (quickstart.md Scenario 4).
- [ ] T036 [VERIFY] [US4] Confirm importing a malformed/incomplete file shows an error and leaves the current state intact.

**Checkpoint**: User Stories 1–4 are independently functional.

---

## Phase 7: User Story 5 — Extend goals by editing data only (Priority: P3)

**Goal**: Adding a goal/sub-goal/task by editing data alone renders it with zero code changes.

**Independent Test**: Add a goal (with sub-goals and tasks) to the data file, regenerate the embed, reload, and confirm the new goal card renders and participates in roll-ups without code edits.

### Implementation for User Story 5

- [ ] T037 [DONE-REF] [US5] Verify `app.js` renders exclusively from the loaded document and hardcodes no goal content in markup or code — already implemented in reference build; verify against FR-001.
- [ ] T038 [DONE-REF] [US5] Verify a new sub-goal with a weight and tasks contributes to its goal's weighted progress per its weight (data-driven roll-up) in `app.js` — already implemented in reference build; verify against FR-002 and US5 scenario 2.

### Verification for User Story 5 (Success Criteria)

- [ ] T039 [VERIFY] [US5] SC-006: Add a new goal (with a sub-goal and ≥ 1 task) to `progress.json`, regenerate `progress.data.js`, reload (clear `localStorage` if needed), and confirm the new goal renders and rolls up with zero code changes (quickstart.md Scenario 5).
- [ ] T040 [VERIFY] [US5] SC-008: Confirm a placeholder goal contributes 0% to overall roll-up while still weighted equally, and stops rendering as a placeholder only when it has ≥ 1 sub-goal with ≥ 1 task, defined weights, and `placeholder: false`.

**Checkpoint**: All user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documented limitations, resource-link behavior, and the full manual acceptance gate.

- [ ] T041 [DONE-REF] Verify task resource links open in a new browser tab and only on user click (`target="_blank"` / user-initiated) in `app.js` — already implemented in reference build; verify against FR-016.
- [ ] T042 [DONE-REF] Verify the empty-state message (no `localStorage` state and no embedded data) directs the owner to import a JSON file and disables export in `app.js` — already implemented in reference build; verify against the "No data available" edge case.
- [ ] T043 [P] (Optional, low-priority — KNOWN GAP) Add keyboard/ARIA support to the sub-goal expand/collapse toggle in `app.js`/`index.html` (currently mouse/click-only). Per the 2026-07-16 clarification this is an accepted, **documented limitation** for a single-user offline tracker (FR-021); implement only if accessibility becomes a requirement. Do not omit silently — track here.
- [ ] T044 [VERIFY] Run the full quickstart.md acceptance-gate checklist end-to-end (SC-001 through SC-009) and record pass/fail for each criterion.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (schema, seed data, embed pipeline, roll-up math).
- **User Stories (Phases 3–7)**: All depend on Foundational completion; can then proceed in parallel or in priority order (P1 → P2 → P3).
- **Polish (Phase 8)**: Depends on the user stories being verified.

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational — MVP.
- **US2 (P1)**: Depends on Foundational; builds on US1 rendering but is independently testable via slider edits.
- **US3 (P2)**: Depends on Foundational; independently testable via the timeline/selector.
- **US4 (P2)**: Depends on Foundational; independently testable via export/import round-trip.
- **US5 (P3)**: Depends on Foundational; independently testable via data-only extension.

### Within Each User Story

- [DONE-REF] verifications can run in any order (single reference file already exists).
- [VERIFY] Success-Criteria checks follow their story's [DONE-REF] verifications.

### Parallel Opportunities

- T003 (styles), T004 (schema) can run in parallel with data verifications.
- Because the reference build already exists, all [DONE-REF] verification tasks across stories can be performed in parallel by different reviewers.
- T043 (accessibility gap) is independent and [P].

---

## Parallel Example: User Story 1

```text
# Reconcile User Story 1 deliverables (all already exist in the reference build):
T012 Verify header ring render (renderHeader)
T013 Verify goal card render (renderGoals)
T014 Verify status badge thresholds (statusFor)
T015 Verify bar color thresholds (barClass)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify layout/scripts/styles).
2. Complete Phase 2: Foundational (formalize schema T004, regenerate embed T009, verify seed + math).
3. Complete Phase 3: User Story 1 verification.
4. **STOP and VALIDATE**: SC-001, SC-007, SC-009 pass.

### Incremental Delivery

1. Setup + Foundational → data contract + math confirmed.
2. US1 → offline read-only view verified (MVP).
3. US2 → editable roll-ups verified.
4. US3 → timeline/checkpoint switching verified.
5. US4 → export/import round-trip verified.
6. US5 → data-only extensibility verified.
7. Polish → resource links, empty-state, documented accessibility gap, full acceptance gate.

---

## Notes

- **[DONE-REF]** = deliverable already exists in the reference build; action is verify/reconcile, not rebuild.
- **[VERIFY]** = manual verification mapped to a Success Criterion (no automated tests; Principle II).
- **[P]** = independent, can run in parallel.
- Regenerate `progress.data.js` (T009) whenever `progress.json` changes; browser `localStorage` may shadow edits (clear it or use Import).
- The sub-goal expand/collapse accessibility gap (T043) is an accepted documented limitation per FR-021 — kept explicit, not silently omitted.
- Keep all changes consistent with the constitution: offline `file://`, no build step, data-driven rendering, weighted roll-up.
