---
layout: default
title: "Running RISC-V Yourself"
description: "A beginner's guide to running the RISC-V assembly from these lessons in a free browser-based simulator — no install required."
permalink: /run/
---

<div class="prose page-narrow">

<h1>Running RISC-V yourself</h1>

You've been reading programs here and watching them execute in the step-through
visualizer. That visualizer is *hand-traced* — it shows you exactly what should
happen, but it isn't a real machine. This page shows you how to run the same code
on an actual RISC-V simulator, free, in your browser, so you can change it, break
it, and see what really happens.

## The tool: {{ site.sim_name }}

<a href="{{ site.sim_url }}" target="_blank" rel="noopener"><strong>{{ site.sim_name }}</strong></a> is a
RISC-V assembler and simulator that runs entirely in your browser — nothing to
install, works on any operating system. It gives you an editor, a **Run** button,
a **Step** button (one instruction at a time, just like our visualizer), and live
panels for the registers and memory.

## Three steps to your first run

1. **Open <a href="{{ site.sim_url }}" target="_blank" rel="noopener">{{ site.sim_name }}</a>.**
   You'll land on an editor with some example code.
2. **Replace it** with the program below (clear the editor, then paste).
3. **Press Run.** Then find the **Registers** panel and read off the result.

### A program that's guaranteed to work

Start with this — it adds two numbers and leaves the answer in a register, so you
get a guaranteed success before pasting anything more complicated:

```text
# add two numbers and inspect the result in the Registers panel
addi t0, zero, 5       # t0 = 5
addi t1, zero, 3       # t1 = 3
add  a0, t0, t1        # a0 = 8
```

Run it, then look at register **a0** in the Registers panel — it should read `8`.
Change the `5` and `3`, run again, and watch the number follow. That's the whole
loop: edit, run, read the registers.

Once that works, come back to any [Hands-On RISC-V]({{ '/' | relative_url }}#code)
lesson, copy its program from the **Try it yourself** box, and run it the same way.
Use **Step** instead of **Run** to walk it one instruction at a time and compare
each move against the lesson's trace.

## A few gotchas

- **Some lesson snippets are fragments.** Our traces sometimes show just the few
  instructions that make a point, without a way to stop. If the simulator complains
  that it "ran off the end," add a terminating environment call — the simulator's
  help lists the exact `ecall` code it expects for *exit*. (We cover `ecall`
  properly in a later lesson.)
- **Labels need the whole loop.** If a snippet branches to a label like `loop:`,
  paste the entire loop, not just the body, so the label is defined.
- **It's a learning tool, not silicon.** A simulator is an idealized model. It's
  perfect for understanding instructions; real hardware adds timing, caches, and
  pipelines a simulator glosses over.

## Going further

When you outgrow the browser, the real thing is a local **RISC-V toolchain** — an
assembler (`gcc`/`as`) plus an emulator like **QEMU** or **Spike** — which runs
assembly the same way an actual RISC-V chip would. That's a heavier setup than a
browser tab, so it's worth saving until you want it. For learning the instructions,
<a href="{{ site.sim_url }}" target="_blank" rel="noopener">{{ site.sim_name }}</a> is all
you need.

</div>
