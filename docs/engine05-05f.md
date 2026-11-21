# Engine 05-F coefficient map

Brunetti, Speciale and Rudan, Journal of Computational Electronics 20, 1105–1113 (2021). DOI 10.1007/s10825-021-01699-3.

This solver is not the 2005 variable-step recurrence.

## Equation

`-u'' = c(x) u + s(x)`, with `u` known at the two ends.

## Interior row

For node `i`, with `h_i = x_i - x_{i-1}` and `h_{i+1} = x_{i+1} - x_i`:

Left side of (10), before moving the unknown midpoint values:

`-u_{i-1}/h_i + (1/h_i + 1/h_{i+1}) u_i - u_{i+1}/h_{i+1}`

equals one third of

`h_i F_{i-1/2} + (h_i + h_{i+1})/2 F_i + h_{i+1} F_{i+1/2}`.

`F = c u + s`. Midpoint values of `u` come from uniform Numerov on each element, spacing `h/2`, which is their interpolation (12)–(14):

`a_left = (48 + h^2 c_left) / (96 - 10 h^2 c_mid)`

`a_right = (48 + h^2 c_right) / (96 - 10 h^2 c_mid)`

`b = (s_left + 10 s_mid + s_right) / (96 - 10 h^2 c_mid)`

`u_mid = a_left u_left + a_right u_right + h^2 b`

After substitution the row is their (15):

`-beta u_{i-1} + alpha u_i - gamma u_{i+1} = sigma + eta`

with beta, gamma, alpha, sigma, and eta as in (16)–(18). A varying `c` makes `beta` and `gamma` differ across a row, so the matrix is not forced to be symmetric. Constant `c` does make it symmetric.

## Manufactured solution

Solution (20): `lambda = 12 pi / (1 + 5x)`, `u = lambda sin(lambda)`, `u(0) = u(1) = 0`.

The extracted text of (21) did not satisfy the ODE. The coefficients in `brunetti_model` are the closed form of (20):

`mu = 5 / (12 pi)`

`c = (mu lambda)^2 (lambda^2 - 2)`

`s = -4 (mu lambda)^2 lambda^2 cos(lambda)`

`manufactured_identity_is_exact` checks `-u'' - c u - s` simplifies to 0.

Maximum nodal error is `max |u_computed - u_exact|`. A measured drop when the node count doubles is recorded as `reduction_ratio`. Formal order is `NOT_ASSIGNED`.

## Coefficient check

The row is preprint equations (16)–(19) from the CC-BY text of 10.21203/rs.3.rs-229482/v1:

`-beta u_{i-1} + alpha u_i - gamma u_{i+1} = sigma + eta`

`beta` and `gamma` are preprint (17). `alpha` is preprint (18). `sigma` and `eta` are preprint (19).

`assemble_brunetti_speciale_rudan_2021` stores that row after the endpoint values move to the right-hand side. `assemble_nonuniform_system` is the same row as a dense matrix. Neither function calls the 2005 recurrence.

The Springer journal pages were not photographed. The check is a text extraction of the preprint, so the assembly status is `PREPRINT_TEXT_CHECKED`, not a certified journal-page transcription.

## Measured refinement

Uniform nodes, spacing `1/(N+1)`. A drop in the maximum nodal error is `reduction_ratio`. Dividing the log of that ratio by the log of the spacing ratio gives `observed_order`. That number is a measurement on this mesh family. Formal order remains `NOT_ASSIGNED`.

The linear problem `u = 2 + 3x`, with `c = 0` and `s = 0`, is an infrastructure check. It is not the manufactured solution (20).

## Status

| Item | Label |
| --- | --- |
| 05-E Gaussian two-zone eigenvalue | INDEPENDENTLY_REPRODUCED in this workspace |
| 05-F manufactured nodal errors | INDEPENDENTLY_REPRODUCED in this workspace |
| Woods–Saxon table | NOT_REPRODUCED |
| Experiment | NOT_VALIDATED |
