# SQRT-01 Engine 05

Fixed-step Numerov bound states and a global Richardson refinement wrapper.
This package computes a synthetic Gaussian well. It does not measure anything.

Status of the code in this tree is established only by executing it:

| Piece | Status |
| --- | --- |
| Fixed-step Numerov reference | Implemented. Tested only after `pytest` exits 0. |
| Global Richardson refinement (05-B) | Implemented. General refinement ratio `q`. Invalid `q` is rejected. |
| Uniform mesh frozen during each root search | True for every fixed-step solve. |
| Independent outward/inward uniform legs (05-D) | Implemented. Each root search freezes its step counts. Not a variable-step recurrence. |
| Variable-step Numerov, equation (8) of Vigo-Aguiar and Ramos 2005 (05-E) | Implemented and tested on the Gaussian well. Not the Woods–Saxon table. Local order drops when the step changes. |
| Nonuniform-grid Numerov, Brunetti–Speciale–Rudan 2021 (05-F) | Separate tridiagonal solver. Tested on manufactured solution (20). Not the Gaussian eigenvalue. |
| Coordinate mapping | Not implemented. |
| WKB hybrid (05-G) | Not implemented. |
| Experimental validation | Not validated. |
| Repository publication | Published to shacklefordjames994-oss/SQRT-01-Engine-05, commit a4046b6. The connected GitHub account cannot write shacklefordjames60-coder/James-Shackleford-E-. |

Archived Gaussian prototypes are kept as cited numbers. The solver is checked
against them. They are not overwritten, and they are not experimental data.

## Run

```bash
pip install -r requirements.txt
pytest -q tests
python -m engine05
```

`python -m engine05` writes `evidence/SQRT-D02-GAUSS-001.json` from the run
that just happened. The benchmark does not, by itself, mark pytest as passed.
Pass `--pytest-exit` only together with a real pytest invocation.

## Benchmark

- `V(r) = -5 eV * exp(-(r / 100 pm)^2)`
- reduced mass `0.5 u`, `ell = 0`
- `u(0) = 0`, inward decaying tail, match at `0.17 a`
- archived reference near `-4.5741727208 eV`

The adaptive controller uses exponent `1/4` because it controls the global
`O(h^4)` eigenvalue error. A local step-doubling controller would use `1/6`
and is not this module.

## Rules

- Computation is not observation.
- Simulation is not measurement.
- A variational number is an upper bound, not an exact energy.
- Do not adopt an unverified variable-step recurrence.
- Do not report potential-evaluation savings that were not counted.
