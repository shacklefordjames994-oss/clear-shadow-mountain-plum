import { useEffect, useRef } from "react";
import { ATLAS_SCENE, ATLAS_SCENE_SCALE } from "@/lib/omega/collider/atlas";
import type { CollisionEvent } from "@/lib/omega/collider/engine";
import type { CosmicShower } from "@/lib/omega/collider/cosmic";
import type { NuclearEvent } from "@/lib/omega/collider/generators";

export type Event3DKind = "barrel" | "shower";

const SPECIES_HEX: Record<string, number> = {
  electron: 0x8fa3b8,
  muon: 0xc4a574,
  photon: 0xd4d8df,
  jet: 0x7a9a80,
  neutrino: 0x5c6370,
  dark: 0xc47a6a,
  pion: 0x7a9a80,
  kaon: 0x9aa87a,
  proton: 0xc4a574,
  nucleon: 0xb8a090,
};

function dirFromEtaPhi(eta: number, phi: number) {
  const theta = 2 * Math.atan(Math.exp(-eta));
  return {
    x: Math.sin(theta) * Math.cos(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(theta),
  };
}

export function Event3D({
  kind,
  nuclear,
  collision,
  shower,
  scrub,
  spinning,
}: {
  kind: Event3DKind;
  nuclear: NuclearEvent | null;
  collision: CollisionEvent | null;
  shower: CosmicShower | null;
  scrub: number;
  spinning: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kindRef = useRef(kind);
  const nuclearRef = useRef(nuclear);
  const collisionRef = useRef(collision);
  const showerRef = useRef(shower);
  const scrubRef = useRef(scrub);
  const spinRef = useRef(spinning);
  const hudRef = useRef<HTMLParagraphElement>(null);

  kindRef.current = kind;
  nuclearRef.current = nuclear;
  collisionRef.current = collision;
  showerRef.current = shower;
  scrubRef.current = scrub;
  spinRef.current = spinning;

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
      scene.fog = new THREE.FogExp2(0x090a0c, 0.045);
      const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 80);
      camera.position.set(6.4, 2.8, 7.2);

      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.target.set(0, 0, 0);
      controls.maxDistance = 28;
      controls.minDistance = 1.4;

      scene.add(new THREE.HemisphereLight(0xc8d0dc, 0x16181e, 0.7));
      const key = new THREE.DirectionalLight(0xe8eaee, 0.5);
      key.position.set(4, 7, 3);
      scene.add(key);

      const barrel = new THREE.Group();
      scene.add(barrel);
      const layers = ATLAS_SCENE.map((layer) => ({
        r: layer.rM * ATLAS_SCENE_SCALE,
        l: Math.min(9.2, layer.zM * 2 * ATLAS_SCENE_SCALE),
        c: layer.color,
        o: layer.opacity,
      }));
      const layerMeshes: InstanceType<typeof THREE.Object3D>[] = [];
      for (const layer of layers) {
        const mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(layer.r, layer.r, layer.l, 48, 1, true),
          new THREE.MeshBasicMaterial({ color: layer.c, wireframe: true, transparent: true, opacity: layer.o }),
        );
        mesh.rotation.x = Math.PI / 2;
        barrel.add(mesh);
        layerMeshes.push(mesh);
      }
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 8.4, 8),
        new THREE.MeshBasicMaterial({ color: 0x8fa3b8, transparent: true, opacity: 0.55 }),
      );
      beam.rotation.x = Math.PI / 2;
      barrel.add(beam);

      const trackMax = 160;
      const trackPos = new Float32Array(trackMax * 2 * 3);
      const trackCol = new Float32Array(trackMax * 2 * 3);
      const trackGeo = new THREE.BufferGeometry();
      trackGeo.setAttribute("position", new THREE.BufferAttribute(trackPos, 3));
      trackGeo.setAttribute("color", new THREE.BufferAttribute(trackCol, 3));
      const tracks = new THREE.LineSegments(
        trackGeo,
        new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.92 }),
      );
      scene.add(tracks);

      const showerMax = 800;
      const dummy = new THREE.Object3D();
      const sphereGeo = new THREE.SphereGeometry(0.07, 8, 8);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
      const showerMesh = new THREE.InstancedMesh(sphereGeo, sphereMat, showerMax);
      showerMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const showerColors = new Float32Array(showerMax * 3);
      showerMesh.instanceColor = new THREE.InstancedBufferAttribute(showerColors, 3);
      scene.add(showerMesh);

      const ground = new THREE.GridHelper(10, 16, 0x2a3038, 0x16181e);
      ground.position.y = -2.2;
      scene.add(ground);
      const axes = new THREE.AxesHelper(0.7);
      axes.position.set(-2.8, -2.05, -2.8);
      scene.add(axes);

      const clock = new THREE.Clock();

      const resize = () => {
        const w = Math.max(160, host.clientWidth);
        const h = Math.max(240, host.clientHeight);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();

      const colorOf = (name: string) => {
        const hex = SPECIES_HEX[name] ?? 0x8b919c;
        return new THREE.Color(hex);
      };

      const loop = () => {
        if (disposed) return;
        clock.getDelta();
        if (!document.hidden) {
          const reveal = Math.max(0.08, Math.min(1, scrubRef.current));
          const isShower = kindRef.current === "shower";
          barrel.visible = !isShower;
          beam.visible = !isShower;
          tracks.visible = !isShower;
          showerMesh.visible = isShower;
          ground.position.y = isShower ? -2.35 : -2.2;
          controls.autoRotate = spinRef.current;
          controls.autoRotateSpeed = isShower ? 0.9 : 1.4;
          controls.target.set(0, isShower ? 0.15 : 0, 0);
          controls.update();

          let ti = 0;
          const pushTrack = (eta: number, phi: number, charge: number, name: string, pT: number) => {
            if (ti + 1 >= trackMax) return;
            const d = dirFromEtaPhi(eta, phi);
            const r = 0.2 + reveal * (1.9 + Math.min(0.7, pT / 8));
            const bend = charge !== 0 ? charge * 0.22 * reveal : 0;
            const c = colorOf(name);
            const a = ti * 2;
            trackPos[a * 3] = 0;
            trackPos[a * 3 + 1] = 0;
            trackPos[a * 3 + 2] = 0;
            trackPos[(a + 1) * 3] = (d.x + bend) * r;
            trackPos[(a + 1) * 3 + 1] = d.y * r;
            trackPos[(a + 1) * 3 + 2] = d.z * r * 1.35;
            for (let k = 0; k < 2; k++) {
              trackCol[(a + k) * 3] = c.r;
              trackCol[(a + k) * 3 + 1] = c.g;
              trackCol[(a + k) * 3 + 2] = c.b;
            }
            ti += 1;
          };

          if (!isShower) {
            const nuc = nuclearRef.current;
            const col = collisionRef.current;
            if (nuc) {
              const nShow = Math.ceil(nuc.tracks.length * reveal);
              for (let i = 0; i < nShow; i++) {
                const t = nuc.tracks[i];
                pushTrack(t.eta, t.phi, t.charge, t.charge ? "pion" : "photon", t.pT);
              }
            } else if (col) {
              const nShow = Math.ceil(col.detected.length * reveal);
              for (let i = 0; i < nShow; i++) {
                const p = col.detected[i];
                pushTrack(p.eta, p.phi, p.charge, p.name, p.measuredPT);
              }
            }
          }
          trackGeo.setDrawRange(0, ti * 2);
          (trackGeo.getAttribute("position") as InstanceType<typeof THREE.BufferAttribute>).needsUpdate = true;
          (trackGeo.getAttribute("color") as InstanceType<typeof THREE.BufferAttribute>).needsUpdate = true;
          tracks.visible = !isShower;

          const sh = showerRef.current;
          let si = 0;
          if (isShower && sh) {
            const cloud = sh.cascade ?? sh.particles;
            const genCut = reveal * Math.max(1, sh.generations || 10);
            for (const p of cloud) {
              if (si >= showerMax) break;
              if (p.generation > genCut) continue;
              const c = colorOf(p.species);
              const scale = (p.charged ? 1.15 : 0.7) * (0.7 + Math.min(1.8, Math.log10(Math.max(1, p.energyGeV)) * 0.45));
              dummy.position.set(p.xKm * 1.4, p.zKm * 0.24 - 2.1, p.yKm * 1.4);
              dummy.scale.setScalar(scale);
              dummy.updateMatrix();
              showerMesh.setMatrixAt(si, dummy.matrix);
              showerMesh.setColorAt(si, c);
              si += 1;
            }
          }
          showerMesh.count = si;
          showerMesh.instanceMatrix.needsUpdate = true;
          if (showerMesh.instanceColor) showerMesh.instanceColor.needsUpdate = true;
          showerMesh.computeBoundingSphere();
          showerMesh.visible = isShower;

          const nPart = isShower ? si : ti;
          if (hudRef.current) {
            hudRef.current.textContent = isShower
              ? `shower gen ≤ ${genLabel(reveal, sh)} · ${nPart} particles · SCI:SIMULATED`
              : `tracks ${nPart} · t=${reveal.toFixed(2)} · picture, not evidence`;
          }
        }
        renderer.render(scene, camera);
      };
      renderer.setAnimationLoop(loop);

      cleanup = () => {
        renderer.setAnimationLoop(null);
        ro.disconnect();
        trackGeo.dispose();
        sphereGeo.dispose();
        sphereMat.dispose();
        showerMesh.dispose();
        for (const obj of layerMeshes) {
          const mesh = obj as InstanceType<typeof THREE.Mesh>;
          mesh.geometry.dispose();
          (mesh.material as InstanceType<typeof THREE.Material>).dispose();
        }
        beam.geometry.dispose();
        (beam.material as InstanceType<typeof THREE.Material>).dispose();
        renderer.dispose();
        controls.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={hostRef} className="relative h-[22rem] min-h-56 w-full overflow-hidden rounded-lg bg-secondary sm:h-[28rem]">
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
      <p
        ref={hudRef}
        className="pointer-events-none absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
      >
        orbit · picture of a simulation
      </p>
    </div>
  );
}

function genLabel(reveal: number, shower: CosmicShower | null) {
  if (!shower) return "—";
  return (reveal * Math.max(1, shower.generations)).toFixed(1);
}
