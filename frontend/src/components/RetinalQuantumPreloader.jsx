import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────
   PROCEDURAL 3-D ANATOMICAL EYE
   Built entirely with Three.js primitives —
   no external .glb needed, works on Vercel.
───────────────────────────────────────────── */

/** Sclera — the outer white of the eye */
function Sclera() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.0, 64, 64]} />
      <meshStandardMaterial
        color="#0e0a08"
        roughness={0.15}
        metalness={0.05}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

/** Iris — ring of colour with radial fibre lines */
function Iris({ progress }) {
  const ref = useRef();
  const irisRef = useRef();

  // Build custom iris geometry with radial lines baked into a texture
  const irisTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    // Deep background — dark amber
    ctx.fillStyle = '#1a0d05';
    ctx.fillRect(0, 0, size, size);

    // Radial iris fibres
    const numLines = 220;
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const r1 = size * 0.18 + Math.random() * size * 0.04;
      const r2 = size * 0.48 + Math.random() * size * 0.04;
      const alpha = 0.15 + Math.random() * 0.4;
      const hue = 10 + Math.random() * 20; // orange-amber range
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.strokeStyle = `hsla(${hue}, 90%, 55%, ${alpha})`;
      ctx.lineWidth = 0.6 + Math.random() * 1.1;
      ctx.stroke();
    }

    // Collarette ring (the ridge around the pupil)
    const gr = ctx.createRadialGradient(cx, cy, size * 0.17, cx, cy, size * 0.26);
    gr.addColorStop(0, 'rgba(228,68,44,0.6)');
    gr.addColorStop(1, 'rgba(180,40,10,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.26, 0, Math.PI * 2);
    ctx.fill();

    // Limbic ring (dark edge of iris)
    const limb = ctx.createRadialGradient(cx, cy, size * 0.42, cx, cy, size * 0.5);
    limb.addColorStop(0, 'rgba(0,0,0,0)');
    limb.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = limb;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  // Pupil dilation: maps 0→100% progress to 0.18→0.42 radius factor
  const pupilScale = 0.18 + (progress / 100) * 0.24;

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z -= delta * 0.12;
    if (irisRef.current) irisRef.current.rotation.z += delta * 0.06;
  });

  return (
    <group ref={ref}>
      {/* Iris disc */}
      <mesh ref={irisRef} position={[0, 0, 0.72]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.68, 128]} />
        <meshStandardMaterial
          map={irisTexture}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.98}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Pupil (black circle that dilates) */}
      <mesh position={[0, 0, 0.73]}>
        <circleGeometry args={[pupilScale, 64]} />
        <meshStandardMaterial
          color="#000000"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Corneal specular highlight — small white crescent */}
      <mesh position={[0.14, 0.18, 0.74]}>
        <circleGeometry args={[0.07, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0}
          metalness={0}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Sub-corneal reflex glow */}
      <mesh position={[-0.08, -0.12, 0.74]}>
        <circleGeometry args={[0.04, 32]} />
        <meshStandardMaterial
          color="#ffccaa"
          roughness={0}
          metalness={0}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

/** Cornea — transparent dome over the iris */
function Cornea() {
  return (
    <mesh position={[0, 0, 0.3]}>
      <sphereGeometry args={[0.75, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      <meshPhysicalMaterial
        color="#aaddff"
        roughness={0}
        metalness={0}
        transmission={0.95}
        transparent
        opacity={0.18}
        ior={1.376}
        thickness={0.1}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

/** Retinal fundus glow visible through pupil */
function RetinalGlow({ progress }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.3 + Math.sin(clock.elapsedTime * 1.8) * 0.15;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, 0.1]}>
      <circleGeometry args={[0.16, 48]} />
      <meshStandardMaterial
        color="#E4442C"
        emissive="#E4442C"
        emissiveIntensity={2.5 + (progress / 100) * 2}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

/** Scan line sweeping across the iris — ophthalmic slit-lamp effect */
function ScanLine({ progress }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(clock.elapsedTime * 2.1) * 0.6;
      ref.current.material.opacity = 0.3 + Math.sin(clock.elapsedTime * 3) * 0.15;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, 0.75]}>
      <planeGeometry args={[1.4, 0.008]} />
      <meshStandardMaterial
        color="#E4442C"
        emissive="#E4442C"
        emissiveIntensity={4}
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

/** 4 Qubit orbital nodes that rotate around the eye */
function QubitOrbit({ progress }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
      groupRef.current.rotation.x += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3].map((q) => {
        const angle = (q / 4) * Math.PI * 2;
        const r = 1.55;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        return (
          <group key={q} position={[x, 0, z]}>
            {/* Node sphere */}
            <mesh>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial
                color="#E4442C"
                emissive="#E4442C"
                emissiveIntensity={3}
                roughness={0.2}
                metalness={0.5}
              />
            </mesh>
            {/* Connecting arc stub */}
            <mesh rotation={[0, angle, 0]}>
              <torusGeometry args={[r, 0.003, 8, 60, Math.PI / 4]} />
              <meshStandardMaterial
                color="#E4442C"
                emissive="#E4442C"
                emissiveIntensity={1.5}
                transparent
                opacity={0.5}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Outer orbit ring — dashed quantum circuit ring */
function OrbitRing() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.25;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.55, 0.004, 4, 120]} />
      <meshStandardMaterial
        color="#E4442C"
        emissive="#E4442C"
        emissiveIntensity={1.2}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

/** Secondary outer ring counter-rotating */
function OuterRing2() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z -= delta * 0.12;
      ref.current.rotation.x += delta * 0.08;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.9, 0.003, 4, 100]} />
      <meshStandardMaterial
        color="#ffffff"
        transparent
        opacity={0.08}
      />
    </mesh>
  );
}

/** Camera gentle auto-orbit */
function CameraRig() {
  useFrame(({ camera, clock }) => {
    camera.position.x = Math.sin(clock.elapsedTime * 0.18) * 0.4;
    camera.position.y = Math.sin(clock.elapsedTime * 0.11) * 0.2;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/** Full 3-D scene */
function EyeScene({ progress }) {
  return (
    <>
      <CameraRig />

      {/* Lighting — warm clinical key + cool rim + ambient */}
      <ambientLight intensity={0.15} color="#1a0a05" />
      <pointLight position={[3, 3, 4]} intensity={4} color="#ff6644" />
      <pointLight position={[-4, -2, 3]} intensity={2} color="#2255ff" />
      <spotLight
        position={[0, 0, 5]}
        angle={0.35}
        penumbra={0.6}
        intensity={8}
        color="#ffffff"
        castShadow={false}
      />
      <pointLight position={[0, 0, -4]} intensity={1.5} color="#E4442C" />

      {/* Eye geometry stack */}
      <Sclera />
      <RetinalGlow progress={progress} />
      <Iris progress={progress} />
      <Cornea />
      <ScanLine progress={progress} />

      {/* Quantum orbit elements */}
      <OrbitRing />
      <OuterRing2 />
      <QubitOrbit progress={progress} />
    </>
  );
}

/* ─────────────────────────────────────────────
   BOOT LOG HUD
───────────────────────────────────────────── */
const BOOT_LOGS = [
  { text: 'OPHTHALMIC SENSOR ALIGNMENT (BEN GRAHAM FOV)', code: 'FOV_224x224_OK' },
  { text: 'GREEN-CHANNEL CLAHE 540–575nm FILTER', code: 'CLAHE_CLIP_2.0' },
  { text: 'AUTOENCODER MANIFOLD COMPRESSION (512→4D)', code: 'LATENT_4D_NORM' },
  { text: 'PENNYLANE QNODE PARAMETER-SHIFT ENGINE', code: 'QNODE_READY' },
  { text: 'QPU NOISE GATE CALIBRATION (15 mK CRYOGENIC)', code: 'QPU_STABLE' },
];

/* ─────────────────────────────────────────────
   MAIN PRELOADER EXPORT
───────────────────────────────────────────── */
export default function RetinalQuantumPreloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [bootPhase, setBootPhase] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 3200; // 3.2 s — gives eye time to render beautifully

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 20) setBootPhase(0);
      else if (pct < 40) setBootPhase(1);
      else if (pct < 62) setBootPhase(2);
      else if (pct < 84) setBootPhase(3);
      else setBootPhase(4);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => { if (onComplete) onComplete(); }, 700);
        }, 400);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => { if (onComplete) onComplete(); }, 350);
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#080605] text-white flex flex-col items-center justify-center select-none transition-all duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-[1.04] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Deep radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(228,68,44,0.07)_0%,rgba(8,6,5,1)_72%)] pointer-events-none" />

      {/* ── TOP HEADER ── */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between font-mono-data text-[11px] tracking-widest border-b border-white/[0.07] pb-3">
        <div className="flex items-center space-x-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E4442C] animate-pulse" />
          <span className="text-white/70 font-semibold uppercase">HQNN QUANTUM RETINA</span>
          <span className="text-white/20">·</span>
          <span className="text-[#E4442C]/80 uppercase">Optical Boot Sequence</span>
        </div>
        <button
          onClick={handleSkip}
          className="text-[10px] uppercase tracking-wider text-white/25 hover:text-white/70 transition-colors px-2.5 py-1 border border-white/[0.08] rounded hover:border-white/25"
        >
          Skip
        </button>
      </div>

      {/* ── 3-D EYE CANVAS ── */}
      <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]">
        {/* Subtle ambient halo behind the canvas */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(228,68,44,${0.04 + (progress / 100) * 0.14}) 0%, transparent 70%)`,
          }}
        />
        <Canvas
          camera={{ position: [0, 0, 3.6], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <EyeScene progress={progress} />
        </Canvas>
      </div>

      {/* ── PROGRESS HUD ── */}
      <div className="mt-6 w-full max-w-xs sm:max-w-sm px-6 space-y-3.5 font-mono-data">

        {/* Percentage + label */}
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-widest text-white/40">
            Calibrating Retina → Quantum Circuit
          </span>
          <span
            className="text-3xl font-bold tabular-nums"
            style={{ color: `hsl(${10 + (progress / 100) * 110}, 85%, 58%)` }}
          >
            {progress.toString().padStart(3, '0')}
            <span className="text-sm font-normal text-white/40 ml-0.5">%</span>
          </span>
        </div>

        {/* Progress track */}
        <div className="relative h-[3px] bg-white/[0.07] rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-75"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, #1F5D3A ${Math.max(0, 50 - progress)}%, #E4442C 80%, #ff9977 100%)`,
              boxShadow: '0 0 10px rgba(228,68,44,0.7)',
            }}
          />
          {/* Moving gleam */}
          <div
            className="absolute top-0 h-full w-8 rounded-full"
            style={{
              left: `${Math.max(0, progress - 8)}%`,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              transition: 'left 0.08s linear',
            }}
          />
        </div>

        {/* Boot log line */}
        <div className="flex items-center space-x-2 text-[10px] text-white/50 h-5">
          <span className="text-[#E4442C] text-[8px]">▶</span>
          <span className="truncate tracking-wide">{BOOT_LOGS[bootPhase].text}</span>
          <span className="ml-auto flex-shrink-0 text-[9px] text-[#1F5D3A] border border-[#1F5D3A]/30 bg-[#1F5D3A]/10 px-1.5 py-0.5 rounded">
            {BOOT_LOGS[bootPhase].code}
          </span>
        </div>

        {/* 4 qubit segment indicators */}
        <div className="flex gap-1.5 pt-1">
          {[0, 1, 2, 3].map((q) => {
            const filled = progress >= (q + 1) * 25;
            const active = progress >= q * 25 && progress < (q + 1) * 25;
            return (
              <div key={q} className="flex-1 space-y-1">
                <div
                  className="h-[2px] rounded-full transition-all duration-300"
                  style={{
                    background: filled
                      ? '#E4442C'
                      : active
                      ? 'rgba(228,68,44,0.5)'
                      : 'rgba(255,255,255,0.08)',
                    boxShadow: filled ? '0 0 6px rgba(228,68,44,0.6)' : 'none',
                  }}
                />
                <div className="text-[8px] text-white/25 text-center tracking-widest">q{q}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM CITATION ── */}
      <div className="absolute bottom-5 left-0 right-0 text-center text-[9px] font-mono-data text-white/20 tracking-widest uppercase">
        APTOS 2019 · 4-QUBIT AUTOENCODER PQC · IBM MARRAKESH 156-QUBIT HERON
      </div>
    </div>
  );
}
