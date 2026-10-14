# Demystifying Assembly

> *Mind the ch·asm between you and the machine.*

An interactive, beginner-to-advanced guide to assembly language — built with
[Jekyll](https://jekyllrb.com/) and hosted on GitHub Pages.

- **History** track — how assembly evolved, from switches and punch cards onward.
- **Hands-On RISC-V** track — write real assembly and **step through it**
  instruction by instruction, watching registers, memory, and the PC change.

The step-through visualizer uses hand-authored execution traces (no emulator),
so the whole site stays static and works offline.

## Project layout

```
_config.yml          site config + collections + the privacy exclude list
_data/tracks.yml     defines the tracks and their order — single source of truth
_history/  _code/    one markdown file per lesson (the two learning tracks)
_layouts/            default + lesson page templates
_includes/           visualizer markup
assets/css/          terminal.scss  (compiled to /assets/css/terminal.css)
assets/js/           visualizer.js, progress.js, effects.js
_internal/           PRIVATE notes/design docs — git-ignored, never published
```

## Add a lesson

Drop a markdown file in `_history/` or `_code/` with front matter:

```yaml
---
title: "Your title"
order: 3                 # position within the track
difficulty: beginner     # beginner | intermediate | advanced
arch: riscv
trace:                   # optional — include only for interactive lessons
  code:
    - "addi t0, zero, 5"
  start:                 # optional — values that exist before line 0 runs
    regs: { sp: "0x7fc0" }
  steps:
    - { line: 0, regs: { t0: 5 }, note: "..." }
---
```

Navigation, prev/next, the "N of M" counter, and the progress bar are all
derived from `order` — no template edits needed. Omitted state in a step
carries forward from the previous step. The visualizer opens on a "start" frame before
line 0: empty, or the `start` values if you give them.

Add a whole new track by appending an entry to `_data/tracks.yml` and creating
a matching `_<id>/` collection in `_config.yml`.

## Preview locally

Requires Ruby + Bundler. Then:

```bash
bundle install
bundle exec jekyll serve --livereload
# open http://127.0.0.1:4000
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   then pick your branch (e.g. `main`) and `/ (root)`.
3. If it's a *project* page (`user.github.io/demistify-asm`), set in `_config.yml`:
   ```yaml
   url: "https://<user>.github.io"
   baseurl: "/demistify-asm"
   ```
   For a *user/org* page (`user.github.io`), leave `baseurl: ""`.

GitHub builds the Jekyll site for you — no Actions workflow required.

## Privacy of internal docs

Anything under `_internal/` is **git-ignored** (never pushed) and **excluded from
the Jekyll build** (never published). Keep design docs and private notes there.
