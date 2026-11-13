import React, { useEffect } from 'react';
import Lenis from 'lenis';

import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import HeroTransformationJourney from './sections/HeroTransformationJourney';
import ClinicalContextSection from './sections/ClinicalContextSection';
import QuantumVsClassicalSection from './sections/QuantumVsClassicalSection';
import EngineeringDeepDiveSection from './sections/EngineeringDeepDiveSection';
import DiagnosticLabSection from './sections/DiagnosticLabSection';
import BenchmarkAblationSection from './sections/BenchmarkAblationSection';
import HardwareRoadmapSection from './sections/HardwareRoadmapSection';
import VivaDefenseSection from './sections/VivaDefenseSection';
import Footer from './components/Footer';

export default function App() {
  useEffect(() => {
    // Lenis Smooth Scroll Initialization
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F2EEE9] text-[#151410] overflow-x-hidden selection:bg-[#E4442C] selection:text-white font-sans">
      {/* Custom Crosshair / Pupil Cursor */}
      <CustomCursor />

      {/* Slim Top Navigation Bar */}
      <Navbar />

      {/* Chapter 01: Hero & 3D WebGL Transformation Journey ("The Eye Becomes the Circuit") */}
      <HeroTransformationJourney />

      {/* Chapter 02: Clinical Context & Pathophysiology (Grade 0 -> Grade 4 + Asymmetric Risk) */}
      <ClinicalContextSection />

      {/* Chapter 03: Quantum vs Classical (11.2M Parameters vs 12 Hilbert Angles) */}
      <QuantumVsClassicalSection />

      {/* Chapter 04: Engineering Deep Dive (Four Research Pillars: Preproc, AE vs PCA, PQC, Focal Loss) */}
      <EngineeringDeepDiveSection />

      {/* Chapter 05: Clinical Diagnostic Lab & Quantum Angle Inspector */}
      <DiagnosticLabSection />

      {/* Chapter 06: Empirical Benchmark Matrix & D3 Pareto Scatter Frontier */}
      <BenchmarkAblationSection />

      {/* Chapter 07: NISQ Resilience, Noise Sweeps, and IBM Quantum Roadmap */}
      <HardwareRoadmapSection />

      {/* Chapter 08: Technical Inquiries & Peer-Review Methodological Defense */}
      <VivaDefenseSection />

      {/* Comprehensive Scientific Footer */}
      <Footer />
    </div>
  );
}

