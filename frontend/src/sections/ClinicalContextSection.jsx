import React, { useState } from 'react';
import { sampleCases } from '../data';
import { Clock, Eye, Activity, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export default function ClinicalContextSection() {
  const [selectedGrade, setSelectedGrade] = useState(3);
  const currentCase = sampleCases[selectedGrade];

  return (
    <section id="clinical" className="w-full bg-[#FAF8F5] text-[#151410] py-24 border-b border-[#E5E1DC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center space-x-2 text-xs font-mono-data text-[#151410] tracking-widest uppercase mb-4 px-3 py-1 bg-white rounded-full border border-[#E5E1DC] shadow-xs">
            <span>CHAPTER 02</span>
            <span className="text-[#A8A29E]">//</span>
            <span>CLINICAL PATHOLOGY SPECTRUM</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight text-[#151410] leading-tight">
            The five stages of <br />
            <span className="italic text-[#E4442C]">preventable diabetic blindness.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[#57534E] leading-relaxed">
            Diabetic Retinopathy (DR) is an ordinal microvascular continuum. Standard multi-class accuracy 
            penalizes all errors equally, which fails clinically: confusing Grade 0 and 1 causes zero clinical harm, 
            whereas confusing Grade 0 and 4 risks irreversible sight loss.
          </p>
        </div>

        {/* Asymmetric Loss & ICDR Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Grade Selector Tabs */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono-data text-[#78716C] uppercase tracking-wider block mb-2 font-medium">
              Select ICDR Severity Grade (APTOS 2019)
            </span>
            {sampleCases.map((c, idx) => {
              const isSelected = selectedGrade === idx;
              const isHighRisk = idx >= 3;
              const isNormal = idx === 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedGrade(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-[#151410] ring-1 ring-[#151410] shadow-sm'
                      : 'bg-white/70 border-[#E5E1DC] hover:border-[#A8A29E] text-[#57534E]'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${
                        isHighRisk ? 'bg-[#E4442C]' : isNormal ? 'bg-[#1F5D3A]' : 'bg-[#EAB308]'
                      }`}
                    />
                    <div>
                      <span className="text-sm font-semibold text-[#151410] block font-sans">
                        {c.gradeLabel}
                      </span>
                      <span className="text-xs text-[#78716C]">
                        {idx === 0 ? 'Normal Retina' : idx === 4 ? 'Neovascular Proliferation' : 'Non-Proliferative Stage'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono-data text-xs">
                    <span className="text-[10px] uppercase text-[#A8A29E] block">Prevalence</span>
                    <span className="font-semibold text-[#151410]">
                      {idx === 0 ? '49.3%' : idx === 1 ? '10.1%' : idx === 2 ? '27.3%' : idx === 3 ? '5.3%' : '8.1%'}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Asymmetric Distance Box */}
            <div className="p-5 bg-white border border-[#E5E1DC] rounded-xl mt-4 text-xs font-mono-data space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-[#151410] font-semibold">
                <span>QUADRATIC PENALTY MATRIX</span>
                <span className="text-[#E4442C]">w_ij = (i - j)² / 16</span>
              </div>
              <p className="text-[#57534E] font-sans text-xs leading-normal">
                Predicting Grade 0 instead of Grade 1 yields penalty <strong className="font-mono-data text-[#1F5D3A]">0.0625</strong> (16× lower). 
                Predicting Grade 0 instead of Grade 4 carries maximum penalty <strong className="font-mono-data text-[#E4442C]">1.0000</strong>.
              </p>
            </div>
          </div>

          {/* Detailed Clinical Specimen Viewer */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 border border-[#E5E1DC] rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E1DC] pb-5">
              <div>
                <span className="text-xs font-mono-data text-[#E4442C] uppercase tracking-wider block font-semibold">
                  ICDR STAGE {currentCase.grade} OF 4
                </span>
                <h3 className="font-editorial text-3xl font-normal text-[#151410] tracking-tight mt-1">
                  {currentCase.gradeLabel}
                </h3>
              </div>

              <div
                className={`px-4 py-1.5 rounded-full text-xs font-mono-data font-bold flex items-center space-x-2 ${
                  currentCase.grade >= 3
                    ? 'bg-[#FBECE9] text-[#E4442C] border border-[#E4442C]/20'
                    : currentCase.grade === 0
                    ? 'bg-[#EAF3EE] text-[#1F5D3A] border border-[#1F5D3A]/20'
                    : 'bg-[#FEF9C3] text-[#854D0E] border border-[#FEF9C3]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>TRIAGE: {currentCase.urgency.toUpperCase()}</span>
              </div>
            </div>

            {/* Real Fundus Pair Comparison: Raw vs Green CLAHE */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono-data uppercase text-[#78716C] block font-medium">Raw Biological Fundus</span>
                <div className="w-full h-44 sm:h-52 bg-[#0B0C0E] rounded-xl overflow-hidden border border-[#E5E1DC] relative">
                  <img src={currentCase.rawImage} alt="Raw Fundus" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono-data text-white">
                    Broad-Spectrum Flash
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono-data uppercase text-[#1F5D3A] block font-medium">Green CLAHE Enhanced</span>
                <div className="w-full h-44 sm:h-52 bg-[#0B0C0E] rounded-xl overflow-hidden border border-[#1F5D3A]/30 relative">
                  <img src={currentCase.claheImage} alt="CLAHE Fundus" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono-data text-[#A3E635]">
                    540–575nm Bandpass
                  </span>
                </div>
              </div>
            </div>

            {/* Pathophysiology & Lesions */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono-data text-[#78716C] uppercase tracking-wider block mb-1 font-medium">
                  Clinical Pathological Features
                </span>
                <p className="text-sm text-[#2E2B27] leading-relaxed font-sans">
                  {currentCase.clinicalDescription}
                </p>
              </div>

              {/* Lesion Markers */}
              <div>
                <span className="text-xs font-mono-data text-[#78716C] uppercase tracking-wider block mb-2 font-medium">
                  Diagnostic Lesions Present
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentCase.lesionsDetected.map((l, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#FAF8F5] border border-[#E5E1DC] text-[#151410] text-xs font-mono-data rounded-lg flex items-center space-x-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E4442C]" />
                      <span>{l}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinical Protocol Recommendation */}
              <div className="p-4 border-l-4 border-[#E4442C] bg-[#FBECE9] rounded-r-xl text-xs space-y-1">
                <span className="font-mono-data text-[#E4442C] font-bold tracking-wider uppercase block text-[10px]">
                  Recommended Clinical Intervention
                </span>
                <p className="text-[#2E2B27] leading-relaxed font-sans">
                  {currentCase.recommendation}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E1DC] text-right">
              <span className="text-[11px] font-mono-data text-[#A8A29E]">
                FIG. 2 — ICDR Severity Ledger · APTOS 2019 Blindness Benchmark
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
