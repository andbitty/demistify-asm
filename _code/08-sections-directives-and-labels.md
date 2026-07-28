---
title: "Anatomy of a Program: Sections, Directives, and Labels"
order: 8
difficulty: intermediate
arch: riscv
---

Every program so far has been a loose handful of instructions, with any data —
like the array in [talking to memory]({{ '/code/04-talking-to-memory/' | relative_url }}) —
simply asserted to already be sitting at some address (`a0` holds `0x2000`,
promise). Real assembly source has to say where its instructions and its data
actually live, and give the assembler enough structure to work that out itself.
That's the job of **sections** and **directives** — lines that talk to the
assembler, not the CPU.

## Directives aren't instructions

Everything you've written until now assembles into a real instruction the CPU
decodes — even [pseudo-instructions]({{ '/code/07-pseudo-instructions/' | relative_url }})
expand into real ones. A **directive** is different: it's a line starting with
`.` that tells the *assembler* how to lay out the program, and produces no
instruction of its own. You've been quietly trusting the assembler to place code
somewhere in memory this whole time — directives are how you tell it what else to
place, and where.

## Two sections: code and data

Programs keep two different kinds of content, and RISC-V assembly separates them
with directives:

```text
.text                 # what follows is instructions
.data                 # what follows is data
```

`.text` marks executable code — everything you've written in every lesson so far
lives here. `.data` marks storage — numbers, bytes, strings — that instructions
will read and write but never execute. Splitting them isn't just tidiness: on
real hardware, the `.text` section is typically marked read-only and
non-writable, and `.data` is marked non-executable. Code that tried to modify
itself, or data that got mistakenly *run* as instructions, is exactly the kind
of bug — or exploit — that this separation guards against.

## Declaring data

Inside `.data`, a directive reserves space and optionally fills it:

```text
nums:   .word  10, 32, 7    # three 4-byte words, initialized
flag:   .byte  1             # one byte
msg:    .asciz "hi"          # bytes 'h', 'i', 0  (null-terminated string)
buf:    .word  0             # one word of scratch space, initialized to 0
```

| Directive | Reserves | Typical use |
|---|---|---|
| `.word` | 4 bytes each | integers, addresses — the array from lesson 4 |
| `.byte` | 1 byte each | raw bytes, small counters |
| `.asciz` | one byte per character, plus a trailing `0` | C-style strings |

Each name on the left (`nums`, `flag`, `msg`, `buf`) is a **label** — and a label
in `.data` works exactly like a label in `.text`. It doesn't hold a value; it
*names an address*, the address where that data starts. `nums` isn't the number
10 — it's wherever the assembler decided to put these three words in memory.

## Labels are addresses, not shortcuts

[The first assemblers]({{ '/history/02-first-assemblers/' | relative_url }})
introduced labels so you could write `loop:` instead of tracking raw addresses
by hand for branches. The same mechanism works for data — `nums:` is just a
name for a number the assembler computes. That raises a question lesson 4 sidestepped:
how do you get that address into a register?

```text
la   a0, nums         # a0 = address of nums
```

`la` (load address) is another pseudo-instruction, alongside `li`/`mv`/`ret`
from [lesson 7]({{ '/code/07-pseudo-instructions/' | relative_url }}). It expands
to `auipc`+`addi` or `lui`+`addi`, the same "however many instructions it takes"
trick `li` uses for large constants — because an address, like any 32-bit value,
often doesn't fit in one 12-bit immediate. You write one line; the label's
address, whatever it turns out to be, is what lands in the register.

## Making a label visible: `.globl`

One more directive controls which label the *outside world* can see — where
execution actually begins:

```text
.globl _start
```

`.globl` exports a label so the assembler/linker treats it as an entry point or
a symbol other files could reference. `_start` is the conventional name for
"where the program begins" — without marking some label `.globl`, nothing tells
the tool where to start running your `.text` section.

## Putting it together: a complete program

Here's lesson 4's array sum again, now as a real, self-contained program instead
of a fragment that assumes `a0` and the array already exist:

```text
.data
nums:   .word  10, 32, 7     # the array itself, 3 words

.text
.globl _start
_start:
        la   a0, nums         # a0 = address of nums (no more magic 0x2000)
        addi t2, zero, 3      # t2 = element count
        addi t0, zero, 0      # sum = 0
loop:   lw   t1, 0(a0)        # read the element a0 points at
        add  t0, t0, t1       # accumulate
        addi a0, a0, 4        # march the pointer to the next word
        addi t2, t2, -1       # count down the remaining elements
        bne  t2, zero, loop   # go again until none are left
        # sum is now in t0 — the program has nowhere left to go yet
```

Everything about the loop body is unchanged from lesson 4. What's new is
everything *around* it: `.data` gives the array a real home, `nums` names its
address instead of a hand-picked number, and `.globl _start` says where
execution begins. That last comment is honest — this program still has no way
to print `t0` or exit cleanly. It just runs off the end, which the simulator will
flag exactly the way the [running guide's gotchas]({{ '/run/' | relative_url }})
describe.

## Try this

- If `nums: .word 10, 32, 7` starts at address `0x2000`, what address does `la
  a0, nums` load, and what's at `0x2008`? (`0x2000` — the *address* of the first
  word, not its value; `0x2008` holds `7`, the third word, 8 bytes in.)
- Why put `.data` before `.text` here, when `_start` runs first either way?
  (Order in the source doesn't decide execution order — `.globl _start` and the
  labels do. Section order is just where you chose to write them.)
- What would `msg: .asciz "hi"` and `.word 0` collide on if you swapped which
  section they were in? (Nothing would collide, but putting them in `.text`
  would mean the CPU could try to *execute* the bytes of `"hi"` as instructions
  — exactly the mixing `.data`/`.text` exists to prevent.)

A program is no longer a leap of faith about what's already in memory — `.data`
declares it, labels name it, and `la` reaches it. The one gap left is that
honest comment above: this program computes an answer with no way to show it or
stop. The next lesson closes that gap with `ecall`, the RISC-V ABI for asking
the operating environment to print a value and exit.

{% include try-it.html %}
