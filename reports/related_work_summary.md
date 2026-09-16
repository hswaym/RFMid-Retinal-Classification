# Related Work Summary: Hybrid Quantum-Classical CNNs for Diabetic Retinopathy Classification

This document compiles five recent (2023–2026) peer-reviewed publications examining hybrid quantum-classical machine learning architectures applied to retinal fundus and diabetic retinopathy (DR) imaging.

---

### Comparison Matrix (IEEE-Format Related Work Table)

| Reference & Year | Problem Solved | Proposed Method & Architecture | Dataset Used | Reported Performance | Stated / Critical Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bali et al. (2025)**<br>*MethodsX* (Elsevier) | Parameter redundancy and overfitting in multi-grade DR detection | **QuantumNet:** Classical CNN/ResNet-50 backbone for feature extraction + Parameterized Variational Quantum Classifier (VQC) via Quantum Transfer Learning | APTOS 2019 Blindness Detection (3,662 fundus images) | **Accuracy: 94.11%** (outperformed classical baselines) | Evaluated exclusively on noiseless statevector simulators; no real QPU execution; ordinal grading evaluated purely with accuracy (no QWK); fixed dense bottleneck. |
| **Ara et al. (2025)**<br>*MethodsX* (Elsevier) | Severe class imbalance and 5-stage DR severity classification in low-resource settings | ResNet-50 backbone + 4-stage dense projection (2048→8 dims) + **8-qubit VQC** (parameterized Ry-Rz gates with ring-style CNOT entanglement); stratified mixed-precision training | APTOS 2019 Blindness Detection (5-class severity) | **Balanced Accuracy: 80.96%** (surpassed classical Swin Transformer and DenseNet on minority grades) | PennyLane Lightning statevector simulation only; no NISQ noise modeling (depolarizing/readout); 2048→8 linear compression introduces an information bottleneck. |
| **Stalin Babu et al. (2025)**<br>*IEEE OTCON Proceedings* | Parameter explosion and high inference latency in classical deep CNNs for DR grading | **HQCNN:** Classical CNN feature extraction coupled with parameterized quantum layers utilizing angle rotation gates and entangling circuits | Kaggle Retinal Fundus Dataset (EyePACS / APTOS) | **Accuracy: 98.89%**<br>Precision: 98.89%<br>Sensitivity: 99.37%<br>F1-score: 97.58% | Evaluated on curated subset without multi-center external validation; ideal quantum simulation without noise channels; lacks ordinal evaluation (QWK). |
| **Sultana & Agrawal (2026)**<br>*IEEE Conference Proceedings* | Early screening of DR with reduced parameter footprint for edge / clinical deployment | **Q-DRNet:** Dual-stage hybrid model integrating deep convolutional feature encoding with a variational quantum decision layer | Retinal fundus benchmarks (EyePACS / APTOS) | **Accuracy: ~97.30%** (competitive with full-depth classical CNNs) | No real quantum hardware validation; restricted to ≤8 qubits due to simulation costs; does not assess resilience under thermal relaxation or bit-flip noise. |
| **Alsubai et al. (2023)**<br>*Mathematics* (MDPI) | Accurate multi-stage DR classification using quantum representation spaces | Quantum-enhanced deep CNN incorporating multi-qubit parameterized gates and parallel-encoded quantum feature maps into an Inception module | IDRiD (Indian Diabetic Retinopathy Image Dataset) & SUSTech-SYSU | **Accuracy: 100%** (IDRiD)<br>**Accuracy: 98.00%** (SUSTech-SYSU) | High risk of overfitting on small IDRiD dataset; no hardware noise or decoherence testing; no Quadratic Weighted Kappa (QWK) reported; lacks parameter count ablation. |

---

### Key Synthesis & Research Gaps for Our Project

1. **Absence of Ordinal Evaluation (QWK):** Diabetic Retinopathy is an ordinal clinical scale (0 = No DR, 1 = Mild, 2 = Moderate, 3 = Severe, 4 = Proliferative). Misclassifying Stage 0 as Stage 4 is far worse than misclassifying Stage 0 as Stage 1. Nearly all existing literature reports standard multi-class accuracy, ignoring **Quadratic Weighted Kappa (QWK)**, the clinical and APTOS competition standard.
2. **Missing NISQ Noise Benchmarking:** All five studies rely primarily on ideal statevector simulators. Almost none perform systematic noise robustness sweeps (depolarizing, amplitude damping, readout errors) or validate small batches on real superconducting QPUs (such as IBM Quantum).
3. **Rigid Dimensionality Reduction:** Existing works use a single arbitrary linear bottleneck (e.g., 2048→8) without systematically comparing Linear, Convolutional Autoencoder, and PCA compression mechanisms.
4. **Parameter-to-Accuracy Yardstick:** Studies claim "quantum advantage" based purely on accuracy, without establishing a rigorous, controlled baseline tracking exact trainable parameter counts and inference latency against standardized classical backbones (ResNet18 / MobileNetV2).
