---
title: "CISC and the Microcode Era: When Instructions Grew Ambitious"
order: 5
difficulty: intermediate
arch: history
---

[The birth of ISAs]({{ '/history/04-birth-of-isas/' | relative_url }}) made the
instruction set a thing people designed on purpose. So a design question followed
immediately: how *much* should a single instruction do? For roughly two decades
the answer trended one way — **more**. This is the CISC era, and the trick that
made it possible was a layer of software hiding *inside* the hardware.

## Instructions that do a lot

**CISC** stands for **Complex Instruction Set Computer** — though nobody called it
that until the rival idea needed a name. The philosophy: make each instruction
powerful, so a short program can express a lot. A CISC machine might offer a single
instruction that reads two values from memory, multiplies them, and writes the
result back to memory — all in one mnemonic.

Two pressures pushed in this direction:

- **Memory was scarce and slow.** Fewer, denser instructions meant smaller
  programs — a real win when every byte counted.
- **People still wrote assembly by hand.** An instruction that mirrored a
  high-level operation (`copy a string`, `call a procedure`) was a kindness to the
  programmer. The ISA reached *up* toward the language.

## Microcode: a computer inside the computer

Here's the catch. If one instruction does the work of five, the circuits have to
carry out five steps' worth of work — how? Building all that behavior directly in
hardwired logic, for hundreds of complex instructions, would be a nightmare to
design and impossible to fix.

The answer was **microcode**. Inside the CPU sits a tiny, fast, private memory
holding **microinstructions** — the truly primitive steps the hardware can do.
Each machine instruction you write is really a little *program* in this hidden
language:

```text
your program            microcode (inside the CPU)
──────────────          ─────────────────────────────
MULM  a, b, c    ──▶     load a from memory
                         load b from memory
                         multiply
                         store result to c
```

The processor **decodes** your instruction into a sequence of microinstructions
and runs them. This is a beautiful callback to
[macros]({{ '/history/03-macros-and-abstraction/' | relative_url }}): one written
line standing for many primitive steps — except the expansion now happens *in
silicon, at run time*, instead of in the assembler. Complex instructions became
cheap to add: you didn't rewire the chip, you just wrote more microcode.

## The high-water mark — and the hidden cost

The **VAX**, from DEC in 1977, is the era's monument. Its instruction set was
famously rich and orthogonal — it even had a single instruction to evaluate a
polynomial. Assembly programmers loved it. It felt like the ISA had finally caught
up with how people think.

But the ambition carried a bill that was easy to miss:

- Decoding variable-length, wildly different instructions is **slow and complex**.
- Microcode adds a layer of interpretation between your program and the real work.
- Most programs, it turned out, used only a **small, common subset** of all those
  fancy instructions — while every program paid the decoding tax on all of them.
- And by now **compilers**, not humans, were emitting most assembly — and
  compilers found the exotic instructions hard to use anyway.

## What to take away

- **CISC** made each instruction do a lot, driven by scarce memory and hand
  assembly programmers — the ISA reaching up toward high-level languages.
- **Microcode** made that affordable: complex instructions were decoded into
  sequences of hidden primitive steps, a macro-expansion happening inside the chip
  at run time.
- The **VAX** was the peak of the philosophy — gorgeous to program, but paying a
  steady tax in decode complexity for instructions most programs rarely used.
- That mismatch — paying for complexity you mostly don't use, now that compilers
  wrote the code — set up a sharp counter-question: what if we made instructions
  *simpler* and *faster* instead? That's the RISC revolution, and it's why this
  site teaches RISC-V.
