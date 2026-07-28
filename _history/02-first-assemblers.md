---
title: "The First Assemblers: Mnemonics, Labels, and Symbolic Code"
order: 2
difficulty: beginner
arch: history
---

Lesson 1 left us hand-translating algorithms into raw numbers and recomputing
addresses by hand. The fix was to write a program that did the bookkeeping for
us — an **assembler**. It's one of the oldest pieces of software still
recognizable today.

## Names instead of numbers

The first idea was small and enormous at once: let the programmer write a short
**mnemonic** — a pronounceable name — for each operation, and have a program
translate it back to the opcode the CPU expects.

```text
LOAD  60        ; assembler emits the numeric opcode for "load"
ADD   61        ; ... and for "add"
STORE 62
```

Each mnemonic maps one-to-one onto a single machine instruction. Nothing is
hidden and nothing is optimized away — the assembler is a *translator*, not a
compiler. But `ADD` is something you can still read an hour later, and that
alone changed how much program a person could hold in their head.

## Labels: the end of address arithmetic

The deeper win was **labels**. Recall lesson 1's worst pain: insert one
instruction near the top and every jump target below it shifts, so you
re-compute addresses by hand. Labels make that the assembler's job.

```text
loop:   LOAD  count
        SUB   one
        STORE count
        JNZ   loop      ; jump to wherever "loop:" ended up
```

You name a location once; the assembler figures out its final address and patches
every reference. Insert ten instructions above `loop:` and your code still
assembles correctly — the names don't move even though the numbers do. This is
exactly the bookkeeping a human used to do by eye, now done perfectly every time.

## Where this actually happened

- **EDSAC (1949)** booted with a set of *initial orders* — a tiny bootstrap
  routine, often called the first assembler. It read symbolic instructions from
  paper tape and placed them in memory with relative addresses resolved for you.
- **Maurice Wilkes** and his group coined much of the surrounding vocabulary,
  including the idea of reusable *subroutines* stored in a library.
- For the IBM 650, **SOAP** (Symbolic Optimal Assembly Program, 1955) even chose
  memory locations to minimize drum-rotation delay — an assembler doing a little
  optimization of *placement*, though never of your logic.

## What to take away

- An assembler is automated clerical work: mnemonics in, opcodes out; labels in,
  addresses out. The machine code it produces is exactly what you specified.
- Mnemonics made code *readable*; labels made it *editable*. Together they're why
  programs could finally grow past a few dozen lines.
- The leap from here is letting one written line stand for *many* instructions —
  macros, and eventually higher-level languages. That's the next thread to pull.

Want mnemonics and labels in your own hands instead of on the page? The code
track starts at
[Your First Instructions]({{ '/code/01-your-first-instructions/' | relative_url }}),
and its label mechanics get the full treatment in
[Sections, Directives, and Labels]({{ '/code/08-sections-directives-and-labels/' | relative_url }}).
