# Physical model review

Status: review written. Not an experimental validation.

## Model

`V(r) = -V0 exp(-r^2/a^2)` with `V0 = 5 eV`, `a = 100 pm`, equal masses of 1 u, so `mu = 0.5 u`, and `ell = 0`.

The radial equation is nonrelativistic and two-body. The origin condition used by the fixed-step solver is `u(0) = 0`. The outer condition is a decaying real exponential on a finite domain. The symmetric matrix solver uses `u(0) = u(R) = 0` instead. Those outer conditions are not the same.

## Constants

Active `K = hbar^2 / (2 mu a^2)` is computed from `hbar = 1.054571817e-34 J s` and the CODATA 2018 atomic mass constant. The campaign records `K = 0.0041801592804967215 eV`. That printed value coincides with one historical report. The report was not used as an input. `h/(2 pi)` and the CODATA 2022 atomic mass constant are stored and were not substituted.

## What the calculations say

On `h/a = 0.02`, a central difference and the expectation value `-∫ u^2 exp(-(r/a)^2) dr` agree:

- `dE/dV0` about `-0.9566` per eV
- `dE/da` about `-0.00418 eV/pm`
- `dE/dmu` about `-0.418 eV/u`

These are numerical sensitivities of this Gaussian computation. They are not measured response coefficients.

## What is not claimed

Equal mass, a Gaussian shape, `ell = 0`, and the nonrelativistic two-body reduction are model choices. No measured spectrum is loaded, so none of the energies is an experimental result.
