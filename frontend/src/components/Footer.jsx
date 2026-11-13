import React from 'react';
import { ExternalLink, ShieldAlert, Award, BookOpen, Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#FAF8F5] text-[#151410] pt-20 pb-12 border-t border-[#E5E1DC] text-xs font-mono-data">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Col 1: Identity & Ethics Notice */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/a/logo.svg" alt="HQNN Quantum Retina" className="h-8 w-auto" />
            </div>

            <p className="text-xs text-[#57534E] font-sans leading-relaxed">
              Empirical Evaluation of Parameterized Quantum Circuits in Hybrid Quantum-Classical 
              Architectures for Diabetic Retinopathy Severity Grading. 
              Benchmarked on APTOS 2019 Blindness Detection (3,662 retinal fundus images).
            </p>

            {/* Mandatory Ethics Callout */}
            <div className="p-4 bg-[#FBECE9] border border-[#E4442C]/30 rounded-2xl text-[11px] text-[#57534E] font-sans flex items-start space-x-3 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-[#E4442C] flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-[#151410]">Research prototype — not for clinical use.</strong> Triage recommendations 
                and severity predictions are experimental demonstrations and must not be used as medical advice or 
                for unmonitored patient care.
              </p>
            </div>
          </div>

          {/* Col 2: Academic Citation & Literature Matrix */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-[#151410] block font-semibold">
              PRIMARY COMPARATIVE LITERATURE
            </span>
            <ul className="space-y-2 text-[11px] text-[#57534E] font-sans">
              <li className="border-b border-[#E5E1DC] pb-1.5">
                <span className="text-[#151410] font-medium">Bali et al. (2025)</span> — QuantumNet (MethodsX, Elsevier) · Noiseless simulator, linear projection.
              </li>
              <li className="border-b border-[#E5E1DC] pb-1.5">
                <span className="text-[#151410] font-medium">Ara et al. (2025)</span> — 8-Qubit VQC (MethodsX, Elsevier) · Dense projection, no QWK evaluation.
              </li>
              <li className="border-b border-[#E5E1DC] pb-1.5">
                <span className="text-[#151410] font-medium">Stalin Babu et al. (2025)</span> — HQCNN (IEEE OTCON) · Angle rotation gates on Kaggle subsets.
              </li>
              <li>
                <span className="text-[#151410] font-medium">Sultana & Agrawal (2026)</span> — Q-DRNet (IEEE) · Ideal simulation, zero NISQ noise analysis.
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links & Tooling */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-[#151410] block font-semibold">
              REPOSITORY & TOOLING
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/hswaym/RFMid-Retinal-Classification"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-[#151410] hover:text-[#E4442C] transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#78716C]" />
                </a>
              </li>
              <li className="text-[#57534E]">
                <span>Frameworks: </span>
                <span className="text-[#151410] font-mono-data">PennyLane 0.35+ · PyTorch 2.2+ · Qiskit 1.0+</span>
              </li>
              <li className="text-[#57534E]">
                <span>Benchmark Split: </span>
                <span className="text-[#151410] font-mono-data">Stratified 70/15/15 (550 Test Samples)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E5E1DC] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#78716C] gap-4">
          <div>
            <span>© 2026 Project ERI 5 / TY_CSE_10 · Final Year Engineering Capstone</span>
          </div>
          <div className="flex items-center space-x-6">
            <span>Faculty of Engineering & Technology</span>
            <span className="text-[#E4442C]">Award-Grade Research Showcase</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
