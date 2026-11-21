import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Wt as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Button, r as cn, t as Badge } from "./badge-uyEFEQwD.mjs";
import { l as useOmegaStore } from "./store-lOmq_ntM.mjs";
import { n as Panel, r as Stat, t as PageHeader } from "./panel-GIo8_dlm.mjs";
import { t as VoiceConsole } from "./voice-console-Di7DBnkl.mjs";
import { c as TpcCanvas, i as S2S1Canvas, o as Spacetime2DCanvas } from "./dark-matter-charts-DV74z4c5.mjs";
import { a as DEFAULT_HALO, i as DEFAULT_DM, r as DEFAULT_DETECTOR, s as composeLabRun } from "./research-engine-a6Btj1Uj.mjs";
import { t as FluidCanvas } from "./fluid-canvas-Cg-3ThF9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/visuals-06j8e9h9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function packEvents(events, radiusM, heightM) {
	const invR = 1 / Math.max(radiusM, .2);
	const invH = 1 / Math.max(heightM * .5, .2);
	return events.map((ev) => ({
		x: ev.signal.xM * invR,
		y: ev.signal.zM * invH,
		z: ev.signal.yM * invR,
		w: ev.truth.timeDay / 365.25 * 2 - 1,
		classId: ev.classification === "NR_LIKE" ? 0 : ev.classification === "ER_LIKE" ? 1 : 2,
		signal: ev.truth.model.startsWith("SI") || ev.truth.id.startsWith("DM-"),
		energy: ev.signal.energyKeV,
		day: ev.truth.timeDay,
		s1: ev.signal.s1PE
	}));
}
function rotate4D(x, y, z, w, plane, theta) {
	const c = Math.cos(theta);
	const s = Math.sin(theta);
	switch (plane) {
		case "XY": return [
			x * c - y * s,
			x * s + y * c,
			z,
			w
		];
		case "XZ": return [
			x * c - z * s,
			y,
			x * s + z * c,
			w
		];
		case "XW": return [
			x * c - w * s,
			y,
			z,
			x * s + w * c
		];
		case "YZ": return [
			x,
			y * c - z * s,
			y * s + z * c,
			w
		];
		case "YW": return [
			x,
			y * c - w * s,
			z,
			y * s + w * c
		];
		case "ZW": return [
			x,
			y,
			z * c - w * s,
			z * s + w * c
		];
	}
}
function project4D(x, y, z, w, theta, phi, planeA = "XW", planeB = "YW") {
	const p = rotate4D(x, y, z, w, planeA, theta);
	const q = rotate4D(p[0], p[1], p[2], p[3], planeB, phi);
	const k = 1 / Math.max(.35, 2.15 - q[3]);
	return [
		q[0] * k,
		q[1] * k,
		q[2] * k
	];
}
function slabFade(w, scrub, width) {
	const d = Math.abs(w - scrub);
	if (d >= width) return .07;
	return 1 - .75 * (d / Math.max(width, .04));
}
function timeRgb(w) {
	const t = (w + 1) * .5;
	return [
		.42 + .42 * t,
		.56 + .08 * (1 - t),
		.74 - .34 * t
	];
}
var CLASS_RGB = [
	[
		.48,
		.6,
		.5
	],
	[
		.56,
		.64,
		.72
	],
	[
		.77,
		.48,
		.42
	]
];
/** 16 vertices of the unit tesseract, all ±1 combinations of (x,y,z,w). */
var TESSERACT_VERTS = Array.from({ length: 16 }, (_, i) => [
	i & 1 ? 1 : -1,
	i & 2 ? 1 : -1,
	i & 4 ? 1 : -1,
	i & 8 ? 1 : -1
]);
/** 32 edges: vertices that differ in exactly one coordinate. */
var TESSERACT_EDGES = (() => {
	const edges = [];
	for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) {
		let d = 0;
		for (let k = 0; k < 4; k++) if (TESSERACT_VERTS[i][k] !== TESSERACT_VERTS[j][k]) d += 1;
		if (d === 1) edges.push([i, j]);
	}
	return edges;
})();
var CAMERA_PRESETS = {
	ISO: {
		pos: [
			3.4,
			2.2,
			4.1
		],
		target: [
			.4,
			0,
			0
		]
	},
	TPC: {
		pos: [
			.15,
			.55,
			4.35
		],
		target: [
			0,
			0,
			0
		]
	},
	T14: {
		pos: [
			4.05,
			1.35,
			1.55
		],
		target: [
			1.85,
			0,
			0
		]
	},
	"4D": {
		pos: [
			.2,
			.15,
			5.4
		],
		target: [
			0,
			0,
			0
		]
	}
};
function cameraForFocus(focus, mode) {
	if (focus === "T14") return "T14";
	if (focus === "TPC") return "TPC";
	if (focus === "GUARD") return mode === "4D" ? "4D" : "ISO";
	if (focus === "SPACETIME" || mode === "4D") return "4D";
	return "ISO";
}
var PLANES = [
	"XW",
	"YW",
	"ZW",
	"XY",
	"XZ",
	"YZ"
];
function FabricCanvas({ mode, subject, events, radiusM, heightM, fault, scrub, spinning, planeA, planeB, sliceY, slabWidth, preset, voiceFocus, onPick }) {
	const hostRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const packedRef = (0, import_react.useRef)([]);
	const modeRef = (0, import_react.useRef)(mode);
	const subjectRef = (0, import_react.useRef)(subject);
	const scrubRef = (0, import_react.useRef)(scrub);
	const spinRef = (0, import_react.useRef)(spinning);
	const faultRef = (0, import_react.useRef)(fault);
	const planeARef = (0, import_react.useRef)(planeA);
	const planeBRef = (0, import_react.useRef)(planeB);
	const sliceRef = (0, import_react.useRef)(sliceY);
	const slabRef = (0, import_react.useRef)(slabWidth);
	const presetRef = (0, import_react.useRef)(preset);
	const focusRef = (0, import_react.useRef)(voiceFocus);
	const pickRef = (0, import_react.useRef)(onPick);
	const [hud, setHud] = (0, import_react.useState)("orbit · picture of a simulation");
	packedRef.current = packEvents(events, radiusM, heightM);
	modeRef.current = mode;
	subjectRef.current = subject;
	scrubRef.current = scrub;
	spinRef.current = spinning;
	faultRef.current = fault;
	planeARef.current = planeA;
	planeBRef.current = planeB;
	sliceRef.current = sliceY;
	slabRef.current = slabWidth;
	presetRef.current = preset;
	focusRef.current = voiceFocus;
	pickRef.current = onPick;
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		const canvas = canvasRef.current;
		if (!host || !canvas) return;
		let disposed = false;
		let cleanup = null;
		(async () => {
			const THREE = await import("../_libs/three.mjs").then((n) => n.n);
			const { OrbitControls } = await import("../_libs/three.mjs").then((n) => n.t);
			if (disposed || !hostRef.current || !canvasRef.current) return;
			const renderer = new THREE.WebGLRenderer({
				canvas,
				antialias: true,
				alpha: false,
				powerPreference: "high-performance"
			});
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
			renderer.setClearColor(592396, 1);
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			const scene = new THREE.Scene();
			scene.fog = new THREE.FogExp2(592396, .055);
			const camera = new THREE.PerspectiveCamera(48, 1, .05, 48);
			camera.position.set(3.4, 2.2, 4.1);
			const controls = new OrbitControls(camera, canvas);
			controls.enableDamping = true;
			controls.dampingFactor = .08;
			controls.target.set(.4, 0, 0);
			controls.maxDistance = 14;
			controls.minDistance = 1.2;
			controls.enablePan = true;
			scene.add(new THREE.HemisphereLight(13160668, 1447966, .72));
			const key = new THREE.DirectionalLight(15264494, .55);
			key.position.set(4.2, 6.4, 3.1);
			scene.add(key);
			const rim = new THREE.DirectionalLight(9413560, .28);
			rim.position.set(-3, 1.4, -2);
			scene.add(rim);
			const grid = new THREE.GridHelper(8, 16, 2764856, 1447966);
			grid.position.y = -1.22;
			scene.add(grid);
			const tank = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.08, 64, 1, true), new THREE.MeshBasicMaterial({
				color: 9413560,
				wireframe: true,
				transparent: true,
				opacity: .32
			}));
			scene.add(tank);
			const fiducial = new THREE.Mesh(new THREE.CylinderGeometry(.82, .82, 1.58, 48, 1, true), new THREE.MeshBasicMaterial({
				color: 8034944,
				wireframe: true,
				transparent: true,
				opacity: .24
			}));
			scene.add(fiducial);
			const rings = [];
			const ringMat = new THREE.LineBasicMaterial({
				color: 9413560,
				transparent: true,
				opacity: .28
			});
			for (let i = 0; i < 5; i++) {
				const y = -.92 + i * .46;
				const pts = Array.from({ length: 48 }, (_, k) => {
					const a = k / 48 * Math.PI * 2;
					return new THREE.Vector3(Math.cos(a), y, Math.sin(a));
				});
				const geo = new THREE.BufferGeometry().setFromPoints(pts);
				const loop = new THREE.LineLoop(geo, ringMat);
				scene.add(loop);
				rings.push(loop);
			}
			const pmtMat = new THREE.MeshBasicMaterial({
				color: 9413560,
				transparent: true,
				opacity: .12,
				side: THREE.DoubleSide
			});
			const pmtGeo = new THREE.CircleGeometry(.96, 48);
			const pmtTop = new THREE.Mesh(pmtGeo, pmtMat);
			pmtTop.rotation.x = -Math.PI / 2;
			pmtTop.position.y = 1.05;
			const pmtBot = new THREE.Mesh(pmtGeo, pmtMat);
			pmtBot.rotation.x = Math.PI / 2;
			pmtBot.position.y = -1.05;
			scene.add(pmtTop, pmtBot);
			const t14 = new THREE.Group();
			t14.position.set(1.88, 0, 0);
			const tankMat = new THREE.MeshStandardMaterial({
				color: 2764856,
				metalness: .42,
				roughness: .48
			});
			const body = new THREE.Mesh(new THREE.BoxGeometry(.58, .92, .42), tankMat);
			const bushing = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, .28, 16), new THREE.MeshStandardMaterial({
				color: 12107980,
				metalness: .6,
				roughness: .3
			}));
			bushing.position.y = .6;
			const fins = [];
			const finMat = new THREE.MeshStandardMaterial({
				color: 3817544,
				metalness: .3,
				roughness: .55
			});
			for (let i = 0; i < 4; i++) {
				const fin = new THREE.Mesh(new THREE.BoxGeometry(.04, .7, .36), finMat);
				fin.position.set(-.36, 0, -.05 + i * .04);
				t14.add(fin);
				fins.push(fin);
			}
			t14.add(body, bushing);
			scene.add(t14);
			const maxN = 520;
			const positions = new Float32Array(maxN * 3);
			const colors = new Float32Array(maxN * 3);
			const sizes = new Float32Array(maxN);
			const alphas = new Float32Array(maxN);
			const geom = new THREE.BufferGeometry();
			geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
			geom.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
			geom.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
			geom.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
			const pointMat = new THREE.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				uniforms: {},
				vertexShader: `
          attribute vec3 aColor;
          attribute float aSize;
          attribute float aAlpha;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vColor = aColor;
            vAlpha = aAlpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (220.0 / max(1.2, -mv.z));
            gl_Position = projectionMatrix * mv;
          }
        `,
				fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec2 p = gl_PointCoord - vec2(0.5);
            float d = length(p);
            if (d > 0.5) discard;
            float glow = pow(1.0 - d * 2.0, 1.6);
            gl_FragColor = vec4(vColor, vAlpha * glow);
          }
        `
			});
			const points = new THREE.Points(geom, pointMat);
			scene.add(points);
			const flowN = 240;
			const flowPos = /* @__PURE__ */ new Float32Array(720);
			const flowCol = /* @__PURE__ */ new Float32Array(720);
			const flowGeo = new THREE.BufferGeometry();
			flowGeo.setAttribute("position", new THREE.BufferAttribute(flowPos, 3));
			flowGeo.setAttribute("color", new THREE.BufferAttribute(flowCol, 3));
			const flow = new THREE.Line(flowGeo, new THREE.LineBasicMaterial({
				vertexColors: true,
				transparent: true,
				opacity: .85
			}));
			scene.add(flow);
			const tessN = TESSERACT_EDGES.length * 2;
			const tessPos = new Float32Array(tessN * 3);
			const tessGeo = new THREE.BufferGeometry();
			tessGeo.setAttribute("position", new THREE.BufferAttribute(tessPos, 3));
			const tess = new THREE.LineSegments(tessGeo, new THREE.LineBasicMaterial({
				color: 9413560,
				transparent: true,
				opacity: .38
			}));
			scene.add(tess);
			const lineMax = 720;
			const linePos = new Float32Array(lineMax * 3);
			const lineCol = new Float32Array(lineMax * 3);
			const lineGeo = new THREE.BufferGeometry();
			lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
			lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
			const worldlines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
				vertexColors: true,
				transparent: true,
				opacity: .42
			}));
			scene.add(worldlines);
			const axes = new THREE.AxesHelper(.5);
			axes.position.set(-1.7, -1.08, -1.7);
			scene.add(axes);
			const clock = new THREE.Clock();
			let theta = .42;
			let lastPreset = presetRef.current;
			let followUntil = 0;
			const desiredPos = new THREE.Vector3();
			const desiredTarget = new THREE.Vector3();
			const raycaster = new THREE.Raycaster();
			raycaster.params.Points = { threshold: .09 };
			const pointer = new THREE.Vector2();
			const resize = () => {
				const w = Math.max(160, host.clientWidth);
				const h = Math.max(220, host.clientHeight);
				renderer.setSize(w, h, false);
				camera.aspect = w / h;
				camera.updateProjectionMatrix();
			};
			const ro = new ResizeObserver(resize);
			ro.observe(host);
			resize();
			const onClick = (ev) => {
				const rect = canvas.getBoundingClientRect();
				pointer.x = (ev.clientX - rect.left) / rect.width * 2 - 1;
				pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
				raycaster.setFromCamera(pointer, camera);
				const hits = raycaster.intersectObject(points);
				if (hits.length === 0) {
					pickRef.current?.(null);
					setHud(`${modeRef.current} · ${subjectRef.current} · picture of a simulation`);
					return;
				}
				const idx = hits[0].index ?? 0;
				const p = packedRef.current[idx];
				if (!p) return;
				const label = p.classId === 0 ? "NR_LIKE" : p.classId === 1 ? "ER_LIKE" : "VETOED";
				pickRef.current?.({
					classId: p.classId,
					energy: p.energy,
					day: p.day,
					signal: p.signal
				});
				setHud(`${label} · ${p.energy.toFixed(1)} keV · day ${p.day.toFixed(0)} · SCI:SIMULATED`);
			};
			canvas.addEventListener("pointerdown", onClick);
			const hidden = () => document.hidden;
			const loop = () => {
				if (disposed) return;
				const dt = Math.min(clock.getDelta(), .1);
				if (hidden()) return;
				if (spinRef.current) theta += dt * .32;
				const packed = packedRef.current;
				const modeNow = modeRef.current;
				const subjectNow = subjectRef.current;
				const scrubNow = scrubRef.current * 2 - 1;
				const windowW = slabRef.current;
				const slice = sliceRef.current * 2 - 1;
				const pos = geom.getAttribute("position");
				const col = geom.getAttribute("aColor");
				const sz = geom.getAttribute("aSize");
				const al = geom.getAttribute("aAlpha");
				const n = Math.min(packed.length, maxN);
				const dimTpc = subjectNow === "COOLING" ? .16 : 1;
				const xyz = [];
				for (let i = 0; i < n; i++) {
					const ev = packed[i];
					let x = ev.x;
					let y = ev.y;
					let z = ev.z;
					if (modeNow === "4D") [x, y, z] = project4D(ev.x, ev.y, ev.z, ev.w, theta, theta * .61, planeARef.current, planeBRef.current);
					xyz[i] = [
						x,
						y,
						z
					];
					let fade = modeNow === "4D" ? slabFade(ev.w, scrubNow, windowW) : 1;
					if (modeNow === "3D") {
						const dy = Math.abs(ev.y - slice);
						if (dy > .22) fade *= Math.max(.08, 1 - (dy - .22) * 2.4);
					}
					fade *= dimTpc;
					pos.setXYZ(i, x, y, z);
					const rgb = modeNow === "4D" ? timeRgb(ev.w) : CLASS_RGB[ev.classId];
					const boost = ev.signal ? 1.22 : 1;
					col.setXYZ(i, rgb[0] * fade * boost, rgb[1] * fade * boost, rgb[2] * fade * boost);
					sz.setX(i, (ev.signal ? 9.5 : 6.2) * (.7 + Math.min(1.4, ev.energy / 40)));
					al.setX(i, fade * (ev.classId === 2 ? .35 : .95));
				}
				geom.setDrawRange(0, n);
				pos.needsUpdate = true;
				col.needsUpdate = true;
				sz.needsUpdate = true;
				al.needsUpdate = true;
				geom.computeBoundingSphere();
				let li = 0;
				const byClass = [
					[],
					[],
					[]
				];
				for (let i = 0; i < n; i++) byClass[packed[i].classId].push(i);
				for (const list of byClass) {
					list.sort((a, b) => packed[a].w - packed[b].w);
					for (let k = 1; k < list.length && li + 1 < lineMax; k++) {
						const a = list[k - 1];
						const b = list[k];
						const pa = xyz[a];
						const pb = xyz[b];
						if (!pa || !pb) continue;
						if (Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]) > .55) continue;
						const rgb = CLASS_RGB[packed[a].classId];
						linePos[li * 3] = pa[0];
						linePos[li * 3 + 1] = pa[1];
						linePos[li * 3 + 2] = pa[2];
						lineCol[li * 3] = rgb[0];
						lineCol[li * 3 + 1] = rgb[1];
						lineCol[li * 3 + 2] = rgb[2];
						li += 1;
						linePos[li * 3] = pb[0];
						linePos[li * 3 + 1] = pb[1];
						linePos[li * 3 + 2] = pb[2];
						lineCol[li * 3] = rgb[0] * .6;
						lineCol[li * 3 + 1] = rgb[1] * .6;
						lineCol[li * 3 + 2] = rgb[2] * .6;
						li += 1;
					}
				}
				lineGeo.setDrawRange(0, li);
				lineGeo.getAttribute("position").needsUpdate = true;
				lineGeo.getAttribute("color").needsUpdate = true;
				worldlines.visible = subjectNow === "SPACETIME" && modeNow !== "2D";
				const stall = faultRef.current !== "NOMINAL";
				const t = clock.getElapsedTime();
				const speed = stall ? .28 : 1.15;
				for (let i = 0; i < flowN; i++) {
					const s = i / 239;
					const a = s * Math.PI * 8 + t * speed;
					const r = .22 + (stall ? .05 : .16) * Math.sin(a * 1.7);
					flowPos[i * 3] = 1.88 + r * Math.cos(a);
					flowPos[i * 3 + 1] = -.42 + s * .84 + .04 * Math.sin(a * 2);
					flowPos[i * 3 + 2] = r * Math.sin(a) * .55;
					if (stall) {
						flowCol[i * 3] = .77;
						flowCol[i * 3 + 1] = .48;
						flowCol[i * 3 + 2] = .42;
					} else {
						flowCol[i * 3] = .85;
						flowCol[i * 3 + 1] = .88;
						flowCol[i * 3 + 2] = .92;
					}
				}
				flowGeo.getAttribute("position").needsUpdate = true;
				flowGeo.getAttribute("color").needsUpdate = true;
				flow.visible = subjectNow !== "TPC";
				tankMat.color.set(stall ? 5910056 : 2764856);
				tankMat.emissive.set(stall ? 3807252 : 0);
				if (modeNow === "4D") {
					tess.visible = true;
					let ti = 0;
					for (const [ia, ib] of TESSERACT_EDGES) {
						const va = TESSERACT_VERTS[ia];
						const vb = TESSERACT_VERTS[ib];
						const pa = project4D(va[0] * .95, va[1] * .95, va[2] * .95, va[3] * .95, theta, theta * .61, planeARef.current, planeBRef.current);
						const pb = project4D(vb[0] * .95, vb[1] * .95, vb[2] * .95, vb[3] * .95, theta, theta * .61, planeARef.current, planeBRef.current);
						tessPos[ti] = pa[0];
						tessPos[ti + 1] = pa[1];
						tessPos[ti + 2] = pa[2];
						tessPos[ti + 3] = pb[0];
						tessPos[ti + 4] = pb[1];
						tessPos[ti + 5] = pb[2];
						ti += 6;
					}
					tessGeo.getAttribute("position").needsUpdate = true;
				} else tess.visible = false;
				const showVol = modeNow !== "2D" && subjectNow !== "COOLING";
				tank.visible = showVol;
				fiducial.visible = showVol;
				pmtTop.visible = showVol;
				pmtBot.visible = showVol;
				for (const r of rings) r.visible = showVol;
				t14.visible = subjectNow !== "TPC";
				const nowT = clock.getElapsedTime();
				if (presetRef.current !== lastPreset) {
					lastPreset = presetRef.current;
					followUntil = nowT + 1.5;
				}
				if (focusRef.current || nowT < followUntil) {
					const focusPreset = cameraForFocus(focusRef.current, modeNow);
					const cam = CAMERA_PRESETS[focusRef.current ? focusPreset : presetRef.current];
					desiredPos.set(...cam.pos);
					desiredTarget.set(...cam.target);
					const k = 1 - Math.exp(-2.4 * dt);
					camera.position.lerp(desiredPos, k);
					controls.target.lerp(desiredTarget, k);
				}
				controls.update();
				renderer.render(scene, camera);
			};
			renderer.setAnimationLoop(loop);
			cleanup = () => {
				renderer.setAnimationLoop(null);
				canvas.removeEventListener("pointerdown", onClick);
				ro.disconnect();
				controls.dispose();
				geom.dispose();
				flowGeo.dispose();
				tessGeo.dispose();
				lineGeo.dispose();
				tank.geometry.dispose();
				tank.material.dispose();
				fiducial.geometry.dispose();
				fiducial.material.dispose();
				pmtGeo.dispose();
				pmtMat.dispose();
				ringMat.dispose();
				for (const r of rings) r.geometry.dispose();
				body.geometry.dispose();
				bushing.geometry.dispose();
				bushing.material.dispose();
				tankMat.dispose();
				finMat.dispose();
				for (const f of fins) f.geometry.dispose();
				pointMat.dispose();
				flow.material.dispose();
				tess.material.dispose();
				worldlines.material.dispose();
				renderer.dispose();
			};
		})();
		return () => {
			disposed = true;
			cleanup?.();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: hostRef,
		className: "relative h-[28rem] w-full sm:h-[34rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "h-full w-full touch-none rounded-md bg-background"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute left-3 top-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
			children: hud
		})]
	});
}
function VisualsPage() {
	const [mode, setMode] = (0, import_react.useState)("3D");
	const [subject, setSubject] = (0, import_react.useState)("SPACETIME");
	const [scrub, setScrub] = (0, import_react.useState)(.42);
	const [spinning, setSpinning] = (0, import_react.useState)(true);
	const [planeA, setPlaneA] = (0, import_react.useState)("XW");
	const [planeB, setPlaneB] = (0, import_react.useState)("YW");
	const [sliceY, setSliceY] = (0, import_react.useState)(.5);
	const [slabWidth, setSlabWidth] = (0, import_react.useState)(.28);
	const [preset, setPreset] = (0, import_react.useState)("ISO");
	const [pick, setPick] = (0, import_react.useState)(null);
	const fault = useOmegaStore((s) => s.physicsFault);
	const dm = useOmegaStore((s) => s.darkMatter);
	const voiceFocus = useOmegaStore((s) => s.voiceFocus);
	const voiceSpeaker = useOmegaStore((s) => s.voiceSpeaker);
	const lab = (0, import_react.useMemo)(() => composeLabRun({
		detector: {
			...DEFAULT_DETECTOR,
			exposureDays: dm.exposureDays,
			fiducialMassKg: dm.fiducialMassKg
		},
		dm: {
			...DEFAULT_DM,
			massGeV: dm.massGeV,
			crossSectionCm2: 10 ** dm.log10Sigma
		},
		halo: DEFAULT_HALO,
		seed: dm.seed
	}), [
		dm.exposureDays,
		dm.fiducialMassKg,
		dm.massGeV,
		dm.log10Sigma,
		dm.seed
	]);
	const detector = {
		...DEFAULT_DETECTOR,
		exposureDays: dm.exposureDays,
		fiducialMassKg: dm.fiducialMassKg
	};
	const classLabel = pick ? pick.classId === 0 ? "NR_LIKE" : pick.classId === 1 ? "ER_LIKE" : "VETOED" : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Visual fabric · 2D / 3D / 4D",
			title: "Geometry is not complete state",
			description: "Two dimensions show a slice. Three show a volume. Four include time. None of these canvases are the plant, and none of them are evidence.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: spinning ? "outline" : "default",
				onClick: () => setSpinning((v) => !v),
				children: spinning ? "Hold 4-rotation" : "Rotate 4-space"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/voice",
					children: "Agent voice"
				})
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Mode",
					value: mode,
					hint: mode === "4D" ? `${planeA} then ${planeB}` : mode === "3D" ? "volume + orbit" : "slice"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Events",
					value: lab.events.length,
					hint: "SCI:SIMULATED"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Time slab",
					value: `${(scrub * 365).toFixed(0)} d`,
					hint: "4D window center"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Voice focus",
					value: voiceSpeaker ?? "idle",
					hint: voiceFocus ? `camera → ${voiceFocus}` : "speech is A2"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-1",
			children: [[
				"2D",
				"3D",
				"4D"
			].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setMode(m),
				className: cn("h-11 min-w-11 rounded-md px-4 text-sm", mode === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
				children: m
			}, m)), [
				"COOLING",
				"TPC",
				"SPACETIME"
			].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setSubject(s),
				className: cn("h-11 rounded-md px-3 text-sm", subject === s ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60"),
				children: s === "COOLING" ? "T-14 loop" : s === "TPC" ? "Xe TPC" : "Spacetime"
			}, s))]
		}),
		mode !== "2D" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex flex-wrap gap-1",
			children: [
				"ISO",
				"TPC",
				"T14",
				"4D"
			].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setPreset(p),
				className: cn("h-11 rounded-md px-3 text-xs", preset === p ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent/60"),
				children: p === "ISO" ? "Isometric" : p === "TPC" ? "Look TPC" : p === "T14" ? "Look T-14" : "Look 4-space"
			}, p))
		}) : null,
		mode === "4D" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex flex-wrap gap-1",
			children: PLANES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					setPlaneA(p);
					setPlaneB(p === "XW" ? "YW" : p === "YW" ? "ZW" : p === "ZW" ? "XW" : "XW");
				},
				className: cn("h-11 rounded-md px-3 font-mono text-xs", planeA === p ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent/60"),
				children: p
			}, p))
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			title: mode === "2D" ? subject === "COOLING" ? "DigiSim field (2D)" : subject === "TPC" ? "TPC planes (2D)" : "Worldline slices (r,t) and (z,t)" : mode === "3D" ? "Volume — orbit to inspect" : "4D projection — tesseract + time slab",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: "info",
				children: fault
			}),
			children: [
				mode === "2D" && subject === "COOLING" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FluidCanvas, {}) : null,
				mode === "2D" && subject === "TPC" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-w-0 gap-3 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TpcCanvas, {
						events: lab.events,
						radiusM: detector.radiusM,
						heightM: detector.heightM,
						sliceZ: sliceY
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(S2S1Canvas, { events: lab.events })]
				}) : null,
				mode === "2D" && subject === "SPACETIME" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-w-0 gap-3 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spacetime2DCanvas, {
						events: lab.events,
						scrub,
						axis: "RT"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spacetime2DCanvas, {
						events: lab.events,
						scrub,
						axis: "ZT"
					})]
				}) : null,
				mode !== "2D" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FabricCanvas, {
					mode,
					subject,
					events: lab.events,
					radiusM: detector.radiusM,
					heightM: detector.heightM,
					fault,
					scrub,
					spinning,
					planeA,
					planeB,
					sliceY,
					slabWidth,
					preset,
					voiceFocus,
					onPick: setPick
				}) : null,
				mode === "3D" || mode === "2D" && subject === "TPC" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex justify-between",
						children: ["Height slice", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-foreground",
							children: [((sliceY * 2 - 1) * detector.heightM * .5).toFixed(2), " m"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						className: "mt-2 h-11 w-full accent-primary",
						min: 0,
						max: 1,
						step: .01,
						value: sliceY,
						onChange: (e) => setSliceY(Number(e.target.value))
					})]
				}) : null,
				mode === "4D" || mode === "2D" && subject === "SPACETIME" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex justify-between",
							children: ["Time hyperplane", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-foreground",
								children: [(scrub * 365.25).toFixed(0), " day"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							className: "mt-2 h-11 w-full accent-primary",
							min: 0,
							max: 1,
							step: .01,
							value: scrub,
							onChange: (e) => setScrub(Number(e.target.value))
						})]
					}), mode === "4D" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex justify-between",
							children: ["Slab width", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-foreground",
								children: slabWidth.toFixed(2)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							className: "mt-2 h-11 w-full accent-primary",
							min: .08,
							max: .9,
							step: .01,
							value: slabWidth,
							onChange: (e) => setSlabWidth(Number(e.target.value))
						})]
					}) : null]
				}) : null,
				pick ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 font-mono text-xs text-foreground",
					children: [
						"Picked ",
						classLabel,
						" · ",
						pick.energy.toFixed(1),
						" keV · day ",
						pick.day.toFixed(0),
						pick.signal ? " · injected SI" : "",
						" · still SCI:SIMULATED"
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Green NR-like, blue ER-like, red vetoed. 4D colors events by day. Drag to orbit — no WASD. Click a point to inspect. Voice from the briefing steers the camera. This is a picture of a simulation."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "What each extra dimension adds",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-2 text-sm leading-relaxed text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: "2D"
						}), " — a cut. Cooling dye plus velocity arrows, S2/S1, or paired (r,t) and (z,t) worldlines. Easy to read. Easy to lie with."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: "3D"
						}), " — xenon volume, PMT planes, field-cage rings, T-14 body and oil loop. Height slice fades events off the plane. Fiducial is a dashed cylinder, not containment."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: "4D"
						}), " — time is an axis. Recoils become a world-tube. Rotate XW / YW / ZW. A pretty 5σ-looking cluster in a slab can vanish when you rotate w."] })
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceConsole, { compact: true })]
		})
	] });
}
//#endregion
export { VisualsPage as component };
