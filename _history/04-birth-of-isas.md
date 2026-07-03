---
title: "The Birth of ISAs: Turning Hardware Into a Promise"
order: 4
difficulty: intermediate
arch: history
---

[Macros and the urge to abstract]({{ '/history/03-macros-and-abstraction/' | relative_url }})
showed software climbing away from the metal. But every layer of that climb still
has to land on *some* set of real instructions. For a long time that landing spot
was a moving target: each new machine had its own instructions, so the programs
you wrote — and the assembler you wrote them with — died with the hardware. The
fix was to stop treating the instruction set as an accident of the wiring and
start treating it as a **designed, documented promise**.

## Every machine its own language

Through the 1950s a computer's instruction set was whatever the engineers happened
to build. A new model — even from the same company — often had *different*
instructions, different registers, different everything. Assembly written for one
machine was gibberish on the next. Businesses that had invested years of
programming into a computer faced a brutal bill every time they outgrew it:
**rewrite it all**.

The instruction set wasn't a thing anyone had designed. It was a side effect of
how the hardware was wired.

## The System/360 watershed

In 1964 IBM made an audacious bet with the **System/360** family. Instead of one
machine, they announced a *range* of machines — cheap and slow up to expensive and
fast — that all spoke **exactly the same instruction set**. A program written for
the small one would run, unchanged, on the big one.

To pull this off, IBM had to separate two ideas that had always been tangled
together:

| | The **architecture** (ISA) | The **implementation** |
|---|---|---|
| What it is | the instructions, registers, and behavior programmers see | the actual circuits that carry them out |
| Who it's for | software | hardware engineers |
| Across the 360 line | *identical* on every model | different on every model |

The **Instruction Set Architecture** was born as a deliberate contract: a document
that says precisely what each instruction does, written *before* and *independent
of* any particular set of circuits. The cheap model and the expensive model
honored the same contract with wildly different hardware underneath.

## The contract cuts both ways

Once the ISA is a published promise rather than a hardware accident, two powerful
guarantees fall out of it:

- **Backward compatibility** — a *new, faster* machine still runs *old* software,
  because it honors the same contract. Your investment survives the upgrade.
- **Forward compatibility** (within reason) — software written today keeps working
  as the family grows, because it targets the documented ISA, not one chip.

This is the moment software and hardware could finally evolve on *separate
schedules*. Chip designers could make the machine faster however they liked, so
long as it kept the promise. Programmers could keep their code, so long as they
only relied on what the promise guaranteed. The ISA is the seam between the two —
and drawing that seam clearly is one of the most consequential ideas in computing.

## What to take away

- Before the mid-1960s, an instruction set was a byproduct of the wiring; every
  new machine meant rewriting the software.
- The System/360 split **architecture** (the instructions programmers see) from
  **implementation** (the circuits underneath), so one ISA could run on many
  different machines.
- That split turned the instruction set into a **contract**, which bought
  backward and forward compatibility — and let hardware and software evolve
  independently.
- With the ISA now a thing people *designed*, the obvious next question was: how
  rich should it be? One camp answered "make instructions do as much as possible."
  That road leads to CISC and microcode — the next thread to pull.
