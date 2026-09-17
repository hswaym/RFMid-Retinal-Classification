"""Principal Component Analysis (PCA) Feature Compressor.

Fits sklearn.decomposition.PCA with n_components=4 or 8 on classical feature vectors.
Normalizes principal components to [-pi, pi] for direct compatibility with
PennyLane AngleEmbedding circuits.
"""

from pathlib import Path
from typing import Optional, Tuple, Union
import joblib
import numpy as np
import torch
import torch.nn as nn
from sklearn.decomposition import PCA


class PCACompressor(nn.Module):
    """Unsupervised PCA compression mapping 512-d features to 4 or 8 dimensions.

    Exposes both scikit-learn fit/transform methods and PyTorch nn.Module forward()
    so it can be plugged seamlessly into the hybrid quantum model.
    """

    def __init__(
        self,
        n_components: int = 4,
        scale_pi: bool = True,
        whiten: bool = False,
    ) -> None:
        super().__init__()
        self.n_components = n_components
        self.scale_pi = scale_pi
        self.whiten = whiten

        self.pca = PCA(n_components=n_components, whiten=whiten)
        self.is_fitted = False
        self.feature_min: Optional[np.ndarray] = None
        self.feature_max: Optional[np.ndarray] = None

    def fit(self, X: Union[np.ndarray, torch.Tensor]) -> "PCACompressor":
        """Fits PCA on the training feature representations."""
        if isinstance(X, torch.Tensor):
            X_np = X.detach().cpu().numpy()
        else:
            X_np = np.asarray(X)

        transformed = self.pca.fit_transform(X_np)
        self.feature_min = transformed.min(axis=0)
        self.feature_max = transformed.max(axis=0)
        self.is_fitted = True

        var_explained = float(np.sum(self.pca.explained_variance_ratio_)) * 100.0
        print(
            f"Fitted PCA ({self.n_components} components) | "
            f"Total Explained Variance: {var_explained:.2f}%"
        )
        return self

    def transform(
        self,
        X: Union[np.ndarray, torch.Tensor],
        to_torch: bool = True,
    ) -> Union[np.ndarray, torch.Tensor]:
        """Transforms features to compressed angles in [-pi, pi]."""
        if not self.is_fitted:
            raise RuntimeError("PCACompressor must be fitted before transform().")

        is_tensor = isinstance(X, torch.Tensor)
        device = X.device if is_tensor else torch.device("cpu")

        if is_tensor:
            X_np = X.detach().cpu().numpy()
        else:
            X_np = np.asarray(X)

        projected = self.pca.transform(X_np)

        # Normalize to [-1, 1] using fitted bounds with numerical epsilon
        denom = (self.feature_max - self.feature_min) + 1e-7
        normalized = 2.0 * (projected - self.feature_min) / denom - 1.0
        normalized = np.clip(normalized, -1.0, 1.0)

        if self.scale_pi:
            angles = normalized * np.pi
        else:
            angles = normalized

        if to_torch or is_tensor:
            return torch.from_numpy(angles).float().to(device)
        return angles

    def forward(self, X: torch.Tensor) -> torch.Tensor:
        """PyTorch Module forward method for seamless hybrid pipeline integration."""
        return self.transform(X, to_torch=True)

    def fit_transform(
        self,
        X: Union[np.ndarray, torch.Tensor],
    ) -> Union[np.ndarray, torch.Tensor]:
        self.fit(X)
        return self.transform(X)

    def save(self, path: Union[str, Path]) -> None:
        """Saves fitted PCA compressor to disk using joblib."""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "pca": self.pca,
            "n_components": self.n_components,
            "scale_pi": self.scale_pi,
            "whiten": self.whiten,
            "is_fitted": self.is_fitted,
            "feature_min": self.feature_min,
            "feature_max": self.feature_max,
        }
        joblib.dump(data, path)
        print(f"Saved PCA compressor to: {path}")

    @classmethod
    def load(cls, path: Union[str, Path]) -> "PCACompressor":
        """Loads a saved PCA compressor."""
        data = joblib.load(path)
        instance = cls(
            n_components=data["n_components"],
            scale_pi=data["scale_pi"],
            whiten=data["whiten"],
        )
        instance.pca = data["pca"]
        instance.is_fitted = data["is_fitted"]
        instance.feature_min = data["feature_min"]
        instance.feature_max = data["feature_max"]
        return instance


if __name__ == "__main__":
    print("Testing PCACompressor...")
    dummy_features = torch.randn(100, 512)

    # 4-component PCA
    pca4 = PCACompressor(n_components=4)
    angles4 = pca4.fit_transform(dummy_features)
    print(f"PCA-4 Output Shape: {list(angles4.shape)} (Expected: [100, 4])")
    print(f"Angle range: [{angles4.min().item():.3f}, {angles4.max().item():.3f}]")

    # 8-component PCA
    pca8 = PCACompressor(n_components=8)
    angles8 = pca8.fit_transform(dummy_features)
    print(f"PCA-8 Output Shape: {list(angles8.shape)} (Expected: [100, 8])")

    # Test save and reload
    test_path = Path("checkpoints/test_pca4.joblib")
    pca4.save(test_path)
    loaded_pca = PCACompressor.load(test_path)
    test_out = loaded_pca(dummy_features[:5])
    assert torch.allclose(angles4[:5], test_out)
    if test_path.exists():
        test_path.unlink()
    print("PCA save/load verification passed!")
