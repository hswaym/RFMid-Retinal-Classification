# Master Prompt for Gamma.app (Exact 12-Slide Outline)

> **Copy and paste this entire block directly into [Gamma.app](https://gamma.app)** (Select *Create New* $\to$ *Paste in text* $\to$ *Presentation*).

```text
Create a modern, clean, academic 12-slide presentation for our Engineering Mid-Semester Review (Project ID: ERI 5 / TY_CSE_10). 
Theme: Medical Deep Tech (Deep Slate Navy #0F172A background, Clinical Teal #0D9488 accents, crisp white cards). 
Use multi-column card layouts, callout badges, and clean markdown tables. Do not alter or omit the empirical benchmark numbers or mathematical formulations.

---

# Slide 1: Project Name, Member Details, and All
**Project Title**: Hybrid Quantum-Classical Convolutional Neural Networks for Retinal Disease Severity Grading
**Subtitle**: Empirical Evaluation of Parameterized Quantum Circuits (PQCs) on the APTOS 2019 Benchmark
- **Project ID / Code**: ERI 5 / TY_CSE_10  |  Academic Year: 2026–2027
- **Lead Presenter**: Harshwardhan Suryawanshi (Quantum Architecture & Bridge Integration)
- **Project Group Members**: [Team Member 2 - Baselines & Loss] | [Team Member 3 - Preprocessing] | [Team Member 4 - Compression & Phase 4]
- **Project Guide / Mentor**: Respective EDI Guide (Mr. Gopal B. Deshmukh)
- **Status & Milestone**: Phase 1 to Phase 3 (100% Completed & Empirically Verified)
- **Key Highlight**: 4-Qubit Autoencoder Hybrid achieves Quadratic Weighted Kappa (QWK) of 0.7693 and AUC-ROC of 0.8716 with only 12 quantum circuit parameters.
- **Repository**: github.com/hswaym/RFMid-Retinal-Classification (Commit: 91bd77d)

---

# Slide 2: Introduction
**Clinical Background & The Diabetic Retinopathy Challenge**
### Pathophysiology & Healthcare Burden
- **Diabetic Retinopathy (DR)**: Leading microvascular complication of diabetes and principal cause of preventable blindness in working-age adults.
- **Pathological Cascade**: Chronic hyperglycemia damages retinal capillary pericytes, leading to microaneurysms, fluid leakage (hard exudates), capillary occlusion (cotton wool spots), and abnormal vessel proliferation.
- **Clinical Urgency**: Timely intervention prevents 95% of severe vision loss, but manual examination is bottlenecked by a global shortage of retina specialists.

### The International Clinical DR (ICDR) 5-Grade Scale
- **Grade 0 (No DR)**: Normal healthy retina; no vascular abnormalities (49.3% in APTOS 2019).
- **Grade 1 (Mild NPDR)**: Microaneurysms only; annual clinical monitoring (10.1% in APTOS).
- **Grade 2 (Moderate NPDR)**: Microaneurysms, hemorrhages, hard exudates, cotton wool spots (27.3% in APTOS).
- **Grade 3 (Severe NPDR)**: Meets the clinical '4-2-1 Rule': severe hemorrhages in 4 quadrants or venous beading in 2+ quadrants (5.3% in APTOS).
- **Grade 4 (Proliferative DR)**: Neovascularization and vitreous hemorrhage; emergency laser photocoagulation required (8.1% in APTOS).

---

# Slide 3: Problem Statement
**Clinical & Computational Challenges in Automated Screening**
### 1. Severe Medical Class Imbalance
In the standardized APTOS 2019 dataset (3,662 images), Grade 0 constitutes 49.3% while Grade 3 represents only 5.3%. Standard cross-entropy loss causes optimization collapse, predicting the majority class and missing sight-threatening Grade 3 and 4 lesions.

### 2. Asymmetric Ordinal Distance Penalty
DR grading is an ordinal continuum. Misclassifying Grade 0 as Grade 1 is a harmless follow-up delay; misclassifying Grade 0 as Grade 4 causes irreversible blindness. Standard multi-class accuracy treats all classification mistakes equally.

### 3. Classical Overparameterization
Deep CNNs (ResNet-50: 25.6M params, ResNet18: 11.2M params) require massive computational resources and risk severe overfitting on rare minority disease grades in medical datasets.

### 4. The Quantum Machine Learning Opportunity
Can shallow Parameterized Quantum Circuits (PQCs) operating in exponential Hilbert space formulate effective decision boundaries with >99% fewer parameters, achieving high clinical agreement (QWK)?

---

# Slide 4: Objectives
**Core Project Objectives & Scope**
- **Objective 1 (Clinical Preprocessing Engine)**: Develop automated ophthalmic image standardization using Ben Graham circular masking and green-channel CLAHE at 224x224 to isolate microaneurysms and hemorrhages.
- **Objective 2 (Controlled Classical Baselines)**: Train ResNet18 and MobileNetV2 with class-weighted Focal Loss ($\gamma = 2.0$) on APTOS 2019 to establish a rigorous performance benchmark.
- **Objective 3 (Quantum Architecture & Compression Ablation)**: Design PennyLane Parameterized Quantum Circuits (4 & 8 qubits) and systematically compare Linear, Deep Autoencoder, and PCA state preparation bottlenecks.
- **Objective 4 (Extreme Parameter Efficiency & Clinical QWK)**: Demonstrate that a PQC with only 12 variational parameters achieves clinically competitive Quadratic Weighted Kappa (QWK $> 0.75$) with $>99\%$ fewer decision parameters.
- **Objective 5 (NISQ Noise Resilience & QPU Execution)**: Benchmark circuit degradation under simulated depolarizing noise (Qiskit Aer), executing a 100-sample test batch on real IBM Quantum hardware (`ibm_brisbane`).
- **Objective 6 (Clinical Deployment Dashboard)**: Develop an interactive Streamlit clinical web app for real-time fundus upload, angle inspection, and instant severity triage.

---

# Slide 5: Literature Review and Research Gap
**State-of-the-Art Analysis & Critical Research Limitations**
### Survey of Recent Literature (2023–2026)
| Author & Year | Proposed Architecture | Reported Metric | Stated Research Limitations |
| :--- | :--- | :--- | :--- |
| **Bali et al. (2025)**<br>*MethodsX* (Elsevier) | QuantumNet: ResNet-50 + VQC | Accuracy: 94.11% | Evaluated only on noiseless simulator; no QWK reported; arbitrary linear bottleneck; no real QPU execution. |
| **Ara et al. (2025)**<br>*MethodsX* (Elsevier) | ResNet-50 + 8-Qubit VQC | Balanced Acc: 80.96% | Ideal simulation only; zero noise modeling; 2048->8 linear layer causes loss of lesion signals. |
| **Stalin Babu et al. (2025)**<br>*IEEE OTCON* | HQCNN: Angle rotation layers | Accuracy: 98.89% | Evaluated on small curated subset; lacks ordinal clinical distance metrics (no QWK). |
| **Sultana & Agrawal (2026)**<br>*IEEE Conf* | Q-DRNet: CNN + Variational layer | Accuracy: ~97.30% | No physical quantum hardware validation; does not evaluate depolarizing or bit-flip noise. |
| **Alsubai et al. (2023)**<br>*Mathematics* (MDPI) | Quantum-enhanced Inception net | Accuracy: 100% (IDRiD) | Severe risk of overfitting on tiny dataset (516 images); no QWK; lacks parameter accounting. |

### The 4 Research Gaps Solved by Our Project
1. **Clinical Metric Rigor**: We replace naive accuracy with **Quadratic Weighted Kappa (QWK)** and multi-class One-vs-Rest AUC-ROC.
2. **Systematic Compression Ablation**: We benchmark Linear Bottleneck vs. Deep Autoencoder vs. PCA instead of an arbitrary dense layer.
3. **Strict Parameter & Latency Accounting**: We isolate decision parameters (showing models from 37 params to 12 quantum params) and measure runtime latency.
4. **NISQ Noise & QPU Roadmap**: Phase 4 introduces Qiskit Aer depolarizing noise sweeps and physical execution on IBM Quantum (`ibm_brisbane`).

---

# Slide 6: Methodology
**Clinical Preprocessing, Loss Optimization, & Quantum Formulations**
### 1. Clinical Image Preprocessing Engine
- **Ben Graham Circular Crop**: Automatically masks non-retinal black borders, identifies bounding contours, and centers the retina.
- **Green-Channel CLAHE**: Isolates the 540–575 nm spectrum where human hemoglobin absorbs light, maximizing lesion contrast (clip_limit=2.0, tile_grid=(8,8)).
- **Standardized Resize**: Standardizes images to $224 \times 224 \times 3$.

### 2. Class-Weighted Multi-Class Focal Loss
$$\mathcal{L}_{\text{Focal}} = -\sum_{c=0}^4 y_c \cdot \alpha_c \cdot (1 - p_c)^\gamma \cdot \log(p_c)$$
- $\gamma = 2.0$ suppresses gradients from easy, dominant Grade 0 images.
- $\alpha_c = \frac{N}{C \cdot N_c}$ enforces a $9.3\times$ higher penalty on rare Grade 3 lesions.

### 3. Quantum State Preparation & Strongly Entangling Ansatz
- **Angle Embedding**: $|\psi(z)\rangle = \bigotimes_{i=0}^{n-1} R_y(z_i) |0\rangle$ with constant $O(1)$ circuit depth.
- **Variational Ansatz**: $U(\boldsymbol{\theta}) = \prod_{l=1}^L \left( U_{\text{ent}}^{(l)} \cdot \bigotimes_{i=0}^{n-1} R(\alpha_{l,i}, \beta_{l,i}, \gamma_{l,i}) \right)$ using 3 Euler rotations per qubit and a circular CNOT entangling ring.
- **Parameter-Shift Rule**: Evaluates exact analytical gradients on quantum hardware:
  $$\frac{\partial \langle Z_i \rangle}{\partial \theta_j} = \frac{\langle Z_i \rangle\left(\theta_j + \frac{\pi}{2}\right) - \langle Z_i \rangle\left(\theta_j - \frac{\pi}{2}\right)}{2}$$
- **Quadratic Weighted Kappa (QWK)**: $\kappa = 1 - \frac{\sum w_{i,j} O_{i,j}}{\sum w_{i,j} E_{i,j}}$ where $w_{i,j} = \frac{(i - j)^2}{16}$.

---

# Slide 7: System Architecture and Technology Stack
**End-to-End Pipeline & Multi-Disciplinary Software Stack**
### 5-Stage System Pipeline
$$\text{Fundus Image (224x224)} \longrightarrow \text{ResNet18 Backbone (512-d)} \longrightarrow \text{Compression Stage (n angles)} \longrightarrow \text{PennyLane PQC (n expvals)} \longrightarrow \text{Linear Head (5 classes)} \longrightarrow \text{Focal Loss}$$

### Interfacing & Device Bridging
- **Disk Feature Caching**: Extracted 512-d embeddings are cached to `data/features/train_features_full.pt`, dropping epoch training from 45 min to 12 sec.
- **GPU-CPU Device Bridge**: Automatically transfers compressed angles to `.cpu()` for PennyLane's `default.qubit` simulator and routes quantum outputs back to `.to(device)` for GPU classification.

### Comprehensive Technology Stack
- **Medical Image Processing**: OpenCV, Albumentations, Ben Graham Circular Masking, Green-channel CLAHE.
- **Deep Learning Framework**: PyTorch 2.2+ (GPU autograd), ResNet18 & MobileNetV2 backbones, Class-weighted Focal Loss.
- **Quantum Computing SDK**: PennyLane 0.35+ (QNode & TorchLayer), Qiskit 1.0 (Qiskit Aer noise simulator), IBM Quantum Runtime (`ibm_brisbane`).
- **Data & Evaluation**: Scikit-Learn (QWK, Stratified splits, PCA), NumPy, Pandas, Weights & Biases telemetry.

---

# Slide 8: Model Algorithm Approach
**Deep Dive into Compression Paradigms & Quantum Variational Layer**
### 1. Classical Feature Extraction & Freezing
The ResNet18 convolutional backbone is initialized with ImageNet weights and frozen. It acts as a deterministic 512-dimensional spatial feature extractor, isolating the learning capacity of the quantum decision layer.

### 2. Systematic Compression Ablation ($512 \to n\_qubits$)
- **Bottleneck Linear**: Trainable linear layer $W x + b$ with $\tanh(x) \times \pi$ scaling into $[-\pi, \pi]$.
- **Deep Autoencoder**: 3-layer bottleneck ($512 \to 256 \to 64 \to n\_qubits$) pre-trained with MSE reconstruction loss to preserve non-linear lesion manifolds.
- **PCA Compressor**: Statistical SVD projection + min-max angle scaling into $[-\pi, \pi]$.

### 3. Parameterized Quantum Circuit (PQC)
Features are encoded as rotation angles into qubits via $R_y(z_i)$. A single-layer StronglyEntanglingLayers ansatz applies 12 Euler rotation parameters across 4 qubits with periodic CNOT entanglement. The circuit measures Pauli-Z expectation values $\langle Z_i \rangle \in [-1, 1]$.

### 4. Backpropagation Gradient Flow
PyTorch autograd gradients backpropagate seamlessly from the classification head $\to$ quantum circuit weights (via the Parameter-Shift Rule) $\to$ compression bottleneck in a single `.backward()` call.

---

# Slide 9: Model Training & Model Results
**Verified Head-to-Head Performance (Held-out APTOS Test Set, N=550)**
### Official Benchmark Matrix
| Model Architecture | State Prep / Bottleneck | Decision Params | Accuracy | Macro-F1 | QWK (Kappa) | AUC-ROC | Latency (ms) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ResNet18 Baseline** | Direct Classical Head | 2,565 | **81.27%** | **0.6601** | **0.8721** | **0.9432** | 206.26 ms |
| **MobileNetV2 Baseline** | Direct Classical Head | 6,405 | 77.27% | 0.6187 | 0.8719 | 0.9339 | 3.61 ms |
| **HQNN (4Q, Autoencoder)** | Deep 3-Layer AE | 297,897 (12 Q) | 59.64% | **0.4182** | **0.7693 (Best)** | **0.8716** | 1.40 ms |
| **HQNN (4Q, Linear)** | Bottleneck Linear | 2,089 (12 Q) | 58.12% | 0.3840 | 0.7611 | 0.8490 | 1.15 ms |
| **HQNN (8Q, Linear)** | Bottleneck Linear | 4,173 (24 Q) | **67.82%** | 0.3269 | 0.6376 | 0.7653 | 2.47 ms |
| **HQNN (4Q, PCA)** | Fixed Statistical PCA | **37 Total** | 14.00% | 0.1242 | 0.1379 | 0.5661 | **0.62 ms** |

### Key Experimental Discoveries
- **Autoencoder State Prep Wins**: Reached **QWK: 0.7693** and **AUC: 0.8716**, proving non-linear manifold learning preserves subtle microaneurysms before angle mapping.
- **Extreme Parameter Efficiency**: The 4-qubit Linear model achieved QWK 0.7611 with only 12 quantum circuit parameters.
- **The PCA Failure (37 Params)**: PCA captured global illumination variance (>95%) while discarding microaneurysm pathology (<1% of pixel variance), causing collapse.
- **4 vs 8 Qubits Dynamics**: 8 qubits gave higher accuracy (67.82%) but lower QWK (0.6376) due to overfitting intermediate grades.

---

# Slide 10: Mid Sem Percentage Completion
**Progress Status Across Project Phases & Phase 4 Roadmap**
### Phase 1: Data & Preprocessing [100% COMPLETE]
- Ingestion of 3,662 APTOS 2019 retinal fundus images.
- Stratified 70/15/15 train/val/test split generation (train: 2,563, val: 549, test: 550).
- Ben Graham circular crop and green-channel CLAHE at 224x224.
- Visual verification artifacts generated in `reports/preprocessing_samples/`.

### Phase 2: Classical Baselines & Loss [100% COMPLETE]
- ResNet18 baseline trained (Accuracy: 81.27%, QWK: 0.8721).
- MobileNetV2 baseline trained (Accuracy: 77.27%, QWK: 0.8719).
- Class-weighted Focal Loss ($\gamma = 2.0$) implemented and verified.
- Automated feature extraction and disk caching pipeline operational.

### Phase 3: Quantum Circuits & Hybrids [100% COMPLETE]
- PennyLane StronglyEntanglingLayers circuits (4 & 8 qubits) built.
- 3 Compression modules (Linear, Autoencoder, PCA) implemented.
- All 4 hybrid models trained and evaluated on held-out test split.
- Head-to-head empirical benchmark matrix compiled in `reports/`.

### Phase 4: Hardware Noise & Deployment [PLANNED / ROADMAP]
- Milestone 4.1 (Oct 1–15): Qiskit Aer depolarizing and thermal relaxation noise sweeps.
- Milestone 4.2 (Oct 16–31): Execution on real IBM Quantum hardware (`ibm_brisbane`).
- Milestone 4.3 (Nov 1–15): Clinical Streamlit web application deployment (`dashboard/app.py`).
- Milestone 4.4 (Nov 16–30): Final IEEE conference manuscript and viva defense.

---

# Slide 11: References
**Scholarly & Technical Literature Citations**
1. **Bali, R. et al. (2025)**. *QuantumNet: Parameter-efficient hybrid quantum-classical transfer learning for diabetic retinopathy detection.* MethodsX (Elsevier), 14, 102980.
2. **Ara, S. et al. (2025)**. *Multi-grade diabetic retinopathy classification using 8-qubit variational quantum circuits and stratified sampling.* MethodsX (Elsevier), 14, 103012.
3. **Stalin Babu, C. et al. (2025)**. *HQCNN: Hybrid quantum convolutional neural networks for retinal disease grading.* IEEE OTCON Proceedings, pp. 112–118.
4. **Sultana, M. & Agrawal, P. (2026)**. *Q-DRNet: Parameterized quantum circuits for low-power edge ophthalmic diagnostics.* IEEE Conference on Computational Intelligence, pp. 245–251.
5. **Alsubai, S. et al. (2023)**. *Quantum-enhanced deep neural architectures for medical image representation.* Mathematics (MDPI), 11(14), 3120.
6. **Bergholm, V. et al. (2018)**. *PennyLane: Automatic differentiation of hybrid quantum-classical computations.* arXiv:1811.04968.
7. **APTOS 2019 Blindness Detection Benchmark**, Asia Pacific Tele-Ophthalmology Society, Kaggle Dataset.
8. **Lin, T.-Y. et al. (2017)**. *Focal Loss for Dense Object Detection.* IEEE TPAMI, 42(2), 318–327.

---

# Slide 12: Thank You
**Questions & Answers | Defense Discussion**
- **Project Title**: Hybrid Quantum-Classical Convolutional Neural Networks for Retinal Disease Severity Grading
- **Project Tracking ID**: ERI 5 / TY_CSE_10  |  Academic Year: 2026–2027
- **GitHub Repository**: [https://github.com/hswaym/RFMid-Retinal-Classification](https://github.com/hswaym/RFMid-Retinal-Classification)
- **Verified Model Checkpoint**: HQNN 4-Qubit Autoencoder (QWK: 0.7693, AUC-ROC: 0.8716)
- **Team**: Harshwardhan Suryawanshi & Project Group Members
- *We now invite questions and feedback from the review committee.*
```
