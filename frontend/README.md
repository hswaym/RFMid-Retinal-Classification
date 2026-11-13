# HQNN Research Showcase · Award-Caliber Frontend

> **Project ERI 5 / TY_CSE_10**: Empirical Evaluation of Parameterized Quantum Circuits in Hybrid Quantum-Classical Architectures for Diabetic Retinopathy Severity Grading.

This frontend is an editorial, scientific journal-grade web application built to showcase the complete research pipeline, clinical pathophysiology, and empirical benchmarks of the Hybrid Quantum Neural Network (HQNN) for Diabetic Retinopathy.

---

## 🚀 Quickstart

Ensure you have **Node.js (v18+)** and **npm** installed.

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies (already installed if cloned locally)
npm install

# 3. Start the Vite local development server
npm run dev
```

Open your browser at: **`http://localhost:5173`**

To produce an optimized production bundle:
```bash
npm run build
npm run preview
```

---

## 🎨 Creative Concept: "The Eye Becomes the Circuit"

Rather than a generic neon "quantum" aesthetic with heavy cyan/violet glassmorphism, the visual system is drawn directly from ophthalmic and quantum physics:
- **Base**: Warm paper bone (`#F1EEE7`) with deep ink typography (`#111111`) and generous editorial whitespace.
- **Signal Vermilion-Red** (`#E4442C`): Hemoglobin absorption peak; reserved strictly for microaneurysms, sight-threatening lesion boundaries, and key metrics.
- **Deep Retinal Green** (`#1F5D3A`): $540\text{--}575\text{ nm}$ optical bandpass where green CLAHE enhances vascular contrast.
- **Night Surface** (`#0B0C0E`): Full-bleed high-contrast dark sections reserved for the 3D WebGL moments (Bloch sphere, quantum entanglement ring).

---

## 📑 Core Chapters & Architecture

1. **Chapter 01: Hero & 3D WebGL Journey (`src/scenes/RetinalQuantumCanvas.jsx`)**
   - Renders 1,400 particles simulating the anatomical retinal vascular tree.
   - Transforms through 6 scrubbable stages: Raw Fundus $\to$ Green CLAHE $\to$ Autoencoder dissolution $\to$ 4-angle collapse $\to$ Bloch sphere with circular CNOT ring $\to$ Pauli-$Z$ measurement collapse.
2. **Chapter 02: Clinical Pathophysiology (`src/sections/ClinicalContextSection.jsx`)**
   - Detailed walkthrough of ICDR Grade 0 (Normal) to Grade 4 (Proliferative DR).
   - Demonstrates the asymmetric clinical risk and quadratic distance penalty matrix $w_{ij} = (i - j)^2 / 16$.
3. **Chapter 03: Parametric Compaction (`src/sections/QuantumVsClassicalSection.jsx`)**
   - Side-by-side breakdown of the $11.2\text{M}$-parameter classical CNN vs. the $12$-parameter variational quantum circuit in $\mathbb{C}^{16}$ Hilbert space.
4. **Chapter 04: Four Research Pillars (`src/sections/EngineeringDeepDiveSection.jsx`)**
   - **Pillar 01**: Interactive before/after split slider comparing Raw Fundus and Green CLAHE ($540\text{--}575\text{ nm}$).
   - **Pillar 02**: The *"37-Parameter Paradox"* — why unsupervised PCA failed ($0.1379$ QWK) while the deep non-linear autoencoder succeeded ($0.7693$ QWK).
   - **Pillar 03**: Parameterized Quantum Circuit (PQC) diagram with dynamic slider-controlled rotation angles $[\theta_0, \theta_1, \theta_2, \theta_3]$ and the Parameter-Shift Rule.
   - **Pillar 04**: Class-weighted Focal Loss ($\gamma = 2.0$) with dynamic inverse-frequency class penalties ($9.3\times$ higher on rare Grade 3).
5. **Chapter 05: Clinical Diagnostic Lab (`src/sections/DiagnosticLabSection.jsx`)**
   - Test real high-resolution specimens across all 5 ICDR grades.
   - Quantum Angle Inspector featuring an SVG polar radar dial.
   - Softmax confidence bars and clinical triage recommendation.
6. **Chapter 06: Empirical Benchmark Matrix (`src/sections/BenchmarkAblationSection.jsx`)**
   - Interactive Pareto scatter plot (Parameters vs. QWK) highlighting the Pareto-optimal 4-Qubit Autoencoder.
   - Sortable table comparing ResNet18, MobileNetV2, and all 4 hybrid models.
7. **Chapter 07: NISQ Resilience & IBM Quantum Roadmap (`src/sections/HardwareRoadmapSection.jsx`)**
   - Interactive depolarizing gate noise slider ($p \in [0.001, 0.08]$) driving live QWK degradation curves and Bloch vector blurring.
   - IBM Quantum superconducting deployment plan (`ibm_brisbane` 127-qubit QPU, ZNE, and M3).
8. **Chapter 08: Academic Defense Protocol & Examiner Viva Accordion (`src/sections/VivaDefenseSection.jsx`)**
   - Complete keyboard-accessible defense answers covering Barren Plateaus, Parameter-Shift gradients, GPU-to-CPU device bridges, and 4Q vs 8Q scaling.

