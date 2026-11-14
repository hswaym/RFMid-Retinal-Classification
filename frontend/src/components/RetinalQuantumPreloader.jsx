import React, { useState, useEffect } from 'react';
import { Eye, Sparkles, Activity, ShieldCheck, Cpu } from 'lucide-react';

export default function RetinalQuantumPreloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [bootPhase, setBootPhase] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const BOOT_LOGS = [
    { text: 'OPTICAL BEN GRAHAM CIRCULAR FOV ALIGNMENT', code: 'FOV_224x224_OK' },
    { text: 'GREEN-CHANNEL CLAHE 540-575nm CONTRAST FILTER', code: 'CLAHE_CLIP_2.0' },
    { text: 'AUTOENCODER COMPRESSION MANIFOLD (512 -> 4 ANGLES)', code: 'LATENT_4D_NORM' },
    { text: 'PENNYLANE QNODE PARAMETER-SHIFT GRADIENTS', code: 'QNODE_READY' },
    { text: 'SUPERCONDUCTING QPU NOISE GATE VALIDATION (15 mK)', code: 'QPU_STABLE' },
  ];

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200; // 2.2 seconds calibration animation

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 25) setBootPhase(0);
      else if (pct < 50) setBootPhase(1);
      else if (pct < 75) setBootPhase(2);
      else if (pct < 95) setBootPhase(3);
      else setBootPhase(4);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 600); // Wait for CSS fade out transition
        }, 300);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#0B0C0E] text-white flex flex-col items-center justify-center transition-all duration-700 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Glow & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(228,68,44,0.12)_0%,rgba(11,12,14,0.95)_70%)]" />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Telemetry Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs font-mono-data text-white/50 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#E4442C] animate-pulse" />
          <span className="tracking-widest uppercase text-white/80 font-bold">
            HQNN QUANTUM RETINA · SYSTEM BOOT
          </span>
        </div>
        <button
          onClick={handleSkip}
          className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white transition-colors px-2 py-1 border border-white/10 rounded-md hover:border-white/30"
        >
          [ Skip Boot ]
        </button>
      </div>

      {/* Central Visual: Animated Optical Eye & Quantum Qubit Reticle */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Outer Rotating Measurement Ring */}
        <div
          className="absolute inset-0 rounded-full border border-dashed border-[#E4442C]/40 animate-spin"
          style={{ animationDuration: '20s' }}
        />

        {/* Concentric Ophthalmic Iris Blades Ring */}
        <div
          className="absolute inset-4 rounded-full border border-white/20 animate-spin"
          style={{ animationDuration: '12s', animationDirection: 'reverse' }}
        />

        {/* 4 Quantum Qubit Nodes on Orbit */}
        {[0, 1, 2, 3].map((q) => {
          const angle = (q * Math.PI) / 2 + (progress / 100) * Math.PI * 2;
          const radius = 120;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <div
              key={q}
              className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-[#151410] border border-[#E4442C] flex items-center justify-center text-[9px] font-mono-data font-bold text-[#E4442C] shadow-[0_0_12px_rgba(228,68,44,0.6)] transition-all duration-75"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              q{q}
            </div>
          );
        })}

        {/* Slit-Lamp Optical Crosshair Lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-white/15" />
          <div className="absolute h-full w-[1px] bg-white/15" />
        </div>

        {/* Central Eye Aperture & Pupil Dilating */}
        <div className="relative w-36 h-36 rounded-full bg-[#151410] border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-2xl">
          {/* Fundus Retinal Blood Vessel Scan Glow */}
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(228,68,44,0.35)_0%,transparent_70%)] animate-pulse"
            style={{ animationDuration: '1.4s' }}
          />

          {/* Eye Icon with Dilating Aperture */}
          <div
            className="transition-transform duration-300 ease-out flex items-center justify-center"
            style={{
              transform: `scale(${0.85 + (progress / 100) * 0.35})`,
            }}
          >
            <Eye className="w-16 h-16 text-[#E4442C] drop-shadow-[0_0_15px_rgba(228,68,44,0.8)]" />
          </div>

          {/* Laser Scanning Line Sweep */}
          <div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E4442C] to-transparent shadow-[0_0_8px_#E4442C] pointer-events-none"
            style={{
              top: `${(progress * 1.5) % 100}%`,
              transition: 'top 0.05s linear',
            }}
          />
        </div>

        {/* Foveal Target Ring */}
        <div
          className="absolute w-20 h-20 rounded-full border border-[#E4442C]/70 pointer-events-none animate-ping"
          style={{ animationDuration: '2.5s' }}
        />
      </div>

      {/* Numerical Calibration Progress HUD */}
      <div className="mt-8 text-center space-y-3 max-w-sm w-full px-6">
        <div className="flex items-baseline justify-between font-mono-data">
          <span className="text-xs text-white/50 tracking-wider uppercase">
            CALIBRATING RETINA ➔ QUANTUM CIRCUIT
          </span>
          <span className="text-2xl font-bold text-[#E4442C]">
            {progress.toString().padStart(3, '0')}%
          </span>
        </div>

        {/* Progress Bar with Vermilion Glow */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/10 p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-[#1F5D3A] via-[#E4442C] to-white rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(228,68,44,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Telemetry Stage Message */}
        <div className="h-6 flex items-center justify-center space-x-2 text-[11px] font-mono-data text-white/80">
          <Activity className="w-3.5 h-3.5 text-[#E4442C] animate-pulse" />
          <span className="truncate">{BOOT_LOGS[bootPhase].text}</span>
          <span className="text-[9px] text-[#1F5D3A] font-bold px-1.5 py-0.2 bg-[#1F5D3A]/20 rounded border border-[#1F5D3A]/30">
            {BOOT_LOGS[bootPhase].code}
          </span>
        </div>
      </div>

      {/* Bottom Citation & Disclaimers */}
      <div className="absolute bottom-6 text-center text-[10px] font-mono-data text-white/40">
        <span>APTOS 2019 CLINICAL COHORT · 4-QUBIT AUTOENCODER PQC · IBM MARRAKESH 156-QUBIT HERON</span>
      </div>
    </div>
  );
}

