# Quickstart & Validation Guide: PIP Progress Tracker

**Feature**: `001-pip-progress-tracker` | **Date**: 2026-07-16 | **Phase**: 1 (Design & Contracts)

This is the manual acceptance gate (Constitution §Development Workflow). It validates the feature
end-to-end: render → roll-up → edit → export → reimport. No server, install, or build step is
required. Contract and schema details live in [contracts/progress.schema.json](contracts/progress.schema.json)
and [data-model.md](data-model.md); this guide focuses on running and verifying.

## Prerequisites

- A modern evergreen desktop browser (Chrome, Edge, Firefox, or Safari).
- The repository checked out locally. No Node, npm, or web server needed.
- Files present at the repository root: `index.html`, `app.js`, `styles.css`, `progress.json`,
  `progress.data.js`.

## Run the dashboard

Open the page directly from the filesystem (`file://`):

```bash
# macOS
open index.html
# Linux
xdg-open index.html
# Windows
start index.html
```

Or drag `index.html` into a browser tab. There is no dev server (Principle II).

## Regenerate the embedded data (only after editing `progress.json`)

Because `fetch()` of a local `file://` JSON is blocked by browsers, the app loads seed data from the
embedded `window.__PIP_DATA__` in `progress.data.js`. Regenerate it whenever you hand-edit
`progress.json`:

```bash
printf 'window.__PIP_DATA__ = ' > progress.data.js \
  && cat progress.json >> progress.data.js \
  && printf ';\n' >> progress.data.js
```

> Tip: if edits made in the browser aren't reflected after reload, the app may be loading autosaved
> `localStorage` working-state (which takes precedence). Clear site data for the page, or use
> Import to replace the active state.

## Validation scenarios

Each scenario maps to a user story and its acceptance criteria in [spec.md](spec.md).

### Scenario 1 — Review overall and per-goal progress (US1, FR-005/006/006a)

1. Open `index.html`.
2. Expected: the latest checkpoint (**Oct 15 (Due)**) is selected; the header shows an overall
   percentage ring plus the tracking period and "8 biweekly checkpoints".
3. Expected: five goal cards render, each with title, outcome, rolled-up %, a progress bar, and a
   status badge. The four non-AWS goals show a **Placeholder** badge, 0%, and a "add sub-goals…" note.
4. Verify bar color rules by inspecting a goal at a known value: `good` when ≥ 80, `warn` when < 34,
   neutral otherwise (SC-009).

### Scenario 2 — Edit a task and watch roll-ups recompute (US2, FR-003/004/007/008)

1. In the AWS goal card, click a sub-goal header (e.g., "Domain 1 …") to expand its task list.
2. Drag a task slider (range 0–100, step 5). Expected: the task % updates live while dragging and is
   recorded for the active checkpoint on release.
3. Expected: the sub-goal %, the AWS goal %, and the header overall % all update as a **weighted
   average** (e.g., Domain 1 at weight 31 moves the goal more than Domain 5 at weight 11).
4. Spot-check carry-forward: switch to a later checkpoint with no explicit value for that task and
   confirm it retains the last recorded value rather than dropping to 0 (FR-004).

### Scenario 3 — Trend timeline and checkpoint switching (US3, FR-009/010)

1. Scroll to "Biweekly Trend". Expected: 8 columns in date order, each showing the overall % for
   that checkpoint, with the active checkpoint highlighted (SC-002).
2. Click a different timeline column. Expected: that checkpoint becomes active and the header, goal
   cards, sliders, and the checkpoint selector all update to match.
3. Change the checkpoint via the selector dropdown. Expected: identical behavior to clicking the
   timeline.

### Scenario 4 — Export, import, round-trip, and dirty flag (US4, FR-011/012/013/014, SC-005)

1. Edit any task slider. Expected: the "Unsaved changes" indicator appears and working state is
   autosaved to browser storage.
2. Click **Export JSON**. Expected: a `progress.json` downloads with your changes and an updated
   `lastUpdated` date; the unsaved indicator clears.
3. Click **Import JSON** and select the file you just exported. Expected: the dashboard loads that
   state, selects the latest checkpoint, and re-renders identically — a clean round-trip with no
   data loss.
4. Import a malformed or incomplete file (missing `checkpoints` or `goals`). Expected: an error
   message and the current state is left unchanged (FR-013).

### Scenario 5 — Extend by editing data only (US5, FR-001/002, SC-006)

1. Add a new goal (with a sub-goal and at least one task) to `progress.json`.
2. Regenerate `progress.data.js` (see above) and reload the page (clear `localStorage` if needed).
3. Expected: the new goal card renders with its sub-goals, tasks, sliders, and status, and
   participates in roll-ups — **with zero code changes**.

## Acceptance gate checklist

- [ ] Opens and is fully usable from `file://` with no server/install/build (SC-001).
- [ ] All 8 checkpoints render on the timeline in date order (SC-002).
- [ ] AWS exam-domain sub-goal weights (31+26+20+12+11) sum to exactly 100 (SC-003).
- [ ] Editing one task slider updates sub-goal, goal, and overall consistently with a weighted
      average for the active checkpoint (SC-004).
- [ ] Exported file re-imports to an identical state — round-trip, no data loss (SC-005).
- [ ] Adding a goal via data only renders and rolls up with zero code changes (SC-006).
- [ ] All five goals render as cards; the four placeholders are clearly marked (SC-007).
- [ ] A placeholder contributes 0% while still weighted equally; it stops being a placeholder only
      when it has ≥ 1 sub-goal with ≥ 1 task, defined weights, and `placeholder: false` (SC-008).
- [ ] Status badges (Done ≥ 100 / In progress > 0 / Not started 0) and bar colors (good ≥ 80 /
      warn < 34) match at known values (SC-009).
