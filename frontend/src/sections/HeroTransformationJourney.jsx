import React, { useState } from 'react';
import PipelinePhaseVisualizer from '../scenes/PipelinePhaseVisualizer';
import { ArrowRight, Sparkles, Cpu, Zap, Activity, Microscope } from 'lucide-react';

const STAGES = [
  {
    step: '01',
    phase: 'RAW RETINAL SCANNING',
    title: 'High-Resolution Ophthalmic Input',
    spec: 'B x 3 x 224 x 224 px · Hemoglobin absorption',
    desc: 'Unprocessed clinical fundus photography. Retinal vascular network radiates from the optic disc. Lesions (microaneurysms and hemorrhages) appear as subtle localized variances under broad-spectrum flash.',
    marker: 'Raw Scan',
  },
  {
    step: '02',
    phase: 'SPECTRAL CONTRAST EXTRACTION',
    title: 'Green-Channel CLAHE (540–575 nm)',
    spec: 'Bandpass absorption · Tile 8x8 · Clip 2.0',
    desc: 'Hemoglobin maximally absorbs green photons. Isolating the green channel and applying Contrast Limited Adaptive Histogram Equalization suppresses illumination glare while amplifying microaneurysm contrast by +340%.',
    marker: 'Green CLAHE',
  },
  {
    step: '03',
    phase: 'NON-LINEAR MANIFOLD EXTRACTION',
    title: 'Deep Latent Autoencoder',
    spec: '512 -> 256 -> 64 -> 4 · MSE pre-trained',
    desc: 'A 3-stage non-linear compression encoder trained with reconstruction loss. Preserves the delicate geometric manifold of diabetic lesions while discarding global illumination noise.',
    marker: 'Autoencoder',
  },
  {
    step: '04',
    phase: 'QUANTUM STATE PREPARATION',
    title: '4 Phase Rotation Angles',
    spec: '[θ₀, θ₁, θ₂, θ₃] ∈ [-π, π] · tanh(x) * π',
    desc: 'The compressed features are bounded strictly within [-π, π] via hyperbolic tangent scaling, preventing rotational phase distortion when initialized onto single-qubit Y-axis rotations.',
    marker: '4 Angles',
  },
  {
    step: '05',
    phase: 'HILBERT SPACE ENTANGLEMENT',
    title: 'Strongly Entangling PQC Ansatz',
    spec: '4 Qubits · 12 Parameters · Circular CNOT',
    desc: 'Euler rotations R_z(γ) R_y(β) R_x(α) coupled with periodic circular ring CNOT gates generate non-classical multi-qubit correlations across a 16-dimensional complex Hilbert space (C¹⁶).',
    marker: 'Entangled PQC',
  },
  {
    step: '06',
    phase: 'MEASUREMENT PROJECTION',
    title: 'Pauli-Z Observable Collapse',
    spec: '⟨Z_i⟩ ∈ [-1, 1] -> Softmax 5 Grades',
    desc: 'Expectation values of the Pauli-Z operator collapse into classical expectation voltages. Analytical Parameter-Shift Rule gradients propagate back through the circuit without wavefunction destruction.',
    marker: 'QWK 0.7693',
  },
];

export default function HeroTransformationJourney() {
  const [activeStage, setActiveStage] = useState(0);
  const [progress, setProgress] = useState(0.08);

  const handleStageSelect = (idx) => {
    setActiveStage(idx);
    const targetP = (idx + 0.5) / STAGES.length;
    setProgress(targetP);
  };

  const current = STAGES[activeStage];

  return (
    <section id="journey" className="relative w-full min-h-screen bg-[#F2EEE9] text-[#151410] overflow-hidden">
      {/* Background paper texture & grid */}
      <div className="absolute inset-0 bg-paper-grid pointer-events-none opacity-60" />

      {/* Main hero header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-12">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 border-b border-[#E5E1DC] pb-12">
          <div className="max-w-3xl">
            
            {/* Telemetry pill */}
            <div className="inline-flex items-center space-x-2.5 px-3 py-1 rounded-full bg-white border border-[#E5E1DC] text-[11px] font-mono-data text-[#151410] tracking-widest uppercase mb-8 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#E4442C] animate-ping" />
              <span>HYBRID QUANTUM-CLASSICAL NEURAL ARCHITECTURE // CLINICAL STUDY</span>
            </div>

            {/* High-contrast Figma Editorial Headline */}
            <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#151410] leading-[1.02] font-normal">
              the eye <br />
              becomes <br />
              <span className="italic font-normal text-[#E4442C]">the circuit.</span>
            </h1>

            <p className="mt-8 text-base sm:text-lg text-[#57534E] max-w-2xl font-normal leading-relaxed">
              A final-year research study: a hybrid quantum-classical system for Diabetic Retinopathy (DR) grading from retinal fundus images. Compressing 150,000 retinal pixels through a non-linear latent autoencoder into 4 rotation angles in a 4-qubit parameterized quantum circuit.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-mono-data">
              <a
                href="#diagnostic-lab"
                className="px-6 py-3.5 rounded-full bg-[#E4442C] text-white font-semibold tracking-wide hover:bg-[#CC4E31] transition-all flex items-center space-x-2 shadow-sm"
              >
                <span>LAUNCH DIAGNOSTIC LAB</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#deep-dive"
                className="px-6 py-3.5 rounded-full bg-white border border-[#E5E1DC] text-[#151410] hover:border-[#151410] transition-all font-semibold shadow-xs"
              >
                EXPLORE FOUR PILLARS
              </a>
            </div>
          </div>

          {/* Key Metric Editorial Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 w-full lg:w-auto self-end lg:self-auto">
            <div className="p-5 bg-white border border-[#E5E1DC] rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#78716C]">Kappa Metric</span>
                <Sparkles className="w-3.5 h-3.5 text-[#E4442C]" />
              </div>
              <span className="font-editorial text-4xl font-normal text-[#151410] block">0.7693</span>
              <span className="text-[10px] font-mono-data text-[#1F5D3A] block mt-1 font-medium">Quadratic Weighted (QWK)</span>
            </div>

            <div className="p-5 bg-white border border-[#E5E1DC] rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#78716C]">Quantum Circuit</span>
                <Cpu className="w-3.5 h-3.5 text-[#151410]" />
              </div>
              <span className="font-editorial text-4xl font-normal text-[#151410] block">12</span>
              <span className="text-[10px] font-mono-data text-[#78716C] block mt-1">Variational Rotation Angles</span>
            </div>

            <div className="p-5 bg-white border border-[#E5E1DC] rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#78716C]">Parameter Cut</span>
                <Zap className="w-3.5 h-3.5 text-[#E4442C]" />
              </div>
              <span className="font-editorial text-4xl font-normal text-[#E4442C] block">99.8%</span>
              <span className="text-[10px] font-mono-data text-[#78716C] block mt-1">vs 11.2M Classical CNN</span>
            </div>

            <div className="p-5 bg-white border border-[#E5E1DC] rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#78716C]">Inference Latency</span>
                <Activity className="w-3.5 h-3.5 text-[#78716C]" />
              </div>
              <span className="font-editorial text-4xl font-normal text-[#151410] block">1.40 <span className="text-base font-normal text-[#78716C]">ms</span></span>
              <span className="text-[10px] font-mono-data text-[#78716C] block mt-1">Forward state evaluation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Pipeline Continuum Scroller */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Top: Interactive Step Nav & Annotation Callouts */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center justify-between text-xs font-mono-data text-[#78716C] border-b border-[#E5E1DC] pb-3">
              <span>FIG. 1 // PIPELINE CONTINUUM</span>
              <span className="text-[#E4442C] font-semibold">PHASE {current.step} / 06</span>
            </div>

            {/* Stage Selector Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2 py-1">
              {STAGES.map((s, idx) => (
                <button
                  key={s.step}
                  onClick={() => handleStageSelect(idx)}
                  className={`p-2.5 rounded-xl text-xs font-mono-data tracking-wider transition-all text-center ${
                    activeStage === idx
                      ? 'bg-[#151410] text-white font-medium shadow-sm'
                      : 'bg-white text-[#78716C] hover:text-[#151410] border border-[#E5E1DC]'
                  }`}
                >
                  <span className="block font-bold text-xs">{s.step}</span>
                  <span className="text-[10px] block opacity-80 truncate mt-0.5">{s.marker}</span>
                </button>
              ))}
            </div>

            {/* Active Step Detailed Card */}
            <div className="p-6 bg-white border border-[#E5E1DC] rounded-2xl space-y-3.5 relative overflow-hidden shadow-sm">
              <div className="text-[10px] font-mono-data uppercase tracking-widest text-[#E4442C] font-semibold flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4442C]" />
                <span>PHASE {current.step} // {current.phase}</span>
              </div>

              <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-[#151410] tracking-tight">
                {current.title}
              </h3>

              <div className="text-xs font-mono-data text-[#1F5D3A] bg-[#EAF3EE] px-2.5 py-1 rounded w-fit border border-[#1F5D3A]/20">
                {current.spec}
              </div>

              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed pt-1 font-sans">
                {current.desc}
              </p>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E5E1DC] text-xs font-mono-data">
                <button
                  disabled={activeStage === 0}
                  onClick={() => handleStageSelect(Math.max(0, activeStage - 1))}
                  className="text-[#78716C] hover:text-[#151410] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  ← PREVIOUS PHASE
                </button>

                <div className="flex items-center space-x-1.5">
                  {STAGES.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        activeStage === i ? 'w-5 bg-[#E4442C]' : 'w-1.5 bg-[#D8D3CC]'
                      }`}
                    />
                  ))}
                </div>

                <button
                  disabled={activeStage === STAGES.length - 1}
                  onClick={() => handleStageSelect(Math.min(STAGES.length - 1, activeStage + 1))}
                  className="text-[#E4442C] hover:text-[#CC4E31] font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  NEXT PHASE →
                </button>
              </div>
            </div>

            <div className="text-[11px] font-mono-data text-[#78716C] flex items-center space-x-2">
              <Microscope className="w-3.5 h-3.5 text-[#E4442C]" />
              <span>Interactive Scientific Pipeline · Ophthalmic Ingestion to 156-Qubit IBM QPU</span>
            </div>
          </div>

          {/* Right: Authentic Ophthalmic & Quantum Scientific Visualizer */}
          <div className="lg:col-span-7 h-[460px] sm:h-[520px] lg:h-[560px] rounded-2xl relative overflow-hidden shadow-xl border border-[#151410]">
            <PipelinePhaseVisualizer activePhase={activeStage} />
          </div>

        </div>
      </div>
    </section>
  );
}
