import React, { useState } from 'react';
import { vivaDefenseQA } from '../data';
import { ChevronDown, HelpCircle, CheckCircle2, BookOpen } from 'lucide-react';

export default function VivaDefenseSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggleAccordion = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx);
  };

  return (
    <section id="technical-inquiries" className="w-full bg-[#FAF8F5] text-[#151410] py-24 border-b border-[#E5E1DC]">
      <span id="viva" className="sr-only" />
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-xs font-mono-data text-[#151410] tracking-widest uppercase mb-4 px-3.5 py-1.5 bg-white rounded-full border border-[#E5E1DC] shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-[#E4442C]" />
            <span>CHAPTER 08 · PEER REVIEW PANEL</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight leading-tight text-[#151410]">
            Technical inquiries & <br />
            <span className="italic text-[#E4442C]">methodological defense.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#57534E] leading-relaxed">
            Exhaustive technical defense rationale addressing critical methodological inquiries: 
            quantum barren plateaus, parameter-shift gradient validity, clinical loss asymmetry, 
            and quantum-classical bridge engineering.
          </p>
        </div>

        {/* Keyboard-Friendly Accordion */}
        <div className="space-y-3.5">
          {vivaDefenseQA.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl overflow-hidden transition-all shadow-xs ${
                  isOpen
                    ? 'bg-white border-[#151410] ring-1 ring-[#151410] shadow-sm'
                    : 'bg-white/80 border-[#E5E1DC] hover:border-[#A8A29E]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleAccordion(idx);
                    }
                  }}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between space-x-4 transition-colors cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start space-x-3.5">
                    <span className="text-xs font-mono-data text-[#E4442C] font-bold flex-shrink-0 mt-0.5">
                      Q{idx + 1}.
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-[#151410] font-sans">
                      {item.q}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#78716C] flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#E4442C]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#57534E] font-sans leading-relaxed border-t border-[#E5E1DC] bg-[#FAF8F5]">
                    <div className="pt-3 pl-4 border-l-2 border-[#E4442C] space-y-2">
                      <span className="text-[10px] font-mono-data text-[#E4442C] uppercase tracking-wider block font-bold">
                        METHODOLOGICAL RATIONALE · TECHNICAL VERIFICATION
                      </span>
                      <p className="text-[#2E2B27]">{item.a}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs font-mono-data text-[#A8A29E]">
          Accessible via keyboard navigation · Press Enter or Space to expand review responses
        </div>

      </div>
    </section>
  );
}
