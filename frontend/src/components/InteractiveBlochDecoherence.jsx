import React, { useState, useMemo } from 'react';
import { Activity, ShieldAlert, Sparkles, Zap, Layers, RefreshCw } from 'lucide-react';

/**
 * Interactive Bloch Sphere Decoherence & Noise Simulator
 * 
 * Mathematically simulates:
 * 1. Depolarizing Channel: E(rho) = (1 - 4p/3) * rho + (4p/3) * (I/2)
 *    -> Radius contracts isotropically: |r'| = (1 - 4p/3) * |r|
 * 2. Phase Damping (T2* Dephasing): r_xy' = sqrt(1-p) * r_xy, r_z' = r_z
 * 3. Amplitude Damping (T1 Decay): Decay towards ground state |0> (North Pole)
 */
export default function InteractiveBlochDecoherence({ noiseP = 0.01 }) {
  const [channelType, setChannelType] = useState('depolarizing'); // 'depolarizing' | 'dephasing' | 'damping'
  const [patientAngle, setPatientAngle] = useState(0.85); // latitude theta [0..pi]

  // Physical State Calculations based on open quantum systems theory
  const physics = useMemo(() => {
    const p = Math.max(0, Math.min(0.1, noiseP));
    
    // Initial pure state angles (representing our fundus autoencoder latent angle)
    const theta = patientAngle; // polar angle
    const phi = 0.65; // azimuthal angle

    let rX = Math.sin(theta) * Math.cos(phi);
    let rY = Math.sin(theta) * Math.sin(phi);
    let rZ = Math.cos(theta);

    let channelLabel = 'Depolarizing Channel E(ρ)';
    let channelEquation = 'E(ρ) = (1-p)ρ + (p/3)[XρX + YρY + ZρZ]';
    let physicalEffect = 'Isotropic contraction towards maximally mixed state (origin I/2)';

    if (channelType === 'depolarizing') {
      const shrink = Math.max(0, 1 - (4 * p) / 3);
      rX *= shrink;
      rY *= shrink;
      rZ *= shrink;
      channelLabel = 'Depolarizing Error Channel E(ρ)';
      channelEquation = 'ρ\' = (1 - 4p/3)ρ + (4p/3)(I/2)';
      physicalEffect = 'Random Pauli X, Y, Z phase & bit-flips pull vector toward center origin (I/2).';
    } else if (channelType === 'dephasing') {
      const dephase = Math.sqrt(Math.max(0, 1 - p * 3));
      rX *= dephase;
      rY *= dephase;
      // rZ is preserved in pure dephasing
      channelLabel = 'Phase Damping Channel (T₂* Dephasing)';
      channelEquation = 'r_{xy}\' = √(1-p) · r_{xy},  r_z\' = r_z';
      physicalEffect = 'Environmental phase fluctuation destroys off-diagonal quantum coherence, flattening into the Z-axis.';
    } else if (channelType === 'damping') {
      const damp = Math.sqrt(Math.max(0, 1 - p * 2));
      rX *= damp;
      rY *= damp;
      rZ = rZ * (1 - p * 2) + p * 2; // drift toward North Pole |0>
      channelLabel = 'Amplitude Damping Channel (T₁ Relaxation)';
      channelEquation = 'r_z\' = r_z(1-γ) + γ (Ground State |0⟩)';
      physicalEffect = 'Spontaneous energy loss to the cryogenic bath decays the qubit toward the ground state |0⟩.';
    }

    // Radius of Bloch vector |r| in [0, 1]
    const radius = Math.sqrt(rX * rX + rY * rY + rZ * rZ);

    // State Purity: Tr(rho^2) = (1 + |r|^2) / 2  (1.0 = pure state, 0.5 = maximally mixed)
    const purity = (1 + radius * radius) / 2;

    // Quantum State Fidelity: F = (1 + radius) / 2 for depolarizing
    const fidelity = Math.max(0.5, 1 - (2 * p) / 3);

    // Von Neumann Entropy S = -Tr(rho log2 rho)
    // S = -lambda_+ log2 lambda_+ - lambda_- log2 lambda_- where lambda_pm = (1 pm radius)/2
    const lPlus = Math.max(1e-7, (1 + radius) / 2);
    const lMinus = Math.max(1e-7, (1 - radius) / 2);
    const entropy = -(lPlus * Math.log2(lPlus) + lMinus * Math.log2(lMinus));

    // Shot noise dispersion variance
    const dispersionRadius = Math.min(28, p * 260);

    return {
      p,
      rX,
      rY,
      rZ,
      radius,
      purity,
      fidelity,
      entropy,
      dispersionRadius,
      channelLabel,
      channelEquation,
      physicalEffect,
    };
  }, [noiseP, channelType, patientAngle]);

  // 3D Orthographic Projection coordinates into SVG viewbox [0..260, 0..260]
  const cx = 130;
  const cy = 130;
  const R = 85; // sphere visual radius

  // Project (x, y, z) where +Z is up, +X is bottom-left, +Y is right
  const project = (x, y, z) => {
    const px = cx + R * (y * 0.88 - x * 0.45);
    const py = cy - R * (z * 0.92 - x * 0.38);
    return { px, py };
  };

  const tip = project(physics.rX, physics.rY, physics.rZ);
  const pole0 = project(0, 0, 1);
  const pole1 = project(0, 0, -1);
  const polePlusX = project(1, 0, 0);
  const polePlusY = project(0, 1, 0);

  // Generate 20 deterministic stochastic shot measurement scatter points around vector tip
  const scatterPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 22; i++) {
      const angle = (i * 2.39996) % (2 * Math.PI); // golden angle
      const dist = (Math.sin(i * 1.7) * 0.5 + 0.5) * physics.dispersionRadius;
      pts.push({
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        opacity: Math.max(0.15, 0.85 - (dist / (physics.dispersionRadius + 1)) * 0.6),
      });
    }
    return pts;
  }, [physics.dispersionRadius]);

  return (
    <div className="w-full bg-[#0B0C0E] text-white p-5 sm:p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
      {/* Top Header & Channel Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#E4442C] animate-pulse"></span>
            <span className="text-[11px] font-mono-data tracking-wider uppercase text-white/70 font-semibold">
              DYNAMIC BLOCH STATE VECTOR DECOHERENCE ENGINE
            </span>
          </div>
          <span className="text-[10px] font-mono-data text-[#E4442C] block mt-0.5">
            {physics.channelLabel}
          </span>
        </div>

        {/* Noise Channel Type Toggle Pills */}
        <div className="inline-flex rounded-full bg-white/5 p-0.5 border border-white/10 text-[10px] font-mono-data">
          <button
            onClick={() => setChannelType('depolarizing')}
            className={`px-3 py-1 rounded-full transition-all ${
              channelType === 'depolarizing'
                ? 'bg-[#E4442C] text-white font-bold shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Depolarizing (Pauli)
          </button>
          <button
            onClick={() => setChannelType('dephasing')}
            className={`px-3 py-1 rounded-full transition-all ${
              channelType === 'dephasing'
                ? 'bg-[#E4442C] text-white font-bold shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Dephasing (T₂*)
          </button>
          <button
            onClick={() => setChannelType('damping')}
            className={`px-3 py-1 rounded-full transition-all ${
              channelType === 'damping'
                ? 'bg-[#E4442C] text-white font-bold shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Relaxation (T₁)
          </button>
        </div>
      </div>

      {/* Main Visual Workspace: 3D Projection & Live Quantum Telemetry HUD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* 3D SVG Bloch Sphere Canvas */}
        <div className="md:col-span-7 flex flex-col items-center justify-center relative">
          <div className="relative w-[260px] h-[260px]">
            <svg className="w-full h-full" viewBox="0 0 260 260">
              <defs>
                {/* Radial Glow Gradient for Coherence Core */}
                <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E4442C" stopOpacity="0.12" />
                  <stop offset="70%" stopColor="#151410" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0B0C0E" stopOpacity="0.9" />
                </radialGradient>

                <linearGradient id="vectorGlow" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#1F5D3A" />
                  <stop offset="70%" stopColor="#E4442C" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>

                <filter id="vectorBlurFilter">
                  <feGaussianBlur stdDeviation={physics.p * 18} />
                </filter>
              </defs>

              {/* Sphere Background Fill */}
              <circle cx={cx} cy={cy} r={R} fill="url(#sphereGlow)" stroke="#383838" strokeWidth="1.2" />

              {/* Equator (Horizontal Ellipse) */}
              <ellipse
                cx={cx}
                cy={cy}
                rx={R}
                ry={R * 0.32}
                fill="none"
                stroke="#555555"
                strokeWidth="0.8"
                strokeDasharray="4 4"
              />

              {/* Prime Meridian (Vertical Ellipse) */}
              <ellipse
                cx={cx}
                cy={cy}
                rx={R * 0.38}
                ry={R}
                fill="none"
                stroke="#444444"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />

              {/* Axes: Z (|0> up, |1> down) */}
              <line x1={cx} y1={cy + R + 10} x2={cx} y2={cy - R - 10} stroke="#666666" strokeWidth="1" />
              <text x={cx + 6} y={cy - R - 8} fill="#E4442C" fontSize="10" fontFamily="monospace" fontWeight="bold">
                |0⟩ (+Z)
              </text>
              <text x={cx + 6} y={cy + R + 16} fill="#A8A29E" fontSize="10" fontFamily="monospace">
                |1⟩ (-Z)
              </text>

              {/* Axes: X and Y projections */}
              <line x1={cx} y1={cy} x2={polePlusX.px} y2={polePlusX.py} stroke="#444444" strokeWidth="0.8" />
              <text x={polePlusX.px - 14} y={polePlusX.py + 12} fill="#78716C" fontSize="9" fontFamily="monospace">
                |+⟩ (X)
              </text>

              <line x1={cx} y1={cy} x2={polePlusY.px} y2={polePlusY.py} stroke="#444444" strokeWidth="0.8" />
              <text x={polePlusY.px + 4} y={polePlusY.py + 4} fill="#78716C" fontSize="9" fontFamily="monospace">
                |+i⟩ (Y)
              </text>

              {/* Maximally Mixed State Core (Center Origin I/2) */}
              <circle cx={cx} cy={cy} r={3} fill="#57534E" />
              <text x={cx - 18} y={cy - 6} fill="#78716C" fontSize="8" fontFamily="monospace">
                I/2 (origin)
              </text>

              {/* Pure State Ideal Surface Target (Dotted ghost line when p > 0) */}
              {physics.p > 0.005 && (
                <>
                  <circle
                    cx={project(Math.sin(patientAngle) * Math.cos(0.65), Math.sin(patientAngle) * Math.sin(0.65), Math.cos(patientAngle)).px}
                    cy={project(Math.sin(patientAngle) * Math.cos(0.65), Math.sin(patientAngle) * Math.sin(0.65), Math.cos(patientAngle)).py}
                    r={3}
                    fill="none"
                    stroke="#E4442C"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={cx}
                    y1={cy}
                    x2={project(Math.sin(patientAngle) * Math.cos(0.65), Math.sin(patientAngle) * Math.sin(0.65), Math.cos(patientAngle)).px}
                    y2={project(Math.sin(patientAngle) * Math.cos(0.65), Math.sin(patientAngle) * Math.sin(0.65), Math.cos(patientAngle)).py}
                    stroke="#E4442C"
                    strokeWidth="0.8"
                    strokeDasharray="2 3"
                    opacity="0.35"
                  />
                </>
              )}

              {/* Active Noisy State Vector (Bloch Vector Arrow) */}
              <line
                x1={cx}
                y1={cy}
                x2={tip.px}
                y2={tip.py}
                stroke="url(#vectorGlow)"
                strokeWidth={Math.max(2.0, 3.2 - physics.p * 15)}
                strokeLinecap="round"
                filter={physics.p > 0.005 ? 'url(#vectorBlurFilter)' : undefined}
              />

              {/* Vector Tip (Coherence Point) */}
              <circle
                cx={tip.px}
                cy={tip.py}
                r={Math.max(2.5, 4.5 - physics.p * 20)}
                fill="#FFFFFF"
                stroke="#E4442C"
                strokeWidth="1.5"
                className="transition-all duration-150"
              />

              {/* Stochastic Quantum Measurement Scatter Cloud (Decoherence Dispersion) */}
              {physics.dispersionRadius > 1 && (
                <g className="transition-all duration-200">
                  {scatterPoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={tip.px + pt.dx}
                      cy={tip.py + pt.dy}
                      r={1.2}
                      fill="#E4442C"
                      opacity={pt.opacity}
                    />
                  ))}
                  {/* Variance Aura Ring */}
                  <ellipse
                    cx={tip.px}
                    cy={tip.py}
                    rx={physics.dispersionRadius}
                    ry={physics.dispersionRadius * 0.75}
                    fill="none"
                    stroke="#E4442C"
                    strokeWidth="0.8"
                    strokeDasharray="2 3"
                    opacity={Math.min(0.6, physics.p * 6)}
                  />
                </g>
              )}
            </svg>
          </div>

          <span className="text-[10px] font-mono-data text-white/50 text-center mt-2">
            State Vector Displacement: Radius |r| = {physics.radius.toFixed(3)} / 1.000
          </span>
        </div>

        {/* Live Quantum Physics Readout HUD */}
        <div className="md:col-span-5 space-y-3 font-mono-data text-xs">
          {/* Card 1: State Purity */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex justify-between items-center text-[10px] text-white/60 mb-1">
              <span>STATE PURITY Tr(ρ²)</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                physics.purity > 0.95 ? 'bg-[#1F5D3A]/30 text-green-400' : 'bg-[#E4442C]/30 text-orange-400'
              }`}>
                {physics.purity > 0.98 ? 'PURE STATE' : 'MIXED STATE'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-white">
                {physics.purity.toFixed(4)}
              </span>
              <span className="text-[10px] text-white/50">
                Ideal: 1.0000
              </span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-green-500 rounded-full transition-all duration-200"
                style={{ width: `${physics.purity * 100}%` }}
              />
            </div>
          </div>

          {/* Card 2: Quantum Fidelity */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex justify-between items-center text-[10px] text-white/60 mb-1">
              <span>QUANTUM FIDELITY F(ρ, |ψ⟩)</span>
              <span className="text-[9px] text-[#E4442C] font-semibold">
                Retention: {(physics.fidelity * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-white">
                {(physics.fidelity * 100).toFixed(2)}%
              </span>
              <span className="text-[10px] text-white/50">
                -{( (1 - physics.fidelity) * 100 ).toFixed(2)}% loss
              </span>
            </div>
          </div>

          {/* Card 3: von Neumann Entropy */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex justify-between items-center text-[10px] text-white/60 mb-1">
              <span>VON NEUMANN ENTROPY S(ρ)</span>
              <span className="text-[9px] text-white/40">Information Disorder</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-white">
                {physics.entropy.toFixed(3)} <span className="text-[10px] text-white/50 font-normal">bits</span>
              </span>
              <span className="text-[10px] text-white/50">
                Max: 1.000 bit
              </span>
            </div>
          </div>

          {/* Interactive Latent Angle Slider */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
            <div className="flex justify-between text-[10px] text-white/70">
              <span>PATIENT LATENT ANGLE (θ):</span>
              <span className="font-bold text-[#E4442C]">{(patientAngle).toFixed(2)} rad ({((patientAngle / Math.PI) * 180).toFixed(0)}°)</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.05"
              value={patientAngle}
              onChange={(e) => setPatientAngle(parseFloat(e.target.value))}
              className="w-full accent-[#E4442C] h-1"
            />
          </div>
        </div>
      </div>

      {/* Educational Clinical & Quantum Footnote */}
      <div className="mt-5 p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs font-sans text-white/80 flex items-start space-x-3">
        <Sparkles className="w-4 h-4 text-[#E4442C] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-mono-data uppercase text-[10px] text-[#E4442C] font-bold block">
            What is this state vector physically doing?
          </span>
          <p className="text-[11px] leading-relaxed text-white/75">
            On ideal simulators, patient retinal embeddings rotate qubits to the <strong>outer sphere boundary</strong> (pure state, radius |r| = 1.0).
            On real superconducting QPUs at 15 mK, thermal dephasing (T₂) and microwave crosstalk apply random Pauli errors.
            This causes the state vector to <strong>shrink inward toward the origin (0, 0, 0)</strong> into a mixed state (I / 2).
            The red scatter cloud visualizes the <strong>quantum shot measurement dispersion</strong> under noise probability <code className="text-[#E4442C]">p = {(noiseP * 100).toFixed(1)}%</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
