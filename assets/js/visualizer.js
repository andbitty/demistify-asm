/* Step-through execution visualizer.
   Reads the trace JSON injected by the lesson layout (#trace-data) and plays it:
   highlights the active line, renders register/memory/flag panels, and
   diff-highlights whatever changed since the previous step.

   Trace shape:
     { code: ["...", ...],
       steps: [ { line, regs:{}, mem:{}, flags:{}, note }, ... ] }
   Any state key omitted on a step is carried forward from the previous step. */

(function () {
  const dataEl = document.getElementById("trace-data");
  const root = document.querySelector(".viz");
  if (!dataEl || !root) return;

  let trace;
  try { trace = JSON.parse(dataEl.textContent); } catch (e) { return; }
  const steps = Array.isArray(trace.steps) ? trace.steps : [];
  if (steps.length === 0) return;

  const lines = [...root.querySelectorAll(".viz-lines li")];
  const panels = {
    regs: root.querySelector('[data-panel="regs"]'),
    mem: root.querySelector('[data-panel="mem"]'),
    flags: root.querySelector('[data-panel="flags"]'),
  };
  const noteEl = root.querySelector('[data-viz="note"]');
  const counterEl = root.querySelector('[data-viz="counter"]');
  const scrub = root.querySelector('[data-viz="scrub"]');
  const btn = (n) => root.querySelector(`[data-viz="${n}"]`);

  // Pre-compute the *cumulative* state at each step (carry-forward) plus the
  // set of keys that changed at that step (for diff highlighting).
  const frames = [];
  let acc = { regs: {}, mem: {}, flags: {} };
  for (const step of steps) {
    const changed = { regs: new Set(), mem: new Set(), flags: new Set() };
    for (const panel of ["regs", "mem", "flags"]) {
      const incoming = step[panel] || {};
      for (const k of Object.keys(incoming)) {
        if (String(acc[panel][k]) !== String(incoming[k])) changed[panel].add(k);
        acc[panel] = { ...acc[panel], [k]: incoming[k] };
      }
    }
    // pc is treated as a flag-ish value for display convenience
    if (step.pc !== undefined) {
      if (String(acc.flags.pc) !== String(step.pc)) changed.flags.add("pc");
      acc.flags = { ...acc.flags, pc: step.pc };
    }
    frames.push({
      line: step.line,
      note: step.note || "",
      state: { regs: { ...acc.regs }, mem: { ...acc.mem }, flags: { ...acc.flags } },
      changed,
    });
  }

  let i = 0;
  let timer = null;

  // Fire once per page view, on the first real interaction — tells us
  // whether the "interactive" tag on a lesson card actually gets used.
  let engaged = false;
  function markEngaged() {
    if (engaged) return;
    engaged = true;
    if (typeof window.dasmTrack === "function") {
      const grid = document.querySelector("[data-lesson-id]");
      window.dasmTrack("trace_engaged", { lesson: grid ? grid.dataset.lessonId : null, steps: frames.length });
    }
  }

  // Trace values are author-controlled, but escape anyway so a stray < or &
  // can never break markup (or inject anything if a trace is ever sourced externally).
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function renderPanel(name, obj, changed) {
    const el = panels[name];
    if (!el) return;
    const keys = Object.keys(obj);
    if (keys.length === 0) { el.innerHTML = '<span class="empty-note">—</span>'; return; }
    el.innerHTML = keys.map((k) => {
      const cls = changed.has(k) ? "cell changed" : "cell";
      return `<span class="${cls}"><span class="k">${esc(k)}</span><span class="v">${esc(obj[k])}</span></span>`;
    }).join("");
  }

  function render() {
    const f = frames[i];
    lines.forEach((li) => li.classList.toggle("active", Number(li.dataset.line) === f.line));
    renderPanel("regs", f.state.regs, f.changed.regs);
    renderPanel("mem", f.state.mem, f.changed.mem);
    renderPanel("flags", f.state.flags, f.changed.flags);
    noteEl.textContent = f.note;
    counterEl.textContent = `${i + 1} / ${frames.length}`;
    scrub.value = String(i);
    btn("first").disabled = i === 0;
    btn("prev").disabled = i === 0;
    btn("next").disabled = i === frames.length - 1;
  }

  function go(n) { i = Math.max(0, Math.min(frames.length - 1, n)); render(); }
  function stop() { if (timer) { clearInterval(timer); timer = null; btn("play").setAttribute("aria-pressed", "false"); btn("play").textContent = "▶ play"; } }
  function play() {
    if (timer) return stop();
    if (i === frames.length - 1) go(0);
    btn("play").setAttribute("aria-pressed", "true");
    btn("play").textContent = "⏸ pause";
    timer = setInterval(() => { if (i >= frames.length - 1) { stop(); } else { go(i + 1); } }, 1100);
  }

  scrub.max = String(frames.length - 1);
  btn("first").addEventListener("click", () => { markEngaged(); stop(); go(0); });
  btn("prev").addEventListener("click", () => { markEngaged(); stop(); go(i - 1); });
  btn("next").addEventListener("click", () => { markEngaged(); stop(); go(i + 1); });
  btn("play").addEventListener("click", () => { markEngaged(); play(); });
  scrub.addEventListener("input", () => { markEngaged(); stop(); go(Number(scrub.value)); });

  // Keyboard: arrows step, space plays — only when the visualizer is in view/focus.
  root.setAttribute("tabindex", "0");
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { markEngaged(); e.preventDefault(); stop(); go(i + 1); }
    else if (e.key === "ArrowLeft") { markEngaged(); e.preventDefault(); stop(); go(i - 1); }
    else if (e.key === "Home") { markEngaged(); e.preventDefault(); stop(); go(0); }
    else if (e.key === " ") { markEngaged(); e.preventDefault(); play(); }
  });

  render();
})();
