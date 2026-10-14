---
title: "Talking to Memory: Loads, Stores, and Arrays"
order: 4
difficulty: beginner
arch: riscv
trace:
  code:
    - "addi t0, zero, 0     # sum = 0"
    - "lw   t1, 0(a0)       # loop: t1 = mem[a0]  (current element)"
    - "add  t0, t0, t1      # sum += element"
    - "addi a0, a0, 4       # advance the pointer one word (4 bytes)"
    - "addi t2, t2, -1      # one fewer element to go"
    - "bne  t2, zero, loop  # repeat until the count reaches 0"
  start: { regs: { a0: "0x2000", t2: 2 }, mem: { "0x2000": "10", "0x2004": "32" }, note: "Before the first instruction: the array [10, 32] is in memory at 0x2000, a0 points at its first element, and t2 counts its 2 elements. Press step ▶ to run the first instruction." }
  steps:
    - { line: 0, pc: "0x00", regs: { t0: 0 }, note: "Set the sum to 0: t0 = 0. a0 and t2 were set before this code, so the loop can start." }
    - { line: 1, pc: "0x04", regs: { t1: 10 }, note: "lw reads the word a0 points at (offset 0): t1 = mem[0x2000] = 10." }
    - { line: 2, pc: "0x08", regs: { t0: 10 }, note: "Accumulate into the running sum: t0 = 0 + 10." }
    - { line: 3, pc: "0x0c", regs: { a0: "0x2004" }, note: "March the pointer: add 4 bytes so a0 now points at the next word." }
    - { line: 4, pc: "0x10", regs: { t2: 1 }, note: "One element handled, one to go." }
    - { line: 5, pc: "0x14", note: "t2 (1) != 0, so the branch is taken — pc snaps back to the loop top." }
    - { line: 1, pc: "0x04", regs: { t1: 32 }, note: "Same lw instruction, new address: t1 = mem[0x2004] = 32. The offset stayed 0 — the pointer moved instead." }
    - { line: 2, pc: "0x08", regs: { t0: 42 }, note: "sum += 32, giving t0 = 42." }
    - { line: 3, pc: "0x0c", regs: { a0: "0x2008" }, note: "Pointer advances one word past the array." }
    - { line: 4, pc: "0x10", regs: { t2: 0 }, note: "The count reaches 0." }
    - { line: 5, pc: "0x14", note: "Now t2 == 0, so bne does NOT branch — the loop falls through and exits with the sum 42 in t0." }
---

[Branches and loops]({{ '/code/03-branches-and-loops/' | relative_url }}) gave a
loop the power to repeat. But a loop that only churns registers runs out of things
to do — registers are few. The interesting work lives in **memory**, and you reach
it with just two instructions: one to read, one to write.

## Load and store

Registers and memory are separate worlds. The CPU computes on registers, but it
can only *move* data between them and memory — it never does arithmetic directly
on memory. Two instructions bridge the gap:

```text
lw  t1, 0(a0)        # LOAD word:  t1 = mem[a0 + 0]
sw  t1, 0(a0)        # STORE word: mem[a0 + 0] = t1
```

`lw` copies a word *out* of memory into a register; `sw` copies a register's value
*into* memory. (You met both briefly in [the stack]({{ '/code/02-the-stack/' | relative_url }})
— this is the lesson that owes you the full story.)

## Addresses and offsets

Memory is one giant numbered array of bytes, and an **address** is just an index
into it. The `0(a0)` syntax is an address built from two parts:

```text
lw  t1, 8(a0)        # address = a0 + 8
#       │  └─ base register: holds a starting address
#       └──── offset: a constant added to it
```

The base register holds where you are; the constant offset reaches a fixed
distance from there. This is exactly how the stack lesson read `12(sp)` — `sp` is
the base, `12` is the offset. The same pattern walks structs, arrays, and stack
frames alike.

## Bytes versus words

A word on RV32 is 4 bytes, so consecutive words sit **4 addresses apart**:
`mem[0]`, `mem[4]`, `mem[8]`, …. When you don't need a whole word, narrower
loads and stores reach a single byte:

```text
lb  t1, 0(a0)        # load byte, sign-extended  (e.g. for signed chars)
lbu t1, 0(a0)        # load byte, zero-extended  (e.g. for raw bytes / ASCII)
sb  t1, 0(a0)        # store the low byte of t1
```

`lb` fills the upper bits with the byte's sign so `-1` stays `-1`; `lbu` fills them
with zeros, which is what you want for text and unsigned data. Picking the wrong
one is a classic source of "why is my character a huge negative number?" bugs.

## Walking an array

Put load and loop together and you can sweep an entire array. Keep a **pointer**
in a register, read through it, then *advance the pointer* by one element each
time around — exactly the loop shape from the previous lesson, now with memory:

```text
        addi t0, zero, 0     # sum = 0
loop:   lw   t1, 0(a0)       # read the element a0 points at
        add  t0, t0, t1      # accumulate
        addi a0, a0, 4       # march the pointer to the next word
        addi t2, t2, -1      # count down the remaining elements
        bne  t2, zero, loop  # go again until none are left
```

Notice the offset never changes — it stays `0(a0)`. The pointer does the moving.
That's the heart of array traversal: a fixed access pattern over a marching base
address.

## Step through it

Use the visualizer and watch two panels at once. The **memory** panel shows the
array `[10, 32]` parked at `0x2000`. Press **step ▶** and follow `a0` in the
**registers** panel: each pass through the loop it climbs `0x2000 → 0x2004 →
0x2008`, while the very same `lw 0(a0)` pulls a different value each time. The sum
lands on `42` right as the counter hits zero and the branch falls through.

## Try this

- The array holds 4-byte words. What if you wrote `addi a0, a0, 1` instead of `4`?
  (You'd advance one *byte*, landing in the middle of the first word and reading
  garbage — element size and the stride must match.)
- How would you find the *largest* element instead of the sum? (Keep a "best so
  far" register; replace `add` with a `blt`/`bge` compare-and-update — same walk,
  different body.)
- Why must `lw` use a word-aligned address like `0x2004` and not `0x2003`? (Most
  loads expect natural alignment; a misaligned word access traps or runs slowly.)

Memory is where programs keep everything bigger than a handful of registers. With
loads, stores, and a marching pointer, you can now touch all of it — and that's
the foundation the [stack]({{ '/code/02-the-stack/' | relative_url }}) was quietly
standing on the whole time.

{% include try-it.html %}
