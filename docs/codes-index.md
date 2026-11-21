# Codes: past, present, future

This file records where the code lives. It is not a validation claim.

## Past

Already in [clear-clover-arrow-apex](https://github.com/shacklefordjames994-oss/clear-clover-arrow-apex) under `src/`: oncology workbench, CRISPR observatory, VXR twin, SCI-NET console, and the master console. Those files were not overwritten.

## Present

The live OMEGA workspace, including Engine 05, is archived under `codes/present/` in that same repository. Engine 05 by itself is also at [SQRT-01-Engine-05](https://github.com/shacklefordjames994-oss/SQRT-01-Engine-05).

Present numerical methods that have been executed here:

- Fixed-step Numerov
- Global Richardson refinement
- Independent uniform legs
- 2005 variable-step recurrence, equation (8), prefactor `h_n^2/12`
- 2021 nonuniform-grid tridiagonal system

## Future

`engine05/future_methods.py` names three deferred methods. Each call raises `NotImplementedError`.

- Coordinate mapping
- WKB hybrid
- Woods–Saxon table

Experimental validation is not established.
