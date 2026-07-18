---
title: "The RISC Revolution: Make the Common Case Fast"
order: 6
difficulty: intermediate
arch: history
---

[CISC and microcode]({{ '/history/05-cisc-and-microcode/' | relative_url }}) left
a mismatch out in the open: chips paid a steady decoding tax for hundreds of exotic
instructions, while real programs — increasingly written by compilers, not
people — leaned on a small, plain subset. In the late 1970s and early 1980s,
researchers at Berkeley and Stanford asked a blunt question: what if you designed
for the instructions programs actually use, and threw the rest away?

## The measurement that started it

Compiler studies of the era kept turning up the same fact: a handful of simple
instructions — loads, stores, adds, branches — accounted for the overwhelming
majority of dynamic execution. The rarely-used complex instructions weren't
pulling their weight; they were mostly there for assembly programmers who, by
this point, barely existed anymore.

That observation has a name: **make the common case fast**. If 90% of the work
runs through 10% of the instructions, spend your transistor budget making *those*
fast, even if it means the remaining 10% of work gets slower or disappears
entirely.

## RISC: simpler instructions, straight through the pipe

**RISC** — **Reduced Instruction Set Computer** — flipped the CISC philosophy on
every axis:

| | CISC | RISC |
|---|---|---|
| Instructions | many, variable-length, variable-cost | few, fixed-length, uniform cost |
| Memory access | almost any instruction can touch memory | only dedicated `load`/`store` do |
| Execution model | microcoded — one instruction, many hidden steps | direct — one instruction, (about) one step |
| Who benefits | hand-written assembly | compilers and pipelining |

The **load-store architecture** is the concrete design rule underneath this:
arithmetic instructions only ever touch registers. If you want to add a value from
memory, you first `load` it into a register, then `add`. No instruction is allowed
to reach into memory *and* do arithmetic in the same breath — the thing CISC's
`MULM` from the previous lesson did in one step. That restriction is what makes
every instruction cheap and predictable to decode: no more little program hiding
inside a microcode ROM, because none is needed.

## Pipelining: the payoff for uniformity

Fixed-length, uniform-cost instructions unlock a trick that variable, microcoded
ones can't: **pipelining**. Instead of finishing one instruction completely before
starting the next, the CPU overlaps them — while instruction 1 executes,
instruction 2 decodes, and instruction 3 fetches, all in the same cycle, like a
factory assembly line where each station always has work of the same shape moving
through it.

Pipelining is *why* RISC chased simplicity so hard. A CISC instruction that might
take two cycles or twenty, and might or might not touch memory mid-execution, is
awkward to slot into a uniform pipeline. A RISC instruction that always looks the
same shape is exactly the kind of part an assembly line wants.

## Where this actually happened

- **Berkeley RISC** (1980, under David Patterson) coined the term itself and
  introduced *register windows*, a scheme to make function calls cheap without
  spilling to memory.
- **Stanford MIPS** (John Hennessy's project, name standing for *Microprocessor
  without Interlocked Pipeline Stages*) pushed pipelining as *the* organizing
  principle, leaning on the compiler to keep the pipeline fed correctly.
- Both projects fed directly into commercial ISAs — MIPS itself, and later SPARC,
  PowerPC, ARM — that carried the load-store, fixed-length philosophy into
  mainstream hardware through the 1980s and 90s.

## What to take away

- Measurement showed most program execution ran through a small set of simple
  instructions — the exotic CISC instructions were mostly unused overhead.
- **RISC** designs for that common case: few instructions, fixed length, and a
  strict **load-store** rule that keeps arithmetic and memory access separate.
- The reward is **pipelining** — overlapping instruction execution like an
  assembly line — which uniform instructions make practical and microcoded ones
  don't.
- RISC won the *design philosophy* argument decisively. But "an open ISA that
  embodies these ideas, that anyone can build without a license" is a separate
  question — and answering it is what makes today's dominant open RISC ISA worth
  a lesson of its own.
