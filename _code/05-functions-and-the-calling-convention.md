---
title: "Functions and the Calling Convention: jal, ra, and Arguments"
order: 5
difficulty: intermediate
arch: riscv
trace:
  code:
    - "addi a0, zero, 5     # arg: a0 = 5"
    - "jal  ra, square      # call square; ra = return address"
    - "addi a1, zero, 1     # (after return) use the result..."
    - "mul  a0, a0, a0      # square: a0 = a0 * a0"
    - "jalr zero, 0(ra)     #   return: jump back to ra"
  steps:
    - { line: 0, pc: "0x00", regs: { a0: 5 }, note: "Put the argument in a0 — the first argument register. This is how the caller hands a value to the callee." }
    - { line: 1, pc: "0x04", regs: { ra: "0x08" }, note: "jal jumps to 'square' AND saves the address of the next instruction (0x08) into ra. That saved address is the breadcrumb home." }
    - { line: 3, pc: "0x10", regs: { a0: 25 }, note: "Inside square: a0 = 5 * 5 = 25. The return value goes in a0 — the same register the argument came in." }
    - { line: 4, pc: "0x14", note: "jalr jumps to the address in ra (0x08), returning control to right after the call." }
    - { line: 2, pc: "0x08", regs: { a1: 1 }, note: "Back in the caller at 0x08, exactly where ra pointed. a0 still holds 25 — the result is waiting for us." }
---

The [stack]({{ '/code/02-the-stack/' | relative_url }}) lesson kept mentioning "the
call" and "the caller" without ever showing one. Time to pay that debt. A function
call needs three things the hardware doesn't give you for free: a way to *jump in*,
a way to *find the way back*, and an agreement about *where arguments and results
live*. RISC-V handles the first two with one instruction and the third with a
convention everyone agrees to follow.

## Jump and link

A plain jump is one-way — it goes somewhere and forgets where it came from. A
*call* has to remember, so it can come back. `jal` ("jump and link") does both in
a single instruction:

```text
jal  ra, square       # 1. jump to the label 'square'
#    │                # 2. save the address of the NEXT instruction into ra
#    └─ the "link" register: where to stash the return address
```

The "link" half is the whole trick: before leaving, `jal` writes the address of
the instruction *after* the call into `ra` (the **return address** register, `x1`).
That saved address is the breadcrumb the function follows home.

## Returning

To return, the function jumps to whatever address is sitting in `ra`. That's
`jalr` ("jump and link register") — jump to a register's value:

```text
jalr zero, 0(ra)      # jump to the address in ra
#    │                # (link into zero = throw the new return address away)
#    └─ we don't need to save a return address here, so discard it
```

You'll almost always see this written as the pseudo-instruction `ret` — it's the
exact same thing, just spelled for humans.

## The calling convention

Jumping in and out is mechanical. The part that lets *your* code call *someone
else's* code — a library, the OS, a function a different team wrote — is a shared
agreement about registers. On RISC-V it goes:

| Purpose | Registers | Rule |
|---------|-----------|------|
| Arguments | `a0`–`a7` | Caller puts args here before `jal`. |
| Return value | `a0` (and `a1`) | Callee leaves the result here. |
| Return address | `ra` | Where `ret` jumps back to. |

So a one-argument call is: load `a0`, `jal`, and after it returns, read your answer
back out of `a0`. Notice `a0` does double duty — it carries the argument *in* and
the result *out*.

```text
        addi a0, zero, 5     # a0 = 5  (the argument)
        jal  ra, square      # call; result comes back in a0
        # ... a0 now holds 25

square: mul  a0, a0, a0      # a0 = a0 * a0
        ret                  # jalr zero, 0(ra)
```

## Watch out: nested calls clobber ra

There's exactly one `ra`. If `square` itself called another function, that inner
`jal` would overwrite `ra` — and `square` would lose its way home. This is the
precise problem the [stack]({{ '/code/02-the-stack/' | relative_url }}) exists to
solve: a function that makes further calls **saves `ra` to the stack** on entry and
restores it before `ret`. A "leaf" function like `square`, which calls no one, can
skip that — it never disturbs `ra`.

## Step through it

Follow `pc` and `ra` in the trace. `jal` fires at `0x04`: watch `pc` leap to
`square` while `ra` quietly records `0x08`. Inside, `a0` becomes `25`. Then `jalr`
sends `pc` straight back to `0x08` — the exact address `ra` was holding — and the
result is sitting in `a0`, ready to use. That round trip, argument in / result out,
is every function call you'll ever write.

## Try this

- After `jal ra, square`, what's in `ra`? (The address of the instruction right
  after the `jal` — its breadcrumb home, `0x08` in the trace.)
- Why can `square` get away with *not* saving `ra` on the stack? (It's a leaf —
  it calls no other function, so nothing overwrites `ra` before `ret`.)
- A function takes three arguments. Which registers hold them? (`a0`, `a1`, `a2` —
  the argument registers fill in order.)

With `jal`/`ret` for control and `a0`–`a7` for data, functions stop being magic:
they're a jump that remembers, plus a handshake about registers. Every library you
call rides on this same convention — and so does asking the *operating system* for
help, which is the same handshake aimed one level lower still.
