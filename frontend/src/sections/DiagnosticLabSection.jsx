import React, { useState, useEffect, useRef } from 'react';
import { sampleCases } from '../data';
import { Play, RotateCcw, AlertTriangle, CheckCircle, ShieldAlert, Clock, Sparkles, Activity, Upload, Radio, FileImage } from 'lucide-react';

export default function DiagnosticLabSection() {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(3);
  const [isInferring, setIsInferring] = useState(false);
  const [inferenceStep, setInferenceStep] = useState(4);
  const [apiOnline, setApiOnline] = useState(false);
  const [customPrediction, setCustomPrediction] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Check if local FastAPI backend is active
  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('API offline');
      })
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
  }, []);

  const currentCase = customPrediction || sampleCases[selectedCaseIdx];

  const handleRunInference = (idx) => {
    setCustomPrediction(null);
    setUploadError(null);
    setSelectedCaseIdx(idx);
    setIsInferring(true);
    setInferenceStep(0);

    setTimeout(() => setInferenceStep(1), 300);
    setTimeout(() => setInferenceStep(2), 600);
    setTimeout(() => setInferenceStep(3), 900);
    setTimeout(() => {
      setInferenceStep(4);
      setIsInferring(false);
    }, 1200);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsInferring(true);
    setInferenceStep(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setInferenceStep(1); // Ben Graham & CLAHE
      const response = await fetch('http://localhost:8000/predict/image', {
        method: 'POST',
        body: formData,
      });

      setInferenceStep(2); // Autoencoder
      if (!response.ok) {
        throw new Error(`Inference API error: ${response.statusText}`);
      }

      setInferenceStep(3); // Quantum Circuit
      const data = await response.json();

      setInferenceStep(4); // Head & Softmax
      setCustomPrediction({
        id: 'CUSTOM_UPLOAD',
        grade: data.grade,
        gradeLabel: `Grade ${data.grade}: ${data.grade_name.replace('Non-Proliferative', 'NPDR').replace('DR', '')}`,
        angles: data.angles_rad,
        probabilities: data.probabilities,
        claheImage: data.clahe_image_b64 || URL.createObjectURL(file),
        urgency: data.triage_urgency.toLowerCase(),
        recommendation: data.recommendation,
        clinicalDescription: data.clinical_stakes,
        latencyMs: data.latency_ms,
        isCustom: true,
      });
      setIsInferring(false);
    } catch (err) {
      console.warn('Backend inference unavailable or failed:', err);
      setUploadError(
        apiOnline
          ? `Inference error: ${err.message}`
          : 'Local FastAPI backend (port 8000) is offline. Start the backend with: python -m api.main to enable live image inference.'
      );
      setIsInferring(false);
    }
  };

  const getRadarCoordinates = (angles) => {
    const radius = 65;
    const center = 80;
    return angles.map((ang, i) => {
      const normR = ((ang + Math.PI) / (2 * Math.PI)) * radius;
      const phi = (i * Math.PI) / 2 - Math.PI / 2;
      const x = center + Math.cos(phi) * normR;
      const y = center + Math.sin(phi) * normR;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <section id="diagnostic-lab" className="w-full bg-[#F2EEE9] text-[#151410] py-24 border-b border-[#E5E1DC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-xs font-mono-data text-[#151410] tracking-widest uppercase mb-4 px-3 py-1 bg-white rounded-full border border-[#E5E1DC] shadow-xs">
              <span>CHAPTER 05</span>
              <span className="text-[#A8A29E]">//</span>
              <span>INTERACTIVE CLINICAL SIMULATOR</span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight leading-tight text-[#151410]">
              Clinical diagnostic lab & <br />
              <span className="italic text-[#E4442C]">quantum angle inspector.</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#57534E] leading-relaxed">
              Test verified clinical specimens or upload custom retinal images through the 4-qubit autoencoder pipeline. 
              Observe in-flight optical preprocessing, the four compressed variational rotation angles, and the final 
              softmax triage prediction.
            </p>
          </div>

          {/* Right Status Block */}
          <div className="space-y-3 max-w-sm">
            {/* Live API Badge */}
            <div className="p-3 bg-white border border-[#E5E1DC] rounded-xl text-xs flex items-center justify-between shadow-xs font-mono-data">
              <span className="text-[#78716C] flex items-center space-x-2">
                <Radio className={`w-3.5 h-3.5 ${apiOnline ? 'text-[#1F5D3A] animate-pulse' : 'text-[#78716C]'}`} />
                <span>BACKEND STATUS:</span>
              </span>
              <span className={`font-bold ${apiOnline ? 'text-[#1F5D3A]' : 'text-[#78716C]'}`}>
                {apiOnline ? '● Live API (Port 8000)' : '○ Standalone Mock'}
              </span>
            </div>

            {/* Research Prototype Alert Notice */}
            <div className="p-3.5 bg-[#FBECE9] border border-[#E4442C]/30 rounded-xl text-xs flex items-start space-x-2.5 shadow-xs">
              <ShieldAlert className="w-4 h-4 text-[#E4442C] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#57534E] font-sans leading-tight">
                <strong className="text-[#151410]">Research Prototype:</strong> Not for direct clinical diagnosis. 
                Triage recommendations reflect experimental benchmark guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Selector of 5 Real Cases + Upload Button */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <span className="text-xs font-mono-data text-[#78716C] uppercase tracking-wider block font-medium">
              Select Specimen from Verified Test Split (APTOS 2019):
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-[#151410] text-xs font-mono-data bg-white text-[#151410] hover:bg-[#FAF8F5] transition-all self-start sm:self-auto shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#E4442C]" />
              <span>Upload Custom Retinal Fundus Image</span>
            </button>
          </div>

          {uploadError && (
            <div className="mb-4 p-3 bg-[#FEF9C3] border border-[#FEF08A] rounded-xl text-xs font-mono-data text-[#854D0E] flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#EAB308]" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {sampleCases.map((c, idx) => {
              const isSelected = !customPrediction && selectedCaseIdx === idx;
              const isHigh = idx >= 3;
              const isNorm = idx === 0;
              return (
                <button
                  key={c.id}
                  onClick={() => handleRunInference(idx)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#151410] bg-white ring-1 ring-[#151410] shadow-sm'
                      : 'border-[#E5E1DC] hover:border-[#A8A29E] bg-white/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono-data font-bold text-[#151410]">
                      Grade {c.grade}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isHigh ? 'bg-[#E4442C]' : isNorm ? 'bg-[#1F5D3A]' : 'bg-[#EAB308]'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-[#57534E] block truncate font-sans">
                    {c.gradeLabel.split(':')[1]}
                  </span>
                  <span className="text-[10px] font-mono-data text-[#1F5D3A] font-semibold block mt-1">
                    Conf: {(c.probabilities[c.grade] * 100).toFixed(1)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Fundus Preprocessing Viewer */}
          <div className="lg:col-span-5 bg-white p-6 border border-[#E5E1DC] rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono-data border-b border-[#E5E1DC] pb-3">
              <span className="text-[#78716C]">
                {currentCase.isCustom ? 'CUSTOM USER SPECIMEN' : 'SPECIMEN VIEWPORT'}
              </span>
              <span className="text-[#151410] font-bold">{currentCase.gradeLabel}</span>
            </div>

            {/* Image Viewer */}
            <div className="w-full h-64 sm:h-72 bg-[#0B0C0E] rounded-xl overflow-hidden relative flex items-center justify-center border border-[#E5E1DC]">
              <img
                src={currentCase.claheImage}
                alt={currentCase.gradeLabel}
                className="w-full h-full object-cover"
              />

              {/* In-Flight Inference Scanner Overlay */}
              {isInferring && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 z-20">
                  <Sparkles className="w-8 h-8 text-[#E4442C] animate-spin" />
                  <span className="text-xs font-mono-data tracking-wider uppercase text-white font-bold text-center px-4">
                    {inferenceStep === 0 && 'STEP 1: BEN GRAHAM CIRCULAR MASKING...'}
                    {inferenceStep === 1 && 'STEP 2: GREEN CLAHE (540-575nm)...'}
                    {inferenceStep === 2 && 'STEP 3: 512-d AUTOENCODER MANIFOLD...'}
                    {inferenceStep === 3 && 'STEP 4: PENNYLANE 4-QUBIT QNODE RUN...'}
                  </span>
                </div>
              )}

              <div className="absolute bottom-2 left-2 bg-black/80 px-2.5 py-1 rounded-full text-[10px] font-mono-data text-white/90 border border-white/10">
                224 x 224 x 3 px · Green-Channel CLAHE
              </div>
            </div>

            {/* Clinical Pathology Description */}
            <div className="text-xs text-[#57534E] space-y-1">
              <span className="font-mono-data uppercase text-[#151410] font-bold block text-[10px]">
                Ophthalmic Findings:
              </span>
              <p className="leading-relaxed font-sans">
                {currentCase.clinicalDescription}
              </p>
            </div>
          </div>

          {/* Right: Quantum Angles & Diagnostic Confidence */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Quantum Angle Inspector (Radar chart + Polar dial) */}
            <div className="bg-white text-[#151410] p-6 rounded-2xl border border-[#E5E1DC] space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono-data border-b border-[#E5E1DC] pb-3">
                <span className="text-[#78716C]">QUANTUM ANGLE INSPECTOR (θ₀..θ₃ ∈ [-π, π])</span>
                <span className="text-[#E4442C] font-semibold">Autoencoder Latent Angles</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* SVG Polar Radar Display */}
                <div className="sm:col-span-5 flex justify-center">
                  <svg className="w-44 h-44" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="65" fill="none" stroke="#E5E1DC" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="80" cy="80" r="40" fill="none" stroke="#E5E1DC" strokeWidth="1" />
                    <circle cx="80" cy="80" r="15" fill="none" stroke="#E5E1DC" strokeWidth="1" />
                    
                    <line x1="80" y1="15" x2="80" y2="145" stroke="#E5E1DC" strokeWidth="1" />
                    <line x1="15" y1="80" x2="145" y2="80" stroke="#E5E1DC" strokeWidth="1" />

                    <polygon
                      points={getRadarCoordinates(currentCase.angles)}
                      fill="rgba(228, 68, 44, 0.12)"
                      stroke="#E4442C"
                      strokeWidth="2.5"
                    />

                    {currentCase.angles.map((ang, i) => {
                      const r = ((ang + Math.PI) / (2 * Math.PI)) * 65;
                      const phi = (i * Math.PI) / 2 - Math.PI / 2;
                      const x = 80 + Math.cos(phi) * r;
                      const y = 80 + Math.sin(phi) * r;
                      return (
                        <circle key={i} cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#E4442C" strokeWidth="2" />
                      );
                    })}

                    <text x="80" y="10" textAnchor="middle" fill="#151410" fontSize="9" fontFamily="monospace" fontWeight="bold">θ₀</text>
                    <text x="155" y="83" textAnchor="start" fill="#151410" fontSize="9" fontFamily="monospace" fontWeight="bold">θ₁</text>
                    <text x="80" y="158" textAnchor="middle" fill="#151410" fontSize="9" fontFamily="monospace" fontWeight="bold">θ₂</text>
                    <text x="5" y="83" textAnchor="end" fill="#151410" fontSize="9" fontFamily="monospace" fontWeight="bold">θ₃</text>
                  </svg>
                </div>

                {/* Numerical Angle Values */}
                <div className="sm:col-span-7 grid grid-cols-2 gap-3 text-xs font-mono-data">
                  {currentCase.angles.map((ang, i) => (
                    <div key={i} className="p-3 bg-[#FAF8F5] border border-[#E5E1DC] rounded-xl">
                      <span className="text-[#78716C] block text-[10px]">WIRE q_{i} ANGLE</span>
                      <span className="text-sm font-bold text-[#151410] font-mono-data block">
                        {ang.toFixed(3)} <span className="text-[10px] text-[#E4442C]">rad</span>
                      </span>
                      <span className="text-[9px] text-[#57534E]">
                        Phase: {((ang / Math.PI) * 180).toFixed(0)}°
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Softmax Probability Distribution */}
            <div className="p-6 bg-white border border-[#E5E1DC] rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono-data border-b border-[#E5E1DC] pb-3">
                <span className="font-semibold text-[#151410]">POST-QUANTUM SOFTMAX PROBABILITIES</span>
                <span className="text-[#1F5D3A] font-bold">
                  LATENCY: {currentCase.latencyMs ? `${currentCase.latencyMs} ms` : '1.40 ms'}
                </span>
              </div>

              <div className="space-y-3 font-mono-data text-xs">
                {['Grade 0: Normal', 'Grade 1: Mild NPDR', 'Grade 2: Moderate NPDR', 'Grade 3: Severe NPDR', 'Grade 4: Proliferative DR'].map((label, g) => {
                  const prob = currentCase.probabilities[g];
                  const isTop = g === currentCase.grade;
                  const isHigh = g >= 3;
                  return (
                    <div key={g} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className={isTop ? 'font-bold text-[#151410]' : 'text-[#78716C]'}>
                          {label}
                        </span>
                        <span className={isTop ? (isHigh ? 'font-bold text-[#E4442C]' : 'font-bold text-[#1F5D3A]') : 'text-[#78716C]'}>
                          {(prob * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E5E1DC]">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isTop ? (isHigh ? 'bg-[#E4442C]' : 'bg-[#1F5D3A]') : 'bg-transparent'
                          }`}
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clinical Protocol Alert */}
              <div
                className={`p-4 rounded-xl text-xs space-y-1 border ${
                  currentCase.grade >= 3
                    ? 'bg-[#FBECE9] border-[#E4442C]/30'
                    : currentCase.grade === 0
                    ? 'bg-[#EAF3EE] border-[#1F5D3A]/30'
                    : 'bg-[#FEF9C3] border-[#FEF08A]'
                }`}
              >
                <div
                  className="flex items-center space-x-2 font-mono-data font-bold"
                  style={{ color: currentCase.grade >= 3 ? '#E4442C' : currentCase.grade === 0 ? '#1F5D3A' : '#854D0E' }}
                >
                  <Clock className="w-4 h-4" />
                  <span>ACTION PROTOCOL: {currentCase.urgency.toUpperCase()} TRIAGE</span>
                </div>
                <p className="text-[#2E2B27] font-sans text-xs leading-relaxed">
                  {currentCase.recommendation}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
