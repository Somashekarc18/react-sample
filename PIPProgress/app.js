/* PIP Progress Tracker - vanilla JS, offline-first, data-driven. */
(function () {
  "use strict";

  const STORAGE_KEY = "pip-progress-working-state";

  /** @type {any} */
  let data = null;
  let dirty = false;
  let selectedCheckpointId = null;

  // ---- Data loading -------------------------------------------------------

  function loadData() {
    const saved = tryLoadLocal();
    if (saved) return saved;
    if (window.__PIP_DATA__) return deepClone(window.__PIP_DATA__);
    return null;
  }

  function tryLoadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {
      /* localStorage may be unavailable on file:// in some browsers; ignore. */
    }
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ---- Roll-up math -------------------------------------------------------

  // Progress of a task at a checkpoint = value at that checkpoint if present,
  // otherwise the most recent prior checkpoint value (carry-forward), else 0.
  function taskProgressAt(task, checkpointId) {
    const map = task.progressByCheckpoint || {};
    const order = data.checkpoints.map((c) => c.id);
    const targetIdx = order.indexOf(checkpointId);
    let last = 0;
    for (let i = 0; i <= targetIdx; i++) {
      const id = order[i];
      if (Object.prototype.hasOwnProperty.call(map, id) && map[id] != null) {
        last = clamp(Number(map[id]) || 0);
      }
    }
    return last;
  }

  function weightedAvg(items, valueFn) {
    let totalW = 0;
    let acc = 0;
    for (const it of items) {
      const w = Number(it.weight) || 0;
      totalW += w;
      acc += w * valueFn(it);
    }
    if (totalW === 0) {
      // Fall back to a simple average when no weights are provided.
      if (items.length === 0) return 0;
      return items.reduce((s, it) => s + valueFn(it), 0) / items.length;
    }
    return acc / totalW;
  }

  function subGoalProgressAt(sg, checkpointId) {
    const tasks = sg.tasks || [];
    if (tasks.length === 0) return 0;
    // Tasks are equally weighted within a sub-goal unless a weight is set.
    return weightedAvg(
      tasks.map((t) => ({ weight: t.weight || 1, __t: t })),
      (w) => taskProgressAt(w.__t, checkpointId)
    );
  }

  function goalProgressAt(goal, checkpointId) {
    const subs = goal.subGoals || [];
    if (subs.length === 0) return 0;
    return weightedAvg(subs, (sg) => subGoalProgressAt(sg, checkpointId));
  }

  function overallProgressAt(checkpointId) {
    const goals = data.goals || [];
    if (goals.length === 0) return 0;
    return weightedAvg(goals, (g) => goalProgressAt(g, checkpointId));
  }

  function clamp(n) {
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function round(n) {
    return Math.round(n);
  }

  // ---- Rendering ----------------------------------------------------------

  function render() {
    renderHeader();
    renderGoals();
    renderTimeline();
    renderDirty();
  }

  function renderHeader() {
    document.getElementById("app-title").textContent = data.meta.title || "PIP Progress Tracker";
    document.getElementById("app-period").textContent =
      `Tracking ${data.meta.periodStart} to ${data.meta.periodEnd} across ${data.checkpoints.length} biweekly checkpoints`;
    document.getElementById("last-updated").textContent =
      "Last updated: " + (data.meta.lastUpdated || "-");

    const pct = round(overallProgressAt(selectedCheckpointId));
    document.getElementById("overall-pct").textContent = pct + "%";
    const ring = document.getElementById("overall-ring");
    const deg = (pct / 100) * 360;
    ring.style.background =
      `radial-gradient(closest-side, var(--panel) 78%, transparent 79%),` +
      `conic-gradient(var(--accent) ${deg}deg, var(--border) 0)`;
  }

  function barClass(pct) {
    if (pct >= 80) return "bar good";
    if (pct < 34) return "bar warn";
    return "bar";
  }

  function statusFor(goal, pct) {
    if (goal.placeholder) return { cls: "placeholder-tag", label: "Placeholder" };
    if (pct >= 100) return { cls: "done", label: "Done" };
    if (pct > 0) return { cls: "in-progress", label: "In progress" };
    return { cls: "not-started", label: "Not started" };
  }

  function renderGoals() {
    const container = document.getElementById("goals-container");
    container.innerHTML = "";

    for (const goal of data.goals) {
      const pct = round(goalProgressAt(goal, selectedCheckpointId));
      const card = el("div", "goal-card" + (goal.placeholder ? " placeholder" : ""));

      const head = el("div", "goal-head");
      const left = el("div");
      const title = el("h3", "goal-title", goal.title);
      const outcome = el("p", "goal-outcome", goal.outcome || "");
      left.append(title, outcome);
      const right = el("div");
      const st = statusFor(goal, pct);
      right.append(el("span", "badge " + st.cls, st.label));
      right.append(el("div", "goal-pct", pct + "%"));
      head.append(left, right);
      card.append(head);

      const bar = el("div", barClass(pct));
      const fill = el("span");
      fill.style.width = pct + "%";
      bar.append(fill);
      card.append(bar);

      if (!goal.subGoals || goal.subGoals.length === 0) {
        card.append(el("p", "empty-note", goal.placeholder
          ? "Placeholder goal - add sub-goals and tasks in progress.json."
          : "No sub-goals yet."));
      } else {
        for (const sg of goal.subGoals) {
          card.append(renderSubGoal(goal, sg));
        }
      }

      container.append(card);
    }
  }

  function renderSubGoal(goal, sg) {
    const wrap = el("div", "subgoal");
    const pct = round(subGoalProgressAt(sg, selectedCheckpointId));

    const head = el("div", "subgoal-head");
    head.append(el("p", "subgoal-title", sg.title));
    head.append(el("span", "subgoal-meta", `weight ${sg.weight || 1} · ${pct}%`));
    wrap.append(head);

    const list = el("ul", "tasks");
    for (const task of sg.tasks || []) {
      list.append(renderTask(task));
    }
    wrap.append(list);

    // Keyboard-accessible expand/collapse toggle (FR-021).
    head.setAttribute("role", "button");
    head.setAttribute("tabindex", "0");
    head.setAttribute("aria-expanded", "true");
    const toggle = () => {
      list.hidden = !list.hidden;
      head.setAttribute("aria-expanded", String(!list.hidden));
    };
    head.addEventListener("click", toggle);
    head.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        toggle();
      }
    });

    return wrap;
  }

  function renderTask(task) {
    const li = el("li", "task");

    const titleWrap = el("div", "task-title");
    if (task.resourceUrl) {
      const a = el("a", null, task.title);
      a.href = task.resourceUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      titleWrap.append(a);
    } else {
      titleWrap.textContent = task.title;
    }
    li.append(titleWrap);

    const meta = el("div", "task-meta", task.estHours ? `${task.estHours}h` : "");
    li.append(meta);

    const val = round(taskProgressAt(task, selectedCheckpointId));
    const control = el("div", "task-control");
    const range = document.createElement("input");
    range.type = "range";
    range.min = "0";
    range.max = "100";
    range.step = "5";
    range.value = String(val);
    const pctLabel = el("span", "task-pct", val + "%");

    range.addEventListener("input", () => {
      pctLabel.textContent = range.value + "%";
    });
    range.addEventListener("change", () => {
      if (!task.progressByCheckpoint) task.progressByCheckpoint = {};
      task.progressByCheckpoint[selectedCheckpointId] = Number(range.value);
      markDirty();
      render();
    });

    control.append(range, pctLabel);
    li.append(control);
    return li;
  }

  function renderTimeline() {
    const tl = document.getElementById("timeline");
    tl.innerHTML = "";
    for (const cp of data.checkpoints) {
      const pct = round(overallProgressAt(cp.id));
      const col = el("div", "tl-col" + (cp.id === selectedCheckpointId ? " active" : ""));
      col.append(el("div", "tl-val", pct + "%"));
      const bar = el("div", "tl-bar");
      bar.style.height = Math.max(2, pct) + "%";
      col.append(bar);
      col.append(el("div", "tl-label", cp.label));
      col.addEventListener("click", () => {
        selectedCheckpointId = cp.id;
        syncCheckpointSelect();
        render();
      });
      tl.append(col);
    }
  }

  function renderDirty() {
    document.getElementById("dirty-flag").hidden = !dirty;
  }

  function markDirty() {
    dirty = true;
    saveLocal();
  }

  // ---- Checkpoint selector ------------------------------------------------

  function buildCheckpointSelect() {
    const sel = document.getElementById("checkpoint-select");
    sel.innerHTML = "";
    for (const cp of data.checkpoints) {
      const opt = document.createElement("option");
      opt.value = cp.id;
      opt.textContent = cp.label;
      sel.append(opt);
    }
    sel.value = selectedCheckpointId;
    sel.addEventListener("change", () => {
      selectedCheckpointId = sel.value;
      render();
    });
  }

  function syncCheckpointSelect() {
    document.getElementById("checkpoint-select").value = selectedCheckpointId;
  }

  // ---- Import / export ----------------------------------------------------

  function setupToolbar() {
    document.getElementById("export-btn").addEventListener("click", exportJson);
    document.getElementById("import-file").addEventListener("change", importJson);
  }

  function exportJson() {
    data.meta.lastUpdated = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "progress.json";
    a.click();
    URL.revokeObjectURL(url);
    dirty = false;
    renderDirty();
  }

  function importJson(evt) {
    const file = evt.target.files && evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed.checkpoints || !parsed.goals) {
          throw new Error("Missing checkpoints or goals");
        }
        data = parsed;
        selectedCheckpointId = data.checkpoints[data.checkpoints.length - 1].id;
        dirty = false;
        saveLocal();
        buildCheckpointSelect();
        render();
      } catch (err) {
        alert("Could not import JSON: " + err.message);
      }
    };
    reader.readAsText(file);
    evt.target.value = "";
  }

  // ---- Helpers ------------------------------------------------------------

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // ---- Init ---------------------------------------------------------------

  function init() {
    data = loadData();
    if (!data) {
      document.getElementById("goals-container").innerHTML =
        '<p class="empty-note">No data found. Use "Import JSON" to load progress.json.</p>';
      document.getElementById("export-btn").disabled = true;
      setupToolbar();
      return;
    }
    selectedCheckpointId = data.checkpoints[data.checkpoints.length - 1].id;
    buildCheckpointSelect();
    setupToolbar();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
