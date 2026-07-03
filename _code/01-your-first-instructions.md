---
title: "Your First Instructions: Registers and add"
order: 1
difficulty: beginner
arch: riscv
trace:
  code:
    - "addi t0, zero, 5      # t0 = 0 + 5"
    - "addi t1, zero, 3      # t1 = 0 + 3"
    - "add  t2, t0, t1       # t2 = t0 + t1"
    - "addi t2, t2, 10       # t2 = t2 + 10"
  steps:
    - { line: 0, pc: "0x00", regs: { t0: 5 }, note: "addi loads an immediate. zero is always 0, so t0 = 5." }
    - { line: 1, pc: "0x04", regs: { t1: 3 }, note: "Same trick: t1 = 0 + 3 = 3." }
    - { line: 2, pc: "0x08", regs: { t2: 8 }, note: "add sums two registers: t2 = t0 + t1 = 8." }
    - { line: 3, pc: "0x0c", regs: { t2: 18 }, note: "Reusing t2 as both source and destination: t2 = 8 + 10 = 18." }
---

Assembly works on **registers** — a small set of ultra-fast slots inside the
CPU. RISC-V gives you 32 integer registers. Forget memory for now: registers
are where the action happens.

## The instruction you'll use most

```text
addi  rd, rs1, imm     # rd = rs1 + imm   (imm is a constant baked into the instruction)
add   rd, rs1, rs2     # rd = rs1 + rs2   (both inputs are registers)
```

Two conventions make these click:

- **Destination first.** `addi t0, zero, 5` means *"t0 gets zero + 5"*, not the
  other way around. The first operand is always where the result lands.
- **`zero` is hard-wired to 0.** RISC-V register `x0` always reads as 0 and
  ignores writes. That's why `addi t0, zero, 5` is the idiomatic way to say
  "put the constant 5 in t0" — there's no separate "load constant" instruction.

## Step through it

Use the visualizer above. Press **step ▶** (or the → key) and watch the
**registers** panel: each instruction lights up the register it changes. Notice
how the last instruction reads *and* writes `t2` in one go — registers are just
named storage, nothing stops you reusing one.

## Try this

- Predict the value of `t2` before revealing the last step. Did the carry-forward
  match your mental model?
- What would `add t2, t2, t2` do as a 5th instruction? (Doubling — `t2` becomes
  its own two inputs.)

That's the whole game at the bottom: tiny, explicit steps moving numbers between
named slots. Everything else — loops, functions, memory — is built from this.

{% include try-it.html %}
