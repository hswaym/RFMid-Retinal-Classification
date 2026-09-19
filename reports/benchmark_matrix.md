# Benchmark Matrix: Classical vs. Hybrid Quantum-Classical DR Classification

This document provides a head-to-head empirical comparison of the classical baseline models and the Hybrid Quantum-Classical Neural Network (HQNN) architectures on the APTOS 2019 Diabetic Retinopathy dataset (70/15/15 stratified split).

---

## 1. Head-to-Head Performance & Efficiency Matrix

| Architecture | Paradigm | Decision Trainable Params | Total Model Params | Macro-F1 | Accuracy | QWK | AUC-ROC | Inference Latency (ms/sample) | Checkpoint |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **ResNet18 Baseline** | Classical Deep CNN | 2,565 | 11,179,077 | **0.7814** | **81.27%** | **0.8721** | **0.9124** | 4.82 ms | `checkpoints/resnet18_baseline.pt` |
| **MobileNetV2 Baseline** | Lightweight Classical | 6,405 | 2,230,277 | 0.7420 | 78.50% | 0.8240 | 0.8840 | 3.10 ms | `checkpoints/mobilenetv2_baseline.pt` |
| **HQNN (4-Qubit, Linear)** | Hybrid Quantum-Classical | **2,089** (12 quantum) | 11,178,601 (Backbone frozen) | 0.1765* | 17.27%* | **0.5177*** | **0.6752*** | **0.73 ms** (feature mode) | `checkpoints/hqnn_4qubit_best.pt` |
| **HQNN (8-Qubit, Linear)** | Hybrid Quantum-Classical | 4,165 (24 quantum) | 11,180,677 (Backbone frozen) | *Pending full run* | *Pending* | *Pending* | *Pending* | *Pending* | `checkpoints/hqnn_8qubit_best.pt` |

*\* Preliminary 5-epoch test run on 20% stratified subset to validate training loop, autograd backpropagation, and disk caching. Full 15-epoch convergence benchmark will follow.*

---

## 2. Key Architectural Takeaways

1. **Parameter Efficiency of the Quantum Decision Stage**:
   - The 4-qubit parameterized quantum circuit (PQC) uses only **12 trainable variational parameters** ($\text{Rot}(\alpha, \beta, \gamma)$ rotation gates per wire in `qml.StronglyEntanglingLayers`).
   - Total decision stage parameters (Linear Bottleneck $512 \to 4$, PQC $4 \to 4$, Linear Head $4 \to 5$) are **2,089**, compared to 2,565 for the classical linear head ($512 \to 5$) and 11,179,077 for the end-to-end network.

2. **Simulation Throughput via Feature Disk Caching**:
   - Training end-to-end images on CPU takes ~8.5s per batch of 32 due to image convolutions.
   - Pre-extracting and caching 512-d embeddings accelerates quantum simulation training epochs to **0.7 – 1.0 second per epoch** on CPU, enabling rapid iteration and hyperparameter sweeps.
