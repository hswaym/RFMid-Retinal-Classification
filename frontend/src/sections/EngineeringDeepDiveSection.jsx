import React, { useState } from 'react';
import { Sliders, Activity, Sparkles, Orbit, Layers, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function EngineeringDeepDiveSection() {
  const [activePillar, setActivePillar] = useState('preprocessing');
  const [sliderPos, setSliderPos] = useState(55);
  const [qubitAngles, setQubitAngles] = useState([-1.25, 0.85, 2.10, -0.45]);
  const [gamma, setGamma] = useState(2.0);

  return (
    <section id="deep-dive" className="w-full bg-[#FAF8F5] text-[#151410] py-24 border-b border-[#E5E1DC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-mono-data text-[#151410] tracking-widest uppercase mb-4 px-3 py-1 bg-white rounded-full border border-[#E5E1DC] shadow-xs">
            <span>CHAPTER 04</span>
            <span className="text-[#A8A29E]">//</span>
            <span>FOUR RESEARCH PILLARS</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight leading-tight text-[#151410]">
            Scientific architecture & <br />
            <span className="italic text-[#E4442C]">engineering mechanics.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[#57534E] leading-relaxed">
            The hybrid quantum-classical pipeline relies on four tightly coupled mathematical foundations. 
            Inspect each engineering subsystem below to examine why non-linear autoencoding and class-weighted 
            loss optimization are essential for medical quantum advantage.
          </p>
        </div>

        {/* Pillar Switcher Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-10 border-b border-[#E5E1DC] pb-6">
          {[
            { id: 'preprocessing', label: '01. Optical Preprocessing', tag: '540–575nm Green CLAHE' },
            { id: 'autoencoder-pca', label: '02. 37-Param Paradox', tag: 'AE vs PCA Manifold' },
            { id: 'pqc-circuit', label: '03. PQC & Parameter-Shift', tag: '4-Qubit Variational Ansatz' },
            { id: 'focal-loss', label: '04. Class-Weighted Focal', tag: 'γ = 2.0 Dynamic Loss' },
          ].map((p) => {
            const isActive = activePillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id)}
                className={`p-4 text-left rounded-xl border transition-all ${
                  isActive
                    ? 'bg-white border-[#151410] ring-1 ring-[#151410] shadow-sm'
                    : 'bg-white/70 border-[#E5E1DC] text-[#78716C] hover:border-[#A8A29E]'
                }`}
              >
                <span className="text-xs font-mono-data block text-[#151410] font-semibold">{p.label}</span>
                <span className={`text-[10px] font-mono-data block mt-1 font-medium ${isActive ? 'text-[#E4442C]' : 'text-[#78716C]'}`}>{p.tag}</span>
              </button>
            );
          })}
        </div>

        {/* PILLAR 1: PREPROCESSING ENGINE */}
        {activePillar === 'preprocessing' && (
          <div className="bg-white p-6 sm:p-8 border border-[#E5E1DC] rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono-data text-[#1F5D3A] uppercase tracking-wider block font-semibold">
                PILLAR 01 · OPHTHALMIC SPECTROPHOTOMETRY
              </span>
              <h3 className="font-editorial text-3xl font-normal tracking-tight text-[#151410]">
                Green Channel (540–575 nm) Optical Isolation
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                Color fundus cameras photograph the eye using broad-spectrum white flash. However, 
                human <strong>deoxyhemoglobin and oxyhemoglobin</strong> exhibit their sharpest optical absorption 
                peak between <strong>540 nm and 575 nm</strong> (the green spectrum). 
              </p>
              <div className="p-4 bg-[#FAF8F5] border border-[#E5E1DC] rounded-xl text-xs font-mono-data space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#78716C]">Red (600-700nm):</span>
                  <span className="text-[#E4442C]">Choroidal overexposure / saturated</span>
                </div>
                <div className="flex justify-between font-bold text-[#1F5D3A]">
                  <span>Green (540-575nm):</span>
                  <span>Optimal Hemoglobin Absorption Peak</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C]">Blue (400-500nm):</span>
                  <span className="text-[#A8A29E]">Poor transmission / optical scatter</span>
                </div>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Applying Contrast Limited Adaptive Histogram Equalization (CLAHE: clip limit 2.0, 8×8 grid) 
                amplifies local lesion boundary gradients without blowing out the optic disc.
              </p>
            </div>

            {/* Interactive Image Splitter Simulator */}
            <div className="lg:col-span-7 bg-[#FAF8F5] p-4 rounded-xl border border-[#E5E1DC]">
              <div className="relative w-full h-[320px] sm:h-[380px] overflow-hidden rounded-xl bg-black select-none">
                {/* Background: Preprocessed Green CLAHE */}
                <img
                  src="/a/g3_clahe.jpg"
                  alt="Green CLAHE Fundus"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Left slice: Raw Fundus */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src="/a/g3_raw.jpg"
                    alt="Raw Fundus"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', minWidth: '100%' }}
                  />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-mono-data border border-white/20">
                    RAW FUNDUS
                  </div>
                </div>

                {/* Slider divider overlay */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-[#E4442C] cursor-ew-resize z-20"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-md border-2 border-[#E4442C] flex items-center justify-center text-[10px] font-mono-data font-bold text-[#E4442C]">
                    ↔
                  </div>
                </div>

                {/* Right label */}
                <div className="absolute top-3 right-3 bg-[#EAF3EE] backdrop-blur-md text-[#1F5D3A] px-2.5 py-1 rounded-full text-[10px] font-mono-data border border-[#1F5D3A]/30 font-bold">
                  GREEN CLAHE (540–575nm)
                </div>
              </div>

              {/* Slider Controller */}
              <div className="mt-4 flex items-center justify-between text-xs font-mono-data">
                <span className="text-[#78716C]">Drag Splitter to Inspect:</span>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="w-48 accent-[#E4442C]"
                />
                <span className="font-bold text-[#E4442C]">{sliderPos}% Split</span>
              </div>
            </div>
          </div>
        )}

        {/* PILLAR 2: AUTOENCODER VS PCA (37-PARAM PARADOX) */}
        {activePillar === 'autoencoder-pca' && (
          <div className="bg-white p-6 sm:p-8 border border-[#E5E1DC] rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono-data text-[#E4442C] uppercase tracking-wider block font-semibold">
                PILLAR 02 · SCIENTIFIC DISCOVERY
              </span>
              <h3 className="font-editorial text-3xl font-normal tracking-tight text-[#151410]">
                The "37-Parameter Paradox"
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-sans">
                The 4-Qubit PCA model was our most parameter-minimal architecture: 
                <strong> only 37 trainable parameters</strong> total (12 in the quantum circuit + 25 in the linear head). 
                Yet it suffered catastrophic failure: <strong>QWK collapsed to 0.1379</strong> and training triggered early stopping at epoch 9.
              </p>
              
              <div className="p-4 bg-[#FBECE9] border-l-4 border-[#E4442C] rounded-r-xl text-xs space-y-2">
                <span className="font-mono-data text-[#E4442C] font-bold block uppercase text-[10px]">WHY DID PCA FAIL?</span>
                <p className="text-[#57534E] leading-relaxed font-sans">
                  Principal Component Analysis is an unsupervised linear projection that maximizes global variance. 
                  In retinal photography, variance is dominated by background illumination and optic disc glare. 
                  <strong>Subtle microaneurysms carry &lt;1% of total pixel variance</strong>. Unsupervised PCA discarded 
                  the disease signals entirely.
                </p>
              </div>

              <div className="p-4 bg-[#EAF3EE] border-l-4 border-[#1F5D3A] rounded-r-xl text-xs space-y-2">
                <span className="font-mono-data text-[#1F5D3A] font-bold block uppercase text-[10px]">WHY THE AUTOENCODER WON:</span>
                <p className="text-[#57534E] leading-relaxed font-sans">
                  The 3-layer Autoencoder (512 → 256 → 64 → 4) was pre-trained with reconstruction loss. 
                  Its non-linear ReLU and tanh activations captured the curved geometric manifold of diabetic lesions, 
                  achieving <strong>0.7693 QWK (+0.63 over PCA)</strong>.
                </p>
              </div>
            </div>

            {/* Scatter Manifold Comparison Visual */}
            <div className="lg:col-span-6 bg-[#FAF8F5] p-6 rounded-2xl border border-[#E5E1DC] space-y-4">
              <div className="flex justify-between items-center text-xs font-mono-data">
                <span className="text-[#78716C]">EMBEDDING MANIFOLD SEPARATION</span>
                <span className="text-[#151410] font-semibold">N=550 Test Samples</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* PCA Scatter Box */}
                <div className="p-4 bg-white border border-[#E4442C]/40 rounded-xl text-center shadow-xs">
                  <span className="text-xs font-mono-data text-[#E4442C] block mb-2 font-bold">PCA Projection</span>
                  <div className="w-full h-36 bg-[#FAF8F5] rounded-lg flex items-center justify-center relative overflow-hidden border border-[#E5E1DC]">
                    <div className="w-16 h-16 rounded-full bg-[#E4442C]/10 blur-md absolute" />
                    <span className="text-[11px] font-mono-data text-[#78716C] px-2 text-center">
                      Severe Class Overlap (QWK 0.1379)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-data text-[#78716C] block mt-2">
                    Linear Variance Collapsed
                  </span>
                </div>

                {/* Autoencoder Scatter Box */}
                <div className="p-4 bg-white border border-[#1F5D3A]/40 rounded-xl text-center shadow-xs">
                  <span className="text-xs font-mono-data text-[#1F5D3A] block mb-2 font-bold">Deep Autoencoder</span>
                  <div className="w-full h-36 bg-[#FAF8F5] rounded-lg flex items-center justify-center relative overflow-hidden border border-[#E5E1DC]">
                    <div className="w-8 h-8 rounded-full bg-[#1F5D3A]/20 blur-sm absolute top-4 left-4" />
                    <div className="w-8 h-8 rounded-full bg-[#E4442C]/20 blur-sm absolute bottom-4 right-4" />
                    <span className="text-[11px] font-mono-data text-[#1F5D3A] px-2 text-center font-medium">
                      Ordinal Manifold Preserved (QWK 0.7693)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-data text-[#78716C] block mt-2">
                    Non-Linear Bottleneck
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-mono-data text-[#A8A29E] pt-2 border-t border-[#E5E1DC]">
                FIG. 4 · Latent space compression comparison · 512-d feature space mapped to 4-d
              </div>
            </div>
          </div>
        )}

        {/* PILLAR 3: PQC & PARAMETER-SHIFT RULE */}
        {activePillar === 'pqc-circuit' && (
          <div className="bg-white p-6 sm:p-8 border border-[#E5E1DC] rounded-2xl space-y-8 shadow-sm">
            <div className="max-w-3xl">
              <span className="text-xs font-mono-data text-[#151410] uppercase tracking-wider block mb-1 font-semibold">
                PILLAR 03 · QUANTUM VARIATIONAL ANSATZ
              </span>
              <h3 className="font-editorial text-3xl font-normal tracking-tight text-[#151410]">
                Parameterized Quantum Circuit & The Parameter-Shift Rule
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] mt-2 leading-relaxed">
                Classical automatic differentiation caches intermediate activations. In quantum hardware, 
                measuring intermediate states collapses the wavefunction. We resolve this via the 
                <strong> Parameter-Shift Rule</strong>, evaluating analytical gradients via macroscopic parameter shifts:
                <code className="block mt-2 p-3.5 bg-[#FAF8F5] border border-[#E5E1DC] text-[#151410] font-mono-data text-xs rounded-xl">
                  ∂⟨Z_i⟩ / ∂θ_j = [ ⟨Z_i⟩(θ_j + π/2) - ⟨Z_i⟩(θ_j - π/2) ] / 2
                </code>
              </p>
            </div>

            {/* Circuit Canvas */}
            <div className="p-6 bg-[#0B0C0E] text-white rounded-2xl border border-[#151410] space-y-6 shadow-md">
              <div className="flex justify-between items-center text-xs font-mono-data border-b border-white/10 pb-3">
                <span className="text-white/60">PENNYLANE QNODE CIRCUIT DIAGRAM (4-QUBIT ANSATZ)</span>
                <span className="text-[#00F5D4] font-bold">Circular CNOT Ring Topology</span>
              </div>

              {/* Circuit Diagram Wires */}
              <div className="space-y-4 font-mono-data text-xs">
                {[0, 1, 2, 3].map((q) => (
                  <div key={q} className="flex items-center space-x-3">
                    <span className="text-[#00F5D4] w-12 text-right font-bold">|q_{q}⟩</span>
                    <div className="flex-1 h-[2px] bg-white/20 relative flex items-center justify-between px-4">
                      {/* State prep Ry gate */}
                      <span className="bg-[#00F5D4] text-[#070B19] px-2.5 py-1 rounded text-[10px] font-bold z-10 shadow-sm">
                        Ry(θ_{q} = {qubitAngles[q].toFixed(2)})
                      </span>

                      {/* Euler rotation block */}
                      <span className="bg-[#182442] text-white px-2.5 py-1 rounded text-[10px] z-10 border border-white/20">
                        R_z · R_y · R_x
                      </span>

                      {/* Entangling CNOT target/control */}
                      <span className="w-5 h-5 rounded-full bg-[#E4442C] text-white flex items-center justify-center text-[10px] font-bold z-10 shadow-sm">
                        ⊕
                      </span>

                      {/* Measurement operator */}
                      <span className="bg-white/10 border border-[#00F5D4] text-[#00F5D4] px-2.5 py-1 rounded text-[10px] z-10 font-bold">
                        ⟨Z_{q}⟩
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Angle Sliders */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                {[0, 1, 2, 3].map((q) => (
                  <div key={q} className="p-3.5 bg-[#12141A] border border-white/10 rounded-xl text-xs font-mono-data space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white/60">θ_{q} Phase</span>
                      <span className="text-[#00F5D4] font-bold">{qubitAngles[q].toFixed(2)} rad</span>
                    </div>
                    <input
                      type="range"
                      min="-3.14"
                      max="3.14"
                      step="0.05"
                      value={qubitAngles[q]}
                      onChange={(e) => {
                        const updated = [...qubitAngles];
                        updated[q] = parseFloat(e.target.value);
                        setQubitAngles(updated);
                      }}
                      className="w-full accent-[#00F5D4]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* FIG. 3 · 4-QUBIT VARIATIONAL ANSATZ — CIRCUIT DIAGRAM */}
            <div className="bg-white p-6 border border-[#E5E1DC] rounded-2xl mt-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono-data text-[#78716C] uppercase tracking-wider font-semibold">
                  FIG. 3 · 4-QUBIT VARIATIONAL ANSATZ — CIRCUIT DIAGRAM (L=1 STRONGLY ENTANGLING LAYER)
                </span>
              </div>

              <svg viewBox="0 0 700 220" className="w-full" xmlns="http://www.w3.org/2000/svg" fontFamily="monospace">
                {/* Wire lines */}
                {[0, 1, 2, 3].map((q) => {
                  const y = 36 + q * 48;
                  return (
                    <line key={`wire-${q}`} x1="60" y1={y} x2="650" y2={y} stroke="#E5E1DC" strokeWidth="1.5" />
                  );
                })}

                {/* Qubit labels */}
                {['q₀','q₁','q₂','q₃'].map((label, q) => {
                  const y = 36 + q * 48;
                  return (
                    <text key={`label-${q}`} x="50" y={y + 4} textAnchor="end" fontSize="13" fill="#151410" fontWeight="bold">{label}</text>
                  );
                })}

                {/* Angle Embedding Ry gates (column 1) */}
                {[0, 1, 2, 3].map((q) => {
                  const y = 36 + q * 48;
                  const gx = 80, gy = y - 14, gw = 80, gh = 28;
                  return (
                    <g key={`ae-${q}`}>
                      <rect x={gx} y={gy} width={gw} height={gh} rx="5" fill="#FFFFFF" stroke="#151410" strokeWidth="1.5" />
                      <text x={gx + gw / 2} y={gy + 18} textAnchor="middle" fontSize="11" fill="#151410" fontWeight="bold">Rᵧ(θ{['₀','₁','₂','₃'][q]})</text>
                    </g>
                  );
                })}

                {/* StronglyEntangling Ry gates (column 2) */}
                {[0, 1, 2, 3].map((q) => {
                  const y = 36 + q * 48;
                  const gx = 240, gy = y - 14, gw = 56, gh = 28;
                  return (
                    <g key={`se-${q}`}>
                      <rect x={gx} y={gy} width={gw} height={gh} rx="5" fill="#FFFFFF" stroke="#151410" strokeWidth="1.5" />
                      <text x={gx + gw / 2} y={gy + 18} textAnchor="middle" fontSize="11" fill="#151410" fontWeight="bold">Rᵧ</text>
                    </g>
                  );
                })}

                {/* CNOT gates: (q0→q1), (q1→q2), (q2→q3), (q3→q0) */}
                {[[0,1],[1,2],[2,3],[3,0]].map(([ctrl, tgt], i) => {
                  const cx = 360 + i * 50;
                  const cy_ctrl = 36 + ctrl * 48;
                  const cy_tgt = tgt === 0 && ctrl === 3 ? 36 : 36 + tgt * 48;
                  const topY = Math.min(cy_ctrl, cy_tgt);
                  const botY = Math.max(cy_ctrl, cy_tgt);
                  return (
                    <g key={`cnot-${i}`}>
                      {/* Vertical connecting line */}
                      <line x1={cx} y1={topY} x2={cx} y2={botY} stroke="#151410" strokeWidth="1.5" />
                      {/* Control dot */}
                      <circle cx={cx} cy={cy_ctrl} r="6" fill="#E4442C" />
                      {/* Target ⊕ */}
                      <circle cx={cx} cy={cy_tgt} r="10" fill="none" stroke="#E4442C" strokeWidth="2" />
                      <line x1={cx - 10} y1={cy_tgt} x2={cx + 10} y2={cy_tgt} stroke="#E4442C" strokeWidth="2" />
                      <line x1={cx} y1={cy_tgt - 10} x2={cx} y2={cy_tgt + 10} stroke="#E4442C" strokeWidth="2" />
                    </g>
                  );
                })}

                {/* Measurement 〈Z〉 boxes */}
                {[0, 1, 2, 3].map((q) => {
                  const y = 36 + q * 48;
                  const gx = 578, gy = y - 14, gw = 60, gh = 28;
                  return (
                    <g key={`meas-${q}`}>
                      <rect x={gx} y={gy} width={gw} height={gh} rx="5" fill="#FFFFFF" stroke="#151410" strokeWidth="1.5" />
                      <text x={gx + gw / 2} y={gy + 18} textAnchor="middle" fontSize="11" fill="#151410" fontWeight="bold">〈Z〉</text>
                    </g>
                  );
                })}

                {/* Section labels */}
                <text x="120" y="210" textAnchor="middle" fontSize="9" fill="#A8A29E">Angle Embedding</text>
                <text x="268" y="210" textAnchor="middle" fontSize="9" fill="#A8A29E">SEL Rotations</text>
                <text x="435" y="210" textAnchor="middle" fontSize="9" fill="#A8A29E">CNOT Ring</text>
                <text x="608" y="210" textAnchor="middle" fontSize="9" fill="#A8A29E">Measurement</text>
              </svg>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono-data text-[#57534E] border-t border-[#E5E1DC] pt-3">
                <span>🔵 Rᵧ(θ) = Angle Embedding (data encoding)</span>
                <span>🟥 CNOT (⊕) = Entangling gates</span>
                <span>⬛ 〈Z〉 = Pauli-Z expectation measurement</span>
              </div>
            </div>

          </div>
        )}

        {/* PILLAR 4: CLASS-WEIGHTED FOCAL LOSS */}
        {activePillar === 'focal-loss' && (
          <div className="bg-white p-6 sm:p-8 border border-[#E5E1DC] rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono-data text-[#E4442C] uppercase tracking-wider block font-semibold">
                PILLAR 04 · OPTIMIZATION REGULARIZATION
              </span>
              <h3 className="font-editorial text-3xl font-normal tracking-tight text-[#151410]">
                Class-Weighted Focal Loss (γ = 2.0)
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                In standard Cross-Entropy, the model is overwhelmed by the 49.3% Grade 0 examples. 
                Focal Loss introduces a modulating dynamic factor <strong>(1 - p_t)^γ</strong> that down-weights 
                easy examples, forcing gradients to focus on hard, sight-threatening lesion boundaries.
              </p>

              <div className="p-4 bg-[#FAF8F5] border border-[#E5E1DC] rounded-xl space-y-2 text-xs font-mono-data">
                <span className="text-[#78716C] uppercase block font-semibold">INVERSE-FREQUENCY CLASS WEIGHTS (α_c):</span>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  <div className="p-2 bg-white rounded-lg border border-[#E5E1DC]">Gr 0: 0.41×</div>
                  <div className="p-2 bg-white rounded-lg border border-[#E5E1DC]">Gr 1: 1.98×</div>
                  <div className="p-2 bg-white rounded-lg border border-[#E5E1DC]">Gr 2: 0.74×</div>
                  <div className="p-2 bg-[#FBECE9] border border-[#E4442C] text-[#E4442C] font-bold">Gr 3: 3.81×</div>
                  <div className="p-2 bg-white rounded-lg border border-[#E5E1DC]">Gr 4: 2.49×</div>
                </div>
                <p className="text-[11px] text-[#57534E] font-sans pt-1">
                  Grade 3 (Severe NPDR) receives a <strong>9.3× larger gradient multiplier</strong> than Grade 0, preventing majority collapse.
                </p>
              </div>

              {/* Gamma Slider */}
              <div className="p-4 bg-[#FAF8F5] border border-[#E5E1DC] rounded-xl text-xs font-mono-data space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-[#151410]">Focusing Parameter γ: {gamma.toFixed(1)}</span>
                  <span className="text-[#E4442C] font-semibold">{gamma === 0 ? 'Standard Cross-Entropy' : 'Focal Modulated'}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="4.0"
                  step="0.5"
                  value={gamma}
                  onChange={(e) => setGamma(parseFloat(e.target.value))}
                  className="w-full accent-[#E4442C]"
                />
              </div>
            </div>

            {/* Visual Loss Gradient Attenuation Chart */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#E5E1DC] space-y-4 shadow-xs">
              <div className="flex justify-between items-center text-xs font-mono-data">
                <span className="text-[#78716C]">GRADIENT LOSS vs PREDICTED PROBABILITY</span>
                <span className="text-[#E4442C] font-bold">γ = {gamma.toFixed(1)}</span>
              </div>

              <div className="h-44 w-full bg-[#FAF8F5] rounded-xl flex items-end justify-between px-6 pb-2 border border-[#E5E1DC] relative">
                {/* Simulated Curve bars */}
                {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((pVal) => {
                  const focalFactor = Math.pow(1 - pVal, gamma);
                  const lossHeight = Math.min(100, Math.max(8, -Math.log(pVal) * focalFactor * 35));
                  return (
                    <div key={pVal} className="flex flex-col items-center space-y-1">
                      <div
                        className="w-5 bg-[#E4442C] rounded-t transition-all duration-300"
                        style={{ height: `${lossHeight}%` }}
                      />
                      <span className="text-[9px] font-mono-data text-[#78716C]">{pVal}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-[10px] font-mono-data text-[#78716C]">
                <span>← Ambiguous Lesions (p ≈ 0.1, High Penalty)</span>
                <span>Easy Classifications (p ≈ 0.9, Zero Gradient) →</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
