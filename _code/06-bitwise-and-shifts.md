---
title: "Bitwise and Shifts: Working One Bit at a Time"
order: 6
difficulty: intermediate
arch: riscv
trace:
  code:
    - "addi t0, zero, 0xB4  # t0 = 1011 0100"
    - "andi t1, t0, 0x0F    # keep low 4 bits: t1 = 0000 0100"
    - "ori  t2, t0, 0x0F    # set  low 4 bits: t2 = 1011 1111"
    - "xori t3, t0, 0xFF    # flip all 8 bits: t3 = 0100 1011"
    - "srli t4, t0, 4       # shift right 4:   t4 = 0000 1011"
    - "slli t5, t0, 1       # shift left 1:    t5 = 1 0110 1000"
  steps:
    - { line: 0, pc: "0x00", regs: { t0: "0xB4" }, note: "Start with the bit pattern 1011 0100 (180 decimal) in t0. Read the notes in binary — that's where the action is." }
    - { line: 1, pc: "0x04", regs: { t1: "0x04" }, note: "AND with 0x0F (0000 1111) keeps only the low nibble and zeros the rest — a MASK. 1011 0100 & 0000 1111 = 0000 0100." }
    - { line: 2, pc: "0x08", regs: { t2: "0xBF" }, note: "OR with 0x0F forces the low four bits to 1, leaving the high bits alone: 1011 0100 | 0000 1111 = 1011 1111." }
    - { line: 3, pc: "0x0c", regs: { t3: "0x4B" }, note: "XOR with 0xFF flips every one of the low 8 bits — a bitwise NOT over that byte: 1011 0100 ^ 1111 1111 = 0100 1011." }
    - { line: 4, pc: "0x10", regs: { t4: "0x0B" }, note: "Shift right by 4 slides every bit down four places (high bits fill with 0). 1011 0100 >> 4 = 0000 1011 = 11. Same as dividing by 16." }
    - { line: 5, pc: "0x14", regs: { t5: "0x168" }, note: "Shift left by 1 slides every bit up one place, a 0 filling in at the bottom: 1011 0100 << 1 = 1 0110 1000 = 360. Same as multiplying by 2." }
---

Every value you've moved so far, you moved as a whole number. But a register is
really just **32 bits sitting in a row**, and sometimes the number is beside the
point — you want to inspect, set, or clear individual bits. Flags packed into one
word, a color's red channel, a permission bit: this is where bitwise operations and
shifts earn their keep.

## The bitwise trio: AND, OR, XOR

These work on each bit position independently — bit 0 with bit 0, bit 1 with bit 1,
and so on. The whole story fits in three tiny rules:

```text
and  t2, t0, t1       # 1 only where BOTH inputs are 1
or   t2, t0, t1       # 1 where EITHER input is 1
xor  t2, t0, t1       # 1 where the inputs DIFFER
```

Each also has an *immediate* form that takes a constant instead of a second
register — `andi`, `ori`, `xori`. Same operation, one operand baked into the
instruction.

## Masks: the reason they matter

A **mask** is a constant you choose so the operation touches exactly the bits you
mean. This is the single most useful idea in the whole lesson:

```text
andi t1, t0, 0x0F     # KEEP  bits that are 1 in the mask, clear the rest
ori  t2, t0, 0x0F     # SET   bits that are 1 in the mask, leave the rest
xori t3, t0, 0x0F     # FLIP  bits that are 1 in the mask, leave the rest
```

Read it as a sentence: `and` **keeps**, `or` **sets**, `xor` **flips** — but only
where the mask has a 1. Want to test whether the bottom bit is on (is a number
odd?)? `andi t1, t0, 1` and check for zero. Want a bitwise NOT? XOR with all ones
(`xori t0, t0, -1`) — there's no separate `not` instruction because this *is* it.

## Shifts: sliding bits sideways

A **shift** moves every bit left or right by a fixed number of places:

```text
slli t1, t0, 3        # shift left  logical: bits move up 3, zeros fill the bottom
srli t1, t0, 3        # shift right logical: bits move down 3, zeros fill the top
srai t1, t0, 3        # shift right arithmetic: fills the top with the SIGN bit
```

Shifting is multiplication and division in disguise — by powers of two, the only
factors a bit-slide can produce:

- `slli t0, t0, 1` doubles a value (`<< n` multiplies by 2ⁿ).
- `srli t0, t0, 1` halves an *unsigned* value (`>> n` divides by 2ⁿ).

The `srli`/`srai` split is the shift version of the `lb`/`lbu` distinction from
[talking to memory]({{ '/code/04-talking-to-memory/' | relative_url }}): with
signed numbers you must preserve the sign. `srli` shoves zeros into the top, which
turns a negative number positive; `srai` copies the sign bit down so `-8 >> 1`
stays `-4`. Use `srai` for signed division, `srli` for raw bit patterns.

## Step through it

The trace starts with `1011 0100` in `t0` and never changes it — each line reads
`t0` and writes a *different* destination, so you can compare all five results side
by side. Watch the notes in **binary**: `andi 0x0F` erases the top nibble, `ori
0x0F` lights up the bottom one, `xori 0xFF` inverts the byte, and the two shifts
slide the whole pattern down (÷16) and up (×2). Same input, six windows onto it.

## Try this

- You have status bits in `t0` and want to clear *just* bit 3. What mask and
  operation? (`andi t0, t0, ~(1<<3)` — i.e. AND with a mask that's all 1s except a
  0 at bit 3. AND-with-0 clears; AND-with-1 keeps.)
- Why does `srli` give the wrong answer for `-8 >> 1` but `srai` gets it right?
  (`srli` fills the top with zeros, so the sign is lost; `srai` copies the sign bit
  down, preserving negativity.)
- How would you multiply a number by 8 without a `mul` instruction? (`slli t0, t0,
  3` — shifting left by 3 multiplies by 2³ = 8, and it's faster than a multiply.)

Bits are the bedrock everything else is built on. Once you can mask, set, flip, and
slide them, you can decode any packed format the hardware hands you — and you've
seen why compilers love turning `x * 8` into a single shift.

{% include try-it.html %}
