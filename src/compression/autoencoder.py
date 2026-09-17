"""Autoencoder Compression for ResNet Feature Representations.

Trained to reconstruct the 512-dimensional classical feature vectors
while forcing information through a 4-dimensional or 8-dimensional bottleneck.
The latent bottleneck is normalized via tanh * pi to [-pi, pi] for direct
quantum angle embedding.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from tqdm import tqdm


class FeatureAutoencoder(nn.Module):
    """Deep autoencoder compressing 512-d features into 4-d or 8-d latent space.

    Args:
        in_features: Input feature dimension (default: 512).
        latent_dim: Bottleneck dimension / qubit count (default: 4).
        scale_pi: Scale latent output by pi to [-pi, pi] (default: True).
    """

    def __init__(
        self,
        in_features: int = 512,
        latent_dim: int = 4,
        scale_pi: bool = True,
    ) -> None:
        super().__init__()
        self.in_features = in_features
        self.latent_dim = latent_dim
        self.scale_pi = scale_pi

        # Encoder: 512 -> 256 -> 64 -> latent_dim
        self.encoder = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.BatchNorm1d(256),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Dropout(0.1),
            nn.Linear(256, 64),
            nn.BatchNorm1d(64),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(64, latent_dim),
            nn.Tanh(),
        )

        # Decoder: latent_dim -> 64 -> 256 -> 512
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 64),
            nn.BatchNorm1d(64),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(64, 256),
            nn.BatchNorm1d(256),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(256, in_features),
        )

    def encode(self, x: torch.Tensor) -> torch.Tensor:
        """Compresses 512-d features to latent angles in [-pi, pi].

        Args:
            x: Feature tensor of shape (B, in_features).

        Returns:
            Latent angles of shape (B, latent_dim).
        """
        z = self.encoder(x)
        if self.scale_pi:
            z = z * np.pi
        return z

    def decode(self, z: torch.Tensor) -> torch.Tensor:
        """Reconstructs 512-d features from latent representation.

        Args:
            z: Latent tensor of shape (B, latent_dim).

        Returns:
            Reconstructed feature tensor of shape (B, in_features).
        """
        # If scaled by pi, unscale before feeding to decoder for numerical consistency
        if self.scale_pi:
            z = z / np.pi
        return self.decoder(z)

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """Forward pass returning (reconstructed, latent_angles)."""
        z = self.encode(x)
        reconstructed = self.decode(z)
        return reconstructed, z

    def save(self, path: Union[str, Path]) -> None:
        """Saves autoencoder weights and parameters."""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        torch.save(
            {
                "state_dict": self.state_dict(),
                "in_features": self.in_features,
                "latent_dim": self.latent_dim,
                "scale_pi": self.scale_pi,
            },
            path,
        )

    @classmethod
    def load(cls, path: Union[str, Path], map_location: str = "cpu") -> "FeatureAutoencoder":
        """Loads a saved FeatureAutoencoder model."""
        checkpoint = torch.load(path, map_location=map_location)
        model = cls(
            in_features=checkpoint["in_features"],
            latent_dim=checkpoint["latent_dim"],
            scale_pi=checkpoint.get("scale_pi", True),
        )
        model.load_state_dict(checkpoint["state_dict"])
        return model


def train_autoencoder(
    model: FeatureAutoencoder,
    train_features: torch.Tensor,
    val_features: Optional[torch.Tensor] = None,
    epochs: int = 25,
    batch_size: int = 32,
    lr: float = 1e-3,
    save_path: Optional[Union[str, Path]] = None,
    device: str = "cpu",
) -> Dict[str, List[float]]:
    """Trains the autoencoder on extracted feature vectors using MSE reconstruction loss."""
    dev = torch.device(device)
    model = model.to(dev)

    train_ds = TensorDataset(train_features)
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)

    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.MSELoss()
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    history = {"train_loss": [], "val_loss": []}
    best_val_loss = float("inf")

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0

        for (batch_x,) in train_loader:
            batch_x = batch_x.to(dev)
            optimizer.zero_grad()
            reconstructed, _ = model(batch_x)
            loss = criterion(reconstructed, batch_x)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * len(batch_x)

        train_loss = total_loss / len(train_features)
        history["train_loss"].append(train_loss)
        scheduler.step()

        val_loss_str = ""
        if val_features is not None:
            model.eval()
            with torch.no_grad():
                val_x = val_features.to(dev)
                val_rec, _ = model(val_x)
                v_loss = criterion(val_rec, val_x).item()
                history["val_loss"].append(v_loss)
                val_loss_str = f" | Val MSE: {v_loss:.5f}"

                if v_loss < best_val_loss and save_path:
                    best_val_loss = v_loss
                    model.save(save_path)

        if epoch % 5 == 0 or epoch == 1:
            print(f"AE Epoch [{epoch:02d}/{epochs:02d}] Train MSE: {train_loss:.5f}{val_loss_str}")

    if save_path and val_features is None:
        model.save(save_path)

    return history


if __name__ == "__main__":
    print("Testing FeatureAutoencoder...")
    ae4 = FeatureAutoencoder(in_features=512, latent_dim=4)
    ae8 = FeatureAutoencoder(in_features=512, latent_dim=8)

    dummy_x = torch.randn(16, 512)
    rec4, z4 = ae4(dummy_x)
    rec8, z8 = ae8(dummy_x)

    print(f"4-d Latent Shape: {list(z4.shape)} (Expected: [16, 4])")
    print(f"4-d Recon Shape:  {list(rec4.shape)} (Expected: [16, 512])")
    print(f"8-d Latent Shape: {list(z8.shape)} (Expected: [16, 8])")
    print(f"Latent bounds:    Min={z4.min().item():.3f}, Max={z4.max().item():.3f} (within [-pi, pi])")

    # Fast training loop check
    print("Verifying quick training run (3 epochs)...")
    history = train_autoencoder(ae4, dummy_x, epochs=3, batch_size=8)
    print(f"Train MSE: {history['train_loss']}")
