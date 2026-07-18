---
title: "Pseudo-Instructions: What the Assembler Adds"
order: 7
difficulty: intermediate
arch: riscv
trace:
  code:
    - "li   t0, 5          # li  -> addi t0, zero, 5"
    - "mv   t1, t0          # mv  -> addi t1, t0, 0"
    - "nop                  # nop -> addi zero, zero, 0"
    - "j    skip            # j   -> jal  zero, skip"
    - "li   t2, 42          # SKIPPED - j jumped over this line"
    - "skip: mv t3, t1      # mv  -> addi t3, t1, 0"
  steps:
    - { line: 0, pc: "0x00", regs: { t0: 5 }, note: "li t0, 5 is not a real instruction - the assembler emits addi t0, zero, 5. A small constant like 5 fits in the 12-bit immediate, so it takes exactly one real instruction." }
    - { line: 1, pc: "0x04", regs: { t1: 5 }, note: "mv t1, t0 becomes addi t1, t0, 0 - 'add zero' is how RISC-V spells 'copy a register,' since there's no dedicated copy instruction." }
    - { line: 2, pc: "0x08", note: "nop becomes addi zero, zero, 0 - add zero to the zero register and throw the result away. A real instruction that provably does nothing." }
    - { line: 3, pc: "0x0c", note: "j skip becomes jal zero, skip - a jal that links into the zero register, so the return address is computed and immediately discarded. A jump that never intends to come back." }
    - { line: 5, pc: "0x14", regs: { t3: 5 }, note: "Execution resumes at 'skip' - the line in between (li t2, 42) was jumped clean over and never ran. mv t3, t1 becomes addi t3, t1, 0." }
---

Every lesson so far has quietly used instructions that don't actually exist. `mv`,
`nop`, and even `ret` from
[functions and the calling convention]({{ '/code/05-functions-and-the-calling-convention/' | relative_url }})
never appear in the RISC-V hardware manual. They're **pseudo-instructions** —
convenient names the assembler recognizes and rewrites into the *real*
instructions the CPU actually decodes. This is
[the first assemblers']({{ '/history/02-first-assemblers/' | relative_url }})
mnemonic idea and [macros']({{ '/history/03-macros-and-abstraction/' | relative_url }})
one-line-for-many idea, both still doing their jobs in the tool you use today.

## Why the hardware doesn't just add these

RISC-V's base instruction set is deliberately tiny — that's the whole point of the
[RISC philosophy]({{ '/history/06-risc-revolution/' | relative_url }}): keep the
real instruction set small and uniform, and let software handle convenience. A
pseudo-instruction is where that trade shows up directly: instead of the chip
growing a `copy register` or `do nothing` instruction, the *assembler* expands a
friendlier name into instructions that already exist.

## The common ones

| You write | Assembler emits | What it really is |
|---|---|---|
| `mv   rd, rs` | `addi rd, rs, 0` | copy a register (add zero, keep the value) |
| `nop` | `addi zero, zero, 0` | do nothing, but take up one instruction slot |
| `li   rd, imm` | `addi rd, zero, imm` (small `imm`)<br>`lui`+`addi` (large `imm`) | load an immediate, however many real instructions that takes |
| `j    label` | `jal  zero, label` | jump, discarding the return address |
| `call label` | `jal  ra, label` (nearby)<br>`auipc`+`jalr` (far away) | call a function, however far away it is |
| `ret` | `jalr zero, 0(ra)` | return, using whatever `ra` holds |

Two patterns run through this whole table. First, several of these are the
*same* trick: `zero` is a real register hardwired to the value 0, so "add zero"
means copy, and "link into zero" means don't bother saving where you came from.
Second, `li` and `call` can quietly expand to **one instruction or two**,
depending on the argument — a 12-bit-immediate `li` needs just `addi`, but a
32-bit constant needs `lui` to set the high bits first. You write one line either
way; the assembler decides how many real instructions it costs.

## Why this matters: reading disassembly

This is mostly invisible until you look at *disassembled* machine code instead of
your own source — objdump output, a debugger, a simulator's instruction view. It
shows you the real instructions, so a `ret` you wrote becomes `jalr zero, 0(ra)`
on screen, and a `li` with a big constant shows up as two lines where you wrote
one. Knowing the expansion table means neither surprises you.

## Step through it

Watch the trace's `pc` column: five source lines produce five real instructions
at `0x00`–`0x14` — except `li t2, 42` never executes at all. `j skip` jumps
straight from `0x0c` to `0x14`, so that line's real instruction (`addi t2, zero,
42`) sits in memory but the CPU never reaches it. That's `jal zero, skip` at work:
a jump with nowhere to link the return address, exactly like `j` in the table
above.

## Try this

- What real instruction does `mv a0, a1` assemble to? (`addi a0, a1, 0` — add
  zero, i.e. copy.)
- Why can't `li t0, 100000` be a single `addi`? (`addi`'s immediate is only 12
  bits — about ±2047 — so a value that large needs `lui` to load the high bits
  before `addi` fills in the rest.)
- You disassemble a program and see `jalr zero, 0(ra)` where your source said
  something else. What did you write? (`ret` — that's exactly what it expands
  to.)

Pseudo-instructions are a kindness from the assembler, not a new part of the
machine — the CPU never sees `mv` or `ret`, only the `addi` and `jalr` underneath.
With that gap closed, the next lesson turns loose instructions into a *complete*
program: sections, directives, and how a label becomes a real address in memory.

{% include try-it.html %}
