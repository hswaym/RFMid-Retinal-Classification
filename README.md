# Hybrid Quantum-Classical Convolutional Neural Network (HQNN) for Diabetic Retinopathy Classification

An empirical research project conducting a controlled comparison between a classical CNN baseline and a shallow Parameterized Quantum Circuit (PQC) decision layer for 5-grade Diabetic Retinopathy classification from retinal fundus images, evaluated across parameter efficiency and simulated NISQ noise resilience.

---

## Repository Structure

```
hqnn-retinal-classification/
├── data/                # Raw & processed fundus datasets (gitignored)
├── src/
│   ├── preprocessing/    # ben_graham_crop.py, clahe.py, dataset.py
│   ├── classical/        # resnet_baseline.py, mobilenet_baseline.py, train_classical.py
│   ├── compression/       # bottleneck_linear.py, autoencoder.py, pca_compressor.py
│   ├── quantum/           # circuits.py, torch_layer.py, noise_models.py, ibm_runner.py
│   ├── hybrid/             # hybrid_model.py, train_hybrid.py
│   └── eval/               # metrics.py, ablation.py, benchmark_matrix.py
├── api/                     # FastAPI backend: main.py, routers/predict.py, routers/circuit.py
├── dashboard/                # Streamlit dashboard: app.py
├── notebooks/                 # Exploratory notebooks only
├── docker/                     # Dockerfile.api, Dockerfile.dashboard, docker-compose.yml
├── reports/                     # Progress reviews, IEEE paper drafts
├── tests/                      # Unit & integration test suite
└── configs/                      # Interchangeable YAML configurations per model variant
```

## Setup & Dependencies

1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
