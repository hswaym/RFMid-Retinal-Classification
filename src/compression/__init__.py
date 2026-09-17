"""Feature compression modules for Quantum State Preparation.

Provides three interchangeable modules to compress high-dimensional classical
features (512-dim or 1280-dim) down to 4 or 8 normalized qubit angles in [-pi, pi]:
1. BottleneckLinear: Trainable end-to-end linear projection with tanh * pi scaling.
2. FeatureAutoencoder: Non-linear bottleneck autoencoder trained with reconstruction MSE.
3. PCACompressor: Unsupervised statistical projection via Principal Component Analysis.
"""

from pathlib import Path
from typing import Optional, Union
import torch.nn as nn

from src.compression.autoencoder import FeatureAutoencoder, train_autoencoder
from src.compression.bottleneck_linear import BottleneckLinear
from src.compression.pca_compressor import PCACompressor


def get_compressor(
    method: str = "linear",
    in_features: int = 512,
    n_qubits: int = 4,
    checkpoint_path: Optional[Union[str, Path]] = None,
) -> nn.Module:
    """Factory function returning an interchangeable compression module.

    All returned modules implement forward(x: Tensor [B, in_features]) -> Tensor [B, n_qubits]
    with values normalized in [-pi, pi].

    Args:
        method: One of 'linear', 'autoencoder', or 'pca'.
        in_features: Input feature dimension from backbone (default: 512).
        n_qubits: Target number of qubits / dimensions (4 or 8).
        checkpoint_path: Path to pre-trained weights/model if loading.

    Returns:
        PyTorch Module executing the compression stage.
    """
    method_clean = method.lower().strip()

    if method_clean in ("linear", "bottleneck"):
        if checkpoint_path and Path(checkpoint_path).exists():
            return BottleneckLinear.load(checkpoint_path)
        return BottleneckLinear(in_features=in_features, n_qubits=n_qubits, scale_pi=True)

    elif method_clean in ("autoencoder", "ae"):
        if checkpoint_path and Path(checkpoint_path).exists():
            model = FeatureAutoencoder.load(checkpoint_path)
        else:
            model = FeatureAutoencoder(in_features=in_features, latent_dim=n_qubits, scale_pi=True)

        class AEEncoderWrapper(nn.Module):
            def __init__(self, ae: FeatureAutoencoder):
                super().__init__()
                self.ae = ae

            def forward(self, x):
                return self.ae.encode(x)

        return AEEncoderWrapper(model)

    elif method_clean == "pca":
        if checkpoint_path and Path(checkpoint_path).exists():
            return PCACompressor.load(checkpoint_path)
        return PCACompressor(n_components=n_qubits, scale_pi=True)

    else:
        raise ValueError(f"Unknown compression method: {method}. Choose from 'linear', 'autoencoder', 'pca'.")


__all__ = [
    "BottleneckLinear",
    "FeatureAutoencoder",
    "PCACompressor",
    "get_compressor",
    "train_autoencoder",
]
