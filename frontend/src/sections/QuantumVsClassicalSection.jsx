import React from 'react';
import { Cpu, Zap, Layers, Sparkles, Scale, Check } from 'lucide-react';

export default function QuantumVsClassicalSection() {
  return (
    <section id="quantum-vs-classical" className="w-full bg-[#F2EEE9] text-[#151410] py-24 border-b border-[#E5E1DC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center space-x-2 text-xs font-mono-data text-[#151410] tracking-widest uppercase mb-4 px-3 py-1 bg-white rounded-full border border-[#E5E1DC] shadow-xs">
            <span>CHAPTER 03</span>
            <span className="text-[#A8A29E]">//</span>
            <span>PARAMETRIC COMPACTION</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight leading-tight text-[#151410]">
            Twelve angles in Hilbert space <br />
            <span className="italic text-[#E4442C]">versus 11.2 million weights.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[#57534E] leading-relaxed">
            Classical deep neural networks build high-dimensional decision boundaries in Euclidean space 
            by stacking millions of matrix multiplications. Parameterized Quantum Circuits (PQCs) map 
            features into a complex Hilbert space (ℂ¹⁶), where multi-qubit entanglement 
            formulates non-linear decision kernels with exponential parameter efficiency.
          </p>
        </div>

        {/* Head to Head Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* Classical CNN Card */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 border border-[#E5E1DC] rounded-2xl relative flex flex-col justify-between shadow-xs">
            <div className="absolute top-5 right-6 text-[10px] font-mono-data text-[#78716C] uppercase tracking-wider font-semibold">
              CLASSICAL CONVNET
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#151410] mb-6 border border-[#E5E1DC]">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-3xl font-normal text-[#151410] tracking-tight mb-1">
                ResNet18 Baseline
              </h3>
              <p className="text-xs font-mono-data text-[#78716C] mb-6">
                Dense Linear Transformations in Euclidean Space ℝ⁵¹²
              </p>

              {/* Stats */}
              <div className="space-y-4 py-5 border-t border-b border-[#E5E1DC]">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#78716C]">Total Model Parameters</span>
                  <span className="font-mono-data text-2xl font-normal text-[#151410]">11,179,077</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#78716C]">Decision Head Weights</span>
                  <span className="font-mono-data text-lg text-[#151410]">2,565 params</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#78716C]">Per-Image Forward Latency</span>
                  <span className="font-mono-data text-lg text-[#E4442C]">206.26 ms</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#78716C]">Validation Macro-F1</span>
                  <span className="font-mono-data text-lg font-bold text-[#151410]">0.6601</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-[#57534E] leading-relaxed">
                Requires over 44 megabytes of FP32 weights. Vulnerable to memorizing the 49.3% majority Grade 0 cases on imbalanced clinical datasets.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E1DC] text-[11px] font-mono-data text-[#A8A29E] flex items-center justify-between">
              <span>TRADITIONAL PARADIGM</span>
              <span>100% Parameter Footprint</span>
            </div>
          </div>

          {/* Hybrid Quantum Card */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 border-2 border-[#151410] rounded-2xl relative flex flex-col justify-between shadow-sm">
            <div className="absolute top-5 right-6 text-[10px] font-mono-data text-[#E4442C] uppercase font-bold tracking-wider">
              HYBRID QUANTUM (HQNN)
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FBECE9] flex items-center justify-center text-[#E4442C] mb-6 border border-[#E4442C]/20">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-3xl font-normal text-[#151410] tracking-tight mb-1">
                4-Qubit Variational Ansatz
              </h3>
              <p className="text-xs font-mono-data text-[#1F5D3A] mb-6 font-semibold">
                Parameterized Quantum Circuit in Complex Hilbert Space ℂ¹⁶
              </p>

              {/* Stats */}
              <div className="space-y-4 py-5 border-t border-b border-[#E5E1DC]">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#78716C]">Variational Quantum Parameters</span>
                  <span className="font-mono-data text-2xl font-bold text-[#E4442C]">12 angles</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#78716C]">Decision Parameter Reduction</span>
                  <span className="font-mono-data text-lg text-[#1F5D3A] font-bold">-99.5% reduction</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#78716C]">Decision Stage Latency</span>
                  <span className="font-mono-data text-lg text-[#151410]">1.40 ms</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#78716C]">Quadratic Weighted Kappa (QWK)</span>
                  <span className="font-mono-data text-lg font-bold text-[#1F5D3A]">0.7693</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-[#57534E] leading-relaxed">
                Utilizes Euler rotations R_z(γ) R_y(β) R_x(α) coupled with circular CNOT entangling gates. Gradients are computed analytically via the Parameter-Shift Rule.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E1DC] text-[11px] font-mono-data text-[#78716C] flex items-center justify-between">
              <span>QUANTUM ADVANTAGE BENCHMARK</span>
              <span className="text-[#1F5D3A] font-bold">12 Trainable Parameters</span>
            </div>
          </div>

        </div>

        {/* Visual Parameter Scaling Bar */}
        <div className="bg-white p-6 border border-[#E5E1DC] rounded-2xl shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 text-xs font-mono-data">
            <span className="font-semibold text-[#151410]">
              FIG. 3 · PARAMETRIC VOLUME SHRINKAGE (DECISION STAGE)
            </span>
            <span className="text-[#E4442C] font-semibold">12 VARIATIONAL ANGLES vs 2,565 CLASSICAL HEAD WEIGHTS</span>
          </div>

          <div className="relative w-full h-8 bg-[#FAF8F5] rounded-lg overflow-hidden flex items-center border border-[#E5E1DC]">
            {/* 12 Qubit Params slice */}
            <div className="w-[1%] h-full bg-[#E4442C] flex items-center justify-center" />
            <div className="flex-1 px-4 text-xs font-mono-data text-[#78716C] flex justify-between">
              <span className="text-[#E4442C] font-semibold">HQNN Decision Layer: 12 parameters (0.46% of classical head)</span>
              <span className="hidden sm:inline">ResNet18 Head: 2,565 parameters (100%)</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
