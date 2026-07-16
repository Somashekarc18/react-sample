# Feature Specification: PIP Progress Tracker

**Feature Branch**: `001-pip-progress-tracker`

**Created**: 2026-07-16

**Status**: Draft (describes existing reference implementation)

**Input**: User description: "Offline, single-page web dashboard that tracks progress toward 5 Performance Improvement Process (PIP) goals across 8 biweekly checkpoints (2026-07-15 to 2026-10-15)."

## Clarifications

### Session 2026-07-16

- Q: What accessibility target should this tool meet? → A: Document the current baseline as-is (native controls keyboard-accessible; sub-goal expand/collapse toggle is mouse/click-only, recorded as a known limitation); do NOT mandate WCAG conformance, since it is a single-user offline personal tracker.
- Q: When is a placeholder goal considered "sourced/complete"? → A: A placeholder goal is complete when it has at least one sub-goal with at least one task, weights defined, and `placeholder` set to `false`; until then it renders with the Placeholder badge and 0% and contributes 0% to roll-up (still weighted equally among goals). Sourcing content for the four placeholder goals is future work owned by the user, not part of this feature.
- Q: How should rolled-up percentages be rounded? → A: Rounding is for display only; underlying stored values remain unrounded and all computation uses unrounded values.
- Q: What is a task's default weight when none is specified? → A: A task with no explicit weight defaults to weight 1, which yields a simple (equal) average when all sibling weights are absent or equal.
- Q: What thresholds drive the status badge? → A: Done when rolled-up progress >= 100; In progress when > 0 and < 100; Not started when 0 (Placeholder badge takes precedence for placeholder goals).
- Q: What thresholds drive the progress bar color? → A: "Good" color when progress >= 80; "warn" color when progress < 34; neutral/default color otherwise.
- Q: What is the data load precedence? → A: localStorage working-state first, then the embedded `window.__PIP_DATA__` fallback; import replaces the active state.
- Q: Which checkpoint does the header ring reflect? → A: The header progress ring reflects overall progress at the active/selected checkpoint.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review overall and per-goal progress at a checkpoint (Priority: P1)

The owner opens the dashboard offline and immediately sees how far along they are against all five PIP goals for the currently selected checkpoint: an overall progress figure in the header and a card for each goal showing its rolled-up percentage, a colored progress bar, and a status badge. This is the core reason the tool exists.

**Why this priority**: Without a reliable, at-a-glance read of progress, the tracker delivers no value. This is the minimum viable slice — a read-only view of accurately rolled-up progress is already useful on its own.

**Independent Test**: Open the dashboard from the filesystem with the seeded data and confirm the header shows an overall percentage and five goal cards render with correct rolled-up percentages, bars, and status badges for the latest checkpoint — no editing required.

**Acceptance Scenarios**:

1. **Given** the dashboard is opened offline with seeded data, **When** it loads, **Then** the latest checkpoint (Oct 15) is selected and the header shows the overall weighted progress percentage as a ring plus the tracking period and checkpoint count.
2. **Given** the seeded data, **When** the goal cards render, **Then** each of the five goals shows its title, outcome, rolled-up percentage, a progress bar, and a status badge (Not started / In progress / Done / Placeholder).
3. **Given** a placeholder goal with no sub-goals, **When** its card renders, **Then** it shows a "Placeholder" badge and a note prompting the owner to add sub-goals and tasks in the data file.

---

### User Story 2 - Update task progress and see roll-ups recompute (Priority: P1)

The owner drills into a goal, expands its sub-goals, and adjusts a task's completion using a slider for the selected checkpoint. The sub-goal, goal, and overall figures recompute immediately and deterministically from the weighted data.

**Why this priority**: Recording progress is the primary interaction that keeps the tracker current. The weighted roll-up (task → sub-goal → goal → overall) is the defining behavior of the tool and must be correct and reproducible.

**Independent Test**: Expand a sub-goal, move a task slider, and confirm the task, sub-goal, goal, and overall percentages update consistently for the active checkpoint and match a weighted-average calculation of the underlying data.

**Acceptance Scenarios**:

1. **Given** a goal card with sub-goals, **When** the owner clicks a sub-goal header, **Then** its task list collapses or expands.
2. **Given** an expanded sub-goal, **When** the owner drags a task slider (range 0–100, step 5), **Then** the task percentage updates live while dragging and is recorded for the active checkpoint on release.
3. **Given** a task value changes, **When** the roll-ups recompute, **Then** the sub-goal, goal, and overall percentages reflect a weighted average by weight (falling back to a simple average when weights are equal or absent).
4. **Given** a task has no value recorded at a later checkpoint, **When** progress is computed at that checkpoint, **Then** the task carries forward its most recent prior recorded value (else 0).

---

### User Story 3 - View the biweekly trend and switch checkpoints (Priority: P2)

The owner reviews a timeline of overall progress across all eight biweekly checkpoints and clicks any checkpoint (or uses the selector) to make it the active reporting interval, which updates every figure and slider on the page.

**Why this priority**: The time-series view turns point-in-time numbers into a trend the owner can report biweekly, and switching checkpoints is how they record and review each reporting interval.

**Independent Test**: Confirm the timeline renders one column per checkpoint with the overall percentage for that checkpoint, then click a checkpoint and verify the active checkpoint changes everywhere (header, cards, sliders, selector).

**Acceptance Scenarios**:

1. **Given** the seeded data, **When** the timeline renders, **Then** it shows all eight checkpoints in order, each with the overall percentage and a bar sized to that value, with the active checkpoint highlighted.
2. **Given** the timeline, **When** the owner clicks a checkpoint column, **Then** that checkpoint becomes active and the header, goal cards, sliders, and the checkpoint selector all update to match.
3. **Given** the checkpoint selector, **When** the owner picks a different checkpoint, **Then** the active checkpoint and all figures update identically to clicking the timeline.

---

### User Story 4 - Export, import, and persist working state (Priority: P2)

The owner exports the current state to a `progress.json` file to persist or share it, and can later import a JSON file to restore that state. While editing, unsaved changes are held in the browser and flagged so the owner knows to export.

**Why this priority**: Editing is non-destructive; explicit export is how progress is persisted and shared, and import lets a saved file round-trip back into the tool. This protects against silent data loss.

**Independent Test**: Change a task value (confirm the unsaved indicator appears), export the file, re-import it, and confirm the state matches and the unsaved indicator clears.

**Acceptance Scenarios**:

1. **Given** an edited task, **When** progress changes, **Then** an "unsaved changes" indicator appears and the working state is autosaved to browser storage.
2. **Given** unsaved changes, **When** the owner clicks Export JSON, **Then** a `progress.json` file downloads with the current state (including an updated last-updated date) and the unsaved indicator clears.
3. **Given** an exported file, **When** the owner imports it, **Then** the dashboard loads that state, selects the latest checkpoint, and re-renders — round-tripping cleanly with no data loss.
4. **Given** an imported file missing checkpoints or goals, **When** the import runs, **Then** the owner sees an error message and the current state is unchanged.

---

### User Story 5 - Extend goals by editing data only (Priority: P3)

A new goal, sub-goal, or task is added by editing the data file alone; the dashboard renders the addition with no changes to markup or code.

**Why this priority**: Four of the five goals are placeholders that will be fleshed out over time. Keeping the tool fully data-driven guarantees it stays generic and maintainable without a build step.

**Independent Test**: Add a goal (with sub-goals and tasks) to the data file, reload the dashboard, and confirm the new goal card renders and participates in roll-ups without any code edits.

**Acceptance Scenarios**:

1. **Given** a new goal added to the data file, **When** the dashboard reloads, **Then** a new goal card renders with its sub-goals, tasks, sliders, and status without any code change.
2. **Given** a new sub-goal with a weight and tasks, **When** roll-ups compute, **Then** the new sub-goal contributes to its goal's weighted progress according to its weight.

### Edge Cases

- **Filesystem load without a server**: Because browsers block `fetch()` of local JSON over `file://`, the dashboard loads embedded data as a fallback so it works offline; importing a JSON file overrides it.
- **Browser storage unavailable**: If browser storage cannot be used on `file://`, autosave is skipped silently and the dashboard still functions; the owner relies on export to persist.
- **No data available**: If neither saved working state (localStorage) nor embedded fallback data is present, the dashboard shows an empty-state message directing the owner to import a JSON file, and disables export.
- **Goal or sub-goal with no children**: A goal with no sub-goals (or a sub-goal with no tasks) rolls up to 0% and shows an appropriate empty note.
- **Missing checkpoint values**: A task with gaps between checkpoints carries forward its last recorded value rather than dropping to 0.
- **Invalid import file**: A malformed or incomplete JSON import is rejected with a message and leaves current state intact.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST render its entire content — goals, sub-goals, tasks, weights, checkpoints, and progress — exclusively from a single data file, with no goal content hardcoded in markup or code.
- **FR-002**: The dashboard MUST support adding a goal, sub-goal, or task by editing the data file only, requiring zero code changes to render it.
- **FR-003**: The dashboard MUST compute progress bottom-up as a weighted average at each level (task → sub-goal → goal → overall), using each item's weight and falling back to a simple average when weights are equal or absent. A task with no explicit weight MUST default to weight 1 (yielding a simple/equal average when all sibling weights are absent or equal). All computation MUST use unrounded values; rounding is applied for display only and MUST NOT affect stored values or intermediate calculations.
- **FR-004**: The dashboard MUST compute a task's progress at a checkpoint as the value recorded at that checkpoint, or the most recent prior recorded value if none exists at that checkpoint (carry-forward), or 0 if no prior value exists.
- **FR-005**: The dashboard MUST display overall weighted progress for the active/selected checkpoint as a ring in the header, alongside the tracking period and checkpoint count; the ring MUST update whenever the active checkpoint changes.
- **FR-006**: The dashboard MUST display one card per goal showing title, outcome, rolled-up percentage, a progress bar, and a status badge. The status badge MUST be Done when rolled-up progress is >= 100, In progress when progress is > 0 and < 100, and Not started when progress is 0; the Placeholder badge MUST take precedence for goals still flagged as placeholders.
- **FR-006a**: The progress bar color MUST reflect the rolled-up percentage: a "good" color when progress is >= 80, a "warn" color when progress is < 34, and the neutral/default color otherwise.
- **FR-007**: The dashboard MUST render sub-goals under each goal with a weight and rolled-up percentage, and MUST allow each sub-goal's task list to be collapsed and expanded.
- **FR-008**: The dashboard MUST provide a per-task progress slider (range 0–100, step 5) that the owner can edit in the browser, updating the task's value for the active checkpoint.
- **FR-009**: The dashboard MUST render a biweekly trend timeline with one entry per checkpoint showing the overall progress for that checkpoint, highlighting the active checkpoint.
- **FR-010**: The dashboard MUST let the owner change the active checkpoint by clicking a timeline entry or using a checkpoint selector, updating all figures and controls consistently.
- **FR-011**: The dashboard MUST let the owner export the current state as a downloadable `progress.json` file, stamping it with an updated last-updated date.
- **FR-012**: The dashboard MUST let the owner import a JSON file via a file picker, replacing the current state, selecting the latest checkpoint, and re-rendering; a file exported by the tool MUST round-trip back through import without data loss.
- **FR-013**: The dashboard MUST reject an imported file that lacks checkpoints or goals, showing an error and leaving the current state unchanged.
- **FR-014**: The dashboard MUST autosave the working state to browser storage on edit and display an "unsaved changes" indicator when the state differs from the last export; the indicator MUST clear on export or import.
- **FR-015**: The dashboard MUST open and function fully from the filesystem (`file://`) with no server, build step, framework, or network dependency, loading data with the precedence: browser localStorage working-state first, then the embedded fallback data source; an explicit import MUST replace the active state.
- **FR-016**: The dashboard MUST open task resource links in a new browser tab, and only in response to a user action.
- **FR-017**: The data MUST define exactly eight biweekly checkpoints spaced 14 days apart from 2026-07-15 (baseline) through 2026-10-15 (due), each identified and labeled.
- **FR-018**: The data MUST represent five PIP goals — the AWS AIP-C01 certification (fully seeded) and four placeholder goals (POC demonstrations, chargeable utilization, IBM Band 8 badge, and the Cloud Solutions reskill) — all due 2026-10-15. A placeholder goal MUST have empty sub-goals and `placeholder: true`; it is considered sourced/complete only when it has at least one sub-goal with at least one task, weights defined, and `placeholder` set to `false`. Until sourced, a placeholder goal MUST render with the Placeholder badge and 0%, and MUST contribute 0% to roll-ups while still being weighted equally among the goals. Sourcing the real content for the four placeholder goals is future work owned by the user and is out of scope for this feature.
- **FR-019**: The AWS certification goal MUST contain an exam prep/logistics sub-goal (weight 10) plus five exam-domain sub-goals weighted by official exam percentage (31, 26, 20, 12, 11) that sum to 100.
- **FR-020**: The data MUST carry a schema version so that data-shape changes are versioned within the file.
- **FR-021**: The dashboard's accessibility baseline is documented as-is and MUST NOT be held to formal WCAG conformance for this feature: native controls (range sliders, checkpoint selector) are keyboard-accessible, while the sub-goal expand/collapse toggle is currently mouse/click-only and is recorded as a known limitation. This is acceptable because the tool is a single-user offline personal tracker.

### Key Entities *(include if feature involves data)*

- **Progress Document**: The single source of truth. Contains a schema version, metadata, the ordered list of checkpoints, and the list of goals.
- **Metadata**: Descriptive fields for the tracker — title, owner, tracking period start and end, and last-updated date.
- **Checkpoint**: A biweekly reporting interval with a stable identifier, a date, and a display label; ordering defines the trend sequence and carry-forward direction.
- **Goal**: A top-level PIP objective with a title, outcome, due date, weight, status, a placeholder flag, an authoritative source, notes, and a list of sub-goals.
- **Sub-Goal**: A weighted component of a goal (for example, an exam domain) with a title, weight, and a list of tasks.
- **Task**: The smallest tracked unit, with a title, optional estimated hours, optional resource link, optional weight, and a map of progress values (0–100) recorded per checkpoint.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The dashboard opens and is fully usable from the filesystem in a modern browser with no server, install, or build step.
- **SC-002**: All eight biweekly checkpoints render on the trend timeline in date order from the baseline to the due date.
- **SC-003**: The AWS certification goal's exam-domain sub-goal weights (excluding the prep sub-goal) sum to exactly 100%.
- **SC-004**: Editing a single task slider updates the containing sub-goal, goal, and overall percentages deterministically and consistently with a weighted-average calculation for the active checkpoint.
- **SC-005**: A file exported by the tool re-imports into the tool and produces an identical state (round-trip with no data loss).
- **SC-006**: Adding a new goal (with sub-goals and tasks) to the data file causes it to render and participate in roll-ups with zero code changes.
- **SC-007**: All five goals render as cards with correct status badges, and the four placeholder goals are clearly marked as placeholders.
- **SC-008**: A placeholder goal contributes 0% to overall roll-up while still being weighted equally among the goals, and only stops rendering as a placeholder once it has at least one sub-goal with at least one task, defined weights, and `placeholder` set to `false`.
- **SC-009**: Status badges follow the thresholds Done (>= 100), In progress (> 0 and < 100), and Not started (0), and progress bar colors follow good (>= 80) and warn (< 34), verifiable by inspecting a goal at known progress values.

## Assumptions

- The tool is single-user and single-owner; there is no authentication, backend, or multi-user synchronization.
- The owner persists progress by exporting `progress.json` and replacing the file; browser storage holds only transient unsaved working state.
- Modern evergreen browsers are the target runtime; legacy browsers without standard filesystem download support are out of scope.
- Checkpoint dates are fixed at 14-day intervals from 2026-07-15 to 2026-10-15 and are not user-configurable through the interface.
- The four non-AWS goals remain placeholders until their real sub-goals and tasks are sourced and added to the data file.
- Resource links point to authoritative external references and require an internet connection only when the owner chooses to open them.
- Formal WCAG accessibility conformance is not a goal; the current baseline (keyboard-accessible native controls; mouse/click-only sub-goal expand/collapse) is documented and accepted for a single-user offline tool.
- Displayed percentages are rounded for presentation only; stored values and calculations remain unrounded.

## Non-Goals

- No backend, database, or server component.
- No authentication or authorization.
- No multi-user or cross-device synchronization.
- No build step, bundler, transpilation, or third-party frameworks or dependencies.
- No automatic or silent persistence beyond transient browser working state; persistence is explicit via export.
