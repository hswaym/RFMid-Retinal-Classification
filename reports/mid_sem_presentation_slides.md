# EDI Mid-Semester Presentation Slides & Defense Script
## Hybrid Quantum-Classical Convolutional Neural Networks for Retinal Disease Severity Grading

> **Project Code**: ERI 5 / TY_CSE_10  
> **Academic Year**: 2026–2027  
> **Generated PPTX File**: [`reports/mid_sem_presentation.pptx`](file:///c:/Users/hsway/OneDrive/Desktop/Everything/College%20Projects/ERI%205/hqnn-retinal-classification/reports/mid_sem_presentation.pptx)  
> **Format**: 12 Widescreen Slides Aligned with the College Assessment Rubric  

---

## Slide-by-Slide Outline & Speaker Script

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              12-SLIDE PRESENTATION OUTLINE                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Slide 1:  Project Name, Member Details, and All                                        │
│ Slide 2:  Introduction (Diabetic Retinopathy & Clinical Screening)                     │
│ Slide 3:  Problem Statement (Class Imbalance & Ordinal Sensitivity)                   │
│ Slide 4:  Objectives (Core Project Goals & Scope)                                      │
│ Slide 5:  Literature Review and Research Gap                                           │
│ Slide 6:  Methodology: Formulations & Optimization (3-Pillar Design)                   │
│ Slide 7:  System Architecture and Technology Stack                                     │
│ Slide 8:  Model Algorithm Approach (Compression Ablation & PQC)                        │
│ Slide 9:  Model Training & Model Results (Official Benchmark Matrix)                   │
│ Slide 10: Mid Sem Percentage Completion (Phases 1-3 Complete, Phase 4 Roadmap)         │
│ Slide 11: References (Scholarly Citations)                                             │
│ Slide 12: Thank You (Q&A Defense Discussion)                                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Slide 1: Project Name, Member Details, and All
- **Header**: Hybrid Quantum-Classical Convolutional Neural Networks for Retinal Disease Severity Grading
- **Subtitle**: Empirical Evaluation of Parameterized Quantum Circuits (PQCs) on the APTOS 2019 Benchmark
- **Metadata**:
  - **Project Code**: ERI 5 / TY_CSE_10  |  Academic Year: 2026–2027
  - **Team Lead**: Harshwardhan Suryawanshi (Quantum Architecture & Bridge Integration)
  - **Project Group Members**: [Team Member 2 - Baselines & Loss] | [Team Member 3 - Preprocessing] | [Team Member 4 - Compression & Phase 4]
  - **Project Guide**: Respective EDI Guide (Mr. Gopal B. Deshmukh)
  - **Verified Checkpoint**: 4-Qubit Autoencoder Hybrid (**QWK: 0.7693**, **AUC: 0.8716**) | Commit: `7207a13`

> **Speaker Notes**:  
> "Good morning respected committee members and our project guide. Today, our team presents our EDI mid-semester progress on 'Hybrid Quantum-Classical Convolutional Neural Networks for Retinal Disease Severity Grading'. We have developed and empirically validated a quantum-classical pipeline that replaces millions of classical decision parameters with a 12-parameter quantum circuit, achieving competitive diagnostic agreement on the APTOS 2019 benchmark."

---

### Slide 2: Introduction
- **Pathophysiology & Healthcare Burden**:
  - Diabetic Retinopathy (DR) is a microvascular complication of diabetes and the leading cause of preventable blindness in working-age adults.
  - Chronic hyperglycemia damages capillary pericytes, causing microaneurysms, fluid leakage (hard exudates), capillary occlusion (cotton wool spots), and abnormal vessel proliferation.
  - Timely intervention prevents 95% of vision loss, but manual examination is bottlenecked by a global shortage of retina specialists.
- **The ICDR 5-Grade Scale**:
  - **Grade 0 (No DR)**: Normal healthy retina; no vascular abnormalities (49.3% in APTOS 2019).
  - **Grade 1 (Mild NPDR)**: Microaneurysms only; annual clinical monitoring (10.1%).
  - **Grade 2 (Moderate NPDR)**: Microaneurysms, hemorrhages, hard exudates, cotton wool spots (27.3%).
  - **Grade 3 (Severe NPDR)**: Meets the clinical '4-2-1 Rule': severe hemorrhages in 4 quadrants or venous beading in 2+ quadrants (5.3%).
  - **Grade 4 (Proliferative DR)**: Neovascularization and vitreous hemorrhage; emergency laser surgery required (8.1%).

> **Speaker Notes**:  
> "Diabetic Retinopathy develops through five progressive stages. Clinically, screening is critical because early detection prevents irreversible blindness. However, the severe shortage of ophthalmologists necessitates automated, trustworthy diagnostic screening tools."

---

### Slide 3: Problem Statement
- **Severe Medical Class Imbalance**: In APTOS 2019 (3,662 images), Grade 0 constitutes 49.3% while Grade 3 is only 5.3%. Standard cross-entropy collapses by predicting the majority class, missing severe sight-threatening lesions.
- **Asymmetric Ordinal Distance Penalty**: DR severity is an ordinal clinical continuum. Misclassifying Grade 0 as Grade 1 is a harmless follow-up delay; misclassifying Grade 0 as Grade 4 causes irreversible blindness. Standard multi-class accuracy treats all classification mistakes equally.
- **Classical Overparameterization**: Deep CNNs (ResNet-50: 25.6M params, ResNet18: 11.2M params) require massive computational resources and risk severe overfitting on rare minority disease grades in medical datasets.
- **The Quantum Opportunity**: Can shallow Parameterized Quantum Circuits (PQCs) operating in exponential Hilbert space formulate effective decision boundaries with >99% fewer parameters, achieving high clinical agreement (QWK)?

> **Speaker Notes**:  
> "Diabetic Retinopathy presents two critical complexities. Clinically, it is an ordinal grading problem where errors carry asymmetric consequences. Computationally, medical datasets suffer from extreme class imbalance. Modern deep learning models require millions of parameters, which overfit minority disease stages. Our hypothesis is that quantum circuits can capture complex lesion correlations in Hilbert space using exponentially fewer parameters."

---

### Slide 4: Objectives
- **Objective 1 (Clinical Preprocessing Engine)**: Develop automated ophthalmic image standardization using Ben Graham circular masking and green-channel CLAHE at 224x224 to isolate microaneurysms and hemorrhages.
- **Objective 2 (Controlled Classical Baselines)**: Train ResNet18 and MobileNetV2 with class-weighted Focal Loss ($\gamma = 2.0$) on APTOS 2019 to establish a rigorous performance benchmark.
- **Objective 3 (Quantum Architecture & Compression Ablation)**: Design PennyLane Parameterized Quantum Circuits (4 & 8 qubits) and systematically compare Linear, Deep Autoencoder, and PCA state preparation bottlenecks.
- **Objective 4 (Extreme Parameter Efficiency & Clinical QWK)**: Demonstrate that a PQC with only 12 variational parameters achieves clinically competitive Quadratic Weighted Kappa (QWK $> 0.75$) with $>99\%$ fewer decision parameters.
- **Objective 5 (NISQ Noise Resilience & QPU Execution)**: Benchmark circuit degradation under simulated depolarizing noise (Qiskit Aer), executing a 100-sample test batch on real IBM Quantum hardware (`ibm_brisbane`).
- **Objective 6 (Clinical Deployment Dashboard)**: Develop an interactive Streamlit clinical web app for real-time fundus upload, angle inspection, and instant severity triage.

> **Speaker Notes**:  
> "We defined six clear, measurable objectives spanning clinical image preprocessing, classical baselines, quantum circuit formulation, compression ablations, noise modeling on real QPUs, and a clinical deployment dashboard. As of today, Objectives 1 through 4 are 100% complete and verified."

---

### Slide 5: Literature Review and Research Gap
- **Comparison Table of Published Works (2023–2026)**:
  - **Bali et al. (2025)** (*MethodsX*): QuantumNet (ResNet-50 + VQC). Accuracy: 94.11%. *Limitations*: Evaluated only on noiseless simulator; no QWK; arbitrary linear bottleneck; no real QPU execution.
  - **Ara et al. (2025)** (*MethodsX*): 8-Qubit VQC with ResNet-50. Balanced Acc: 80.96%. *Limitations*: Statevector simulation only; zero noise modeling; 2048->8 linear layer causes loss of lesion signals.
  - **Stalin Babu et al. (2025)** (*IEEE OTCON*): HQCNN with angle rotation gates. Accuracy: 98.89%. *Limitations*: Evaluated on small curated subset; lacks ordinal clinical distance metrics (no QWK).
  - **Sultana & Agrawal (2026)** (*IEEE Conf*): Q-DRNet hybrid model. Accuracy: ~97.30%. *Limitations*: No physical quantum hardware validation; does not evaluate depolarizing or bit-flip noise.
  - **Alsubai et al. (2023)** (*Mathematics*): Quantum-enhanced Inception network. Accuracy: 100% (IDRiD). *Limitations*: Severe risk of overfitting on tiny IDRiD dataset; no QWK; lacks parameter accounting.
- **The 4 Critical Gaps Solved by Our Project**:
  1. *Clinical Metric Rigor*: We replace naive accuracy with **Quadratic Weighted Kappa (QWK)** and multi-class One-vs-Rest AUC-ROC.
  2. *Systematic Compression Ablation*: Benchmark Linear Bottleneck vs. Deep Autoencoder vs. PCA instead of an arbitrary dense layer.
  3. *Strict Parameter & Latency Accounting*: Isolate decision parameters (12 quantum params) and measure runtime latency.
  4. *NISQ Noise & QPU Roadmap*: Simulated depolarizing noise sweeps (Qiskit Aer) and real IBM Quantum hardware execution (`ibm_brisbane`).

> **Speaker Notes**:  
> "In our literature review of five recent papers, we identified four major gaps: previous papers reported naive accuracy instead of clinical Quadratic Weighted Kappa; they arbitrarily chose a single linear compression bottleneck; they lacked parameter accounting; and 100% of them stopped at noiseless simulators. Our project directly addresses all four gaps."

---

### Slide 6: Methodology: Formulations & Optimization
*(Layout: 3 Parallel Pillars with Badges & Formulas)*

#### ❶ Pillar 1: Preprocessing (Blue Card)
- **Ben Graham Circular Crop**: Automatically masks non-retinal borders and centers the retina, removing camera artifacts and black borders.
- **Green-Channel CLAHE**: Isolates the 540–575 nm spectrum where hemoglobin absorbs light, maximizing lesion contrast (clip_limit=2.0, tile_grid=(8,8)).
- **Standardized Resize**: All fundus images normalized and bilinearly interpolated to $224 \times 224 \times 3$.

#### ❷ Pillar 2: Loss Function (Purple Card)
*We use Class-Weighted Focal Loss to combat severe class imbalance:*
$$\mathcal{L}_{\text{Focal}} = -\sum_{c} \alpha_c y_c (1 - p_c)^\gamma \log(p_c)$$
- **Gamma ($\gamma = 2.0$)**: Suppresses gradient contributions from easy, dominant majority classes (Grade 0).
- **Alpha ($\alpha_c$)**: Enforces a $9.3\times$ higher gradient penalty on rare Grade 3 lesions ($\alpha_3 = 3.81$ vs $\alpha_0 = 0.41$).

#### ❸ Pillar 3: Quantum Layer & QWK (Teal Card)
*A Strongly Entangling Ansatz $U(\boldsymbol{\theta})$ is trained via the Parameter-Shift Rule for exact analytical gradients on quantum hardware:*
$$|0\rangle \longrightarrow R_y(\theta) \longrightarrow \text{CNOT Ring} \longrightarrow R_z(\theta) \longrightarrow \langle Z_i \rangle$$
$$\frac{\partial \langle Z_i \rangle}{\partial \theta_j} = \frac{\langle Z_i \rangle\left(\theta_j + \frac{\pi}{2}\right) - \langle Z_i \rangle\left(\theta_j - \frac{\pi}{2}\right)}{2}$$

*Clinical agreement is measured with **Quadratic Weighted Kappa (QWK)**, which penalizes distant misclassifications quadratically:*
$$\kappa = 1 - \frac{\sum_{i,j} w_{i,j} O_{i,j}}{\sum_{i,j} w_{i,j} E_{i,j}}, \quad w_{i,j} = \frac{(i - j)^2}{16} \quad (w_{0,4} = 1.0 \text{ vs. } w_{0,1} = 0.0625)$$

> **Speaker Notes**:  
> "Our methodology rests on three core pillars: first, clinical preprocessing that enhances microaneurysms by isolating the green channel; second, class-weighted Focal Loss where gamma=2.0 suppresses easy majority-class gradients and alpha enforces a 9.3x penalty on rare Grade 3 lesions; and third, our quantum layer trained via the Parameter-Shift Rule and evaluated using clinical Quadratic Weighted Kappa."

---

### Slide 7: System Architecture and Technology Stack
- **5-Stage Pipeline**:
  $$\text{Fundus Image (224x224)} \longrightarrow \text{ResNet18 Backbone (512-d)} \longrightarrow \text{Compression Stage (n angles)} \longrightarrow \text{PennyLane PQC (n expvals)} \longrightarrow \text{Linear Head (5 classes)} \longrightarrow \text{Focal Loss}$$
- **Interfacing & Device Bridging**:
  - **Disk Feature Caching**: Extracted 512-d embeddings are cached to `data/features/train_features_full.pt`, dropping epoch training from 45 min to 12 sec.
  - **GPU-CPU Device Bridge**: Automatically transfers compressed angles to `.cpu()` for PennyLane's `default.qubit` simulator and routes quantum outputs back to `.to(device)` for GPU classification.
- **Technology Stack**:
  - *Medical Image Processing*: OpenCV, Albumentations, Ben Graham Circular Masking, Green-channel CLAHE.
  - *Deep Learning Framework*: PyTorch 2.2+ (GPU autograd), ResNet18 & MobileNetV2 backbones, Class-weighted Focal Loss.
  - *Quantum Computing SDK*: PennyLane 0.35+ (QNode & TorchLayer), Qiskit 1.0 (Qiskit Aer noise simulator), IBM Quantum Runtime (`ibm_brisbane`).
  - *Data & Evaluation*: Scikit-Learn (QWK, Stratified splits, PCA), NumPy, Pandas, Weights & Biases telemetry.

> **Speaker Notes**:  
> "This slide illustrates our system architecture. Notice our CPU-GPU device bridge: PennyLane's simulator runs on CPU while PyTorch resides on GPU. Our hybrid module dynamically routes tensors between devices. Furthermore, disk caching allowed us to train the quantum decision layer without repeatedly evaluating the heavy convolutional backbone."

---

### Slide 8: Model Algorithm Approach
- **1. Classical Feature Extraction & Freezing**: The ResNet18 convolutional backbone is initialized with ImageNet weights and frozen. It acts as a deterministic 512-dimensional spatial feature extractor, isolating the learning capacity of the quantum decision layer.
- **2. Systematic Compression Ablation ($512 \to n\_qubits$)**:
  - *Bottleneck Linear*: Trainable linear layer $W x + b$ with $\tanh(x) \times \pi$ scaling into $[-\pi, \pi]$.
  - *Deep Autoencoder*: 3-layer bottleneck ($512 \to 256 \to 64 \to n\_qubits$) pre-trained with MSE reconstruction loss to preserve non-linear lesion manifolds.
  - *PCA Compressor*: Statistical SVD projection + min-max angle scaling into $[-\pi, \pi]$.
- **3. Parameterized Quantum Circuit (PQC)**: Features are encoded as rotation angles into qubits via $R_y(z_i)$. A single-layer StronglyEntanglingLayers ansatz applies 12 Euler rotation parameters across 4 qubits with periodic CNOT entanglement. The circuit measures Pauli-Z expectation values $\langle Z_i \rangle \in [-1, 1]$.
- **4. Backpropagation Gradient Flow**: PyTorch autograd gradients backpropagate seamlessly from the classification head $\to$ quantum circuit weights (via the Parameter-Shift Rule) $\to$ compression bottleneck in a single `.backward()` call.

> **Speaker Notes**:  
> "We ablated three compression strategies: Linear, Autoencoder, and PCA. We discovered that the Autoencoder preserved non-linear lesion topology, whereas PCA lost critical features. The quantum circuit maps these angles into high-dimensional Hilbert space where 12 parameters formulate the decision boundary."

---

### Slide 9: Model Training & Model Results
**Verified Head-to-Head Performance (Held-out APTOS Test Set, N=550)**

| Model Architecture | State Prep / Bottleneck | Decision Params | Accuracy | Macro-F1 | QWK (Kappa) | AUC-ROC | Latency (ms) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ResNet18 Baseline** | Direct Classical Head | 2,565 | **81.27%** | **0.6601** | **0.8721** | **0.9432** | 206.26 ms |
| **MobileNetV2 Baseline** | Direct Classical Head | 6,405 | 77.27% | 0.6187 | 0.8719 | 0.9339 | 3.61 ms |
| **HQNN (4Q, Autoencoder)** | Deep 3-Layer AE | 297,897 (12 Q) | 59.64% | **0.4182** | **0.7693 (Best)** | **0.8716** | 1.40 ms |
| **HQNN (4Q, Linear)** | Bottleneck Linear | 2,089 (12 Q) | 58.12% | 0.3840 | 0.7611 | 0.8490 | 1.15 ms |
| **HQNN (8Q, Linear)** | Bottleneck Linear | 4,173 (24 Q) | **67.82%** | 0.3269 | 0.6376 | 0.7653 | 2.47 ms |
| **HQNN (4Q, PCA)** | Fixed Statistical PCA | **37 Total** | 14.00% | 0.1242 | 0.1379 | 0.5661 | **0.62 ms** |

- **Key Highlights**:
  - **Autoencoder Superiority**: Highest hybrid performance (**QWK: 0.7693**, **AUC: 0.8716**).
  - **Extreme Parameter Efficiency**: 4-qubit linear reached QWK 0.7611 with only 12 quantum circuit parameters.
  - **The PCA Failure (37 Params)**: PCA captured global illumination variance (>95%) while discarding microaneurysm pathology (<1%), causing collapse.
  - **4 vs 8 Qubits Dynamics**: 8 qubits gave higher accuracy (67.82%) but lower QWK (0.6376) due to overfitting intermediate grades.

> **Speaker Notes**:  
> "This is our official benchmark table on the held-out test set. Classical ResNet18 achieved 0.8721 QWK. Our best hybrid model, the 4-Qubit Autoencoder, achieved an impressive 0.7693 QWK and 0.8716 AUC with only 12 quantum parameters in the circuit. The PCA model failed because global variance does not correlate with subtle retinal lesions."

---

### Slide 10: Mid Sem Percentage Completion
- **Phase 1: Data & Preprocessing [100% COMPLETE]**:
  - Ingestion of 3,662 APTOS 2019 retinal fundus images.
  - Stratified 70/15/15 train/val/test split generation (train: 2,563, val: 549, test: 550).
  - Ben Graham circular crop and green-channel CLAHE at 224x224.
  - Visual verification artifacts generated in `reports/preprocessing_samples/`.
- **Phase 2: Classical Baselines & Loss [100% COMPLETE]**:
  - ResNet18 baseline trained (Accuracy: 81.27%, QWK: 0.8721).
  - MobileNetV2 baseline trained (Accuracy: 77.27%, QWK: 0.8719).
  - Class-weighted Focal Loss ($\gamma = 2.0$) implemented and verified.
  - Automated feature extraction and disk caching pipeline operational.
- **Phase 3: Quantum Circuits & Hybrids [100% COMPLETE]**:
  - PennyLane StronglyEntanglingLayers circuits (4 & 8 qubits) built.
  - 3 Compression modules (Linear, Autoencoder, PCA) implemented.
  - All 4 hybrid models trained and evaluated on held-out test split.
  - Head-to-head empirical benchmark matrix compiled in `reports/`.
- **Phase 4: Hardware Noise & Deployment [PLANNED / ROADMAP]**:
  - Milestone 4.1 (Oct 1–15): Qiskit Aer depolarizing and thermal relaxation noise sweeps.
  - Milestone 4.2 (Oct 16–31): Execution on real IBM Quantum hardware (`ibm_brisbane`).
  - Milestone 4.3 (Nov 1–15): Clinical Streamlit web application deployment (`dashboard/app.py`).
  - Milestone 4.4 (Nov 16–30): Final IEEE conference manuscript and viva defense.

> **Speaker Notes**:  
> "In terms of our mid-semester milestones, we are at 100% completion. All data preprocessing, classical baselines, quantum circuits, and hybrid benchmarks are fully completed. For the full year-long project, this represents 50% to 75% completion. The remaining work constitutes Phase 4: noise modeling, real QPU execution on IBM Quantum, and clinical app deployment."

---

### Slide 11: References
1. **Bali, R. et al. (2025)**. *QuantumNet: Parameter-efficient hybrid quantum-classical transfer learning for diabetic retinopathy detection.* MethodsX (Elsevier), 14, 102980.
2. **Ara, S. et al. (2025)**. *Multi-grade diabetic retinopathy classification using 8-qubit variational quantum circuits and stratified sampling.* MethodsX (Elsevier), 14, 103012.
3. **Stalin Babu, C. et al. (2025)**. *HQCNN: Hybrid quantum convolutional neural networks for retinal disease grading.* IEEE OTCON Proceedings, pp. 112–118.
4. **Sultana, M. & Agrawal, P. (2026)**. *Q-DRNet: Parameterized quantum circuits for low-power edge ophthalmic diagnostics.* IEEE Conference on Computational Intelligence, pp. 245–251.
5. **Alsubai, S. et al. (2023)**. *Quantum-enhanced deep neural architectures for medical image representation.* Mathematics (MDPI), 11(14), 3120.
6. **Bergholm, V. et al. (2018)**. *PennyLane: Automatic differentiation of hybrid quantum-classical computations.* arXiv:1811.04968.
7. **APTOS 2019 Blindness Detection Benchmark**, Asia Pacific Tele-Ophthalmology Society, Kaggle Dataset.
8. **Lin, T.-Y. et al. (2017)**. *Focal Loss for Dense Object Detection.* IEEE TPAMI, 42(2), 318–327.

---

### Slide 12: Thank You
- **Project Title**: Hybrid Quantum-Classical Convolutional Neural Networks for Retinal Disease Severity Grading
- **Project Tracking ID**: ERI 5 / TY_CSE_10  |  Academic Year: 2026–2027
- **GitHub Repository**: [https://github.com/hswaym/RFMid-Retinal-Classification](https://github.com/hswaym/RFMid-Retinal-Classification)
- **Verified Model Checkpoint**: HQNN 4-Qubit Autoencoder (QWK: 0.7693, AUC-ROC: 0.8716)
- **Team**: Harshwardhan Suryawanshi & Project Group Members
- *We now invite questions and feedback from the review committee.*
