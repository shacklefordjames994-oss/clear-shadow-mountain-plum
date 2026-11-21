import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fluid-canvas-Cg-3ThF9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FluidSolver = class {
	w;
	h;
	u;
	v;
	u0;
	v0;
	d;
	d0;
	particles;
	particleCount = 420;
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
	idx(x, y) {
		const xi = Math.max(0, Math.min(this.w - 1, x | 0));
		return Math.max(0, Math.min(this.h - 1, y | 0)) * this.w + xi;
	}
	seedPlume() {
		const cx = this.w * .22 | 0;
		const cy = this.h * .5 | 0;
		for (let y = -4; y <= 4; y++) for (let x = -3; x <= 3; x++) {
			const i = this.idx(cx + x, cy + y);
			this.d[i] += 1.1;
			this.u[i] += 1.8;
		}
	}
	addForce(nx, ny, dx, dy, inject = true) {
		const x = Math.floor(nx * this.w);
		const y = Math.floor(ny * this.h);
		for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
			const id = this.idx(x + i, y + j);
			this.u[id] += dx * 8;
			this.v[id] += dy * 8;
			if (inject) this.d[id] += .35;
		}
	}
	sample(nx, ny) {
		const id = this.idx(Math.floor(nx * this.w), Math.floor(ny * this.h));
		const u = this.u[id];
		const v = this.v[id];
		return {
			nx,
			ny,
			u,
			v,
			speed: Math.hypot(u, v),
			dye: this.d[id]
		};
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
	step(turbulence, running, buoyancyDeltaT = 12.4, fault = "NOMINAL") {
		if (!running) return this.metrics(turbulence);
		const visc = turbulence === "DNS" ? 8e-5 : turbulence === "LES" ? 22e-5 : 8e-4;
		const dt = .12;
		const g = 28e-5 * (buoyancyDeltaT / 12.4);
		for (let i = 0; i < this.v.length; i++) this.v[i] -= g * this.d[i];
		this.applyFault(fault);
		this.diffuse(this.u, this.u0, visc, dt);
		this.diffuse(this.v, this.v0, visc, dt);
		this.project();
		this.advect(this.u, this.u0, this.u0, this.v0, dt);
		this.advect(this.v, this.v0, this.u0, this.v0, dt);
		this.project();
		this.diffuse(this.d, this.d0, 12e-5, dt);
		this.advect(this.d, this.d0, this.u, this.v, dt);
		this.decay();
		this.advectParticles(dt);
		return this.metrics(turbulence);
	}
	applyFault(fault) {
		const { w, h } = this;
		if (fault === "NOMINAL") {
			const cx = w * .14 | 0;
			const cy = h * .5 | 0;
			for (let y = -3; y <= 3; y++) {
				const id = this.idx(cx, cy + y);
				this.u[id] += .07;
				this.d[id] += .018;
			}
			return;
		}
		if (fault === "FAN_STALL") {
			for (let j = 1; j < h - 1; j++) for (let i = 1; i < (w * .32 | 0); i++) {
				const id = j * w + i;
				this.u[id] *= .9;
			}
			return;
		}
		const wall = w * .48 | 0;
		for (let j = 0; j < h; j++) for (let i = wall - 1; i <= wall + 1; i++) {
			const id = this.idx(i, j);
			this.u[id] = 0;
			this.v[id] *= .45;
		}
	}
	decay() {
		for (let i = 0; i < this.d.length; i++) {
			this.d[i] *= .996;
			this.u[i] *= .999;
			this.v[i] *= .999;
		}
	}
	diffuse(x, x0, diff, dt) {
		x0.set(x);
		const a = dt * diff * this.w * this.h;
		for (let k = 0; k < 8; k++) for (let j = 1; j < this.h - 1; j++) for (let i = 1; i < this.w - 1; i++) {
			const id = j * this.w + i;
			x[id] = (x0[id] + a * (x[id - 1] + x[id + 1] + x[id - this.w] + x[id + this.w])) / (1 + 4 * a);
		}
		this.setBounds(x);
	}
	advect(d, d0, u, v, dt) {
		d0.set(d);
		const dt0x = dt * (this.w - 2);
		const dt0y = dt * (this.h - 2);
		for (let j = 1; j < this.h - 1; j++) for (let i = 1; i < this.w - 1; i++) {
			const id = j * this.w + i;
			let x = i - dt0x * u[id];
			let y = j - dt0y * v[id];
			if (x < .5) x = .5;
			if (x > this.w - 1.5) x = this.w - 1.5;
			if (y < .5) y = .5;
			if (y > this.h - 1.5) y = this.h - 1.5;
			const i0 = x | 0;
			const i1 = i0 + 1;
			const j0 = y | 0;
			const j1 = j0 + 1;
			const s1 = x - i0;
			const s0 = 1 - s1;
			const t1 = y - j0;
			const t0 = 1 - t1;
			d[id] = s0 * (t0 * d0[j0 * this.w + i0] + t1 * d0[j1 * this.w + i0]) + s1 * (t0 * d0[j0 * this.w + i1] + t1 * d0[j1 * this.w + i1]);
		}
		this.setBounds(d);
	}
	project() {
		const div = this.u0;
		const p = this.v0;
		for (let j = 1; j < this.h - 1; j++) for (let i = 1; i < this.w - 1; i++) {
			const id = j * this.w + i;
			div[id] = -.5 * ((this.u[id + 1] - this.u[id - 1]) / this.w + (this.v[id + this.w] - this.v[id - this.w]) / this.h);
			p[id] = 0;
		}
		this.setBounds(div);
		this.setBounds(p);
		for (let k = 0; k < 10; k++) {
			for (let j = 1; j < this.h - 1; j++) for (let i = 1; i < this.w - 1; i++) {
				const id = j * this.w + i;
				p[id] = (div[id] + p[id - 1] + p[id + 1] + p[id - this.w] + p[id + this.w]) / 4;
			}
			this.setBounds(p);
		}
		for (let j = 1; j < this.h - 1; j++) for (let i = 1; i < this.w - 1; i++) {
			const id = j * this.w + i;
			this.u[id] -= .5 * this.w * (p[id + 1] - p[id - 1]);
			this.v[id] -= .5 * this.h * (p[id + this.w] - p[id - this.w]);
		}
		this.setBounds(this.u);
		this.setBounds(this.v);
	}
	setBounds(x) {
		for (let i = 0; i < this.w; i++) {
			x[i] = x[this.w + i];
			x[(this.h - 1) * this.w + i] = x[(this.h - 2) * this.w + i];
		}
		for (let j = 0; j < this.h; j++) {
			x[j * this.w] = x[j * this.w + 1];
			x[j * this.w + this.w - 1] = x[j * this.w + this.w - 2];
		}
	}
	advectParticles(dt) {
		for (let i = 0; i < this.particleCount; i++) {
			let x = this.particles[i * 2];
			let y = this.particles[i * 2 + 1];
			const id = this.idx(x, y);
			x += this.u[id] * dt * this.w * .35;
			y += this.v[id] * dt * this.h * .35;
			if (x < 1 || x > this.w - 1 || y < 1 || y > this.h - 1) {
				x = Math.random() * this.w;
				y = Math.random() * this.h;
			}
			this.particles[i * 2] = x;
			this.particles[i * 2 + 1] = y;
		}
	}
	metrics(turbulence) {
		let mass = 0;
		let ke = 0;
		let maxDiv = 0;
		let maxVel = 0;
		let maxDye = 0;
		let nonFinite = false;
		for (let j = 1; j < this.h - 1; j++) for (let i = 1; i < this.w - 1; i++) {
			const id = j * this.w + i;
			const u = this.u[id];
			const v = this.v[id];
			if (!Number.isFinite(u) || !Number.isFinite(v) || !Number.isFinite(this.d[id])) nonFinite = true;
			mass += this.d[id];
			ke += .5 * (u * u + v * v);
			const div = Math.abs(this.u[id + 1] - this.u[id - 1] + (this.v[id + this.w] - this.v[id - this.w]));
			if (div > maxDiv) maxDiv = div;
			const speed = Math.hypot(u, v);
			if (speed > maxVel) maxVel = speed;
			if (this.d[id] > maxDye) maxDye = this.d[id];
		}
		const visc = turbulence === "DNS" ? 8e-5 : turbulence === "LES" ? 22e-5 : 8e-4;
		const cfl = maxVel * .12;
		const keMean = ke / (this.w * this.h);
		const simDeltaT = 6 + Math.min(18, maxDye * 5.5 + keMean * 3.2);
		const simHotspotC = 84.6 + (simDeltaT - 12.4) * 1.15;
		const failures = [];
		if (nonFinite) failures.push("PHYS_NONFINITE");
		if (cfl > 1) failures.push("PHYS_CFL");
		if (maxDiv > .35) failures.push("PHYS_MASS");
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
			reStar: visc > 0 ? maxVel * .45 / visc : 0,
			maxSpeed: maxVel,
			simHotspotC,
			simDeltaT
		};
	}
};
function FluidCanvas() {
	const canvasRef = (0, import_react.useRef)(null);
	const solverRef = (0, import_react.useRef)(null);
	const lastRef = (0, import_react.useRef)(null);
	const downRef = (0, import_react.useRef)(null);
	const nonceRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const solver = new FluidSolver(96, 54);
		solverRef.current = solver;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const tmp = document.createElement("canvas");
		tmp.width = solver.w;
		tmp.height = solver.h;
		const tctx = tmp.getContext("2d");
		if (!tctx) return;
		let frame = 0;
		let raf = 0;
		const loop = () => {
			const state = useOmegaStore.getState();
			if (state.physicsResetNonce !== nonceRef.current) {
				nonceRef.current = state.physicsResetNonce;
				solver.reset();
			}
			const loopTwin = state.twins.find((t) => t.id === "cool-loop");
			const deltaT = typeof loopTwin?.observed.deltaT === "number" ? loopTwin.observed.deltaT : 12.4;
			const metrics = solver.step(state.physics.turbulence, state.physicsRunning, deltaT, state.physicsFault);
			if (frame % 8 === 0) state.setPhysicsMetrics(metrics);
			draw(ctx, canvas, solver, tmp, tctx, state.physicsField, state.physicsProbe);
			frame += 1;
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, []);
	function pointer(e, dragging) {
		const canvas = canvasRef.current;
		const solver = solverRef.current;
		if (!canvas || !solver) return;
		const rect = canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;
		const last = lastRef.current;
		const dx = last ? x - last.x : 0;
		const dy = last ? y - last.y : 0;
		lastRef.current = {
			x,
			y
		};
		if (dragging) solver.addForce(x, y, dx, dy, true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		width: 960,
		height: 540,
		className: "h-auto w-full rounded-md bg-background touch-none",
		onPointerDown: (e) => {
			e.target.setPointerCapture(e.pointerId);
			const canvas = canvasRef.current;
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			downRef.current = {
				x: (e.clientX - rect.left) / rect.width,
				y: (e.clientY - rect.top) / rect.height
			};
			lastRef.current = null;
			pointer(e, false);
		},
		onPointerMove: (e) => {
			if (e.buttons) pointer(e, true);
		},
		onPointerUp: (e) => {
			const canvas = canvasRef.current;
			const solver = solverRef.current;
			const down = downRef.current;
			if (canvas && solver && down) {
				const rect = canvas.getBoundingClientRect();
				const x = (e.clientX - rect.left) / rect.width;
				const y = (e.clientY - rect.top) / rect.height;
				if (Math.hypot(x - down.x, y - down.y) < .02) useOmegaStore.getState().setPhysicsProbe(solver.sample(x, y));
			}
			lastRef.current = null;
			downRef.current = null;
		}
	});
}
function draw(ctx, canvas, solver, tmp, tctx, field, probe) {
	const { w, h, d, u, v, particles, particleCount } = solver;
	const img = tctx.createImageData(w, h);
	for (let i = 0; i < w * h; i++) {
		let r = 10;
		let g = 12;
		let b = 16;
		if (field === "DYE") {
			const t = Math.min(1, Math.pow(Math.max(0, d[i]) * 2.4, .62));
			r = 10 + t * 198;
			g = 12 + t * 206;
			b = 16 + t * 224;
		} else if (field === "SPEED") {
			const t = Math.min(1, Math.hypot(u[i], v[i]) * .7);
			r = 8 + t * 40;
			g = 14 + t * 210;
			b = 18 + t * 190;
		} else {
			const div = Math.abs(i % w < w - 1 && i % w > 0 && i > w && i < w * (h - 1) ? u[i + 1] - u[i - 1] + (v[i + w] - v[i - w]) : 0);
			const t = Math.min(1, div * 4);
			r = 12 + t * 210;
			g = 12 + t * 40;
			b = 16 + t * 50;
		}
		img.data[i * 4] = r;
		img.data[i * 4 + 1] = g;
		img.data[i * 4 + 2] = b;
		img.data[i * 4 + 3] = 255;
	}
	tctx.putImageData(img, 0, 0);
	ctx.imageSmoothingEnabled = true;
	ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
	const sx = canvas.width / w;
	const sy = canvas.height / h;
	ctx.strokeStyle = "rgba(232,234,238,0.22)";
	ctx.lineWidth = 1;
	const step = 8;
	for (let y = 4; y < h; y += step) for (let x = 4; x < w; x += step) {
		const i = y * w + x;
		const sp = Math.hypot(u[i], v[i]);
		if (sp < .08) continue;
		const px = (x + .5) * sx;
		const py = (y + .5) * sy;
		const nx = u[i] / sp * Math.min(14, sp * 9);
		const ny = v[i] / sp * Math.min(14, sp * 9);
		ctx.beginPath();
		ctx.moveTo(px, py);
		ctx.lineTo(px + nx, py + ny);
		ctx.stroke();
	}
	for (let i = 0; i < particleCount; i++) {
		const px = particles[i * 2] * sx;
		const py = particles[i * 2 + 1] * sy;
		const gi = Math.max(0, Math.min(w * h - 1, (py / sy | 0) * w + (px / sx | 0)));
		ctx.fillStyle = Math.hypot(u[gi] ?? 0, v[gi] ?? 0) > 1.2 ? "rgba(196,122,106,0.7)" : "rgba(232,234,238,0.28)";
		ctx.fillRect(px - 1.4, py - 1.4, 5.2, 5.2);
		ctx.fillStyle = "rgba(212,216,223,0.85)";
		ctx.fillRect(px, py, 2.4, 2.4);
	}
	ctx.fillStyle = "#8b919c";
	ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
	ctx.fillText(`${field}  ·  arrows = velocity  ·  simulated`, 12, 18);
	const legendW = 120;
	const lx = canvas.width - legendW - 16;
	const ly = canvas.height - 22;
	const grd = ctx.createLinearGradient(lx, ly, lx + legendW, ly);
	if (field === "DYE") {
		grd.addColorStop(0, "#0a0c10");
		grd.addColorStop(1, "#d4d8df");
	} else if (field === "SPEED") {
		grd.addColorStop(0, "#0e1214");
		grd.addColorStop(1, "#32d2be");
	} else {
		grd.addColorStop(0, "#0c0c10");
		grd.addColorStop(1, "#d23232");
	}
	ctx.fillStyle = grd;
	ctx.fillRect(lx, ly - 6, legendW, 8);
	if (probe) {
		const x = probe.nx * canvas.width;
		const y = probe.ny * canvas.height;
		ctx.strokeStyle = "rgba(232,234,239,0.9)";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(x - 10, y);
		ctx.lineTo(x + 10, y);
		ctx.moveTo(x, y - 10);
		ctx.lineTo(x, y + 10);
		ctx.stroke();
	}
}
//#endregion
export { FluidCanvas as t };
