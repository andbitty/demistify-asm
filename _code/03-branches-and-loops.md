---
title: "Branches and Loops: Making Decisions"
order: 3
difficulty: beginner
arch: riscv
trace:
  code:
    - "addi t0, zero, 3      # t0 = counter, start at 3"
    - "addi t1, zero, 0      # t1 = sum"
    - "add  t1, t1, t0       # loop: sum += counter"
    - "addi t0, t0, -1       # counter -= 1"
    - "bne  t0, zero, loop   # counter != 0? jump back to loop"
  steps:
    - { line: 0, pc: "0x00", regs: { t0: 3 }, note: "Set up the countdown counter: t0 = 3." }
    - { line: 1, pc: "0x04", regs: { t1: 0 }, note: "The accumulator starts empty: t1 = 0." }
    - { line: 2, pc: "0x08", regs: { t1: 3 }, note: "First pass through the loop body: sum += counter, so t1 = 0 + 3 = 3." }
    - { line: 3, pc: "0x0c", regs: { t0: 2 }, note: "Decrement the counter: t0 = 2." }
    - { line: 4, pc: "0x10", note: "bne compares t0 to zero. 2 != 0, so the branch is taken — watch pc jump back." }
    - { line: 2, pc: "0x08", regs: { t1: 5 }, note: "Back at the top, same instruction, new values: t1 = 3 + 2 = 5." }
    - { line: 3, pc: "0x0c", regs: { t0: 1 }, note: "Counter down to 1." }
    - { line: 4, pc: "0x10", note: "1 != 0 — branch taken again, pc returns to the loop body." }
    - { line: 2, pc: "0x08", regs: { t1: 6 }, note: "Final pass: t1 = 5 + 1 = 6." }
    - { line: 3, pc: "0x0c", regs: { t0: 0 }, note: "Counter hits 0." }
    - { line: 4, pc: "0x10", note: "Now t0 == 0, so bne does NOT branch — execution falls through. The loop exits with t1 = 6." }
---

So far every program ran straight down the page, one instruction after the next.
Real programs need to **choose** and **repeat**. Both come from the same tool: a
branch that, depending on a comparison, changes which instruction runs next.

## The program counter

The CPU tracks where it is with the **program counter** (`pc`) — the address of
the instruction it's about to run. Normally `pc` just steps forward by one
instruction each cycle. A **branch** is simply an instruction that can *set* `pc`
to somewhere else, so the next step jumps instead of falling through.

## Conditional branches

RISC-V's branches compare two registers and jump only if the test holds:

```text
beq  rs1, rs2, label   # branch if rs1 == rs2  (EQual)
bne  rs1, rs2, label   # branch if rs1 != rs2  (Not Equal)
blt  rs1, rs2, label   # branch if rs1 <  rs2  (Less Than, signed)
bge  rs1, rs2, label   # branch if rs1 >= rs2  (Greater or Equal)
```

The `label` is a name for a target instruction — the assembler turns it into the
right `pc` offset for you (exactly the bookkeeping the
[first assemblers]({{ '/history/02-first-assemblers/' | relative_url }}) were
invented to do). If the condition is false, the branch is ignored and execution
simply continues to the next line.

## Building a loop

A loop is nothing more than a backward branch. Put a label at the top of the
body, do some work, then branch back to that label while a condition still holds:

```text
        addi t0, zero, 3      # counter
        addi t1, zero, 0      # sum
loop:   add  t1, t1, t0       # body: accumulate
        addi t0, t0, -1       # move toward the exit condition
        bne  t0, zero, loop   # repeat until the counter reaches 0
```

Three pieces show up in almost every loop: an **initial value**, a **body** that
makes progress, and a **branch** that decides whether to go again. Forget the
progress step and you've written an infinite loop.

## Step through it

Use the visualizer above and keep an eye on the **pc & flags** panel. Press
**step ▶** and watch `pc` climb `0x00 → 0x04 → …` until the `bne` fires — then it
snaps *backward* to `0x08`. That jump is the whole idea of a loop made visible:
the same three instructions run three times, summing 3 + 2 + 1 = 6 in `t1`.

## Try this

- Change the branch to `beq t0, zero, loop`. What happens? (It loops only when
  the counter *is* zero — so the body runs once and exits. Reversing the
  condition reverses the behavior.)
- How would you sum 1 through 10 instead? (Start the counter at 10 — the body and
  branch don't change at all.)
- What if you delete the `addi t0, t0, -1`? (The counter never reaches 0, the
  branch is always taken, and the loop never ends.)

Branches are the last primitive you need. Straight-line code, a way to repeat,
and a way to choose — every program you'll ever write is built from just these.

{% include try-it.html %}
