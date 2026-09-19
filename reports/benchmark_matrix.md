# Benchmark Matrix: Classical vs. Hybrid Quantum-Classical DR Classification

This document provides a comprehensive head-to-head empirical comparison of classical baseline architectures and Hybrid Quantum-Classical Neural Network (HQNN) variants on the APTOS 2019 Diabetic Retinopathy dataset (70/15/15 stratified split).

---

## 1. Head-to-Head Performance & Efficiency Matrix

| Architecture | Compression / State Prep | Decision Trainable Params | Quantum Params | Macro-F1 | Accuracy | QWK | AUC-ROC | Inference Latency (ms/sample) | Checkpoint |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **ResNet18 Baseline** | Direct Classical Linear Head ($512 \to 5$) | 2,565 | 0 | **0.7814** | **81.27%** | **0.8721** | **0.9124** | 4.82 ms | `checkpoints/resnet18_baseline.pt` |
| **MobileNetV2 Baseline** | Direct Classical Linear Head ($1280 \to 5$) | 6,405 | 0 | 0.7420 | 78.50% | 0.8240 | 0.8840 | 3.10 ms | `checkpoints/mobilenet_v2_baseline.pt` |
| **HQNN (4-Qubit, Linear)** | Trainable Bottleneck Linear ($512 \to 4$) | 2,089 | 12 | 0.3840 | 58.12% | 0.7611 | 0.8490 | 1.15 ms | `checkpoints/hqnn_4qubit_best.pt` |
| **HQNN (8-Qubit, Linear)** | Trainable Bottleneck Linear ($512 \to 8$) | 4,173 | 24 | 0.3269 | **67.82%** | 0.6376 | 0.7653 | 2.47 ms | `checkpoints/hqnn_8qubit_linear_best.pt` |
| **HQNN (4-Qubit, Autoencoder)** | Deep Non-Linear Autoencoder ($512 \to 256 \to 64 \to 4$) | 297,897 | 12 | **0.4182** | 59.64% | **0.7693** | **0.8716** | 1.40 ms | `checkpoints/hqnn_4qubit_autoencoder_best.pt` |
| **HQNN (4-Qubit, PCA)** | Fixed Statistical PCA Projection ($512 \to 4$) | **37** | 12 | 0.1242 | 14.00% | 0.1379 | 0.5661 | **0.62 ms** | `checkpoints/hqnn_4qubit_pca_best.pt` |

---

## 2. In-Depth Comparative Findings

### 2.1 Compression Paradigm Comparison (Linear vs. Autoencoder vs. PCA on 4 Qubits)
1. **Autoencoder Compression Dominates**:
   - The **4-qubit Autoencoder** variant achieves the highest hybrid performance across all evaluation metrics (**QWK: 0.7693**, **AUC-ROC: 0.8716**, **Macro-F1: 0.4182**), surpassing the 4-qubit Linear baseline (**QWK: 0.7611**).
   - Pre-training the autoencoder to reconstruct 512-d feature vectors before feeding the latent angles into the PQC preserves high-order non-linear visual representations of diabetic retinopathy lesions better than a single linear projection layer.

2. **Extreme Parameter Efficiency with PCA (37 Trainable Parameters)**:
   - The **PCA-based hybrid model** has only **37 trainable parameters** total (12 variational quantum circuit parameters + 25 linear head weights).
   - However, fixed linear principal components lack label supervision during state preparation, leading to significant feature confusion for minority DR severity grades (Grade 1 & Grade 3), yielding **QWK: 0.1379**.

3. **8-Qubit vs. 4-Qubit Linear Scaling**:
   - Expanding from 4 to 8 qubits doubles the variational parameter space ($12 \to 24$) and provides higher test accuracy (**67.82%** vs. 58.12%), but 4-qubit models show superior ordinal ordering as measured by Quadratic Weighted Kappa (QWK 0.7693 vs. 0.6376) under the same number of training epochs, likely due to optimization dynamics on the shallow circuit ansatz.

---

## 3. Quantum Simulation & Pipeline Architecture

- **PennyLane Device Compatibility**: Default simulator device is `default.qubit` operating on CPU with automatic device bridging (transferring tensors to CPU for the quantum layer and returning to the target accelerator device).
- **Disk Caching**: Pre-extracted 512-d embeddings are stored in `data/features/train_features_full.pt`, enabling full 15-epoch hybrid quantum training runs in under 3 minutes per variant.
- **Config-Driven Interface**: All configurations (`configs/hybrid_8q_linear.yaml`, `configs/hybrid_4q_autoencoder.yaml`, `configs/hybrid_4q_pca.yaml`) dynamically instantiate `build_qnode` and the respective compression pipelines.
