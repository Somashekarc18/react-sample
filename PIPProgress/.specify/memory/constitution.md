# PIP Progress Tracker Constitution

## Core Principles

### I. Single Source of Truth (Data-Driven)

All goals, sub-goals, tasks, weights, and checkpoint progress live in one file: `progress.json`.
The dashboard renders exclusively from this file and never hardcodes goal content in markup or
code. Any new goal, sub-goal, or task is added by editing data, not by changing the application.
This guarantees the tool stays generic and extensible across all five PIP goals.

### II. Offline-First, No Build Step (NON-NEGOTIABLE)

The tracker must open directly from the filesystem (`file://`) in any modern browser with no
server, no bundler, and no install step. Only vanilla HTML, CSS, and JavaScript are permitted.
No frameworks, no npm dependencies, no transpilation. If a feature cannot be delivered without a
build step, it is out of scope.

### III. Weighted Roll-Up Progress

Progress aggregates bottom-up: task -> sub-goal -> goal -> overall. Each sub-goal and goal carries
a `weight`, and roll-ups are weighted averages, not simple counts. Weights reflect real priority
(for example, AWS exam domain percentages). Roll-up math is deterministic and reproducible from
the data alone.

### IV. Biweekly Checkpoint Cadence

Progress is tracked against a fixed set of eight biweekly checkpoints from 2026-07-15 to
2026-10-15. Every task records progress per checkpoint, enabling a time-series trend view.
Checkpoint dates are defined once in data and are the only sanctioned reporting intervals.

### V. Traceable, Sourced Content

Every task should carry a resource link and estimated effort where known. Goal and sub-goal
content must be traceable to an authoritative source (for example, the AWS exam guide or the PIP
document). Placeholder goals are explicitly marked as such until the user sources their details.

### VI. Non-Destructive Editing with Explicit Persistence

The dashboard may edit progress in-browser, but persistence is explicit: the user exports the
updated `progress.json` and replaces the file. The tool never silently mutates state that cannot
be recovered, and every export round-trips cleanly back into the tool.

## Technology Constraints

- Stack: vanilla HTML5, CSS3, and ES2020+ JavaScript only.
- Storage: a single `progress.json` file; optional `localStorage` for unsaved working state.
- No external network calls at runtime; resource links open in a new tab only on user action.
- Must function fully via `file://` with no CORS or server dependency.

## Development Workflow

- Follow the spec-kit flow: constitution -> specify -> plan -> tasks -> implement.
- Data schema changes are versioned inside `progress.json` via a `schemaVersion` field.
- Adding a goal must require zero code changes; verify this before shipping any schema change.
- Manual verification in a browser is the acceptance gate: render, roll-up, edit, export, reimport.

## Governance

This constitution supersedes ad-hoc implementation choices. Any change that violates a principle
requires an explicit amendment recorded here with a version bump and rationale. Complexity must be
justified against Principle II (no build step) and Principle I (data-driven). All work is verified
against the acceptance gate in the Development Workflow before it is considered done.

**Version**: 1.0.0 | **Ratified**: 2026-07-16 | **Last Amended**: 2026-07-16
