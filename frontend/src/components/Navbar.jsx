import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Activity, Cpu, Layers, ShieldAlert, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('01 Journey');

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }

      const sections = [
        { id: 'journey', label: '01 Architecture' },
        { id: 'clinical', label: '02 Pathology' },
        { id: 'quantum-vs-classical', label: '03 Quantum vs CNN' },
        { id: 'deep-dive', label: '04 Pillars' },
        { id: 'diagnostic-lab', label: '05 Clinical Lab' },
        { id: 'benchmarks', label: '06 Benchmarks' },
        { id: 'hardware', label: '07 IBM QPU' },
        { id: 'technical-inquiries', label: '08 Defense' },
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(sections[i].label);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#F2EEE9]/92 backdrop-blur-md border-b border-[#E5E1DC] transition-colors duration-300">
      {/* Scroll indicator vermilion hairline */}
      <div
        className="absolute top-0 left-0 h-[2px] bg-[#E4442C] transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between text-xs font-mono-data tracking-tight gap-4">
        {/* Left: Official HQNN Emblem & Research Subtitle */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-2 text-[#151410] hover:opacity-80 transition-opacity"
          >
            <img src="/a/logo.svg" alt="HQNN Quantum Retina" className="h-7 w-auto" />
          </button>
          <span className="text-[#D8D3CC] hidden sm:inline">|</span>
          <span className="text-[#78716C] hidden sm:inline text-[11px] tracking-widest font-semibold uppercase whitespace-nowrap">
            CLINICAL STUDY · APTOS 2019
          </span>
        </div>

        {/* Center: Current active chapter indicator with vermilion pulse */}
        <div className="hidden md:flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full border border-[#E5E1DC] text-[#151410] text-[11px] shadow-sm font-mono-data whitespace-nowrap flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#E4442C] animate-pulse flex-shrink-0" />
          <span className="text-[#E4442C] font-bold text-[10px] tracking-wider uppercase whitespace-nowrap">MODULE //</span>
          <span className="font-semibold text-[#151410] tracking-wide whitespace-nowrap">{activeSection}</span>
        </div>

        {/* Right: Quick jump anchors & Live Prototype Badge */}
        <div className="flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
          <nav className="hidden lg:flex items-center space-x-4 text-[#78716C] whitespace-nowrap text-xs">
            <button
              onClick={() => scrollTo('clinical')}
              className="hover:text-[#151410] transition-colors"
            >
              Clinical
            </button>
            <button
              onClick={() => scrollTo('deep-dive')}
              className="hover:text-[#151410] transition-colors"
            >
              Pillars
            </button>
            <button
              onClick={() => scrollTo('diagnostic-lab')}
              className="hover:text-[#E4442C] text-[#151410] font-medium transition-colors"
            >
              Diagnostic Lab
            </button>
            <button
              onClick={() => scrollTo('benchmarks')}
              className="hover:text-[#151410] transition-colors"
            >
              Benchmarks
            </button>
            <button
              onClick={() => scrollTo('hardware')}
              className="hover:text-[#151410] transition-colors"
            >
              IBM QPU
            </button>
            <button
              onClick={() => scrollTo('technical-inquiries')}
              className="hover:text-[#151410] transition-colors"
            >
              Defense
            </button>
          </nav>

          <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-[#FBECE9] text-[#E4442C] border border-[#E4442C]/20 rounded-full flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E4442C] flex-shrink-0" />
            <span>QWK 0.7693</span>
          </span>
        </div>
      </div>
    </header>
  );
}
