"""Inference Router for Diabetic Retinopathy Classification.

Provides endpoints for live fundus image preprocessing, feature extraction,
4-qubit quantum circuit simulation, and softmax clinical triage prediction.
"""

from io import BytesIO
import base64
import math
import time
from typing import Dict, List, Optional
import cv2
import numpy as np
import torch
import torch.nn.functional as F
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from src.classical.resnet_baseline import ResNet18FeatureExtractor
from src.compression.autoencoder import FeatureAutoencoder
from src.preprocessing.ben_graham_crop import circle_crop_fov
from src.preprocessing.clahe import apply_green_channel_clahe
from src.preprocessing.fundus_validator import validate_fundus_image
from src.quantum.torch_layer import get_quantum_torch_layer

router = APIRouter(prefix="/predict", tags=["Prediction"])

# Standard Clinical Metadata & Action Protocols
GRADE_INFO = {
    0: {
        "name": "Normal (No DR)",
        "urgency": "Routine",
        "color": "#1F5D3A",
        "recommendation": "Routine annual dilated ophthalmic examination. Maintain strict glycemic control (target HbA1c < 7.0%) and monitor systemic blood pressure.",
        "clinical_stakes": "Retinal vasculature exhibits uniform caliber with intact endothelial junctions. Foveal avascular zone (FAZ) is sharply circumscribed with zero microaneurysms or hard exudates.",
    },
    1: {
        "name": "Mild Non-Proliferative DR",
        "urgency": "Low-Risk Followup",
        "color": "#EAB308",
        "recommendation": "Schedule follow-up dilated eye examination in 9-12 months. Re-evaluate medical therapy for microvascular glycemic and lipid management.",
        "clinical_stakes": "Earliest detectable ophthalmic microangiopathy. Microaneurysms (< 125 um) present in isolated retinal quadrants without visible intraretinal hemorrhages.",
    },
    2: {
        "name": "Moderate Non-Proliferative DR",
        "urgency": "Specialist Review",
        "color": "#F97316",
        "recommendation": "Ophthalmology referral recommended within 3-6 months. Optical Coherence Tomography (OCT) indicated to evaluate subclinical diabetic macular edema.",
        "clinical_stakes": "Multiple microaneurysms, dot-and-blot hemorrhages, and hard lipid exudates in 1-3 quadrants. Cotton wool spots indicate localized precapillary arteriolar occlusions.",
    },
    3: {
        "name": "Severe Non-Proliferative DR",
        "urgency": "Urgent Referral",
        "color": "#E4442C",
        "recommendation": "Urgent retina specialist consultation within 2-4 weeks. High risk (50% within 1 year) of progression to proliferative stage. Fundus fluorescein angiography recommended.",
        "clinical_stakes": "Meets international 4-2-1 clinical criteria: extensive hemorrhages in all 4 quadrants, venous beading in >=2 quadrants, or prominent IRMA in >=1 quadrant.",
    },
    4: {
        "name": "Proliferative DR",
        "urgency": "Emergency Intervention",
        "color": "#B91C1C",
        "recommendation": "EMERGENCY surgical retina specialist intervention within 48-72 hours. Immediate Panretinal Photocoagulation (PRP) laser or anti-VEGF intravitreal therapy required to avert permanent tractional retinal detachment.",
        "clinical_stakes": "Severe retinal ischemia has triggered pathological VEGF upregulation, causing neovascularization of the disc (NVD) and preretinal vitreous hemorrhage with imminent blindness risk.",
    },
}

class PredictionResponse(BaseModel):
    grade: int
    grade_name: str
    confidence: float
    probabilities: List[float]
    angles_rad: List[float]
    angles_deg: List[float]
    quantum_expectations: List[float]
    bloch_vectors: List[Dict[str, float]]
    triage_urgency: str
    recommendation: str
    clinical_stakes: str
    clahe_image_b64: Optional[str] = None
    latency_ms: float
    hardware_profile: str


class FeatureInferenceRequest(BaseModel):
    features: List[float]


class HQNNInferenceEngine:
    """Singleton inference pipeline holding frozen backbone, autoencoder, and PennyLane quantum layer."""

    def __init__(self):
        self.device = torch.device("cpu")
        print("[HQNN Engine] Initializing PyTorch models...")

        # 1. Classical Backbone (ResNet18, 512-dim)
        self.backbone = ResNet18FeatureExtractor(
            pretrained=False,
            checkpoint_path="checkpoints/resnet18_baseline.pt",
        )
        self.backbone.eval()
        self.backbone.to(self.device)

        # 2. Non-linear Autoencoder (512 -> 4 angles)
        self.autoencoder = FeatureAutoencoder(
            in_features=512,
            latent_dim=4,
            scale_pi=True,
        )
        hqnn_ckpt = torch.load(
            "checkpoints/hqnn_4qubit_autoencoder_best.pt",
            map_location="cpu",
            weights_only=False,
        )

        ae_state = {
            k.replace("compressor.ae.", ""): v
            for k, v in hqnn_ckpt["model_state_dict"].items()
            if k.startswith("compressor.ae.")
        }
        self.autoencoder.load_state_dict(ae_state)
        self.autoencoder.eval()
        self.autoencoder.to(self.device)

        # 3. Parameterized Quantum Circuit (PennyLane TorchLayer)
        self.quantum_layer = get_quantum_torch_layer(n_qubits=4, n_layers=1)
        self.quantum_layer.weights.data.copy_(
            hqnn_ckpt["model_state_dict"]["quantum_layer.weights"]
        )

        # 4. Classical Linear Classification Head (4 -> 5)
        self.head = torch.nn.Linear(4, 5)
        self.head.weight.data.copy_(hqnn_ckpt["model_state_dict"]["head.weight"])
        self.head.bias.data.copy_(hqnn_ckpt["model_state_dict"]["head.bias"])
        self.head.eval()
        self.head.to(self.device)

        # Normalization constants (ImageNet standard)
        self.mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
        self.std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)

        print("[HQNN Engine] Ready for high-throughput inference.")

    def preprocess_image(self, image_bytes: bytes) -> (torch.Tensor, str):
        """Applies Ben Graham Circular FOV Masking + Green-Channel CLAHE."""
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise ValueError("Invalid image file format or corrupted bytes.")

        # Ophthalmic Quality & Out-of-Distribution (OOD) Validation Gate
        is_valid, reason, _ = validate_fundus_image(img_bgr)
        if not is_valid:
            raise ValueError(f"OOD_IMAGE: {reason}")

        # 1. Ben Graham circular FOV crop standardizing to 224x224
        cropped_bgr = circle_crop_fov(img_bgr, output_size=224)

        # 2. Green-channel CLAHE (540-575 nm hemoglobin contrast enhancement)
        enhanced_bgr = apply_green_channel_clahe(cropped_bgr, clip_limit=2.0)

        # 3. Create base64 PNG data URL for client preview
        success, buffer = cv2.imencode(".png", enhanced_bgr)
        b64_str = ""
        if success:
            b64_str = f"data:image/png;base64,{base64.b64encode(buffer).decode('utf-8')}"

        # 4. Prepare normalized PyTorch tensor
        enhanced_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
        tensor = torch.from_numpy(enhanced_rgb).permute(2, 0, 1).float() / 255.0
        tensor = ((tensor - self.mean) / self.std).unsqueeze(0)
        return tensor, b64_str

    @torch.no_grad()
    def infer_from_tensor(self, tensor: torch.Tensor, b64_preview: Optional[str] = None) -> PredictionResponse:
        t0 = time.perf_counter()

        # Step 1: Classical 512-dim feature extraction
        features = self.backbone(tensor)

        # Step 2: Autoencoder latent compression to 4 angles in [-pi, pi]
        angles = self.autoencoder.encode(features)

        # Step 3: Parameterized Quantum Circuit simulation
        q_exp = self.quantum_layer(angles)

        # Step 4: Final linear projection & Softmax probabilities
        logits = self.head(q_exp)
        probs = F.softmax(logits, dim=-1).squeeze(0).numpy().tolist()

        elapsed_ms = (time.perf_counter() - t0) * 1000.0

        pred_grade = int(np.argmax(probs))
        confidence = float(probs[pred_grade])

        angles_rad = angles.squeeze(0).numpy().tolist()
        angles_deg = [float(math.degrees(a)) for a in angles_rad]
        q_expectations = q_exp.squeeze(0).numpy().tolist()

        # Compute Bloch coordinates for each angle
        # |psi> = cos(theta/2)|0> + sin(theta/2)|1> => x = sin(theta), y = 0, z = cos(theta)
        bloch_vectors = []
        for a in angles_rad:
            bloch_vectors.append({
                "x": float(math.sin(a)),
                "y": 0.0,
                "z": float(math.cos(a)),
            })

        meta = GRADE_INFO[pred_grade]

        return PredictionResponse(
            grade=pred_grade,
            grade_name=meta["name"],
            confidence=round(confidence, 4),
            probabilities=[round(p, 4) for p in probs],
            angles_rad=[round(a, 4) for a in angles_rad],
            angles_deg=[round(d, 2) for d in angles_deg],
            quantum_expectations=[round(e, 4) for e in q_expectations],
            bloch_vectors=bloch_vectors,
            triage_urgency=meta["urgency"],
            recommendation=meta["recommendation"],
            clinical_stakes=meta["clinical_stakes"],
            clahe_image_b64=b64_preview,
            latency_ms=round(elapsed_ms, 2),
            hardware_profile="PennyLane StateVector / IBM Brisbane Transpiled Profile (Depth 25)",
        )

    @torch.no_grad()
    def infer_from_features(self, feat_list: List[float]) -> PredictionResponse:
        t0 = time.perf_counter()
        if len(feat_list) != 512:
            raise ValueError(f"Expected 512 features, received {len(feat_list)}")

        features = torch.tensor(feat_list, dtype=torch.float32).unsqueeze(0)
        angles = self.autoencoder.encode(features)
        q_exp = self.quantum_layer(angles)
        logits = self.head(q_exp)
        probs = F.softmax(logits, dim=-1).squeeze(0).numpy().tolist()

        elapsed_ms = (time.perf_counter() - t0) * 1000.0

        pred_grade = int(np.argmax(probs))
        confidence = float(probs[pred_grade])

        angles_rad = angles.squeeze(0).numpy().tolist()
        angles_deg = [float(math.degrees(a)) for a in angles_rad]
        q_expectations = q_exp.squeeze(0).numpy().tolist()

        bloch_vectors = [
            {"x": float(math.sin(a)), "y": 0.0, "z": float(math.cos(a))}
            for a in angles_rad
        ]

        meta = GRADE_INFO[pred_grade]

        return PredictionResponse(
            grade=pred_grade,
            grade_name=meta["name"],
            confidence=round(confidence, 4),
            probabilities=[round(p, 4) for p in probs],
            angles_rad=[round(a, 4) for a in angles_rad],
            angles_deg=[round(d, 2) for d in angles_deg],
            quantum_expectations=[round(e, 4) for e in q_expectations],
            bloch_vectors=bloch_vectors,
            triage_urgency=meta["urgency"],
            recommendation=meta["recommendation"],
            clinical_stakes=meta["clinical_stakes"],
            clahe_image_b64=None,
            latency_ms=round(elapsed_ms, 2),
            hardware_profile="PennyLane StateVector / IBM Brisbane Transpiled Profile (Depth 25)",
        )


# Global Engine Instance
_engine: Optional[HQNNInferenceEngine] = None

def get_engine() -> HQNNInferenceEngine:
    global _engine
    if _engine is None:
        _engine = HQNNInferenceEngine()
    return _engine


@router.post("/image", response_model=PredictionResponse)
async def predict_image(file: UploadFile = File(...)):
    """Upload a retinal fundus image (.png, .jpg, .jpeg) for end-to-end HQNN grading."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file submitted.")

    try:
        engine = get_engine()
        tensor, b64_preview = engine.preprocess_image(content)
        result = engine.infer_from_tensor(tensor, b64_preview=b64_preview)
        return result
    except ValueError as ve:
        err_msg = str(ve)
        if "OOD_IMAGE:" in err_msg:
            clean_reason = err_msg.replace("OOD_IMAGE:", "").strip()
            raise HTTPException(
                status_code=422,
                detail=f"Out-of-Distribution Image Rejected: {clean_reason} Only authentic ocular retinal fundus scans can be evaluated for diabetic retinopathy.",
            )
        raise HTTPException(status_code=400, detail=err_msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference pipeline error: {str(e)}")


@router.post("/features", response_model=PredictionResponse)
async def predict_features(payload: FeatureInferenceRequest):
    """Directly submit a 512-dimensional feature embedding for low-latency quantum evaluation."""
    try:
        engine = get_engine()
        return engine.infer_from_features(payload.features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feature inference error: {str(e)}")

