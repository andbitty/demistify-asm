/* Lightweight progress tracking — no backend, no accounts.
   Marks the current lesson as visited in localStorage and reflects ✓ on any
   lesson links/cards that carry a data-progress-id. Degrades silently if
   storage is unavailable (private mode, etc.). */

(function () {
  const KEY = "dasm:visited";

  // Fires a GA4 custom event if analytics is loaded (production only); a
  // silent no-op otherwise, e.g. local dev or an ad blocker.
  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }
  window.dasmTrack = track;

  function load() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); }
    catch (e) { return new Set(); }
  }
  function save(set) {
    try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch (e) {}
  }

  const visited = load();

  // Mark the lesson we're currently on (the lesson-grid carries its id).
  const grid = document.querySelector("[data-lesson-id]");
  const lessonId = grid ? grid.dataset.lessonId : null;
  if (lessonId) { visited.add(lessonId); save(visited); }

  // Reflect ✓ everywhere a progress id appears (TOC + landing cards).
  document.querySelectorAll("[data-progress-id]").forEach((el) => {
    if (visited.has(el.dataset.progressId)) el.classList.add("is-visited");
  });

  // Any explicitly tagged element (e.g. the "try it yourself" simulator
  // link) reports its own event name on click.
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-track]");
    if (el) track(el.dataset.track, { lesson: lessonId });
  });

  // Links that cross from this page's track into the other one (history <->
  // code) — lets us see whether an in-prose cross-link actually gets used,
  // without hand-tagging every occurrence in the markdown.
  if (lessonId) {
    const track_name = lessonId.split("/")[0];
    const otherTrack = track_name === "history" ? "code" : track_name === "code" ? "history" : null;
    if (otherTrack) {
      document.querySelectorAll(`.prose a[href^="/${otherTrack}/"]`).forEach((a) => {
        a.addEventListener("click", () => track("cross_track_click", { from: lessonId, to: a.getAttribute("href") }));
      });
    }
  }

  // Toggle the TOC on mobile.
  const toc = document.querySelector(".toc");
  const tocToggle = toc && toc.querySelector(".toc-toggle");
  if (tocToggle) {
    tocToggle.addEventListener("click", () => {
      const open = toc.classList.toggle("open");
      tocToggle.setAttribute("aria-expanded", String(open));
    });
  }
})();
