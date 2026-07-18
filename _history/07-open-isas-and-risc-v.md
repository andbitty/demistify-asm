---
title: "Open ISAs and the Rise of RISC-V"
order: 7
difficulty: intermediate
arch: history
---

[The RISC revolution]({{ '/history/06-risc-revolution/' | relative_url }}) won the
design argument: simple, uniform, pipeline-friendly instructions beat sprawling
CISC ones. But every RISC ISA that followed — MIPS, SPARC, PowerPC, ARM — was
still somebody's **product**. Building a chip against them meant a license, a fee,
and legal terms set by whoever owned the architecture. RISC-V's founding idea
wasn't a new instruction-design philosophy at all; it was a different question:
what if the ISA itself were *free*, the way a public standard is free?

## An ISA as a product

Recall the [System/360's]({{ '/history/04-birth-of-isas/' | relative_url }}) big
idea: the ISA is a contract, separate from any one implementation. That
separation made the ISA valuable enough to *own*. ARM Holdings, for instance,
doesn't sell chips — it sells the right to build a chip that speaks ARM. Every
phone maker, every microcontroller vendor, pays for that right or negotiates
around it.

That's not a criticism; it funded decades of excellent engineering. But it means
the instruction set — the seam between hardware and software that this whole
history track has been tracing — has an owner with a business model, and using it
means working inside that owner's terms.

## RISC-V: the ISA as a public standard

**RISC-V** (pronounced "risk-five" — the fifth RISC ISA to come out of Berkeley,
following four research predecessors) started around 2010 with a simple
constraint: design an ISA and give it away under an open, royalty-free license.
Anyone can implement it, extend it, teach it, or ship silicon built on it, without
asking permission.

That openness didn't require abandoning anything RISC had learned — RISC-V is
a textbook load-store, fixed-length RISC design. What's new is *governance*:
the specification is maintained by a nonprofit (**RISC-V International**) through
an open process, the way standards like HTML or TCP/IP are, rather than by a
single company's roadmap.

## Modular by design: a base plus extensions

RISC-V's other structural idea is **modularity**. There's one small, mandatory
**base** integer instruction set — **RV32I** for a 32-bit machine — covering just
arithmetic, branches, loads and stores: enough to run real programs and nothing
more. Everything else is an optional **extension**, named by a letter, that a
given chip can choose to include:

| Extension | Adds |
|---|---|
| `M` | integer multiply and divide |
| `F` / `D` | single/double-precision floating point |
| `A` | atomic memory operations, for multi-core code |
| `C` | compressed (16-bit) instruction encodings |

A microcontroller with no floating-point hardware simply doesn't implement `F` —
and any program compiled to the base `I` set still runs on it unchanged, because
the base is a guaranteed floor everyone honors. This is the RISC philosophy taken
one step further: not just "keep individual instructions simple," but "keep the
*whole ISA* small by default, and let complexity in only where a specific chip
actually needs it." Compare this to the CISC era's instinct to build every
possible instruction into every chip whether or not programs used it.

## Why this is the ISA this site teaches

Three reasons converge: RISC-V is a clean, modern expression of everything the
RISC lessons argued for; it's free to read about, implement, and run without
touching a license agreement; and specifically because it's open, an enormous
free tooling and simulator ecosystem has grown up around it — including the very
simulator the code track's "Try it yourself" boxes point at. Learning RISC-V
means learning the ideas in their most legible, least encumbered form.

## What to take away

- RISC won the *design* argument, but MIPS, ARM, and their peers remained
  proprietary products — an ISA with an owner and a license.
- **RISC-V** answers a different question: can the ISA itself be a free, open
  standard, governed the way public standards are, rather than owned by one
  company?
- Its **base-plus-extensions** structure keeps a mandatory core (`RV32I`) tiny and
  makes everything else — multiply/divide, floating point, atomics, compressed
  encoding — an opt-in extension a chip can include or skip.
- This is the hinge where the history track hands off to the hands-on track:
  every lesson in the code track from here on is written directly against
  RISC-V's base integer instructions.
