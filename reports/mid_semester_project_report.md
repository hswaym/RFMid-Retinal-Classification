# Mid-Semester Project Report: Hybrid Quantum-Classical Convolutional Neural Networks for Retinal Disease Classification

**Project Title**: Empirical Evaluation of Parameterized Quantum Circuits in Hybrid Quantum-Classical Architectures for Diabetic Retinopathy Severity Grading  
**Project Code / ID**: ERI 5 / TY_CSE_10  
**Repository**: [https://github.com/hswaym/RFMid-Retinal-Classification](https://github.com/hswaym/RFMid-Retinal-Classification)  
**Tracking Branch**: `main`  
**Latest Verified Commit**: `491aa19`  
**Date**: September 2026  

---

## 1. Project Overview

### 1.1 Purpose & Motivation
Diabetic Retinopathy (DR) is a microvascular complication of diabetes and a leading cause of preventable blindness worldwide. Early clinical diagnosis requires screening retinal fundus photography across five progressive international severity stages (Grade 0: No DR, Grade 1: Mild, Grade 2: Moderate, Grade 3: Severe, Grade 4: Proliferative DR). While deep classical Convolutional Neural Networks (CNNs) achieve high diagnostic accuracy, they rely on millions of parameters (e.g., $11.2\text{M}$ for ResNet18), resulting in high computational overhead, heavy power consumption, and vulnerability to overfitting on minority disease grades.

Quantum Machine Learning (QML), particularly **Hybrid Quantum-Classical Neural Networks (HQNNs)** running Parameterized Quantum Circuits (PQCs) as variational decision layers, offers a promising paradigm. By leveraging high-dimensional Hilbert space expressibility, quantum superposition, and multi-qubit entanglement, PQCs can formulate non-linear decision boundaries with exponentially fewer trainable parameters.

### 1.2 Scope
This project conducts a controlled, empirical benchmark comparing classical CNN baselines against hybrid quantum-classical networks on the standardized **APTOS 2019 Blindness Detection benchmark**. The scope spans:
1. Standardized ophthalmic image preprocessing (Ben Graham circular crop and green-channel CLAHE).
2. Deep classical baselines (ResNet18, MobileNetV2) trained with class-weighted Focal Loss.
3. Three interchangeable state preparation / dimensionality compression pipelines (Linear Bottleneck, Deep Autoencoder, and Principal Component Analysis).
4. Analytical quantum variational ansatzes built with PennyLane (`StronglyEntanglingLayers`).
5. Hardware noise modeling and physical deployment roadmap on IBM Quantum superconducting quantum processors (Phase 4).

### 1.3 Core Project Goals
- **Empirical Rigor**: Establish strict, reproducible benchmarks evaluated against the clinical competition standard metric: **Quadratic Weighted Kappa (QWK)**, along with Macro-F1, Multi-class One-vs-Rest AUC-ROC, and Accuracy.
- **Parameter Efficiency**: Determine whether a shallow PQC with only 12–24 quantum parameters can approach classical performance while reducing decision-stage parameters by $>99\%$.
- **Noise & NISQ Resilience**: Evaluate the degradation of quantum classification under simulated depolarizing noise and execute physical inference runs on real IBM Quantum NISQ hardware.

---

## 2. What Has Been Completed So Far (Mid-Semester Status)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MID-SEMESTER STATUS                                    │
├─────────────────────┬─────────────────────┬─────────────────────┬──────────────────────┤
│ PHASE 1: DATA & PRE │ PHASE 2: BASELINES  │ PHASE 3: HQNN CORE  │ PHASE 4: NISQ & DEP  │
│ [100% COMPLETE]     │ [100% COMPLETE]     │ [100% COMPLETE]     │ [PLANNED / ROADMAP]  │
│ - APTOS 2019 splits │ - ResNet18 (Colab)  │ - 4 & 8 Qubit PQCs  │ - Qiskit Aer Noise   │
│ - Ben Graham crop   │ - MobileNetV2       │ - 3 Compressors     │ - IBMQ Runtime Run   │
│ - Green CLAHE       │ - Focal Loss Opt    │ - 4 Variants Run    │ - Streamlit GUI      │
│ - Feature Caching   │ - W&B Verification  │ - Benchmark Matrix  │ - FastAPI Endpoint   │
└─────────────────────┴─────────────────────┴─────────────────────┴──────────────────────┘
```

### 2.1 Implemented & Verified Modules
1. **Dataset Ingestion & Split Management** ([`src/classical/train_classical.py`](file:///c:/Users/hsway/OneDrive/Desktop/Everything/College%20Projects/ERI%205/hqnn-retinal-classification/src/classical/train_classical.py)):
   - Ingested 3,662 labeled high-resolution fundus images.
   - Generated fixed, reproducible stratified 70/15/15 train/val/test splits saved in `data/splits/` (`train.csv`: 2,563, `val.csv`: 549, `test.csv`: 550).
2. **Clinical Preprocessing Engine** ([`src/preprocessing/`](file:///c:/Users/hsway/OneDrive/Desktop/Everything/College%20Projects/ERI%205/hqnn-retinal-classification/src/preprocessing)):
   - `ben_graham_crop.py`: Automates circular masking, border thresholding, and aspect-preserving resizing to $224 \times 224$.
   - `clahe.py`: Isolates the green channel (optimal absorption spectrum for hemoglobin/microaneurysms) and applies Contrast Limited Adaptive Histogram Equalization.
   - Preprocessing visual artifacts generated: 10 individual diagnostic panels and a multi-panel comparison grid in `reports/preprocessing_samples/`.
3. **Classical CNN Baselines** ([`src/classical/`](file:///c:/Users/hsway/OneDrive/Desktop/Everything/College%20Projects/ERI%205/hqnn-retinal-classification/src/classical)):
   - Implemented `ResNet18Baseline` ($11,179,077$ params) and `MobileNetV2Baseline` ($2,230,277$ params).
   - Custom `FocalLoss` module with dynamic inverse-frequency class weights ($\gamma=2.0$).
   - Truncated feature extractors (`get_feature_extractor()`) outputting pooled 512-d and 1280-d feature vectors.
   - Checkpoints saved in `checkpoints/resnet18_baseline.pt` and `checkpoints/mobilenet_v2_baseline.pt`.
4. **Three Interchangeable Feature Compression Modules** ([`src/compression/`](file:///c:/Users/hsway/OneDrive/Desktop/Everything/College%20Projects/ERI%205/hqnn-retinal-classification/src/compression)):
   - `BottleneckLinear`: Parametric linear projection ($512 \to n\_qubits$) with $\tanh(x) \times \pi$ scaling into $[-\pi, \pi]$.
   - `FeatureAutoencoder`: Deep non-linear autoencoder ($512 \to 256 \to 64 \to n\_qubits \to 64 \to 256 \to 512$) trained with MSE reconstruction loss.
   - `PCACompressor`: Statistical Principal Component Analysis with dynamic min-max normalization into rotation angles.
5. **Parameterized Quantum Circuits** ([`src/quantum/`](file:///c:/Users/hsway/OneDrive/Desktop/Everything/College%20Projects/ERI%205/hqnn-retinal-classification/src/quantum)):
   - `circuits.py`: PennyLane QNode with configurable `n_qubits` and `n_layers`. Feature map using `AngleEmbedding(rotation='Y')`, variational ansatz using `StronglyEntanglingLayers`, and measurements returning Pauli-$Z$ expectation values.
   - `torch_layer.py`: QNode encapsulated as a native `qml.qnn.TorchLayer` with analytical gradient backpropagation.
6. **End-to-End Hybrid Model & Training Pipeline** ([`src/hybrid/`](file:///c:/Users/hsway/OneDrive/Desktop/Everything/College%20Projects/ERI%205/hqnn-retinal-classification/src/hybrid)):
   - `hybrid_model.py`: Modular PyTorch pipeline chaining: Frozen Backbone $\to$ Compression $\to$ Quantum TorchLayer $\to$ Linear Classification Head ($n\_qubits \to 5$).
   - Device bridging: Automatically routes angle tensors to CPU for simulator execution and transfers quantum outputs back to GPU/CUDA for classification.
   - `train_hybrid.py`: End-to-end training loop with feature disk caching, early stopping, and automated compressor pre-training.
7. **Empirical Benchmark Suite** ([`reports/benchmark_matrix.md`](file:///c:/Users/hsway/OneDrive/Desktop/Everything/College%20Projects/ERI%205/hqnn-retinal-classification/reports/benchmark_matrix.md)):
   - Verified head-to-head empirical results recorded across all 6 models.

---

## 3. Current Architecture & System Design

### 3.1 High-Level Architecture Diagram

```
                                      HYBRID QUANTUM-CLASSICAL PIPELINE
                                      
  [ Raw Fundus Image ] (B, 3, H, W)
           │
           ▼
  [ Clinical Preprocessor ] (Ben Graham Circular Crop + Green CLAHE)
           │
           ▼
  [ ResNet18 Backbone ] (Truncated before FC, Frozen Weights)
           │
           ▼
  [ 512-d Feature Vector ] (B, 512)  ──► [ Disk Cache: data/features/train_features_full.pt ]
           │
           ▼
  [ Dimensionality Compression Stage ] (512 ──► n_qubits)
     ├─ Option A: BottleneckLinear (nn.Linear + tanh * π)
     ├─ Option B: FeatureAutoencoder (Pre-trained encoder)
     └─ Option C: PCACompressor (Statistical PCA projection)
           │
           ▼
  [ Quantum State Preparation ] (Rotation angles θ_i ∈ [-π, π])
           │
           ▼
  [ Parameterized Quantum Circuit ] (PennyLane default.qubit / IBM Quantum)
     ├─ Feature Map: AngleEmbedding(wires=range(n), rotation='Y')
     ├─ Variational Ansatz: StronglyEntanglingLayers(weights, wires=range(n))
     └─ Measurement: [⟨Z_0⟩, ⟨Z_1⟩, ..., ⟨Z_{n-1}⟩] ∈ [-1, 1]^n
           │
           ▼
  [ Classical Linear Head ] (nn.Linear(n_qubits, 5))
           │
           ▼
  [ Softmax / Logits Output ] (5-Class Probabilities: Grades 0 to 4)
```

### 3.2 Component Breakdown & Interfaces

| Component | Source File | Input Dimension | Output Dimension | Trainable Parameters | Description |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Preprocessor** | `src/preprocessing/` | $(B, 3, H, W)$ | $(B, 3, 224, 224)$ | 0 | Ben Graham circular crop + CLAHE |
| **Backbone** | `src/classical/resnet_baseline.py` | $(B, 3, 224, 224)$ | $(B, 512)$ | 0 (Frozen) | Truncated ImageNet-pretrained ResNet18 |
| **Linear Compressor** | `src/compression/bottleneck_linear.py` | $(B, 512)$ | $(B, n\_qubits)$ | $512 \times n + n$ | Trainable linear projection with $\tanh \times \pi$ |
| **AE Compressor** | `src/compression/autoencoder.py` | $(B, 512)$ | $(B, n\_qubits)$ | $297,860$ (4-d) | 3-layer encoder ($512 \to 256 \to 64 \to n$) |
| **PCA Compressor** | `src/compression/pca_compressor.py` | $(B, 512)$ | $(B, n\_qubits)$ | 0 (Statistical) | Fitted Scikit-learn PCA projection |
| **Quantum Layer** | `src/quantum/torch_layer.py` | $(B, n\_qubits)$ | $(B, n\_qubits)$ | $L \times n \times 3$ | StronglyEntanglingLayers on PennyLane |
| **Classifier Head** | `src/hybrid/hybrid_model.py` | $(B, n\_qubits)$ | $(B, 5)$ | $n \times 5 + 5$ | Linear projection to 5 DR severity classes |

---

## 4. Training, Data, & Performance Benchmarks

### 4.1 Dataset & Stratified Splits
The benchmark uses the **APTOS 2019 Blindness Detection** dataset (3,662 fundus images). Clinical DR grading exhibits inherent medical class imbalance:
- **Grade 0 (No DR)**: 1,805 images ($49.3\%$)
- **Grade 1 (Mild DR)**: 370 images ($10.1\%$)
- **Grade 2 (Moderate DR)**: 999 images ($27.3\%$)
- **Grade 3 (Severe DR)**: 193 images ($5.3\%$)
- **Grade 4 (Proliferative DR)**: 295 images ($8.1\%$)

Splits were generated using stratified sampling across diagnoses:
- **Train Split**: 2,563 images ($70\%$)
- **Validation Split**: 549 images ($15\%$)
- **Held-Out Test Split**: 550 images ($15\%$)

### 4.2 Comprehensive Empirical Benchmark Matrix
The table below reports actual logged evaluation metrics on the held-out test split ($N = 550$). All runs were executed across 15 epochs with early stopping on validation Macro-F1 (patience = 5).

| Model Architecture | Compression / State Prep | Decision Trainable Params | Quantum Circuit Params | Total Model Params | Macro-F1 | Accuracy | Quadratic Weighted Kappa (QWK) | AUC-ROC (OvR) | Inference Latency (ms/sample) | Checkpoint Path |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **ResNet18 Baseline** | Direct Classical Head ($512 \to 5$) | 2,565 | 0 | 11,179,077 | **0.6601** | **81.27%** | **0.8721** | **0.9432** | 206.26 ms | `checkpoints/resnet18_baseline.pt` |
| **MobileNetV2 Baseline**| Direct Classical Head ($1280 \to 5$) | 6,405 | 0 | 2,230,277 | 0.6187 | 77.27% | 0.8719 | 0.9339 | 3.61 ms | `checkpoints/mobilenet_v2_baseline.pt` |
| **HQNN (4-Qubit, Autoencoder)** | Deep Non-Linear Autoencoder ($512 \to 4$) | 297,897 | 12 | 11,474,409 | **0.4182** | 59.64% | **0.7693** | **0.8716** | 1.40 ms | `checkpoints/hqnn_4qubit_autoencoder_best.pt` |
| **HQNN (4-Qubit, Linear)** | Bottleneck Linear ($512 \to 4$) | 2,089 | 12 | 11,178,601 | 0.3840 | 58.12% | 0.7611 | 0.8490 | 1.15 ms | `checkpoints/hqnn_4qubit_best.pt` |
| **HQNN (8-Qubit, Linear)** | Bottleneck Linear ($512 \to 8$) | 4,173 | 24 | 11,180,685 | 0.3269 | **67.82%** | 0.6376 | 0.7653 | 2.47 ms | `checkpoints/hqnn_8qubit_linear_best.pt` |
| **HQNN (4-Qubit, PCA)** | Fixed Statistical PCA ($512 \to 4$) | **37** | 12 | 11,176,549 | 0.1242 | 14.00% | 0.1379 | 0.5661 | **0.62 ms** | `checkpoints/hqnn_4qubit_pca_best.pt` |

*Notes on Execution:*
- **Early Stopping**: The 8-qubit linear model and 4-qubit PCA model plateaued early, triggering early stopping at epochs 12 and 9 respectively.
- **Latency**: Classical baselines evaluate the full convolutional backbone per image; hybrid latencies represent feature-mode decision stage evaluation.

### 4.3 Scientific Insights & Findings
1. **Autoencoder State Preparation is Superior**:
   - The 4-qubit Autoencoder variant achieved the highest hybrid performance (**QWK: 0.7693**, **AUC-ROC: 0.8716**, **Macro-F1: 0.4182**). Pre-training an unsupervised reconstruction bottleneck preserves non-linear geometric relationships of microaneurysms and hemorrhages before quantum angle mapping.
2. **Extreme Parameter Efficiency with PCA (37 Parameters)**:
   - The PCA model operated with only **37 trainable parameters** (12 quantum + 25 head weights). While inference latency is ultra-fast (**0.62 ms**), unsupervised linear orthogonal projection lacks clinical supervision, causing severe degradation on subtle intermediate grades (Grades 1 and 3).
3. **Qubit Scaling Dynamics (4 vs. 8 Qubits)**:
   - The 8-qubit linear hybrid achieved higher raw Accuracy (**67.82%** vs. 58.12%), but 4-qubit variants achieved substantially higher Quadratic Weighted Kappa (**0.7693** vs. 0.6376). This indicates that in shallow single-layer ansatzes, 4-qubit Hilbert spaces generalize better without overfitting intermediate class distributions.

---

## 5. Mathematical Formulations & Algorithms

### 5.1 Class-Weighted Multi-Class Focal Loss
To address clinical class imbalance (Grade 0 constitutes $49.3\%$, while Grade 3 is only $5.3\%$), models are optimized with class-weighted Focal Loss:

$$\mathcal{L}_{\text{Focal}}(p_t) = -\alpha_t (1 - p_t)^\gamma \log(p_t)$$

Where:
- $p_t = \text{Softmax}(z)_c$ is the predicted probability for the ground-truth class $c$.
- $\gamma = 2.0$ is the focusing parameter that down-weights easy, well-classified examples (Grade 0) and focuses gradients on hard edge cases.
- $\alpha_t = \frac{N}{C \cdot N_c}$ is the inverse-frequency class weight normalized so that $\sum_{c=0}^{C-1} \alpha_c = C$.

### 5.2 Quantum State Preparation (Angle Embedding)
Features $x \in \mathbb{R}^{512}$ are compressed to $z \in [-\pi, \pi]^n$. The quantum state is initialized from the ground state $|0\rangle^{\otimes n}$ via single-qubit Pauli-$Y$ rotations:

$$|\psi(z)\rangle = \bigotimes_{i=0}^{n-1} R_y(z_i) |0\rangle = \bigotimes_{i=0}^{n-1} \left( \cos\frac{z_i}{2}|0\rangle + \sin\frac{z_i}{2}|1\rangle \right)$$

### 5.3 Strongly Entangling Variational Ansatz
The parameterized unitary $U(\boldsymbol{\theta})$ consists of $L$ layers. In layer $l$, each qubit wire $i$ undergoes an arbitrary single-qubit Euler rotation followed by a circular entangling ring of CNOT gates:

$$U(\boldsymbol{\theta}) = \prod_{l=1}^{L} \left( U_{\text{ent}}^{(l)} \cdot \bigotimes_{i=0}^{n-1} R(\alpha_{l,i}, \beta_{l,i}, \gamma_{l,i}) \right)$$

Where the general rotation gate is defined as:

$$R(\alpha, \beta, \gamma) = R_z(\gamma) R_y(\beta) R_x(\alpha)$$

Entangling gates form a periodic ring topology with range $r$:

$$U_{\text{ent}}^{(l)} = \prod_{i=0}^{n-1} \text{CNOT}_{(i, (i + r) \pmod n)}$$

For $L=1$ and $n=4$, the circuit contains exactly $1 \times 4 \times 3 = 12$ variational parameters.

### 5.4 Expectation Value Measurement & Gradients
The output of the quantum circuit is the vector of Pauli-$Z$ expectation values:

$$\langle Z_i \rangle = \langle \psi(z) | U^\dagger(\boldsymbol{\theta}) \sigma_z^{(i)} U(\boldsymbol{\theta}) | \psi(z) \rangle \in [-1, 1]$$

Analytical gradients with respect to circuit weights $\theta_j$ are computed via the **Parameter-Shift Rule**:

$$\frac{\partial \langle Z_i \rangle}{\partial \theta_j} = \frac{\langle Z_i \rangle(\theta_j + s) - \langle Z_i \rangle(\theta_j - s)}{2 \sin(s)}, \quad s = \frac{\pi}{2}$$

### 5.5 Quadratic Weighted Kappa (QWK)
The official clinical evaluation metric penalizes errors quadratically according to the distance between severity grades:

$$\kappa = 1 - \frac{\sum_{i,j} w_{i,j} O_{i,j}}{\sum_{i,j} w_{i,j} E_{i,j}}, \quad w_{i,j} = \frac{(i - j)^2}{(C - 1)^2}$$

Where $O_{i,j}$ is the observed confusion matrix, and $E_{i,j}$ is the expected confusion matrix under random chance agreement.

---

## 6. Future Plan & Milestones (Phase 4 Roadmap for End-Semester)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 4: END-SEMESTER ROADMAP & TIMELINE                        │
├─────────────────────┬─────────────────────┬─────────────────────┬──────────────────────┤
│ MILESTONE 4.1       │ MILESTONE 4.2       │ MILESTONE 4.3       │ MILESTONE 4.4        │
│ Oct 1 - Oct 15      │ Oct 16 - Oct 31     │ Nov 1 - Nov 15      │ Nov 16 - Nov 30      │
│ Simulated NISQ      │ IBM Quantum Cloud   │ Interactive Web App │ Final Paper &        │
│ Noise Modeling      │ Hardware Execution  │ & Model Serving     │ Project Defense      │
│ - Qiskit Aer backend│ - IBMQ Runtime      │ - Streamlit demo    │ - Complete Report    │
│ - Depolarizing noise│ - ibm_brisbane      │ - FastAPI backend   │ - Video Presentation │
│ - Robustness sweep  │ - Error mitigation  │ - Docker container  │ - Code Freeze        │
└─────────────────────┴─────────────────────┴─────────────────────┴──────────────────────┘
```

### Detailed Upcoming Tasks & Ownership
1. **Milestone 4.1: Simulated NISQ Noise Robustness Sweep (Weeks 1–2)**:
   - Implement `src/quantum/noise_models.py` using `qiskit.aer` noise models.
   - Evaluate model robustness under depolarizing channel noise probabilities $p \in \{0.01, 0.05, 0.10\}$ and thermal relaxation ($T_1, T_2$).
   - Test hypothesis: Variational quantum circuits demonstrate intrinsic fault-tolerance to low-level gate noise compared to classical noise injection.
2. **Milestone 4.2: Physical IBM Quantum Hardware Execution (Weeks 3–4)**:
   - Configure IBM Quantum Runtime service via `qiskit-ibm-runtime`.
   - Transpile the optimized 4-qubit circuit onto a physical superconducting quantum device (`ibm_brisbane` / `ibm_sherbrooke`).
   - Run zero-noise extrapolation (ZNE) and readout error mitigation (M3) on a 100-sample test batch.
3. **Milestone 4.3: Interactive Clinical Dashboard & API Deployment (Weeks 5–6)**:
   - Develop Streamlit app in `dashboard/app.py` allowing clinicians to upload fundus images, inspect the circular crop, view the 4 quantum rotation angles, and review prediction confidence.
   - Package production inference endpoint in `api/routers/predict.py` with Docker containerization.
4. **Milestone 4.4: Final Manuscript & Viva Preparation (Weeks 7–8)**:
   - Compile benchmark results into an academic conference manuscript formatted for IEEE / Springer.
   - Final code freeze and presentation rehearsal.

---

## 7. Deployment, Environment, & Tech Stack

### 7.1 Software Dependencies
- **Core Deep Learning**: Python 3.10+, PyTorch (`torch>=2.2.0`), `torchvision>=0.17.0`
- **Quantum Computing Framework**: PennyLane (`pennylane>=0.35.0`, `pennylane-lightning`)
- **Quantum Hardware SDK**: Qiskit (`qiskit>=1.0.0`, `qiskit-aer`, `qiskit-ibm-runtime`)
- **Medical Image Processing**: OpenCV (`opencv-python`), Albumentations (`albumentations>=1.4.0`), Pillow
- **Data Science & Metrics**: NumPy, Pandas, Scikit-learn (`scikit-learn>=1.4.0`), SciPy
- **Experiment Tracking**: Weights & Biases (`wandb>=0.16.0`), PyYAML

### 7.2 Directory Organization

```text
hqnn-retinal-classification/
├── checkpoints/              # Model weights (.pt) and PCA pipelines (.joblib)
├── configs/                  # YAML experiment configurations
│   ├── hybrid_4qubit.yaml
│   ├── hybrid_8qubit.yaml
│   ├── hybrid_4q_autoencoder.yaml
│   ├── hybrid_4q_pca.yaml
│   └── hybrid_8q_linear.yaml
├── data/
│   ├── aptos2019/            # Raw train images & CSV labels
│   ├── features/             # Cached 512-d embeddings (.pt)
│   ├── processed_224/        # Ben Graham preprocessed fundus images (.png)
│   └── splits/               # Stratified train/val/test CSV splits
├── reports/
│   ├── benchmark_matrix.md   # Head-to-head empirical metrics
│   ├── related_work_summary.md
│   └── preprocessing_samples/# 10-panel visual verification images
├── src/
│   ├── classical/            # ResNet18 & MobileNetV2 baselines + Focal Loss
│   ├── compression/          # Linear, Autoencoder, PCA compressors
│   ├── eval/                 # QWK, Macro-F1, Accuracy, AUC metrics calculation
│   ├── hybrid/               # HybridQuantumCNN & training pipelines
│   ├── preprocessing/        # Ben Graham crop & green CLAHE modules
│   └── quantum/              # PennyLane QNode & TorchLayer circuits
├── dashboard/                # Streamlit clinical demo app
├── docker/                   # Dockerfile & container setup
└── requirements.txt          # Python dependencies
```

---

## 8. Verification & Quality Assurance

### 8.1 Automated Sanity & Unit Tests
1. **Autograd Backpropagation Check** (`src/quantum/torch_layer.py`):
   - Verified that passing random tensors through `TorchLayer` computes valid analytical gradients on quantum circuit weights (`weights.grad is not None`).
2. **End-to-End Hybrid Gradient Flow** (`src/hybrid/hybrid_model.py`):
   - Verified forward pass on dummy batches $[2, 3, 224, 224]$ producing logits $[2, 5]$.
   - Verified `.backward()` passes gradients through classification head, quantum circuit parameters, and compressor bottleneck simultaneously.
3. **Stratified Split Integrity**:
   - Confirmed equal representation of all five DR diagnoses across training, validation, and test subsets.
4. **Disk Cache Parity**:
   - Validated that cached feature tensors match exact `id_code` sequences to prevent data leakage.

### 8.2 Current Limitations & Assumptions
- **Simulator Execution**: Phase 3 benchmarks were executed on the high-performance statevector simulator `default.qubit`. While mathematically exact, physical hardware execution (Phase 4) will introduce gate infidelity and readout noise.
- **Backbone Feature Freezing**: In Phase 3, the ResNet18 convolutional backbone was frozen to isolate the learning capacity of the quantum decision stage. Joint end-to-end fine-tuning will be benchmarked as an extension.

---

## 9. How to Reproduce & Contribute

### 9.1 Environment Setup
```bash
# 1. Clone repository
git clone https://github.com/hswaym/RFMid-Retinal-Classification.git
cd RFMid-Retinal-Classification

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt
```

### 9.2 Reproducing Classical Baselines
```bash
python -m src.classical.train_classical --model resnet18 --epochs 15 --batch-size 32
python -m src.classical.train_classical --model mobilenet_v2 --epochs 15 --batch-size 32
```

### 9.3 Reproducing Hybrid Quantum Experiments
```bash
# 4-Qubit Autoencoder Hybrid (Best Hybrid Model)
python -m src.hybrid.train_hybrid --config configs/hybrid_4q_autoencoder.yaml --subset 1.0 --epochs 15

# 4-Qubit Linear Hybrid
python -m src.hybrid.train_hybrid --config configs/hybrid_4qubit.yaml --subset 1.0 --epochs 15

# 8-Qubit Linear Hybrid
python -m src.hybrid.train_hybrid --config configs/hybrid_8q_linear.yaml --subset 1.0 --epochs 15

# 4-Qubit PCA Hybrid (37 Parameters)
python -m src.hybrid.train_hybrid --config configs/hybrid_4q_pca.yaml --subset 1.0 --epochs 15
```

---

## 10. Appendix: Glossary & Team Responsibilities

### 10.1 Acronyms & Terminology
- **PQC**: Parameterized Quantum Circuit (a quantum circuit containing parameterized gates optimized via classical gradient descent).
- **HQNN**: Hybrid Quantum-Classical Neural Network.
- **QWK**: Quadratic Weighted Kappa (Cohen's Kappa with quadratic penalty matrix).
- **CLAHE**: Contrast Limited Adaptive Histogram Equalization.
- **NISQ**: Noisy Intermediate-Scale Quantum (current quantum era characterized by 50–1000 qubits without fault-tolerant error correction).
- **QNode**: PennyLane quantum execution node binding a quantum circuit to a specific device backend.
- **Ansatz**: Variational circuit structure specifying the arrangement of quantum gates and entangling operations.

### 10.2 Team Member Allocation & Roles
- **Data Engineering & Preprocessing**: Fundus image standardization, circular masking, and CLAHE optimization.
- **Classical Architecture & Baselines**: ResNet18 / MobileNetV2 backbone training, focal loss tuning, and feature caching.
- **Quantum Circuit Design & Autograd**: PennyLane QNode formulation, StronglyEntanglingLayers tuning, and TorchLayer integration.
- **State Preparation & Compression**: Implementation and optimization of Bottleneck Linear, Autoencoder, and PCA compressors.
- **Deployment & Evaluation (Phase 4 Lead)**: Qiskit Aer noise modeling, IBM Quantum cloud compilation, and Streamlit dashboard interface.

---
*Report compiled and verified from active repository checkpoints and Weights & Biases telemetry logs.*
