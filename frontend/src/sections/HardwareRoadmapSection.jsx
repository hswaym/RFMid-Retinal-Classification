import React, { useState } from 'react';
import { Cpu, ShieldCheck, Layers, CheckCircle2, Award, Terminal, Cloud, Key, Check, AlertCircle, RefreshCw } from 'lucide-react';

export default function HardwareRoadmapSection() {
  const [noiseP, setNoiseP] = useState(0.010);
  const [showRealCurve, setShowRealCurve] = useState(false);
  const [ibmToken, setIbmToken] = useState('');
  const [isConnectingIbm, setIsConnectingIbm] = useState(false);
  const [ibmCloudResult, setIbmCloudResult] = useState(null);

  // Empirical interpolation derived from Milestone 4.1 sweep across 550 test samples
  const getEmpiricalMetrics = (p) => {
    if (p <= 0.01) return { qwk: (0.7693 + p * 0.24).toFixed(4), f1: (0.4182 - p * 0.5).toFixed(4) };
    if (p <= 0.05) return { qwk: (0.7717 - (p - 0.01) * 0.1575).toFixed(4), f1: (0.4132 - (p - 0.01) * 0.8).toFixed(4) };
    return { qwk: (0.7654 - (p - 0.05) * 1.03).toFixed(4), f1: (0.3812 - (p - 0.05) * 1.2).toFixed(4) };
  };

  const handleConnectIbmCloud = async (e) => {
    e.preventDefault();
    if (!ibmToken.trim()) return;

    setIsConnectingIbm(true);
    setIbmCloudResult(null);

    try {
      const res = await fetch('http://localhost:8000/hardware/ibm-cloud/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: ibmToken.trim() }),
      });
      const data = await res.json();
      setIbmCloudResult(data);
    } catch (err) {
      setIbmCloudResult({
        status: 'error',
        message: 'Could not reach local FastAPI backend (Port 8000). Ensure python run_project.py is active.',
      });
    } finally {
      setIsConnectingIbm(false);
    }
  };

  const currentMetrics = getEmpiricalMetrics(noiseP);
  const vectorBlur = Math.min(14, noiseP * 120);

  return (
    <section id="hardware" className="w-full bg-[#F2EEE9] text-[#151410] py-24 border-b border-[#E5E1DC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-mono-data text-[#151410] tracking-widest uppercase mb-4 px-3 py-1 bg-white rounded-full border border-[#E5E1DC] shadow-xs">
            <span>CHAPTER 07</span>
            <span className="text-[#A8A29E]">//</span>
            <span>NISQ RESILIENCE & PHYSICAL HARDWARE</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight leading-tight text-[#151410]">
            Superconducting noise sweeps & <br />
            <span className="italic text-[#E4442C]">IBM Quantum deployment.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#57534E] leading-relaxed">
            Existing quantum machine learning literature operates purely on ideal noiseless statevectors.
            Physical Noisy Intermediate-Scale Quantum (NISQ) processors suffer from gate infidelities
            and thermal relaxation (T₁, T₂). We executed full depolarizing noise sweeps across the entire 550-sample
            test set and transpiled our 4-qubit circuit onto IBM's 127-qubit Eagle architecture (<code>ibm_brisbane</code>).
          </p>
        </div>

        {/* Milestone 4.2 Verified Hardware Card */}
        <div className="mb-12 p-6 sm:p-8 bg-white border border-[#151410] rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#151410] text-white text-[10px] font-mono-data px-4 py-1.5 rounded-bl-xl tracking-wider uppercase flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-[#EAB308]" />
            <span>Verified Physical QPU & Emulated Benchmarks // Milestone 4.2</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E5E1DC] pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F5D3A] animate-pulse"></span>
                <span className="text-xs font-mono-data text-[#1F5D3A] font-semibold uppercase tracking-wider block">
                  Physical Hardware Target: ibm_marrakesh (156-Qubit Heron Architecture)
                </span>
              </div>
              <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-[#151410] mt-1">
                Cryogenic Superconducting Quantum Hardware Verification
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-data">
              <a
                href="https://quantum.ibm.com/jobs/dbrhmc7v5hds73dhrg9g"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#FAF8F5] border border-[#151410] rounded-lg text-[#151410] hover:bg-[#151410] hover:text-white transition-all font-semibold"
              >
                <span>IBM Job: dbrhmc7v5hds73dhrg9g</span>
                <Terminal className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Dual Hardware Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Real Hardware Card */}
            <div className="p-5 bg-[#FAF8F5] border-2 border-[#1F5D3A] rounded-xl relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono-data uppercase font-bold text-[#1F5D3A] tracking-wider">
                  Live Physical Cloud QPU (15 mK Cryostat)
                </span>
                <span className="text-[10px] font-mono-data bg-[#1F5D3A] text-white px-2 py-0.5 rounded">
                  ibm_marrakesh
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 font-mono-data">
                <div>
                  <span className="text-[10px] text-[#78716C] block uppercase">Physical QWK</span>
                  <span className="text-2xl font-bold text-[#1F5D3A] block mt-0.5">0.7170</span>
                  <span className="text-[10px] text-[#57534E]">Sim: 0.7693</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#78716C] block uppercase">Sim-to-Real</span>
                  <span className="text-2xl font-bold text-[#151410] block mt-0.5">93.2%</span>
                  <span className="text-[10px] text-[#1F5D3A] font-semibold">&gt; 0.70 Target</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#78716C] block uppercase">QPU Depth</span>
                  <span className="text-2xl font-bold text-[#E4442C] block mt-0.5">20</span>
                  <span className="text-[10px] text-[#57534E]">1,024 Shots</span>
                </div>
              </div>
            </div>

            {/* FakeBrisbane Baseline Card */}
            <div className="p-5 bg-[#FAF8F5] border border-[#E5E1DC] rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono-data uppercase font-bold text-[#57534E] tracking-wider">
                  Eagle Architecture Emulation (100 Samples)
                </span>
                <span className="text-[10px] font-mono-data bg-[#57534E] text-white px-2 py-0.5 rounded">
                  FakeBrisbane
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 font-mono-data">
                <div>
                  <span className="text-[10px] text-[#78716C] block uppercase">Emulated QWK</span>
                  <span className="text-2xl font-bold text-[#151410] block mt-0.5">0.7839</span>
                  <span className="text-[10px] text-[#57534E]">127 Qubits</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#78716C] block uppercase">Retention</span>
                  <span className="text-2xl font-bold text-[#151410] block mt-0.5">101.9%</span>
                  <span className="text-[10px] text-[#1F5D3A]">Zero degradation</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#78716C] block uppercase">Transpiled Depth</span>
                  <span className="text-2xl font-bold text-[#57534E] block mt-0.5">25</span>
                  <span className="text-[10px] text-[#57534E]">2,048 Shots</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive IBM Quantum Cloud Connection Widget */}
          <div className="p-4 sm:p-5 bg-[#FAF8F5] border border-[#E5E1DC] rounded-xl text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-[#151410]" />
                <span className="font-mono-data font-bold text-[#151410] uppercase">
                  IBM Quantum Cloud Service Integration (qiskit-ibm-runtime)
                </span>
              </div>
              <span className="font-mono-data text-[10px] text-[#78716C]">
                Offline default: Exact FakeBrisbane 127-Qubit Snapshot
              </span>
            </div>

            <form onSubmit={handleConnectIbmCloud} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Key className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-3" />
                <input
                  type="password"
                  value={ibmToken}
                  onChange={(e) => setIbmToken(e.target.value)}
                  placeholder="Paste your IBM Quantum Cloud API Token (quantum.ibm.com)..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E1DC] rounded-lg text-xs font-mono-data text-[#151410] focus:outline-none focus:border-[#151410]"
                />
              </div>
              <button
                type="submit"
                disabled={isConnectingIbm}
                className="px-4 py-2 bg-[#151410] text-white rounded-lg font-mono-data font-semibold hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isConnectingIbm ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Query Live Cloud QPUs</span>
                )}
              </button>
            </form>

            {ibmCloudResult && (
              <div className="mt-3 p-3 rounded-lg font-mono-data text-xs border bg-white">
                {ibmCloudResult.status === 'connected' ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[#1F5D3A] font-bold">
                      <Check className="w-4 h-4" />
                      <span>{ibmCloudResult.message}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {ibmCloudResult.backends?.map((b) => (
                        <div key={b.name} className="p-2 bg-[#FAF8F5] border border-[#E5E1DC] rounded text-[11px]">
                          <span className="font-bold text-[#151410] block">{b.name}</span>
                          <span className="text-[#78716C] block">{b.num_qubits} Qubits · Jobs: {b.pending_jobs}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-[#E4442C]">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{ibmCloudResult.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Interactive NISQ Noise Simulator & Empirical Curve */}
        <div className="bg-white p-6 sm:p-8 border border-[#E5E1DC] rounded-2xl mb-12 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#E5E1DC] pb-4">
            <div>
              <span className="text-xs font-mono-data text-[#E4442C] uppercase tracking-wider block font-semibold">
                EMPIRICAL DEPOLARIZING NOISE SWEEP (N = 550 TEST SET)
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight text-[#151410] mt-0.5">
                Single & Two-Qubit Error Rate Modulation (Qiskit Aer)
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRealCurve(!showRealCurve)}
                className="px-3.5 py-1.5 rounded-full border border-[#151410] text-xs font-mono-data bg-[#151410] text-white hover:bg-black transition-all"
              >
                {showRealCurve ? 'Show Interactive Sweep' : 'View Publication Curve'}
              </button>
            </div>
          </div>

          {!showRealCurve ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Slider Controller & Metrics */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs font-mono-data">
                    <span className="text-[#78716C]">Gate Error Probability (p):</span>
                    <span className="text-xl font-bold text-[#E4442C]">{(noiseP * 100).toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.000"
                    max="0.100"
                    step="0.005"
                    value={noiseP}
                    onChange={(e) => setNoiseP(parseFloat(e.target.value))}
                    className="w-full accent-[#E4442C]"
                  />
                  <div className="flex justify-between text-[10px] font-mono-data text-[#78716C]">
                    <span>0.0% (Clean)</span>
                    <span>5.0% (Noisy NISQ)</span>
                    <span>10.0% (Extreme Decoherence)</span>
                  </div>
                </div>

                {/* Degradation Readout Cards */}
                <div className="grid grid-cols-2 gap-3.5 font-mono-data text-xs">
                  <div className="p-4 bg-[#FAF8F5] border border-[#E5E1DC] rounded-xl">
                    <span className="text-[10px] text-[#78716C] block uppercase">Degraded QWK</span>
                    <span className={`text-2xl font-bold ${parseFloat(currentMetrics.qwk) >= 0.70 ? 'text-[#1F5D3A]' : 'text-[#E4442C]'}`}>
                      {currentMetrics.qwk}
                    </span>
                    <span className="text-[9px] text-[#78716C] block mt-1">
                      {parseFloat(currentMetrics.qwk) >= 0.70 ? 'Clinical validity holds' : 'Degraded below threshold'}
                    </span>
                  </div>

                  <div className="p-4 bg-[#FAF8F5] border border-[#E5E1DC] rounded-xl">
                    <span className="text-[10px] text-[#78716C] block uppercase">Degraded Macro-F1</span>
                    <span className="text-2xl font-bold text-[#151410]">
                      {currentMetrics.f1}
                    </span>
                    <span className="text-[9px] text-[#78716C] block mt-1">
                      From baseline 0.4182
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#EAF3EE] border border-[#1F5D3A]/20 rounded-xl text-xs space-y-1">
                  <span className="font-mono-data font-bold block uppercase text-[10px] text-[#1F5D3A]">
                    Key Empirical Finding
                  </span>
                  <p className="font-sans text-[11px] text-[#57534E] leading-tight">
                    Even at an aggressive depolarizing error rate of <strong className="text-[#151410]">p = 10.0%</strong>,
                    the 4-qubit autoencoder HQNN retains a QWK of <strong className="text-[#151410]">0.7139</strong>,
                    remaining strictly above the minimum clinical benchmark threshold of 0.70.
                  </p>
                </div>
              </div>

              {/* Visual Bloch Coherence Dispersion (Near-Black 3D Canvas Box) */}
              <div className="lg:col-span-7 bg-[#0B0C0E] p-6 rounded-2xl border border-[#151410] text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[260px] shadow-md">
                <div className="text-xs font-mono-data text-white/60 mb-4">
                  BLOCH STATE VECTOR COHERENCE DISPERSION UNDER NOISE
                </div>

                <div className="relative w-44 h-44 rounded-full border border-white/20 flex items-center justify-center">
                  {[0, 1, 2, 3].map((i) => {
                    const baseAngle = (i * Math.PI) / 2 + 0.4;
                    return (
                      <div
                        key={i}
                        className="absolute w-1 h-20 bg-gradient-to-t from-transparent via-[#E4442C] to-white rounded-full origin-bottom transition-all duration-200"
                        style={{
                          transform: `rotate(${baseAngle + (Math.random() - 0.5) * noiseP * 3}rad)`,
                          filter: `blur(${vectorBlur}px)`,
                          opacity: Math.max(0.35, 1 - noiseP * 8),
                        }}
                      />
                    );
                  })}
                  <div className="w-3 h-3 rounded-full bg-white z-10 shadow-sm" />
                </div>

                <span className="text-[10px] font-mono-data text-white/50 mt-4">
                  State Vector Blurring: {vectorBlur.toFixed(1)}px variance under depolarizing channel E(ρ)
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-full bg-[#FAF8F5] p-3 border border-[#E5E1DC] rounded-xl overflow-hidden flex justify-center">
                <img
                  src="/noise_degradation_curve.png"
                  alt="Empirical NISQ Noise Degradation Curve (N=550)"
                  className="max-h-[380px] object-contain rounded-lg"
                />
              </div>
              <div className="flex justify-between items-center text-xs font-mono-data text-[#57534E]">
                <span>Figure 7: Full 550-sample empirical QWK degradation curve under depolarizing error p ∈ [0.0, 0.10].</span>
                <span className="text-[#1F5D3A] font-bold">Clinical Threshold: QWK ≥ 0.70</span>
              </div>
            </div>
          )}
        </div>

        {/* IBM Quantum Deployment Roadmap (3 Pillars) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#E5E1DC] rounded-2xl space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#151410] border border-[#E5E1DC]">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-editorial text-2xl font-normal text-[#151410]">
              127-Qubit Eagle QPU
            </h4>
            <p className="text-xs text-[#57534E] leading-relaxed font-sans">
              Targeting <code>ibm_brisbane</code> via <code>qiskit-ibm-runtime</code>. Dynamic backend calibration
              selects physical qubits [0, 1, 2, 3] exhibiting minimal cross-talk and ECR gate infidelities (&lt;0.8%).
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E1DC] rounded-2xl space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#FBECE9] flex items-center justify-center text-[#E4442C] border border-[#E4442C]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-editorial text-2xl font-normal text-[#151410]">
              Zero-Noise Extrapolation (ZNE)
            </h4>
            <p className="text-xs text-[#57534E] leading-relaxed font-sans">
              Unitary folding at noise scale factors λ ∈ &#123;1.0, 1.5, 2.0&#125; with polynomial/Richardson extrapolation
              projects Pauli expectation values back to the zero-noise limit (λ → 0).
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E1DC] rounded-2xl space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#EAF3EE] flex items-center justify-center text-[#1F5D3A] border border-[#1F5D3A]/20">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-editorial text-2xl font-normal text-[#151410]">
              M3 Measurement Mitigation
            </h4>
            <p className="text-xs text-[#57534E] leading-relaxed font-sans">
              Matrix-free Measurement Mitigation pre-calibrates readout assignment error tensors,
              correcting physical detector misidentifications (|0⟩ misread as |1⟩) in post-processing.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
