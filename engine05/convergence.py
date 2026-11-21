"""Matching-radius and domain sweeps. Failed runs stay in the table."""

from __future__ import annotations

from engine05.numerov_solver import GaussianModel, NumerovError, solve_bound_state

MATCH_RADII = (1.5, 2.0, 2.5, 3.0, 3.5)
DOMAIN_RADII = (4.0, 5.0, 6.0, 8.0, 10.0)


def numerov_sweep(
    model: GaussianModel | None = None,
    *,
    h_over_a: float = 0.01,
    matches: tuple[float, ...] = MATCH_RADII,
    domains: tuple[float, ...] = DOMAIN_RADII,
) -> list[dict]:
    model = model or GaussianModel()
    rows: list[dict] = []
    for domain in domains:
        for match in matches:
            row = {
                "solver": "numerov-fixed-step",
                "h_over_a": h_over_a,
                "rmax_over_a": domain,
                "match_over_a": match,
                "classification": "COMPUTED",
            }
            if not match < domain:
                row.update(
                    {
                        "energy_eV": None,
                        "root_residual": None,
                        "nodes": None,
                        "n_points": None,
                        "tail_probability": None,
                        "status": "NOT_RUN",
                        "reason": "MATCH_NOT_INSIDE_DOMAIN",
                    }
                )
                rows.append(row)
                continue
            try:
                solved = solve_bound_state(model, h_over_a, domain, match)
            except (NumerovError, ValueError) as exc:
                row.update(
                    {
                        "energy_eV": None,
                        "root_residual": None,
                        "nodes": None,
                        "n_points": None,
                        "tail_probability": None,
                        "status": "FAILED",
                        "reason": f"{type(exc).__name__}:{exc}",
                    }
                )
                rows.append(row)
                continue
            row.update(
                {
                    "energy_eV": solved.energy_eV,
                    "root_residual": solved.matching_residual,
                    "nodes": solved.nodes,
                    "n_points": solved.n_points,
                    "tail_probability": solved.tail_probability,
                    "status": "COMPUTED",
                    "reason": "OK",
                }
            )
            rows.append(row)
    return rows
