"""End-to-End Hybrid Quantum-Classical Convolutional Neural Network (HQNN).

Chains:
(a) Classical Feature Extractor: ResNet18 (ImageNet-pretrained / fine-tuned) -> 512-d.
(b) Compression Stage: Linear Bottleneck / Autoencoder / PCA -> 4-d or 8-d in [-pi, pi].
(c) Parameterized Quantum Circuit: PennyLane TorchLayer (AngleEmbedding + StronglyEntanglingLayers + PauliZ) -> n_qubits.
(d) Classification Head: Linear(n_qubits, 5) -> 5 DR severity grades.
"""

from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Union
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

from src.classical.resnet_baseline import get_feature_extractor
from src.compression import get_compressor
from src.quantum.circuits import load_circuit_config
from src.quantum.torch_layer import get_quantum_torch_layer


class HybridQuantumCNN(nn.Module):
    """Hybrid Quantum-Classical CNN for Retinal Disease Classification.

    Args:
        backbone_checkpoint: Path to fine-tuned ResNet18 weights (default: checkpoints/resnet18_baseline.pt).
        freeze_backbone: Whether to freeze backbone weights during training (default: True).
        compression_method: 'linear', 'autoencoder', or 'pca' (default: 'linear').
        compressor_checkpoint: Path to pre-trained compressor weights if available.
        n_qubits: Number of qubits in quantum register (default: 4).
        n_layers: Ansatz depth for StronglyEntanglingLayers (default: 1).
        dev_name: PennyLane device identifier (default: 'default.qubit').
        shots: Measurement shots (None for exact autograd backpropagation).
        num_classes: Number of target severity classes (default: 5).
    """

    def __init__(
        self,
        backbone_checkpoint: Optional[Union[str, Path]] = "checkpoints/resnet18_baseline.pt",
        freeze_backbone: bool = True,
        compression_method: str = "linear",
        compressor_checkpoint: Optional[Union[str, Path]] = None,
        n_qubits: int = 4,
        n_layers: int = 1,
        dev_name: str = "default.qubit",
        shots: Optional[int] = None,
        num_classes: int = 5,
    ) -> None:
        super().__init__()
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        self.compression_method = compression_method
        self.num_classes = num_classes

        # Stage 1: Classical Feature Extractor (512-dim output)
        self.backbone = get_feature_extractor(
            pretrained=True,
            freeze_backbone=freeze_backbone,
            checkpoint_path=backbone_checkpoint,
        )
        self.in_features = self.backbone.feature_dim  # 512

        # Stage 2: Interchangeable Dimensionality Compression (512 -> n_qubits in [-pi, pi])
        self.compressor = get_compressor(
            method=compression_method,
            in_features=self.in_features,
            n_qubits=n_qubits,
            checkpoint_path=compressor_checkpoint,
        )

        # Stage 3: Parameterized Quantum Circuit (PQC) Decision Layer
        self.quantum_layer = get_quantum_torch_layer(
            n_qubits=n_qubits,
            n_layers=n_layers,
            dev_name=dev_name,
            shots=shots,
        )

        # Stage 4: Classical Linear Classification Head
        self.head = nn.Linear(n_qubits, num_classes)

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        """Extracts 512-d embeddings through ResNet18."""
        return self.backbone(x)

    def forward_from_features(self, features: torch.Tensor) -> torch.Tensor:
        """Executes the pipeline starting from pre-extracted 512-d features.

        Enables fast quantum training loops without recomputing image convolutions.
        Handles device bridging between classical PyTorch modules (GPU/CUDA)
        and PennyLane simulator devices (e.g. default.qubit on CPU).
        """
        # Compress to quantum rotation angles in [-pi, pi]
        angles = self.compressor(features)

        # Move to CPU for PennyLane quantum simulation
        angles_cpu = angles.cpu()
        q_out = self.quantum_layer(angles_cpu)

        # Transfer back to original device before classical classification head
        q_out = q_out.to(features.device)

        # Final linear classification head
        logits = self.head(q_out)
        return logits

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Full end-to-end forward pass from raw 224x224 images to DR class logits.

        Args:
            x: Input images of shape (B, 3, 224, 224).

        Returns:
            Logits of shape (B, num_classes).
        """
        features = self.extract_features(x)
        logits = self.forward_from_features(features)
        return logits

    def predict_proba(self, x: torch.Tensor) -> torch.Tensor:
        """Returns softmax class probabilities."""
        logits = self.forward(x)
        return F.softmax(logits, dim=-1)

    def get_parameter_breakdown(self) -> Dict[str, int]:
        """Provides parameter accounting across classical, compression, and quantum stages."""
        backbone_total = sum(p.numel() for p in self.backbone.parameters())
        backbone_trainable = sum(p.numel() for p in self.backbone.parameters() if p.requires_grad)

        compressor_total = sum(p.numel() for p in self.compressor.parameters())
        compressor_trainable = sum(p.numel() for p in self.compressor.parameters() if p.requires_grad)

        quantum_trainable = self.quantum_layer.weights.numel()
        head_trainable = sum(p.numel() for p in self.head.parameters() if p.requires_grad)

        total_trainable = (
            backbone_trainable + compressor_trainable + quantum_trainable + head_trainable
        )

        return {
            "backbone_total": backbone_total,
            "backbone_trainable": backbone_trainable,
            "compressor_trainable": compressor_trainable,
            "quantum_trainable": quantum_trainable,
            "head_trainable": head_trainable,
            "total_trainable": total_trainable,
        }


def get_hybrid_model_from_config(config_path: Union[str, Path]) -> HybridQuantumCNN:
    """Instantiates a complete HybridQuantumCNN from a YAML configuration file."""
    import yaml

    config_path = Path(config_path)
    with open(config_path, "r") as f:
        cfg = yaml.safe_load(f)

    model_cfg = cfg.get("model", {})
    quantum_cfg = cfg.get("quantum", {})

    return HybridQuantumCNN(
        backbone_checkpoint=model_cfg.get("backbone_checkpoint", "checkpoints/resnet18_baseline.pt"),
        freeze_backbone=model_cfg.get("freeze_backbone", True),
        compression_method=model_cfg.get("compression_method", "linear"),
        compressor_checkpoint=model_cfg.get("compressor_checkpoint", None),
        n_qubits=quantum_cfg.get("n_qubits", 4),
        n_layers=quantum_cfg.get("n_layers", 1),
        dev_name=quantum_cfg.get("device", "default.qubit"),
        shots=quantum_cfg.get("shots", None),
        num_classes=model_cfg.get("num_classes", 5),
    )


if __name__ == "__main__":
    print("=================================================================")
    print("        Hybrid Quantum-Classical CNN (Prompt 3.4 Verification)   ")
    print("=================================================================")

    model = HybridQuantumCNN(
        backbone_checkpoint=None,  # Use default ImageNet weights for testing
        freeze_backbone=True,
        compression_method="linear",
        n_qubits=4,
        n_layers=1,
        num_classes=5,
    )

    summary = model.get_parameter_breakdown()
    print("Parameter Breakdown:")
    print(f"  Backbone (ResNet18 - Frozen):  {summary['backbone_total']:,}")
    print(f"  Linear Bottleneck (512 -> 4):  {summary['compressor_trainable']:,}")
    print(f"  Quantum Circuit (4 Qubits):    {summary['quantum_trainable']:,}")
    print(f"  Classification Head (4 -> 5):  {summary['head_trainable']:,}")
    print(f"  -------------------------------------------------------------")
    print(f"  Total Decision Trainable Params: {summary['total_trainable']:,}")
    print(f"  Classical Head Comparison:       2,565 (512 -> 5)")
    print("=================================================================")

    # Verification on batch of images: Forward & Backward pass
    print("\nRunning Forward Pass on Batch of Images [2, 3, 224, 224]...")
    dummy_images = torch.randn(2, 3, 224, 224)
    logits = model(dummy_images)

    print(f"Logits Output Shape: {list(logits.shape)} (Expected: [2, 5])")
    print(f"Logits Sample Values:\n{logits.detach().numpy()}")

    probs = model.predict_proba(dummy_images)
    print(f"Probabilities Shape: {list(probs.shape)} (Row sums: {probs.sum(dim=-1).detach().numpy()})")

    # Backward pass & Autograd gradient check
    print("\nRunning Backward Pass (.backward())...")
    loss = F.cross_entropy(logits, torch.tensor([0, 4]))
    loss.backward()

    assert model.quantum_layer.weights.grad is not None, "Quantum layer did not receive gradients!"
    assert model.compressor.linear.weight.grad is not None, "Compressor did not receive gradients!"
    assert model.head.weight.grad is not None, "Classification head did not receive gradients!"

    print("Gradients successfully flowed end-to-end:")
    print(f"  Head Weight Grad Shape:        {list(model.head.weight.grad.shape)}")
    print(f"  Quantum Weights Grad Shape:    {list(model.quantum_layer.weights.grad.shape)}")
    print(f"  Compressor Weight Grad Shape:  {list(model.compressor.linear.weight.grad.shape)}")
    print("\n[PASS] Prompt 3.4 Verification: End-to-end forward and backward passed cleanly!")
    print("=================================================================")
