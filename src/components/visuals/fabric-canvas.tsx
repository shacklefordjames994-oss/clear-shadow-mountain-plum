import { useEffect, useRef, useState } from "react";
import type { DigiSimFault } from "@/lib/omega/types";
import {
  CAMERA_PRESETS,
  CLASS_RGB,
  TESSERACT_EDGES,
  TESSERACT_VERTS,
  cameraForFocus,
  packEvents,
  project4D,
  slabFade,
  timeRgb,
  type CameraPreset,
  type PackedEvent,
  type Plane4,
  type VisualMode,
  type VisualSubject,
  type VoiceFocus,
} from "@/lib/omega/spacetime";
import type { SimulatedEvent } from "@/lib/omega/dark-matter/engine";

export interface FabricPick {
  classId: 0 | 1 | 2;
  energy: number;
  day: number;
  signal: boolean;
}

export function FabricCanvas({
  mode,
  subject,
  events,
  radiusM,
  heightM,
  fault,
  scrub,
  spinning,
  planeA,
  planeB,
  sliceY,
  slabWidth,
  preset,
  voiceFocus,
  onPick,
}: {
  mode: VisualMode;
  subject: VisualSubject;
  events: SimulatedEvent[];
  radiusM: number;
  heightM: number;
  fault: DigiSimFault;
  scrub: number;
  spinning: boolean;
  planeA: Plane4;
  planeB: Plane4;
  sliceY: number;
  slabWidth: number;
  preset: CameraPreset;
  voiceFocus: VoiceFocus;
  onPick?: (pick: FabricPick | null) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const packedRef = useRef<PackedEvent[]>([]);
  const modeRef = useRef(mode);
  const subjectRef = useRef(subject);
  const scrubRef = useRef(scrub);
  const spinRef = useRef(spinning);
  const faultRef = useRef(fault);
  const planeARef = useRef(planeA);
  const planeBRef = useRef(planeB);
  const sliceRef = useRef(sliceY);
  const slabRef = useRef(slabWidth);
  const presetRef = useRef(preset);
  const focusRef = useRef(voiceFocus);
  const pickRef = useRef(onPick);
  const [hud, setHud] = useState("orbit · picture of a simulation");

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

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    void (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      if (disposed || !hostRef.current || !canvasRef.current) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x090a0c, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x090a0c, 0.055);
      const camera = new THREE.PerspectiveCamera(48, 1, 0.05, 48);
      camera.position.set(3.4, 2.2, 4.1);

      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.target.set(0.4, 0, 0);
      controls.maxDistance = 14;
      controls.minDistance = 1.2;
      controls.enablePan = true;

      scene.add(new THREE.HemisphereLight(0xc8d0dc, 0x16181e, 0.72));
      const key = new THREE.DirectionalLight(0xe8eaee, 0.55);
      key.position.set(4.2, 6.4, 3.1);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x8fa3b8, 0.28);
      rim.position.set(-3, 1.4, -2);
      scene.add(rim);

      const grid = new THREE.GridHelper(8, 16, 0x2a3038, 0x16181e);
      grid.position.y = -1.22;
      scene.add(grid);

      const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 2.08, 64, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x8fa3b8, wireframe: true, transparent: true, opacity: 0.32 }),
      );
      scene.add(tank);
      const fiducial = new THREE.Mesh(
        new THREE.CylinderGeometry(0.82, 0.82, 1.58, 48, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x7a9a80, wireframe: true, transparent: true, opacity: 0.24 }),
      );
      scene.add(fiducial);

      const rings: InstanceType<typeof THREE.LineLoop>[] = [];
      const ringMat = new THREE.LineBasicMaterial({ color: 0x8fa3b8, transparent: true, opacity: 0.28 });
      for (let i = 0; i < 5; i++) {
        const y = -0.92 + i * 0.46;
        const pts = Array.from({ length: 48 }, (_, k) => {
          const a = (k / 48) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a), y, Math.sin(a));
        });
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const loop = new THREE.LineLoop(geo, ringMat);
        scene.add(loop);
        rings.push(loop);
      }

      const pmtMat = new THREE.MeshBasicMaterial({
        color: 0x8fa3b8,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      });
      const pmtGeo = new THREE.CircleGeometry(0.96, 48);
      const pmtTop = new THREE.Mesh(pmtGeo, pmtMat);
      pmtTop.rotation.x = -Math.PI / 2;
      pmtTop.position.y = 1.05;
      const pmtBot = new THREE.Mesh(pmtGeo, pmtMat);
      pmtBot.rotation.x = Math.PI / 2;
      pmtBot.position.y = -1.05;
      scene.add(pmtTop, pmtBot);

      const t14 = new THREE.Group();
      t14.position.set(1.88, 0, 0);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x2a3038, metalness: 0.42, roughness: 0.48 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.92, 0.42), tankMat);
      const bushing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 0.28, 16),
        new THREE.MeshStandardMaterial({ color: 0xb8c0cc, metalness: 0.6, roughness: 0.3 }),
      );
      bushing.position.y = 0.6;
      const fins: InstanceType<typeof THREE.Mesh>[] = [];
      const finMat = new THREE.MeshStandardMaterial({ color: 0x3a4048, metalness: 0.3, roughness: 0.55 });
      for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7, 0.36), finMat);
        fin.position.set(-0.36, 0, -0.05 + i * 0.04);
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
        `,
      });
      const points = new THREE.Points(geom, pointMat);
      scene.add(points);

      const flowN = 240;
      const flowPos = new Float32Array(flowN * 3);
      const flowCol = new Float32Array(flowN * 3);
      const flowGeo = new THREE.BufferGeometry();
      flowGeo.setAttribute("position", new THREE.BufferAttribute(flowPos, 3));
      flowGeo.setAttribute("color", new THREE.BufferAttribute(flowCol, 3));
      const flow = new THREE.Line(
        flowGeo,
        new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85 }),
      );
      scene.add(flow);

      const tessN = TESSERACT_EDGES.length * 2;
      const tessPos = new Float32Array(tessN * 3);
      const tessGeo = new THREE.BufferGeometry();
      tessGeo.setAttribute("position", new THREE.BufferAttribute(tessPos, 3));
      const tess = new THREE.LineSegments(
        tessGeo,
        new THREE.LineBasicMaterial({ color: 0x8fa3b8, transparent: true, opacity: 0.38 }),
      );
      scene.add(tess);

      const lineMax = 720;
      const linePos = new Float32Array(lineMax * 3);
      const lineCol = new Float32Array(lineMax * 3);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
      lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
      const worldlines = new THREE.LineSegments(
        lineGeo,
        new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.42 }),
      );
      scene.add(worldlines);

      const axes = new THREE.AxesHelper(0.5);
      axes.position.set(-1.7, -1.08, -1.7);
      scene.add(axes);

      const clock = new THREE.Clock();
      let theta = 0.42;
      let lastPreset = presetRef.current;
      let followUntil = 0;
      const desiredPos = new THREE.Vector3();
      const desiredTarget = new THREE.Vector3();
      const raycaster = new THREE.Raycaster();
      raycaster.params.Points = { threshold: 0.09 };
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

      const onClick = (ev: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(points);
        if (hits.length === 0) {
          pickRef.current?.(null);
          setHud(`${modeRef.current} · ${subjectRef.current} · picture of a simulation`);
          return;
        }
        const idx = hits[0].index ?? 0;
        const packed = packedRef.current;
        const p = packed[idx];
        if (!p) return;
        const label = p.classId === 0 ? "NR_LIKE" : p.classId === 1 ? "ER_LIKE" : "VETOED";
        pickRef.current?.({ classId: p.classId, energy: p.energy, day: p.day, signal: p.signal });
        setHud(`${label} · ${p.energy.toFixed(1)} keV · day ${p.day.toFixed(0)} · SCI:SIMULATED`);
      };
      canvas.addEventListener("pointerdown", onClick);

      const hidden = () => document.hidden;

      const loop = () => {
        if (disposed) return;
        const dt = Math.min(clock.getDelta(), 0.1);
        if (hidden()) return;
        if (spinRef.current) theta += dt * 0.32;

        const packed = packedRef.current;
        const modeNow = modeRef.current;
        const subjectNow = subjectRef.current;
        const scrubNow = scrubRef.current * 2 - 1;
        const windowW = slabRef.current;
        const slice = sliceRef.current * 2 - 1;
        const pos = geom.getAttribute("position") as InstanceType<typeof THREE.BufferAttribute>;
        const col = geom.getAttribute("aColor") as InstanceType<typeof THREE.BufferAttribute>;
        const sz = geom.getAttribute("aSize") as InstanceType<typeof THREE.BufferAttribute>;
        const al = geom.getAttribute("aAlpha") as InstanceType<typeof THREE.BufferAttribute>;
        const n = Math.min(packed.length, maxN);
        const dimTpc = subjectNow === "COOLING" ? 0.16 : 1;
        const xyz: [number, number, number][] = [];

        for (let i = 0; i < n; i++) {
          const ev = packed[i];
          let x = ev.x;
          let y = ev.y;
          let z = ev.z;
          if (modeNow === "4D") {
            [x, y, z] = project4D(ev.x, ev.y, ev.z, ev.w, theta, theta * 0.61, planeARef.current, planeBRef.current);
          }
          xyz[i] = [x, y, z];
          let fade = modeNow === "4D" ? slabFade(ev.w, scrubNow, windowW) : 1;
          if (modeNow === "3D") {
            const dy = Math.abs(ev.y - slice);
            if (dy > 0.22) fade *= Math.max(0.08, 1 - (dy - 0.22) * 2.4);
          }
          fade *= dimTpc;
          pos.setXYZ(i, x, y, z);
          const rgb = modeNow === "4D" ? timeRgb(ev.w) : CLASS_RGB[ev.classId];
          const boost = ev.signal ? 1.22 : 1;
          col.setXYZ(i, rgb[0] * fade * boost, rgb[1] * fade * boost, rgb[2] * fade * boost);
          sz.setX(i, (ev.signal ? 9.5 : 6.2) * (0.7 + Math.min(1.4, ev.energy / 40)));
          al.setX(i, fade * (ev.classId === 2 ? 0.35 : 0.95));
        }
        geom.setDrawRange(0, n);
        pos.needsUpdate = true;
        col.needsUpdate = true;
        sz.needsUpdate = true;
        al.needsUpdate = true;
        geom.computeBoundingSphere();

        let li = 0;
        const byClass: number[][] = [[], [], []];
        for (let i = 0; i < n; i++) byClass[packed[i].classId].push(i);
        for (const list of byClass) {
          list.sort((a, b) => packed[a].w - packed[b].w);
          for (let k = 1; k < list.length && li + 1 < lineMax; k++) {
            const a = list[k - 1];
            const b = list[k];
            const pa = xyz[a];
            const pb = xyz[b];
            if (!pa || !pb) continue;
            const dist = Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]);
            if (dist > 0.55) continue;
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
            lineCol[li * 3] = rgb[0] * 0.6;
            lineCol[li * 3 + 1] = rgb[1] * 0.6;
            lineCol[li * 3 + 2] = rgb[2] * 0.6;
            li += 1;
          }
        }
        lineGeo.setDrawRange(0, li);
        (lineGeo.getAttribute("position") as InstanceType<typeof THREE.BufferAttribute>).needsUpdate = true;
        (lineGeo.getAttribute("color") as InstanceType<typeof THREE.BufferAttribute>).needsUpdate = true;
        worldlines.visible = subjectNow === "SPACETIME" && modeNow !== "2D";

        const stall = faultRef.current !== "NOMINAL";
        const t = clock.getElapsedTime();
        const speed = stall ? 0.28 : 1.15;
        for (let i = 0; i < flowN; i++) {
          const s = i / (flowN - 1);
          const a = s * Math.PI * 8 + t * speed;
          const r = 0.22 + (stall ? 0.05 : 0.16) * Math.sin(a * 1.7);
          flowPos[i * 3] = 1.88 + r * Math.cos(a);
          flowPos[i * 3 + 1] = -0.42 + s * 0.84 + 0.04 * Math.sin(a * 2);
          flowPos[i * 3 + 2] = r * Math.sin(a) * 0.55;
          if (stall) {
            flowCol[i * 3] = 0.77;
            flowCol[i * 3 + 1] = 0.48;
            flowCol[i * 3 + 2] = 0.42;
          } else {
            flowCol[i * 3] = 0.85;
            flowCol[i * 3 + 1] = 0.88;
            flowCol[i * 3 + 2] = 0.92;
          }
        }
        (flowGeo.getAttribute("position") as InstanceType<typeof THREE.BufferAttribute>).needsUpdate = true;
        (flowGeo.getAttribute("color") as InstanceType<typeof THREE.BufferAttribute>).needsUpdate = true;
        flow.visible = subjectNow !== "TPC";
        tankMat.color.set(stall ? 0x5a2e28 : 0x2a3038);
        tankMat.emissive.set(stall ? 0x3a1814 : 0x000000);

        if (modeNow === "4D") {
          tess.visible = true;
          let ti = 0;
          for (const [ia, ib] of TESSERACT_EDGES) {
            const va = TESSERACT_VERTS[ia];
            const vb = TESSERACT_VERTS[ib];
            const pa = project4D(va[0] * 0.95, va[1] * 0.95, va[2] * 0.95, va[3] * 0.95, theta, theta * 0.61, planeARef.current, planeBRef.current);
            const pb = project4D(vb[0] * 0.95, vb[1] * 0.95, vb[2] * 0.95, vb[3] * 0.95, theta, theta * 0.61, planeARef.current, planeBRef.current);
            tessPos[ti] = pa[0];
            tessPos[ti + 1] = pa[1];
            tessPos[ti + 2] = pa[2];
            tessPos[ti + 3] = pb[0];
            tessPos[ti + 4] = pb[1];
            tessPos[ti + 5] = pb[2];
            ti += 6;
          }
          (tessGeo.getAttribute("position") as InstanceType<typeof THREE.BufferAttribute>).needsUpdate = true;
        } else {
          tess.visible = false;
        }

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
        (tank.material as InstanceType<typeof THREE.Material>).dispose();
        fiducial.geometry.dispose();
        (fiducial.material as InstanceType<typeof THREE.Material>).dispose();
        pmtGeo.dispose();
        pmtMat.dispose();
        ringMat.dispose();
        for (const r of rings) r.geometry.dispose();
        body.geometry.dispose();
        bushing.geometry.dispose();
        (bushing.material as InstanceType<typeof THREE.Material>).dispose();
        tankMat.dispose();
        finMat.dispose();
        for (const f of fins) f.geometry.dispose();
        pointMat.dispose();
        (flow.material as InstanceType<typeof THREE.Material>).dispose();
        (tess.material as InstanceType<typeof THREE.Material>).dispose();
        (worldlines.material as InstanceType<typeof THREE.Material>).dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={hostRef} className="relative h-[28rem] w-full sm:h-[34rem]">
      <canvas ref={canvasRef} className="h-full w-full touch-none rounded-md bg-background" />
      <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {hud}
      </div>
    </div>
  );
}
