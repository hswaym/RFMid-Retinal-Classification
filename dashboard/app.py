"""Streamlit Clinical Diagnostic Interface for Diabetic Retinopathy HQNN.

Provides an interactive web GUI for uploading fundus images, inspecting
the ophthalmic preprocessing pipeline, viewing the 4 latent quantum angles,
and inspecting the 5-class DR severity predictions with triage recommendations.

Usage:
    streamlit run dashboard/app.py
"""

import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import cv2
import numpy as np
import streamlit as st
import torch
import torch.nn.functional as F

from api.routers.predict import GRADE_INFO, get_engine
from src.preprocessing.ben_graham_crop import circle_crop_fov
from src.preprocessing.clahe import apply_green_channel_clahe

# Streamlit Page Config
st.set_page_config(
    page_title="HQNN Clinical Diagnostic Simulator",
    page_icon="👁️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling
st.markdown(
    """
    <style>
    .main-header {
        font-family: 'Georgia', serif;
        font-size: 2.2rem;
        color: #151410;
        font-weight: normal;
    }
    .metric-badge {
        font-family: monospace;
        font-size: 0.85rem;
        padding: 4px 10px;
        background-color: #FAF8F5;
        border: 1px solid #E5E1DC;
        border-radius: 6px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.title("👁️ Hybrid Quantum-Classical Retinal Diagnostic Lab")
st.markdown(
    "**Project ERI 5 // Final Capstone Clinical Interface**  \n"
    "*Ophthalmic Preprocessing (540-575nm) ➔ 512-d ResNet-18 ➔ 4-Qubit Autoencoder ➔ PennyLane PQC ➔ Clinical Softmax*"
)

st.markdown("---")

# Sidebar: System Metadata & Controls
with st.sidebar:
    st.header("⚙️ Quantum Architecture")
    st.info(
        "**Quantum Layer**: 4 Qubits (`default.qubit` / `ibm_brisbane`)\n\n"
        "**Ansatz**: StronglyEntanglingLayers (12 params)\n\n"
        "**State Prep**: AngleEmbedding ($R_y$ rotations)\n\n"
        "**Decision Reduction**: 99.8% vs. 11.2M CNN"
    )

    st.header("Hardware Resilience")
    st.write("• **Hardware QWK**: `0.7839` (FakeBrisbane)")
    st.write("• **Sim-to-Real Retention**: `101.9%`")
    st.write("• **Transpiled Depth**: `25`")

    st.markdown("---")
    st.caption("Research prototype. Not certified for standalone clinical diagnostic decisions.")

# Load Model Engine
@st.cache_resource(show_spinner="Pre-warming HQNN inference pipeline...")
def load_cached_engine():
    return get_engine()

engine = load_cached_engine()

# Main Workspace: Two Columns
col_left, col_right = st.columns([1, 1], gap="large")

with col_left:
    st.subheader("1. Fundus Image Ingestion")
    uploaded_file = st.file_uploader(
        "Upload a retinal fundus photograph (.png, .jpg, .jpeg)",
        type=["png", "jpg", "jpeg"],
    )

    if uploaded_file is not None:
        file_bytes = uploaded_file.read()
        nparr = np.frombuffer(file_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img_bgr is not None:
            # Preprocessing Steps
            cropped_bgr = circle_crop_fov(img_bgr, output_size=224)
            enhanced_bgr = apply_green_channel_clahe(cropped_bgr, clip_limit=2.0)
            enhanced_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
            raw_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

            st.write("**Ophthalmic Inspection Pipeline:**")
            p_col1, p_col2 = st.columns(2)
            with p_col1:
                st.image(raw_rgb, caption="Raw Fundus Image", use_container_width=True)
            with p_col2:
                st.image(
                    enhanced_rgb,
                    caption="Green-Channel CLAHE (540-575nm)",
                    use_container_width=True,
                )

            # Convert to Tensor & Run Inference
            tensor, _ = engine.preprocess_image(file_bytes)
            with st.spinner("Executing 4-Qubit Quantum Circuit..."):
                prediction = engine.infer_from_tensor(tensor)

            st.success(f"Inference Completed in {prediction.latency_ms} ms")

with col_right:
    st.subheader("2. Quantum State & Diagnostic Triage")

    if uploaded_file is not None and 'prediction' in locals():
        # Predicted Grade Callout
        grade = prediction.grade
        meta = GRADE_INFO[grade]

        st.markdown(
            f"""
            <div style="padding: 16px; border-radius: 12px; border: 1px solid {meta['color']}; background-color: #FAF8F5; margin-bottom: 20px;">
                <h3 style="margin: 0; color: {meta['color']}; font-family: monospace;">
                    DIAGNOSED: GRADE {grade} — {prediction.grade_name.upper()}
                </h3>
                <p style="margin: 8px 0 0 0; font-size: 1.1rem; color: #151410;">
                    Diagnostic Confidence: <strong>{prediction.confidence * 100:.2f}%</strong>
                </p>
                <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #57534E;">
                    Triage Urgency: <strong>{prediction.triage_urgency}</strong>
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # 4 Latent Quantum Angles Table
        st.write("**Quantum Variational Angles [θ₀..θ₃ ∈ (-π, π)]:**")
        q_cols = st.columns(4)
        for i, col in enumerate(q_cols):
            with col:
                st.metric(
                    label=f"Wire Q{i} (θ{i})",
                    value=f"{prediction.angles_rad[i]:.3f} rad",
                    delta=f"{prediction.angles_deg[i]:.1f}°",
                )

        # Softmax Probability Distribution Chart
        st.write("**Post-Quantum Softmax Distribution:**")
        chart_data = {
            f"Grade {g}": prediction.probabilities[g] for g in range(5)
        }
        st.bar_chart(chart_data)

        # Action Protocol Recommendation
        st.info(f"**Clinical Recommendation Protocol:**\n\n{prediction.recommendation}")
        st.caption(f"**Ophthalmic Pathology Context:** {prediction.clinical_stakes}")

    else:
        st.info("👈 Upload a retinal fundus photograph on the left to activate real-time quantum inference.")

