---
title: "Macros and the Urge to Abstract: One Line, Many Instructions"
order: 3
difficulty: beginner
arch: history
---

[The first assemblers]({{ '/history/02-first-assemblers/' | relative_url }}) gave us
mnemonics and labels, but the deal was strict: one written line became exactly one
machine instruction. The next idea broke that one-to-one rule on purpose — let a
single line stand for *many* instructions. That line is a **macro**.

## One line, many instructions

Programmers kept writing the same little sequences over and over. Zero a cell.
Save a register. Bump a counter. A macro lets you name a sequence once and then
summon the whole thing by that name:

```text
        MACRO  CLEAR addr   ; define a macro called CLEAR
        LOAD   #0           ;   put zero in the accumulator
        STORE  addr         ;   write it to the named cell
        ENDM                ; end of definition
```

`addr` is a **parameter** — a blank the macro fills in at each use. Now the
two-instruction dance has a one-word name:

```text
        CLEAR  count        ; expands to: LOAD #0 / STORE count
        CLEAR  total        ; expands again: LOAD #0 / STORE total
```

The macro **assembler** sees `CLEAR count`, looks up the definition, and *pastes
the body in* with `addr` replaced by `count`. The machine code is identical to
what you'd have typed by hand — the macro just saved you the typing and the chance
to get it wrong.

## Expansion, not a call

This is the subtle part, and it's worth pinning down. A macro is **expanded in
place**: every use stamps a fresh copy of the body into the program. That's very
different from a **subroutine** — the reusable, jumped-to routine
[Wilkes' group]({{ '/history/02-first-assemblers/' | relative_url }}) pioneered —
where *one* copy lives somewhere and the code jumps to it and back.

| | Macro | Subroutine |
|---|---|---|
| Where the body lives | copied at every use | one shared copy |
| Cost | bigger program, no jump | smaller program, jump + return |
| Decided | at assembly time | at run time |

Same goal — reuse — two opposite trade-offs. Macros buy speed with space;
subroutines buy space with a little overhead. Programmers have been weighing that
exact trade ever since.

## The slippery slope

Once one line can stand for many instructions, an obvious question hangs in the
air: *why stop at a fixed little sequence?* Macro assemblers kept answering "we
won't." They grew parameters, then conditionals (emit these instructions only if
an argument is set), then loops that generated repetitive code, then whole
**macro libraries** you could pull in by name.

Each step let the programmer say *what* they wanted and let the assembler work out
the *how*. Pushed far enough, that's no longer assembly at all. When you can write
`count = 0` and trust a program to choose whatever instructions the machine needs,
the translator has stopped being a clerk and become a **compiler** — and you've
arrived at higher-level languages.

## What to take away

- A macro trades the assembler's defining rule — one line, one instruction — for
  convenience: one line, a whole canned sequence, pasted in at assembly time.
- Macro and subroutine solve the same problem (don't repeat yourself) with
  opposite mechanics: copy-everywhere versus call-one-copy.
- The urge to abstract didn't stop at macros. It ran straight up into compilers
  and high-level languages — software getting steadily further from the metal.
- But all that abstraction still has to land on *some* set of real instructions.
  As the software stack climbed, the hardware contract underneath it had to become
  a deliberate, documented thing — a designed **instruction set**. That's the next
  thread to pull.

This one-line-for-many trick didn't stay in the past — a modern assembler still
does it, quietly, every time you write `mv` or `ret`. See it happen for real in
the code track's
[Pseudo-Instructions]({{ '/code/07-pseudo-instructions/' | relative_url }})
lesson (start from
[Your First Instructions]({{ '/code/01-your-first-instructions/' | relative_url }})
if you're new to the track).
