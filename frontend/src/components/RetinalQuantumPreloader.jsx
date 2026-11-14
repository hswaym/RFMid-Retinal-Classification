import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ════════════════════════════════════════════════════════════
   GLSL: Anatomical Iris Fragment Shader
   - Radial fibre pattern via layered fbm noise
   - Collarette ring, limbic arc, Purkinje specular
   - Pupil with fundus red-reflex glow
   - Progress-driven brightness reveal
════════════════════════════════════════════════════════════ */
const IRIS_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const IRIS_FRAG = /* glsl */`
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uPupilR;   // 0.60 → 0.18 (dilated → constricted)
  uniform float uProgress; // 0.0 → 1.0

  /* ── hash / noise ─────────────────────────── */
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float smoothnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),             hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x),
      f.y
    );
  }

  /* layered fractal brownian motion */
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2  shift = vec2(100.0);
    mat2  rot   = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 6; i++) {
      v += a * smoothnoise(p);
      p  = rot * p * 2.1 + shift;
      a *= 0.48;
    }
    return v;
  }

  void main() {
    /* polar coords centred on disc */
    vec2  uv  = vUv * 2.0 - 1.0;
    float r   = length(uv);
    float ang = atan(uv.y, uv.x);           /* -π … π  */
    float angN = ang / 6.28318;             /* -0.5 … 0.5 */

    if (r > 1.0) { discard; }

    /* ── PUPIL ───────────────────────────────── */
    if (r < uPupilR + 0.025) {
      float edge    = smoothstep(uPupilR + 0.025, uPupilR, r);
      /* fundus red-reflex warm glow deep in pupil */
      float glow    = exp(-r * r / max(uPupilR * uPupilR * 0.4, 0.001));
      vec3 pupilCol = mix(
        vec3(0.012, 0.005, 0.003),
        vec3(0.60, 0.10, 0.03) * uProgress,
        glow * 0.55
      );
      gl_FragColor = vec4(pupilCol, edge);
      return;
    }

    /* ── IRIS ────────────────────────────────── */
    /* t = 0 at pupil edge, 1 at limbus */
    float t = clamp((r - uPupilR) / (1.0 - uPupilR), 0.0, 1.0);

    /* radial-fibre noise: angle & radius as uv */
    vec2 fUV1  = vec2(angN * 22.0 + smoothnoise(vec2(r * 7.0, 0.5)) * 0.5, r * 9.0 + uTime * 0.003);
    vec2 fUV2  = vec2(angN * 10.0 + 1.3,                                   r * 4.5 - uTime * 0.002);
    float fine   = fbm(fUV1 * 1.5);
    float coarse = fbm(fUV2 * 0.85);
    float pattern = fine * 0.65 + coarse * 0.35;

    /* color ramp — amber/hazel with project vermilion cast */
    vec3 cInner  = vec3(0.42, 0.13, 0.025);   /* deep amber near pupil */
    vec3 cMid    = vec3(0.70, 0.27, 0.055);   /* mid iris              */
    vec3 cCollar = vec3(0.90, 0.33, 0.07);    /* collarette highlight  */
    vec3 cLimbus = vec3(0.028, 0.010, 0.006); /* dark limbus           */

    vec3 col = mix(cInner, cMid, smoothstep(0.0, 0.45, t));
    /* collarette ring ~18 % from pupil edge */
    float ring = exp(-pow((t - 0.18) * 11.0, 2.0));
    col = mix(col, cCollar, ring * 0.75);
    /* limbus darkening */
    col = mix(col, cLimbus, smoothstep(0.58, 1.0, t));
    /* fibre modulation */
    col += pattern * vec3(0.20, 0.07, 0.015) - 0.03;
    col  = clamp(col, 0.0, 1.0);

    /* ── Purkinje corneal specular (bright crescent) ── */
    vec2 s1 = uv - vec2(0.24, 0.30);
    float spec1 = exp(-dot(s1, s1) * 32.0);
    float spec2 = exp(-dot(s1 * 0.55, s1 * 0.55) * 11.0) * 0.28;
    col = mix(col, vec3(1.0), clamp(spec1 + spec2, 0.0, 1.0) * 0.92);

    /* secondary Purkinje image (smaller, opposite) */
    vec2 s2  = uv - vec2(-0.14, -0.20);
    float sp2 = exp(-dot(s2, s2) * 70.0);
    col  = mix(col, vec3(1.0, 0.95, 0.90), sp2 * 0.38);

    /* ── Progress-driven reveal ── */
    float reveal = smoothstep(0.0, 0.35, uProgress);
    col *= reveal;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ════════════════════════════════════════════════════════════
   Three.js Scene Components
════════════════════════════════════════════════════════════ */

/** Sclera — the outer globe */
function ScleraGlobe() {
  const meshRef = useRef();
  useFrame((_, dt) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * 0.04;
      meshRef.current.rotation.x += dt * 0.012;
    }
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.0, 72, 72]} />
      <meshStandardMaterial
        color="#ede8e0"
        roughness={0.55}
        metalness={0.0}
      />
    </mesh>
  );
}

/** Iris disc with the GLSL anatomical shader */
function IrisDisc({ progress }) {
  const progRef = useRef(progress);
  progRef.current = progress;

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: IRIS_VERT,
        fragmentShader: IRIS_FRAG,
        uniforms: {
          uTime:     { value: 0 },
          uPupilR:   { value: 0.60 },
          uProgress: { value: 0 },
        },
        transparent: false,
        side: THREE.FrontSide,
        depthWrite: true,
      }),
    []
  );

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value     = clock.elapsedTime;
    mat.uniforms.uProgress.value = progRef.current;
    /* pupil dilated (0.60) → constricted (0.18) */
    mat.uniforms.uPupilR.value   = THREE.MathUtils.lerp(0.60, 0.18, progRef.current);
  });

  return (
    <mesh position={[0, 0, 0.705]} renderOrder={2}>
      <circleGeometry args={[0.68, 128]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** Transparent cornea dome */
function CorneaDome() {
  return (
    <mesh position={[0, 0, 0.26]}>
      <sphereGeometry args={[0.76, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
      <meshPhysicalMaterial
        transmission={0.92}
        roughness={0.0}
        metalness={0.0}
        ior={1.376}
        thickness={0.08}
        transparent
        opacity={0.14}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Limbal ring — dark circle where iris meets sclera */
function LimbalRing() {
  return (
    <mesh position={[0, 0, 0.700]}>
      <ringGeometry args={[0.665, 0.74, 128]} />
      <meshStandardMaterial
        color="#030100"
        roughness={1}
        side={THREE.FrontSide}
        depthWrite
      />
    </mesh>
  );
}

/** Static 3-point clinical lighting */
function Lighting() {
  return (
    <>
      {/* warm key — front-right-top */}
      <directionalLight position={[2.5, 2.5, 5]} intensity={5.5} color="#fff4ee" />
      {/* cool fill — left */}
      <pointLight position={[-4, 1, 2]} intensity={1.8} color="#6688dd" />
      {/* vermilion rim — back */}
      <pointLight position={[0, -1, -3]} intensity={2.2} color="#E4442C" />
      {/* low ambient */}
      <ambientLight intensity={0.09} color="#150a06" />
    </>
  );
}

function EyeScene({ progress }) {
  return (
    <>
      <Lighting />
      <ScleraGlobe />
      <LimbalRing />
      <IrisDisc progress={progress} />
      <CorneaDome />
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   Boot telemetry lines
════════════════════════════════════════════════════════════ */
const LOGS = [
  { pct: 0,  text: 'OPHTHALMIC SENSOR ALIGNMENT',       code: 'FOV_224x224' },
  { pct: 20, text: 'GREEN-CHANNEL CLAHE 540–575 nm',    code: 'CLAHE_2.0'  },
  { pct: 40, text: 'AUTOENCODER MANIFOLD 512 → 4-DIM',  code: 'LATENT_OK'  },
  { pct: 62, text: 'PENNYLANE QNODE PARAMETER-SHIFT',   code: 'QNODE_READY' },
  { pct: 82, text: 'CRYOGENIC QPU GATE VALIDATION 15 mK', code: 'QPU_STABLE' },
];

function currentLog(pct) {
  for (let i = LOGS.length - 1; i >= 0; i--) {
    if (pct >= LOGS[i].pct) return LOGS[i];
  }
  return LOGS[0];
}

/* ════════════════════════════════════════════════════════════
   Main Export
════════════════════════════════════════════════════════════ */
export default function RetinalQuantumPreloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [out, setOut] = useState(false);

  useEffect(() => {
    const t0 = Date.now();
    const dur = 3800; // ms — gives shader time to render beautifully
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / dur);
      setProgress(p);
      if (p >= 1) {
        clearInterval(id);
        setTimeout(() => {
          setOut(true);
          setTimeout(() => { if (onComplete) onComplete(); }, 800);
        }, 500);
      }
    }, 20);
    return () => clearInterval(id);
  }, [onComplete]);

  const skip = () => {
    setOut(true);
    setTimeout(() => { if (onComplete) onComplete(); }, 400);
  };

  const pct  = Math.round(progress * 100);
  const log  = currentLog(pct);
  /* iris-opening clip: eye reveals itself as a circle expanding */
  const clip = `circle(${(progress * 52 + 2).toFixed(1)}% at 50% 50%)`;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#070504',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        userSelect: 'none',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
        opacity: out ? 0 : 1,
        transform: out ? 'scale(1.03)' : 'scale(1)',
        pointerEvents: out ? 'none' : 'auto',
        fontFamily: 'var(--font-mono-data, "JetBrains Mono", monospace)',
      }}
    >
      {/* ── ambient vignette ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 55% at 50% 48%, rgba(228,68,44,0.06) 0%, #070504 68%)',
      }} />

      {/* ── TOP BAR ─────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 24, left: 24, right: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
        paddingBottom: 12,
        fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#E4442C',
            boxShadow: '0 0 8px rgba(228,68,44,0.9)',
            animation: 'pulse 1.4s ease-in-out infinite',
          }} />
          <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
            HQNN Quantum Retina
          </span>
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>
          <span style={{ color: 'rgba(228,68,44,0.7)' }}>Optical Boot Sequence</span>
        </div>
        <button
          onClick={skip}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: '0.15em',
            textTransform: 'uppercase', padding: '4px 10px', borderRadius: 4,
            cursor: 'pointer',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { e.target.style.color='rgba(255,255,255,0.8)'; e.target.style.borderColor='rgba(255,255,255,0.3)'; }}
          onMouseLeave={e => { e.target.style.color='rgba(255,255,255,0.3)'; e.target.style.borderColor='rgba(255,255,255,0.1)'; }}
        >
          Skip
        </button>
      </div>

      {/* ── 3-D EYE ─────────────────────────────── */}
      <div style={{
        width: 'min(380px, 72vw)',
        height: 'min(380px, 72vw)',
        position: 'relative',
        marginBottom: 32,
      }}>
        {/* subtle halo behind canvas — grows with progress */}
        <div style={{
          position: 'absolute', inset: -20,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(228,68,44,${(progress * 0.18).toFixed(3)}) 0%, transparent 68%)`,
          filter: 'blur(28px)',
          pointerEvents: 'none',
          transition: 'background 0.4s',
        }} />

        {/* iris-opening clip mask */}
        <div style={{
          width: '100%', height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          clipPath: clip,
          transition: 'clip-path 0.15s ease-out',
        }}>
          <Canvas
            camera={{ position: [0, 0, 3.0], fov: 44 }}
            dpr={[1, 1.6]}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent', width: '100%', height: '100%' }}
          >
            <EyeScene progress={progress} />
          </Canvas>
        </div>

        {/* thin precise ring around the eye */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: `1px solid rgba(228,68,44,${(progress * 0.4).toFixed(3)})`,
          pointerEvents: 'none',
          transition: 'border-color 0.3s',
        }} />

        {/* 4 compass tick marks */}
        {['top', 'right', 'bottom', 'left'].map((dir) => {
          const styles = {
            top:    { top: -6, left: '50%', transform: 'translateX(-50%)', width: 1, height: 12 },
            bottom: { bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 1, height: 12 },
            left:   { left: -6, top: '50%', transform: 'translateY(-50%)', height: 1, width: 12 },
            right:  { right: -6, top: '50%', transform: 'translateY(-50%)', height: 1, width: 12 },
          };
          return (
            <div key={dir} style={{
              position: 'absolute',
              background: `rgba(228,68,44,${(progress * 0.6).toFixed(3)})`,
              ...styles[dir],
            }} />
          );
        })}
      </div>

      {/* ── HUD BELOW EYE ───────────────────────── */}
      <div style={{
        width: 'min(360px, 86vw)',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>

        {/* big percentage + label */}
        <div style={{
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}>
          {/* editorial counter */}
          <div>
            <div style={{
              fontFamily: 'var(--font-editorial, Georgia, serif)',
              fontSize: 'clamp(52px, 10vw, 80px)',
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: `hsl(${8 + progress * 110}, 85%, ${52 + progress * 12}%)`,
              fontVariantNumeric: 'tabular-nums',
              transition: 'color 0.2s',
            }}>
              {pct.toString().padStart(3, '0')}
            </div>
            <div style={{
              fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)', marginTop: 4,
            }}>
              Scan Protocol Initialising
            </div>
          </div>

          {/* qubit phase dots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', paddingBottom: 6 }}>
            {[0, 1, 2, 3].map(q => {
              const active = pct >= q * 25;
              return (
                <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 8, letterSpacing: '0.12em', color: active ? 'rgba(228,68,44,0.75)' : 'rgba(255,255,255,0.15)' }}>
                    q{q}
                  </span>
                  <div style={{
                    width: 20, height: 2, borderRadius: 1,
                    background: active ? '#E4442C' : 'rgba(255,255,255,0.08)',
                    boxShadow: active ? '0 0 5px rgba(228,68,44,0.6)' : 'none',
                    transition: 'background 0.3s, box-shadow 0.3s',
                  }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* progress track */}
        <div style={{
          position: 'relative', height: 2,
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 1, overflow: 'visible',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, #1F5D3A ${Math.max(0, 50 - pct)}%, #E4442C 80%, #ff9966 100%)`,
            borderRadius: 1,
            boxShadow: '0 0 8px rgba(228,68,44,0.65)',
            transition: 'width 0.08s linear',
          }} />
          {/* gleam */}
          <div style={{
            position: 'absolute', top: -3, height: 8, width: 24,
            left: `${Math.max(0, pct - 6)}%`,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
            transition: 'left 0.1s linear',
          }} />
        </div>

        {/* current boot log */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 10, letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.4)',
          height: 18,
        }}>
          <span style={{ color: '#E4442C', fontSize: 7 }}>▶</span>
          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {log.text}
          </span>
          <span style={{
            fontSize: 8, color: '#1F5D3A',
            border: '1px solid rgba(31,93,58,0.35)',
            background: 'rgba(31,93,58,0.12)',
            padding: '1px 5px', borderRadius: 2, flexShrink: 0,
          }}>
            {log.code}
          </span>
        </div>
      </div>

      {/* ── BOTTOM CITATION ─────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 20, left: 0, right: 0,
        textAlign: 'center', fontSize: 9,
        letterSpacing: '0.20em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.14)',
      }}>
        APTOS 2019 · 4-QUBIT AUTOENCODER PQC · IBM MARRAKESH 156-QUBIT HERON
      </div>

      {/* ── Keyframe for pulse dot ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
