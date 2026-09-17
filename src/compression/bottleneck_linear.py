"""Linear Bottleneck Compression for Quantum State Encoding.

Maps high-dimensional classical feature vectors (e.g., 512 from ResNet18 or 1280 from MobileNetV2)
to an n-qubit representation (4 or 8) with tanh activation scaled to [-pi, pi]
for direct input to PennyLane AngleEmbedding.
"""

from pathlib import Path
from typing import Union
import numpy as np
import torch
import torch.nn as nn


class BottleneckLinear(nn.Module):
    """Linear projection followed by tanh scaling to [-pi, pi].

    Args:
        in_features: Input feature dimension (default: 512).
        n_qubits: Number of target qubits / compressed dimensions (default: 4).
        scale_pi: Whether to scale tanh output by pi to map into [-pi, pi] (default: True).
    """

    def __init__(
        self,
        in_features: int = 512,
        n_qubits: int = 4,
        scale_pi: bool = True,
    ) -> None:
        super().__init__()
        self.in_features = in_features
        self.n_qubits = n_qubits
        self.scale_pi = scale_pi

        self.linear = nn.Linear(in_features, n_qubits)
        self.tanh = nn.Tanh()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Projects input features to n_qubits angles in [-pi, pi].

        Args:
            x: Input feature tensor of shape (B, in_features).

        Returns:
            Normalized angle tensor of shape (B, n_qubits) in range [-pi, pi].
        """
        x = self.linear(x)
        angles = self.tanh(x)
        if self.scale_pi:
            angles = angles * np.pi
        return angles

    def save(self, path: Union[str, Path]) -> None:
        """Saves layer weights and configuration."""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        torch.save(
            {
                "state_dict": self.state_dict(),
                "in_features": self.in_features,
                "n_qubits": self.n_qubits,
                "scale_pi": self.scale_pi,
            },
            path,
        )

    @classmethod
    def load(cls, path: Union[str, Path], map_location: str = "cpu") -> "BottleneckLinear":
        """Loads a saved BottleneckLinear model."""
        checkpoint = torch.load(path, map_location=map_location)
        model = cls(
            in_features=checkpoint["in_features"],
            n_qubits=checkpoint["n_qubits"],
            scale_pi=checkpoint.get("scale_pi", True),
        )
        model.load_state_dict(checkpoint["state_dict"])
        return model


if __name__ == "__main__":
    print("Testing BottleneckLinear...")
    # 4-qubit compression
    comp4 = BottleneckLinear(in_features=512, n_qubits=4)
    dummy_feat = torch.randn(8, 512)
    angles4 = comp4(dummy_feat)

    print(f"4-Qubit Output Shape: {list(angles4.shape)} (Expected: [8, 4])")
    print(f"Values in [-pi, pi]: Min={angles4.min().item():.4f}, Max={angles4.max().item():.4f} (pi={np.pi:.4f})")

    # 8-qubit compression
    comp8 = BottleneckLinear(in_features=512, n_qubits=8)
    angles8 = comp8(dummy_feat)
    print(f"8-Qubit Output Shape: {list(angles8.shape)} (Expected: [8, 8])")

    # Test save/load
    test_save = Path("checkpoints/test_bottleneck4.pt")
    comp4.save(test_save)
    loaded = BottleneckLinear.load(test_save)
    assert torch.allclose(comp4(dummy_feat), loaded(dummy_feat))
    if test_save.exists():
        test_save.unlink()
    print("Save/load verification passed!")
