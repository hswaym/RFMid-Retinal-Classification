"""Extracts 512-d ResNet18 features and fits/trains all three compression modules.

Workflow:
1. Loads truncated ResNet18 feature extractor (from checkpoints/resnet18_baseline.pt).
2. Passes preprocessed training images through the backbone to obtain 512-d feature representations.
3. Fits PCACompressor (4-qubit and 8-qubit) -> checkpoints/pca_4qubit.joblib, pca_8qubit.joblib.
4. Trains FeatureAutoencoder (4-qubit and 8-qubit) -> checkpoints/autoencoder_4qubit.pt, autoencoder_8qubit.pt.
5. Saves BottleneckLinear checkpoints -> checkpoints/bottleneck_linear_4qubit.pt, bottleneck_linear_8qubit.pt.
"""

from pathlib import Path
from typing import Optional, Tuple
import albumentations as A
from albumentations.pytorch import ToTensorV2
import numpy as np
import pandas as pd
import torch
from torch.utils.data import DataLoader
from tqdm import tqdm

from src.classical.resnet_baseline import get_feature_extractor
from src.classical.train_classical import PreprocessedRetinalDataset, get_or_create_splits
from src.compression.autoencoder import FeatureAutoencoder, train_autoencoder
from src.compression.bottleneck_linear import BottleneckLinear
from src.compression.pca_compressor import PCACompressor


def extract_split_features(
    feature_extractor: torch.nn.Module,
    loader: DataLoader,
    device: torch.device,
) -> Tuple[torch.Tensor, torch.Tensor]:
    """Extracts 512-d features and corresponding labels from a DataLoader."""
    feature_extractor.eval()
    all_features = []
    all_labels = []

    with torch.no_grad():
        for images, labels in tqdm(loader, desc="Extracting Features", leave=False):
            images = images.to(device)
            feats = feature_extractor(images)
            all_features.append(feats.cpu())
            all_labels.append(labels.cpu())

    features_tensor = torch.cat(all_features, dim=0)
    labels_tensor = torch.cat(all_labels, dim=0)
    return features_tensor, labels_tensor


def run_compression_pipeline(
    checkpoint_path: str = "checkpoints/resnet18_baseline.pt",
    ae_epochs: int = 20,
    batch_size: int = 32,
    subset: Optional[int] = None,
) -> None:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("=================================================================")
    print("      ResNet18 Feature Extraction & Compressor Training Pipeline")
    print(f"      Device: {device} | Checkpoint: {checkpoint_path}")
    print("=================================================================")

    # 1. Load Feature Extractor
    feature_extractor = get_feature_extractor(
        pretrained=True,
        freeze_backbone=True,
        checkpoint_path=checkpoint_path,
    ).to(device)

    # 2. Prepare Data Loader
    train_df, val_df, _ = get_or_create_splits()
    if subset:
        print(f">> Debug mode: using {subset} samples")
        train_df = train_df.head(subset)
        val_df = val_df.head(subset)

    eval_transform = A.Compose(
        [
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ]
    )

    image_dir = Path("data/aptos2019/train_images")
    cache_dir = Path("data/processed_224")

    train_ds = PreprocessedRetinalDataset(train_df, image_dir=image_dir, cache_dir=cache_dir, transform=eval_transform)
    val_ds = PreprocessedRetinalDataset(val_df, image_dir=image_dir, cache_dir=cache_dir, transform=eval_transform)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    # 3. Extract Features
    print(f"\nExtracting 512-d features for {len(train_ds)} train samples...")
    train_features, train_labels = extract_split_features(feature_extractor, train_loader, device)
    print(f"Extracted Train Features: {list(train_features.shape)}")

    print(f"Extracting 512-d features for {len(val_ds)} val samples...")
    val_features, val_labels = extract_split_features(feature_extractor, val_loader, device)
    print(f"Extracted Val Features:   {list(val_features.shape)}")

    # Cache features to disk
    feat_dir = Path("data/features")
    feat_dir.mkdir(parents=True, exist_ok=True)
    torch.save({"features": train_features, "labels": train_labels}, feat_dir / "train_features_512.pt")
    torch.save({"features": val_features, "labels": val_labels}, feat_dir / "val_features_512.pt")
    print(f"Saved extracted features to: {feat_dir}")

    checkpoints_dir = Path("checkpoints")
    checkpoints_dir.mkdir(exist_ok=True)

    # 4. Fit PCA Compressors (4 and 8 components)
    print("\n-------------------------------------------------------")
    print("Fitting PCA Compressors (4 and 8 components)...")
    pca_4 = PCACompressor(n_components=4, scale_pi=True).fit(train_features)
    pca_4.save(checkpoints_dir / "pca_4qubit.joblib")

    pca_8 = PCACompressor(n_components=8, scale_pi=True).fit(train_features)
    pca_8.save(checkpoints_dir / "pca_8qubit.joblib")

    # 5. Train Autoencoder Compressors (4 and 8 bottleneck)
    print("\n-------------------------------------------------------")
    print("Training Feature Autoencoders (4-d and 8-d bottlenecks)...")
    ae_4 = FeatureAutoencoder(in_features=512, latent_dim=4, scale_pi=True)
    train_autoencoder(
        ae_4,
        train_features=train_features,
        val_features=val_features,
        epochs=ae_epochs,
        batch_size=batch_size,
        save_path=checkpoints_dir / "autoencoder_4qubit.pt",
        device=str(device),
    )
    print("Saved 4-qubit autoencoder to checkpoints/autoencoder_4qubit.pt")

    ae_8 = FeatureAutoencoder(in_features=512, latent_dim=8, scale_pi=True)
    train_autoencoder(
        ae_8,
        train_features=train_features,
        val_features=val_features,
        epochs=ae_epochs,
        batch_size=batch_size,
        save_path=checkpoints_dir / "autoencoder_8qubit.pt",
        device=str(device),
    )
    print("Saved 8-qubit autoencoder to checkpoints/autoencoder_8qubit.pt")

    # 6. Initialize and Save BottleneckLinear layers
    print("\n-------------------------------------------------------")
    print("Initializing BottleneckLinear Compressors...")
    bl_4 = BottleneckLinear(in_features=512, n_qubits=4, scale_pi=True)
    bl_4.save(checkpoints_dir / "bottleneck_linear_4qubit.pt")

    bl_8 = BottleneckLinear(in_features=512, n_qubits=8, scale_pi=True)
    bl_8.save(checkpoints_dir / "bottleneck_linear_8qubit.pt")
    print("Saved linear bottlenecks to checkpoints/bottleneck_linear_*.pt")

    print("\n=======================================================")
    print(" Compressor Fitting Pipeline Completed Successfully!")
    print(" All 3 compressors (4 & 8 qubits) are saved and ready.")
    print("=======================================================")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Fit and Save Feature Compressors")
    parser.add_argument("--checkpoint", type=str, default="checkpoints/resnet18_baseline.pt")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--subset", type=int, default=None)
    args = parser.parse_args()

    run_compression_pipeline(
        checkpoint_path=args.checkpoint,
        ae_epochs=args.epochs,
        batch_size=args.batch_size,
        subset=args.subset,
    )
