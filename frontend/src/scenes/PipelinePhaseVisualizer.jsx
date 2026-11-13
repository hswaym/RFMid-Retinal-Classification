import React, { useState } from 'react';
import { Eye, Layers, Sparkles, Cpu, Award, Zap, CheckCircle2, ChevronRight, Activity, ArrowRight, ExternalLink } from 'lucide-react';

export default function PipelinePhaseVisualizer({ activePhase = 0 }) {
  // Split slider for Phase 2 (Green-channel CLAHE comparison)
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="w-full h-full min-h-[460px] bg-[#151410] text-[#F2EEE9] rounded-2xl relative overflow-hidden flex flex-col justify-between p-6 select-none">
      
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-mono-data">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#E4442C] animate-pulse" />
          <span className="text-[#E4442C] font-bold uppercase tracking-wider text-[11px]">
            {activePhase === 0 && 'PHASE 01 // DATA INGESTION & RAW FUNDUS'}
            {activePhase === 1 && 'PHASE 02 // SPECTRAL GREEN-CHANNEL CLAHE'}
            {activePhase === 2 && 'PHASE 03 // LATENT AUTOENCODER MANIFOLD'}
            {activePhase === 3 && 'PHASE 04 // 4-QUBIT BLOCH PHASE STATE'}
            {activePhase === 4 && 'PHASE 05 // STRONGLY ENTANGLING PQC'}
            {activePhase === 5 && 'PHASE 06 // CRYOGENIC QPU HARDWARE EXECUTION'}
          </span>
        </div>
        <span className="text-white/40 text-[10px] hidden sm:inline">
          {activePhase === 0 && 'APTOS 2019 · 224x224 RGB'}
          {activePhase === 1 && '540-575nm Hemoglobin Absorption'}
          {activePhase === 2 && '512 -> 256 -> 64 -> 4'}
          {activePhase === 3 && 'θ ∈ [-π, π]⁴ Single-Qubit Ry'}
          {activePhase === 4 && '4 Qubits · 12 Trainable Weights'}
          {activePhase === 5 && 'IBM Marrakesh · 156-Qubit Heron'}
        </span>
      </div>

      {/* Main Interactive Stage Body */}
      <div className="my-auto py-4 flex items-center justify-center w-full">

        {/* PHASE 01: RAW RETINAL SCAN */}
        {activePhase === 0 && (
          <div className="w-full max-w-md flex flex-col items-center space-y-4">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
              <img
                src="/a/g3_raw.jpg"
                alt="Raw Retinal Fundus Scan"
                className="w-full h-full object-cover"
              />
              
              {/* Anatomical Callout Markers */}
              <div className="absolute top-[48%] left-[62%] -translate-x-1/2 -translate-y-1/2 flex items-center space-x-1.5 group cursor-pointer">
                <span className="w-3 h-3 rounded-full bg-[#EAB308] border-2 border-white animate-ping" />
                <span className="absolute left-4 bg-black/85 text-[10px] font-mono-data px-2 py-0.5 rounded text-white whitespace-nowrap border border-white/20">
                  Optic Disc (Cup/Disc)
                </span>
              </div>

              <div className="absolute top-[52%] left-[36%] -translate-x-1/2 -translate-y-1/2 flex items-center space-x-1.5 group cursor-pointer">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4442C] border-2 border-white" />
                <span className="absolute right-4 bg-black/85 text-[10px] font-mono-data px-2 py-0.5 rounded text-white whitespace-nowrap border border-white/20">
                  Fovea / Macula
                </span>
              </div>

              <div className="absolute top-[28%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex items-center space-x-1.5 group cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] border border-white" />
                <span className="absolute top-3 bg-black/85 text-[9px] font-mono-data px-2 py-0.5 rounded text-white whitespace-nowrap border border-white/20">
                  Superior Vascular Arcades
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full text-[11px] font-mono-data text-white/70">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-white/40 block text-[9px] uppercase">Illumination</span>
                <span className="text-white font-semibold block">Broad-Spectrum Xenon</span>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-white/40 block text-[9px] uppercase">Challenge</span>
                <span className="text-[#EAB308] font-semibold block">Non-Uniform Glare</span>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 02: GREEN-CHANNEL CLAHE (INTERACTIVE BEFORE/AFTER SLIDER) */}
        {activePhase === 1 && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-4">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-2 border-[#1F5D3A] shadow-2xl bg-black">
              {/* After image (Green CLAHE) */}
              <img
                src="/a/g3_clahe.jpg"
                alt="Green Channel CLAHE"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Before image (Raw Scan clipped by slider) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src="/a/g3_raw.jpg"
                  alt="Raw Fundus"
                  className="w-64 h-64 sm:w-72 sm:h-72 object-cover max-w-none"
                />
              </div>

              {/* Vertical divider hairline */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-[#151410] text-[9px] font-bold flex items-center justify-center shadow-md">
                  ↔
                </div>
              </div>

              {/* Labels on each side */}
              <span className="absolute bottom-3 left-4 bg-black/80 text-[9px] font-mono-data px-2 py-0.5 rounded text-white/80 border border-white/10">
                RAW FLASH
              </span>
              <span className="absolute bottom-3 right-4 bg-black/80 text-[9px] font-mono-data px-2 py-0.5 rounded text-[#1F5D3A] font-bold border border-white/10">
                540nm CLAHE
              </span>
            </div>

            {/* Interactive Slider Controller */}
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono-data text-white/50">
                <span>Drag to compare contrast:</span>
                <span className="text-[#1F5D3A] font-bold">{sliderPos}% Bandpass</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full accent-[#1F5D3A] cursor-ew-resize h-1.5 bg-white/20 rounded-lg appearance-none"
              />
              <span className="text-[10px] font-mono-data text-[#1F5D3A] block text-center mt-1">
                +340% Lesion Contrast · Hemoglobin absorption maximized
              </span>
            </div>
          </div>
        )}

        {/* PHASE 03: DEEP LATENT AUTOENCODER */}
        {activePhase === 2 && (
          <div className="w-full max-w-lg space-y-4 font-mono-data text-xs">
            <div className="grid grid-cols-4 gap-2.5 text-center items-center">
              
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-[9px] text-white/40 block">BACKBONE</span>
                <span className="text-base font-bold text-white block mt-1">512</span>
                <span className="text-[9px] text-white/50">ResNet-18</span>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-[9px] text-white/40 block">DENSE 1</span>
                <span className="text-base font-bold text-white block mt-1">256</span>
                <span className="text-[9px] text-white/50">ReLU + LN</span>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-[9px] text-white/40 block">DENSE 2</span>
                <span className="text-base font-bold text-white block mt-1">64</span>
                <span className="text-[9px] text-white/50">ReLU</span>
              </div>

              <div className="p-3 bg-[#E4442C]/20 border-2 border-[#E4442C] rounded-xl">
                <span className="text-[9px] text-[#E4442C] block font-bold">LATENT</span>
                <span className="text-base font-bold text-[#E4442C] block mt-1">4</span>
                <span className="text-[9px] text-white/70">tanh · π</span>
              </div>
            </div>

            {/* Manifold Preservation Explanation Card */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-white/80">
                <span className="font-bold text-[#E4442C]">Non-Linear Manifold Preservation</span>
                <span className="text-[#1F5D3A] font-semibold">MSE: 0.0381</span>
              </div>
              <p className="text-[11px] text-white/60 font-sans leading-relaxed">
                Standard statistical PCA failed (QWK 0.1379) because lesions occupy &lt;1% of global image variance. 
                Our deep autoencoder non-linearly compresses 512 CNN activations into a 4D manifold, 
                preserving microvascular pathology for quantum encoding.
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-white/40">
                <span>Compression Ratio: 99.2%</span>
                <span className="text-white">Output: [θ₀, θ₁, θ₂, θ₃] ∈ [-π, π]⁴</span>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 04: 4 BLOCH SPHERES (QUANTUM ANGLES) */}
        {activePhase === 3 && (
          <div className="w-full max-w-lg space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { q: 'q₀', ang: -2.112, deg: -121 },
                { q: 'q₁', ang: 1.841, deg: 105 },
                { q: 'q₂', ang: 1.448, deg: 83 },
                { q: 'q₃', ang: -1.916, deg: -110 },
              ].map((item, i) => {
                const cx = 32, cy = 32, r = 24;
                const dotY = cy - Math.cos(item.ang) * r * 0.82;
                const dotX = cx + Math.sin(item.ang) * r * 0.7;
                return (
                  <div key={i} className="flex flex-col items-center p-2.5 bg-white/5 border border-white/10 rounded-xl">
                    <svg width="64" height="64" viewBox="0 0 64 64">
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.28} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeDasharray="2 2" />
                      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                      <circle cx={cx} cy={cy - r} r="2" fill="rgba(255,255,255,0.4)" />
                      <circle cx={cx} cy={cy + r} r="2" fill="rgba(255,255,255,0.4)" />
                      <line x1={cx} y1={cy} x2={dotX} y2={dotY} stroke="#E4442C" strokeWidth="1.5" />
                      <circle cx={dotX} cy={dotY} r="4" fill="#E4442C" stroke="#FFFFFF" strokeWidth="1.2" />
                      <text x={cx} y={cy - r - 3} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="rgba(255,255,255,0.6)">|0⟩</text>
                      <text x={cx} y={cy + r + 9} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="rgba(255,255,255,0.6)">|1⟩</text>
                    </svg>
                    <span className="text-xs font-mono-data font-bold text-white mt-1">{item.q}</span>
                    <span className="text-[10px] font-mono-data text-[#E4442C] font-semibold">{item.ang.toFixed(2)} rad</span>
                    <span className="text-[9px] font-mono-data text-white/40">{item.deg}° phase</span>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center font-mono-data text-[11px] text-white/70">
              <span>State Vector: |ψ⟩ = ⨂_{'{i=0}'}³ [cos(θ_i/2)|0⟩ + sin(θ_i/2)|1⟩]</span>
            </div>
          </div>
        )}

        {/* PHASE 05: STRONGLY ENTANGLING PQC ANSATZ */}
        {activePhase === 4 && (
          <div className="w-full max-w-lg space-y-3 font-mono-data text-xs">
            {/* SVG Quantum Circuit Wire Schematic */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
              <svg viewBox="0 0 460 140" className="w-full h-32">
                {[20, 50, 80, 110].map((y, i) => (
                  <g key={i}>
                    {/* Wire line */}
                    <line x1="35" y1={y} x2="430" y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                    {/* Qubit label */}
                    <text x="15" y={y + 4} fill="rgba(255,255,255,0.8)" fontSize="10" fontFamily="monospace">q{['₀','₁','₂','₃'][i]}</text>
                    {/* Ry angle embedding */}
                    <rect x="50" y={y - 10} width="44" height="20" rx="3" fill="#151410" stroke="#E4442C" strokeWidth="1.5" />
                    <text x="72" y={y + 4} fill="#E4442C" fontSize="8" textAnchor="middle" fontFamily="monospace">Ry(θ{i})</text>
                    {/* Trainable Strongly Entangling Layer */}
                    <rect x="110" y={y - 10} width="36" height="20" rx="3" fill="#151410" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
                    <text x="128" y={y + 4} fill="#FFFFFF" fontSize="8" textAnchor="middle" fontFamily="monospace">U(w)</text>
                    {/* Pauli-Z readout */}
                    <rect x="380" y={y - 10} width="32" height="20" rx="3" fill="#151410" stroke="#1F5D3A" strokeWidth="1.5" />
                    <text x="396" y={y + 4} fill="#1F5D3A" fontSize="8" textAnchor="middle" fontFamily="monospace">〈Z〉</text>
                  </g>
                ))}

                {/* CNOT Entanglement Ring (q0->q1, q1->q2, q2->q3, q3->q0) */}
                <line x1="180" y1="20" x2="180" y2="50" stroke="#E4442C" strokeWidth="1.5" />
                <circle cx="180" cy="20" r="3" fill="#E4442C" />
                <circle cx="180" cy="50" r="5" fill="none" stroke="#E4442C" strokeWidth="1.5" />

                <line x1="230" y1="50" x2="230" y2="80" stroke="#E4442C" strokeWidth="1.5" />
                <circle cx="230" cy="50" r="3" fill="#E4442C" />
                <circle cx="230" cy="80" r="5" fill="none" stroke="#E4442C" strokeWidth="1.5" />

                <line x1="280" y1="80" x2="280" y2="110" stroke="#E4442C" strokeWidth="1.5" />
                <circle cx="280" cy="80" r="3" fill="#E4442C" />
                <circle cx="280" cy="110" r="5" fill="none" stroke="#E4442C" strokeWidth="1.5" />

                <line x1="330" y1="20" x2="330" y2="110" stroke="#E4442C" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="330" cy="110" r="3" fill="#E4442C" />
                <circle cx="330" cy="20" r="5" fill="none" stroke="#E4442C" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-white/70">
              <div className="p-2 bg-white/5 border border-white/10 rounded">
                <span className="text-white/40 block">Ansatz Depth:</span>
                <span className="text-white font-semibold">12 Trainable Parameters (L=2)</span>
              </div>
              <div className="p-2 bg-white/5 border border-white/10 rounded">
                <span className="text-white/40 block">Gradient Optimization:</span>
                <span className="text-[#1F5D3A] font-semibold">Parameter-Shift Rule</span>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 06: CRYOGENIC IBM QUANTUM EXECUTION & TRIAGE */}
        {activePhase === 5 && (
          <div className="w-full max-w-lg space-y-3 font-mono-data text-xs">
            {/* Live QPU Telemetry Card */}
            <div className="p-4 bg-white/5 border-2 border-[#1F5D3A] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1F5D3A] font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1F5D3A] animate-ping" />
                  <span>Physical Cryogenic QPU Run (15 mK)</span>
                </span>
                <a
                  href="https://quantum.ibm.com/jobs/dbrhmc7v5hds73dhrg9g"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/60 hover:text-white flex items-center space-x-1 text-[10px]"
                >
                  <span>Job: dbrhmc7...</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                <div>
                  <span className="text-[9px] text-white/40 uppercase block">QPU Target</span>
                  <span className="text-xs font-bold text-white block">ibm_marrakesh</span>
                  <span className="text-[9px] text-[#1F5D3A]">156 Qubits</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/40 uppercase block">Hardware QWK</span>
                  <span className="text-sm font-bold text-[#1F5D3A] block">0.7170</span>
                  <span className="text-[9px] text-white/50">93.2% Retention</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/40 uppercase block">Shots</span>
                  <span className="text-xs font-bold text-white block">1,024</span>
                  <span className="text-[9px] text-white/50">Depth 20</span>
                </div>
              </div>
            </div>

            {/* Final Diagnostic Softmax Triage Output */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-semibold">Predicted: Grade 3 (Severe NPDR)</span>
                <span className="text-[#E4442C] font-bold">74.8% Softmax Conf</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#E4442C] rounded-full" style={{ width: '74.8%' }} />
              </div>
              <span className="text-[10px] text-white/60 font-sans block">
                Action Protocol: Urgent Retina Specialist referral within 2-4 weeks. Panretinal photocoagulation assessment recommended.
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Status Telemetry Footer */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[10px] font-mono-data text-white/40">
        <span>HQNN MEDICAL PIPELINE // SCIENTIFIC ARCHITECTURE</span>
        <span>PennyLane + Qiskit 2.6.2 · PyTorch Bridge</span>
      </div>

    </div>
  );
}

