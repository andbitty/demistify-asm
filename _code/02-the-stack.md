---
title: "The Stack: Saving Values Across a Call"
order: 2
difficulty: intermediate
arch: riscv
trace:
  code:
    - "addi sp, sp, -16     # make room: grow the stack down"
    - "sw   ra, 12(sp)      # save return address"
    - "sw   s0, 8(sp)       # save callee-saved s0"
    - "addi s0, zero, 42    # ... do work, clobbering s0"
    - "lw   s0, 8(sp)       # restore s0"
    - "lw   ra, 12(sp)      # restore return address"
    - "addi sp, sp, 16      # release the frame"
  steps:
    - { line: 0, regs: { sp: "0x7fb0" }, note: "The stack grows downward. Subtracting 16 reserves a 16-byte frame." }
    - { line: 1, regs: { sp: "0x7fb0", ra: "0x104" }, mem: { "0x7fbc": "0x104 (ra)" }, note: "sw stores a word to memory: ra is saved at sp+12." }
    - { line: 2, mem: { "0x7fbc": "0x104 (ra)", "0x7fb8": "old s0" }, regs: { s0: "old s0" }, note: "s0 is callee-saved, so we preserve the caller's value at sp+8." }
    - { line: 3, regs: { s0: 42 }, note: "Now we're free to clobber s0 for our own work." }
    - { line: 4, regs: { s0: "old s0" }, note: "lw loads it back: the caller's s0 is restored, untouched." }
    - { line: 5, regs: { ra: "0x104" }, note: "Restore the return address so we can return to the right place." }
    - { line: 6, regs: { sp: "0x7fc0" }, note: "Add 16 back: the frame is gone and sp is exactly where we started." }
---

Registers are fast but few. The moment you call another function, you face a
problem: it might overwrite the registers *you* were using. The **stack** is the
shared scratch space that solves this.

## The shape of a stack frame

The stack pointer `sp` marks the top of the stack, and on RISC-V the stack
**grows downward** — toward lower addresses. So you reserve space by
*subtracting*:

```text
addi sp, sp, -16      # allocate 16 bytes
...                   # use the frame
addi sp, sp, 16       # free it — must balance exactly
```

`sw` (store word) writes a register to memory; `lw` (load word) reads it back:

```text
sw  ra, 12(sp)        # mem[sp + 12] = ra
lw  ra, 12(sp)        # ra = mem[sp + 12]
```

## Caller-saved vs callee-saved

RISC-V's calling convention splits registers into two camps:

| Kind | Examples | Rule |
|------|----------|------|
| callee-saved | `s0`–`s11`, `sp`, `ra` | If you use one, you must restore it before returning. |
| caller-saved | `t0`–`t6`, `a0`–`a7` | Free to clobber; the caller saves them if it cares. |

This lesson's trace saves `ra` and `s0` because they're callee-saved — watch the
**memory** panel light up as each is pushed, then the **registers** panel as each
is restored. By the final step, `sp` is back exactly where it began: a balanced
frame is the contract.

## Try this

- What breaks if you forget the final `addi sp, sp, 16`? (The stack "leaks" —
  every call drifts `sp` further down.)
- Why save `ra` at all? (A nested call would overwrite it, and you'd lose your
  way home.)

{% include try-it.html %}
