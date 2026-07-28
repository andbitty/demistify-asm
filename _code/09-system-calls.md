---
title: "System Calls: Printing and Exiting with ecall"
order: 9
difficulty: advanced
arch: riscv
trace:
  code:
    - "la   a1, msg          # a1 = address of the string"
    - "addi a0, zero, 4      # a0 = 4  (syscall: print_string)"
    - "ecall                 # ask the environment to print msg"
    - "addi a0, zero, 10     # a0 = 10 (syscall: exit)"
    - "ecall                 # ask the environment to stop"
  steps:
    - { line: 0, pc: "0x00", regs: { a1: "0x3000" }, note: "Point a1 at the string in .data - the argument the print_string syscall expects." }
    - { line: 1, pc: "0x04", regs: { a0: 4 }, note: "Load the syscall number itself into a0. This isn't the string or its length - it's which service we're asking for. 4 means print_string on this simulator." }
    - { line: 2, pc: "0x08", note: "ecall - the CPU stops running your instructions and hands control to the operating environment, which reads a0 (4) and a1 (the address) and does the printing." }
    - { line: 3, pc: "0x0c", regs: { a0: 10 }, note: "Back under your program's control. Reuse a0 for a new syscall number: 10 means exit." }
    - { line: 4, pc: "0x10", note: "ecall again - this time the environment reads a0 (10) and terminates the program cleanly, instead of letting it run off the end." }
---

Every program in this track has ended the same unsatisfying way: state sitting in
a register, no way to show it, no way to stop cleanly.
[Sections, directives, and labels]({{ '/code/08-sections-directives-and-labels/' | relative_url }})
even said so out loud, in a comment. `ecall` is what closes that gap — a single
instruction that asks something *outside* your program to do work your program
can't do for itself.

## An instruction that means "ask for help"

Every instruction so far has been the CPU doing something itself — arithmetic,
a branch, a memory access. `ecall` ("environment call") is different: it's the
CPU's way of saying *I need something from whatever is running me* — an
operating system, or here, the simulator standing in for one. That something is
usually a capability the CPU has no instruction for at all. There's no opcode
for "print these bytes to a screen" — a screen isn't a register or a memory cell
the ISA knows about. `ecall` hands the request to something that *does* know.

```text
ecall                 # stop; let the environment handle the next thing
```

By itself, `ecall` says nothing about *what* to do. That's set up beforehand, the
same way arguments are set up before
[a function call]({{ '/code/05-functions-and-the-calling-convention/' | relative_url }}) —
except here the "function" isn't code you wrote, it's a service the environment
provides.

## The syscall convention: a0 picks the service

Just as the calling convention says "arguments go in `a0`–`a7`," the environment
call convention says which register picks *which* service. On this site's
simulator ({{ site.sim_name }}), that register is `a0`:

```text
addi a0, zero, 1      # a0 = 1  ->  print_int
addi a0, zero, 4      # a0 = 4  ->  print_string
addi a0, zero, 10     # a0 = 10 ->  exit
```

| `a0` | Service | Argument | Effect |
|---|---|---|---|
| `1` | print_int | `a1` = the integer | prints it as decimal text |
| `4` | print_string | `a1` = address of a null-terminated string | prints the bytes until the `0` |
| `10` | exit | — | stops the program cleanly |

**This numbering isn't part of RISC-V itself — it's the simulator's convention,**
worth double-checking if you ever move to a different tool. (Some other RISC-V
simulators put the syscall number in `a7` instead of `a0` — same idea, different
register.) That's exactly the kind of detail the
[running guide]({{ '/run/' | relative_url }}) told you to check the simulator's
own help for, back when this lesson didn't exist yet to pin it down.

## Printing a string

`print_string` needs an address, which by now you know how to produce — the same
`la` from last lesson, aimed at a `.asciz` label instead of a `.word` array:

```text
.data
msg:    .asciz "hello\n"

.text
.globl _start
_start:
        la   a1, msg          # a1 = address of the string
        addi a0, zero, 4      # a0 = 4 (print_string)
        ecall                 # ask the environment to print it

        addi a0, zero, 10     # a0 = 10 (exit)
        ecall                 # ask the environment to stop
```

Two calls, two completely different requests, same instruction. `a0` tells
`ecall` which one you mean each time, so it's loaded fresh before each call —
exactly like reloading `a0` for a second function call with a different
argument.

## Finishing lesson 8's program

Now the array-sum from the previous lesson can actually show its answer instead
of leaving it stranded in `t0`:

```text
.data
nums:   .word  10, 32, 7      # the array itself, 3 words

.text
.globl _start
_start:
        la   a0, nums          # a0 = address of nums
        addi t2, zero, 3       # t2 = element count
        addi t0, zero, 0       # sum = 0
loop:   lw   t1, 0(a0)         # read the element a0 points at
        add  t0, t0, t1        # accumulate
        addi a0, a0, 4         # march the pointer to the next word
        addi t2, t2, -1        # count down the remaining elements
        bne  t2, zero, loop    # go again until none are left

        mv   a1, t0             # move the sum where print_int expects it
        addi a0, zero, 1        # a0 = 1 (print_int)
        ecall                   # print the sum

        addi a0, zero, 10       # a0 = 10 (exit)
        ecall                   # stop cleanly
```

Notice `a0` does the *pointer's* job during the loop, then switches to the
*syscall number's* job right after — nothing sacred about which value lives
where; it's just whichever convention is active at that point in the program.
`mv a1, t0` moves the sum out of the way first, precisely because `a0` is about
to be overwritten with `1`.

## Step through it

Watch `a0` change meaning twice in five instructions. At `0x04` it briefly holds
`4`, purely a service code — not an address, not data. `ecall` at `0x08` is where
control leaves your program entirely; the environment does the printing and hands
control back. Then `a0` is overwritten again, this time with `10`, and the second
`ecall` doesn't return at all — the program is over.

## Try this

- What would happen if you ran `ecall` with `a0 = 4` but `a1` still held an
  *integer* instead of a string address? (The environment would treat that
  number as a memory address and try to read bytes there as text — garbage
  output, or a crash, depending on what's actually at that address.)
- Why does the exit `ecall` need no argument in `a1`, unlike `print_int` or
  `print_string`? (There's nothing to report — exiting doesn't produce output,
  it just tells the environment to stop.)
- If you forgot the final `addi a0, zero, 10` / `ecall` pair entirely, what
  would happen when execution reached the end of `.text`? (Exactly the "ran off
  the end" problem the [running guide]({{ '/run/' | relative_url }}) warned
  about — with no exit call, there's nothing telling the environment to stop.)

Every program up to now computed something and left the proof buried in a
register you had to trust the trace to show you. `ecall` is the last piece:
your program can now announce its own answer and stop on its own terms, the same
two things every real program does before it hands control back to whatever
launched it.

{% include try-it.html %}
