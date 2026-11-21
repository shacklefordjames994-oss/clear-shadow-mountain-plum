import type { DigiSimFault, PhysicsMetrics, TurbulenceModel } from "./types";

export class FluidSolver {
  readonly w: number;
  readonly h: number;
  u: Float32Array;
  v: Float32Array;
  u0: Float32Array;
  v0: Float32Array;
  d: Float32Array;
  d0: Float32Array;
  particles: Float32Array;
  readonly particleCount = 420;

  constructor(w = 96, h = 54) {
    this.w = w;
    this.h = h;
    const n = w * h;
    this.u = new Float32Array(n);
    this.v = new Float32Array(n);
    this.u0 = new Float32Array(n);
    this.v0 = new Float32Array(n);
    this.d = new Float32Array(n);
    this.d0 = new Float32Array(n);
    this.particles = new Float32Array(this.particleCount * 2);
    for (let i = 0; i < this.particleCount; i++) {
      this.particles[i * 2] = Math.random() * w;
      this.particles[i * 2 + 1] = Math.random() * h;
    }
    this.seedPlume();
  }

  private idx(x: number, y: number) {
    const xi = Math.max(0, Math.min(this.w - 1, x | 0));
    const yi = Math.max(0, Math.min(this.h - 1, y | 0));
    return yi * this.w + xi;
  }

  private seedPlume() {
    const cx = (this.w * 0.22) | 0;
    const cy = (this.h * 0.5) | 0;
    for (let y = -4; y <= 4; y++) {
      for (let x = -3; x <= 3; x++) {
        const i = this.idx(cx + x, cy + y);
        this.d[i] += 1.1;
        this.u[i] += 1.8;
      }
    }
  }

  addForce(nx: number, ny: number, dx: number, dy: number, inject = true) {
    const x = Math.floor(nx * this.w);
    const y = Math.floor(ny * this.h);
    for (let j = -2; j <= 2; j++) {
      for (let i = -2; i <= 2; i++) {
        const id = this.idx(x + i, y + j);
        this.u[id] += dx * 8;
        this.v[id] += dy * 8;
        if (inject) this.d[id] += 0.35;
      }
    }
  }

  sample(nx: number, ny: number) {
    const id = this.idx(Math.floor(nx * this.w), Math.floor(ny * this.h));
    const u = this.u[id];
    const v = this.v[id];
    return { nx, ny, u, v, speed: Math.hypot(u, v), dye: this.d[id] };
  }

  reset() {
    this.u.fill(0);
    this.v.fill(0);
    this.u0.fill(0);
    this.v0.fill(0);
    this.d.fill(0);
    this.d0.fill(0);
    for (let i = 0; i < this.particleCount; i++) {
      this.particles[i * 2] = Math.random() * this.w;
      this.particles[i * 2 + 1] = Math.random() * this.h;
    }
    this.seedPlume();
  }

  step(turbulence: TurbulenceModel, running: boolean, buoyancyDeltaT = 12.4, fault: DigiSimFault = "NOMINAL") {
    if (!running) return this.metrics(turbulence);
    const visc = turbulence === "DNS" ? 0.00008 : turbulence === "LES" ? 0.00022 : 0.0008;
    const dt = 0.12;
    const g = 0.00028 * (buoyancyDeltaT / 12.4);
    for (let i = 0; i < this.v.length; i++) this.v[i] -= g * this.d[i];
    this.applyFault(fault);
    this.diffuse(this.u, this.u0, visc, dt);
    this.diffuse(this.v, this.v0, visc, dt);
    this.project();
    this.advect(this.u, this.u0, this.u0, this.v0, dt);
    this.advect(this.v, this.v0, this.u0, this.v0, dt);
    this.project();
    this.diffuse(this.d, this.d0, 0.00012, dt);
    this.advect(this.d, this.d0, this.u, this.v, dt);
    this.decay();
    this.advectParticles(dt);
    return this.metrics(turbulence);
  }

  private applyFault(fault: DigiSimFault) {
    const { w, h } = this;
    if (fault === "NOMINAL") {
      const cx = (w * 0.14) | 0;
      const cy = (h * 0.5) | 0;
      for (let y = -3; y <= 3; y++) {
        const id = this.idx(cx, cy + y);
        this.u[id] += 0.07;
        this.d[id] += 0.018;
      }
      return;
    }
    if (fault === "FAN_STALL") {
      for (let j = 1; j < h - 1; j++) {
        for (let i = 1; i < ((w * 0.32) | 0); i++) {
          const id = j * w + i;
          this.u[id] *= 0.9;
        }
      }
      return;
    }
    const wall = (w * 0.48) | 0;
    for (let j = 0; j < h; j++) {
      for (let i = wall - 1; i <= wall + 1; i++) {
        const id = this.idx(i, j);
        this.u[id] = 0;
        this.v[id] *= 0.45;
      }
    }
  }

  private decay() {
    for (let i = 0; i < this.d.length; i++) {
      this.d[i] *= 0.996;
      this.u[i] *= 0.999;
      this.v[i] *= 0.999;
    }
  }

  private diffuse(x: Float32Array, x0: Float32Array, diff: number, dt: number) {
    x0.set(x);
    const a = dt * diff * this.w * this.h;
    for (let k = 0; k < 8; k++) {
      for (let j = 1; j < this.h - 1; j++) {
        for (let i = 1; i < this.w - 1; i++) {
          const id = j * this.w + i;
          x[id] =
            (x0[id] +
              a *
                (x[id - 1] +
                  x[id + 1] +
                  x[id - this.w] +
                  x[id + this.w])) /
            (1 + 4 * a);
        }
      }
    }
    this.setBounds(x);
  }

  private advect(
    d: Float32Array,
    d0: Float32Array,
    u: Float32Array,
    v: Float32Array,
    dt: number,
  ) {
    d0.set(d);
    const dt0x = dt * (this.w - 2);
    const dt0y = dt * (this.h - 2);
    for (let j = 1; j < this.h - 1; j++) {
      for (let i = 1; i < this.w - 1; i++) {
        const id = j * this.w + i;
        let x = i - dt0x * u[id];
        let y = j - dt0y * v[id];
        if (x < 0.5) x = 0.5;
        if (x > this.w - 1.5) x = this.w - 1.5;
        if (y < 0.5) y = 0.5;
        if (y > this.h - 1.5) y = this.h - 1.5;
        const i0 = x | 0;
        const i1 = i0 + 1;
        const j0 = y | 0;
        const j1 = j0 + 1;
        const s1 = x - i0;
        const s0 = 1 - s1;
        const t1 = y - j0;
        const t0 = 1 - t1;
        d[id] =
          s0 * (t0 * d0[j0 * this.w + i0] + t1 * d0[j1 * this.w + i0]) +
          s1 * (t0 * d0[j0 * this.w + i1] + t1 * d0[j1 * this.w + i1]);
      }
    }
    this.setBounds(d);
  }

  private project() {
    const div = this.u0;
    const p = this.v0;
    for (let j = 1; j < this.h - 1; j++) {
      for (let i = 1; i < this.w - 1; i++) {
        const id = j * this.w + i;
        div[id] =
          -0.5 *
          ((this.u[id + 1] - this.u[id - 1]) / this.w +
            (this.v[id + this.w] - this.v[id - this.w]) / this.h);
        p[id] = 0;
      }
    }
    this.setBounds(div);
    this.setBounds(p);
    for (let k = 0; k < 10; k++) {
      for (let j = 1; j < this.h - 1; j++) {
        for (let i = 1; i < this.w - 1; i++) {
          const id = j * this.w + i;
          p[id] =
            (div[id] + p[id - 1] + p[id + 1] + p[id - this.w] + p[id + this.w]) / 4;
        }
      }
      this.setBounds(p);
    }
    for (let j = 1; j < this.h - 1; j++) {
      for (let i = 1; i < this.w - 1; i++) {
        const id = j * this.w + i;
        this.u[id] -= 0.5 * this.w * (p[id + 1] - p[id - 1]);
        this.v[id] -= 0.5 * this.h * (p[id + this.w] - p[id - this.w]);
      }
    }
    this.setBounds(this.u);
    this.setBounds(this.v);
  }

  private setBounds(x: Float32Array) {
    for (let i = 0; i < this.w; i++) {
      x[i] = x[this.w + i];
      x[(this.h - 1) * this.w + i] = x[(this.h - 2) * this.w + i];
    }
    for (let j = 0; j < this.h; j++) {
      x[j * this.w] = x[j * this.w + 1];
      x[j * this.w + this.w - 1] = x[j * this.w + this.w - 2];
    }
  }

  private advectParticles(dt: number) {
    for (let i = 0; i < this.particleCount; i++) {
      let x = this.particles[i * 2];
      let y = this.particles[i * 2 + 1];
      const id = this.idx(x, y);
      x += this.u[id] * dt * this.w * 0.35;
      y += this.v[id] * dt * this.h * 0.35;
      if (x < 1 || x > this.w - 1 || y < 1 || y > this.h - 1) {
        x = Math.random() * this.w;
        y = Math.random() * this.h;
      }
      this.particles[i * 2] = x;
      this.particles[i * 2 + 1] = y;
    }
  }

  metrics(turbulence: TurbulenceModel): PhysicsMetrics {
    let mass = 0;
    let ke = 0;
    let maxDiv = 0;
    let maxVel = 0;
    let maxDye = 0;
    let nonFinite = false;
    for (let j = 1; j < this.h - 1; j++) {
      for (let i = 1; i < this.w - 1; i++) {
        const id = j * this.w + i;
        const u = this.u[id];
        const v = this.v[id];
        if (!Number.isFinite(u) || !Number.isFinite(v) || !Number.isFinite(this.d[id])) {
          nonFinite = true;
        }
        mass += this.d[id];
        ke += 0.5 * (u * u + v * v);
        const div = Math.abs(
          this.u[id + 1] - this.u[id - 1] + (this.v[id + this.w] - this.v[id - this.w]),
        );
        if (div > maxDiv) maxDiv = div;
        const speed = Math.hypot(u, v);
        if (speed > maxVel) maxVel = speed;
        if (this.d[id] > maxDye) maxDye = this.d[id];
      }
    }
    const visc = turbulence === "DNS" ? 0.00008 : turbulence === "LES" ? 0.00022 : 0.0008;
    const cfl = maxVel * 0.12;
    const keMean = ke / (this.w * this.h);
    const simDeltaT = 6 + Math.min(18, maxDye * 5.5 + keMean * 3.2);
    const simHotspotC = 84.6 + (simDeltaT - 12.4) * 1.15;
    const failures: string[] = [];
    if (nonFinite) failures.push("PHYS_NONFINITE");
    if (cfl > 1) failures.push("PHYS_CFL");
    if (maxDiv > 0.35) failures.push("PHYS_MASS");
    if (maxVel > 8) failures.push("PHYS_BOUNDS");
    return {
      massResidual: maxDiv,
      maxDivergence: maxDiv,
      cfl,
      kineticEnergy: keMean,
      nonFinite,
      inBounds: maxVel < 8,
      regime: turbulence === "RANS" ? "INTERPOLATION" : "NEAR_BOUNDARY",
      turbulence,
      failures,
      reStar: visc > 0 ? (maxVel * 0.45) / visc : 0,
      maxSpeed: maxVel,
      simHotspotC,
      simDeltaT,
    };
  }
}
