# SQRT-01 Engine 05 changelog

Published to https://github.com/shacklefordjames994-oss/SQRT-01-Engine-05
Commit a4046b6664321c545ee6ed47c0bc5cb75097c9be on main.

The connected GitHub account is shacklefordjames994-oss. It cannot write shacklefordjames60-coder/James-Shackleford-E-, so that repository's one-line README was left untouched.

## 05-E retained

Vigo-Aguiar and Ramos 2005, equation (8), prefactor `h_n^2/12`. The `h_{n+1}^2/12` draft stays rejected. Two-zone Gaussian energy `-4.5741727794 eV`, `-5.8e-8 eV` from the fixed `h/a = 0.0025` result. Woods–Saxon table not reproduced.

## 05-F added

Separate tridiagonal solver from Brunetti, Speciale and Rudan 2021. Not a call to 05-E. Manufactured solution (20) with rebuilt `c` and `s`. Matrix asymmetry is tested. Formal order is not assigned.

## 05-F coefficient audit

`assemble_brunetti_speciale_rudan_2021` is the band form of preprint equations (16)–(19). The dense solver uses that same row. A text extraction of CC-BY preprint 10.21203/rs.3.rs-229482/v1 was checked. The Springer page images were not. The linear solution `u = 2 + 3x` passes on a nonuniform grid. Uniform refinement records a measured order and still leaves the formal order `NOT_ASSIGNED`. 05-E was not edited.


## Reconstruction branch

`reconstruction/phase3-4-and-validation` adds the shared root contract, the DOP853 eigenvalue match, the symmetric matrix ground state, and the validation campaign. `main` is unchanged. Release status remains `NOT_CERTIFIED`.


## Still out

Coordinate mapping. WKB hybrid. Woods–Saxon table.
