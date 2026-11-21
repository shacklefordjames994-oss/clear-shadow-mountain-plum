# Scientific release

`SCIENTIFIC_RELEASE_STATUS = NOT_CERTIFIED`

This process does not sign an independent review. A passing test suite does not close that gate.

| Gate | Status | Evidence |
| --- | --- | --- |
| Clean checkout | NOT_RUN | The campaign was not tied to a commit at generation time |
| Environment | PASS | Python, NumPy, and SciPy imported and the campaign finished |
| Tests | PASS | `55 passed` after the campaign |
| Ground-state reproduction | PASS | Fixed-step `h/a = 0.0025` reproduced the repository archive |
| Solver agreement | PASS | DOP853 minus that Numerov energy is `3.0e-10 eV` at match `r/a = 0.17` |
| Wavefunction | PASS | Zero nodes, unit norm, matrix overlap `0.999998` |
| Uncertainty | PASS | Components are listed and not combined |
| Physical review | PASS | [PHYSICAL_MODEL_REVIEW.md](PHYSICAL_MODEL_REVIEW.md) |
| Reproducibility | IN_PROGRESS | Run JSON, manifest, and source hashes exist; checkout gate is still open |
| Independent review | NOT_RUN | No external reviewer |

The match radii `1.5, 2.0, 2.5, 3.0, 3.5` at `h/a = 0.02` produced 25 computed rows. Every one of those rows has 9 or more radial nodes. They are not the ground state. The ground-state rows in that sweep are the five domains at match `r/a = 0.17`. Their energy spread is numerical roundoff.

Historical energies in `evidence/SQRT-D02-GAUSS-001.json` were not overwritten.
