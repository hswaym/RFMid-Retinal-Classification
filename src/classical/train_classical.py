"""Classical Baseline Training Pipeline (ResNet18 and MobileNetV2).

Features:
- Stratified 70/15/15 dataset splitting saved to data/splits/ for reproducibility.
- Class-weighted multi-class Focal Loss to counteract clinical class imbalance.
- Data augmentation via Albumentations (flips, rotations, shifts).
- Preprocessing with Ben Graham circular cropping and green-channel CLAHE.
- Early stopping monitored on validation Macro-F1.
- Logging of Accuracy, Macro-F1, AUC-ROC, and Quadratic Weighted Kappa (QWK) to W&B.
- Checkpoint saving to checkpoints/resnet18_baseline.pt or checkpoints/mobilenet_v2_baseline.pt.
"""

import argparse
import json
import os
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import albumentations as A
from albumentations.pytorch import ToTensorV2
import cv2
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset
from tqdm import tqdm

from src.classical.mobilenet_baseline import get_mobilenet_v2_model
from src.classical.resnet_baseline import get_resnet18_model
from src.eval.metrics import compute_metrics
from src.preprocessing.ben_graham_crop import circle_crop_fov
from src.preprocessing.clahe import apply_green_channel_clahe


# ─────────────────────────────────────────────────────────────────────────────
# 1. Stratified 70/15/15 Data Splitter
# ─────────────────────────────────────────────────────────────────────────────

def get_or_create_splits(
    raw_csv: str = "data/aptos2019/train.csv",
    splits_dir: str = "data/splits",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Generates and saves stratified 70/15/15 train/val/test splits."""
    splits_path = Path(splits_dir)
    splits_path.mkdir(parents=True, exist_ok=True)

    train_file = splits_path / "train.csv"
    val_file = splits_path / "val.csv"
    test_file = splits_path / "test.csv"

    if train_file.exists() and val_file.exists() and test_file.exists():
        train_df = pd.read_csv(train_file)
        val_df = pd.read_csv(val_file)
        test_df = pd.read_csv(test_file)
        return train_df, val_df, test_df

    df = pd.read_csv(raw_csv)

    # First split: 70% train, 30% temp (val + test)
    train_df, temp_df = train_test_split(
        df,
        test_size=(val_ratio + test_ratio),
        random_state=seed,
        stratify=df["diagnosis"],
    )

    # Second split: split 30% equally into 15% val and 15% test
    val_df, test_df = train_test_split(
        temp_df,
        test_size=0.5,
        random_state=seed,
        stratify=temp_df["diagnosis"],
    )

    train_df = train_df.reset_index(drop=True)
    val_df = val_df.reset_index(drop=True)
    test_df = test_df.reset_index(drop=True)

    train_df.to_csv(train_file, index=False)
    val_df.to_csv(val_file, index=False)
    test_df.to_csv(test_file, index=False)
    print(f"Created stratified splits: Train={len(train_df)}, Val={len(val_df)}, Test={len(test_df)}")

    return train_df, val_df, test_df


# ─────────────────────────────────────────────────────────────────────────────
# 2. Class-Weighted Focal Loss
# ─────────────────────────────────────────────────────────────────────────────

class FocalLoss(nn.Module):
    """Multi-class Focal Loss with class balancing weights.

    FL(p_t) = -alpha_t * (1 - p_t)^gamma * log(p_t)
    """

    def __init__(
        self,
        alpha: Optional[torch.Tensor] = None,
        gamma: float = 2.0,
        reduction: str = "mean",
    ) -> None:
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        Args:
            inputs: Raw logits (B, C)
            targets: Class labels (B)
        """
        ce_loss = F.cross_entropy(inputs, targets, reduction="none")
        p_t = torch.exp(-ce_loss)
        focal_weight = (1.0 - p_t) ** self.gamma

        if self.alpha is not None:
            if self.alpha.device != inputs.device:
                self.alpha = self.alpha.to(inputs.device)
            alpha_t = self.alpha[targets]
            focal_loss = alpha_t * focal_weight * ce_loss
        else:
            focal_loss = focal_weight * ce_loss

        if self.reduction == "mean":
            return focal_loss.mean()
        elif self.reduction == "sum":
            return focal_loss.sum()
        return focal_loss


def calculate_class_weights(df: pd.DataFrame, num_classes: int = 5) -> torch.Tensor:
    """Computes normalized inverse-frequency class weights."""
    counts = df["diagnosis"].value_counts().sort_index()
    total = len(df)
    weights = []
    for c in range(num_classes):
        cnt = counts.get(c, 1)
        # Standard balanced weight: Total / (num_classes * count)
        w = total / (num_classes * cnt)
        weights.append(w)
    weights_tensor = torch.tensor(weights, dtype=torch.float)
    # Normalize weights so they average to 1.0
    weights_tensor = weights_tensor / weights_tensor.mean()
    return weights_tensor


# ─────────────────────────────────────────────────────────────────────────────
# 3. Preprocessed Retinal Fundus Dataset with Caching
# ─────────────────────────────────────────────────────────────────────────────

class PreprocessedRetinalDataset(Dataset):
    """Retinal fundus dataset applying Ben Graham Crop + Green CLAHE + Albumentations."""

    def __init__(
        self,
        df: pd.DataFrame,
        image_dir: Path,
        cache_dir: Optional[Path] = None,
        transform: Optional[A.Compose] = None,
    ) -> None:
        self.df = df.reset_index(drop=True)
        self.image_dir = Path(image_dir)
        self.cache_dir = Path(cache_dir) if cache_dir else None
        self.transform = transform

        if self.cache_dir:
            self.cache_dir.mkdir(parents=True, exist_ok=True)

    def __len__(self) -> int:
        return len(self.df)

    def _get_preprocessed_image(self, id_code: str) -> np.ndarray:
        """Loads and pre-processes the fundus image (with disk cache support)."""
        if self.cache_dir:
            cached_file = self.cache_dir / f"{id_code}.png"
            if cached_file.exists():
                img = cv2.imread(str(cached_file))
                if img is not None:
                    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        raw_path = self.image_dir / f"{id_code}.png"
        raw_bgr = cv2.imread(str(raw_path))
        if raw_bgr is None:
            raise FileNotFoundError(f"Cannot load image: {raw_path}")

        raw_rgb = cv2.cvtColor(raw_bgr, cv2.COLOR_BGR2RGB)
        # Step 1: Ben Graham circular crop + resize to 224x224
        cropped = circle_crop_fov(raw_rgb, output_size=224)
        # Step 2: Green-channel CLAHE
        enhanced = apply_green_channel_clahe(cropped, clip_limit=2.0, tile_grid_size=(8, 8))

        if self.cache_dir:
            cached_file = self.cache_dir / f"{id_code}.png"
            cv2.imwrite(str(cached_file), cv2.cvtColor(enhanced, cv2.COLOR_RGB2BGR))

        return enhanced

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        row = self.df.iloc[idx]
        id_code = str(row["id_code"])
        label = int(row["diagnosis"])

        image = self._get_preprocessed_image(id_code)

        if self.transform:
            augmented = self.transform(image=image)
            image_tensor = augmented["image"]
        else:
            image_tensor = ToTensorV2()(image=image)["image"].float() / 255.0

        label_tensor = torch.tensor(label, dtype=torch.long)
        return image_tensor, label_tensor


# ─────────────────────────────────────────────────────────────────────────────
# 4. Transforms
# ─────────────────────────────────────────────────────────────────────────────

def get_transforms() -> Tuple[A.Compose, A.Compose]:
    """Returns Albumentations train and validation/test pipelines."""
    train_transform = A.Compose(
        [
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.5),
            A.RandomRotate90(p=0.5),
            A.Affine(
                scale=(0.9, 1.1),
                translate_percent=(-0.06, 0.06),
                rotate=(-30, 30),
                p=0.5,
                border_mode=cv2.BORDER_CONSTANT,
            ),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ]
    )

    eval_transform = A.Compose(
        [
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ]
    )

    return train_transform, eval_transform


# ─────────────────────────────────────────────────────────────────────────────
# 5. Training & Evaluation Engine
# ─────────────────────────────────────────────────────────────────────────────

def train_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
) -> Tuple[float, float, float, float]:
    model.train()
    total_loss = 0.0
    all_preds = []
    all_targets = []

    for images, targets in tqdm(loader, desc="Training", leave=False):
        images = images.to(device)
        targets = targets.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * len(targets)
        preds = torch.argmax(outputs, dim=1)

        all_preds.extend(preds.cpu().numpy())
        all_targets.extend(targets.cpu().numpy())

    epoch_loss = total_loss / len(loader.dataset)
    metrics = compute_metrics(all_targets, all_preds)
    return epoch_loss, metrics["accuracy"], metrics["macro_f1"], metrics["qwk"]


def evaluate(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> Tuple[float, Dict[str, float], np.ndarray]:
    model.eval()
    total_loss = 0.0
    all_preds = []
    all_targets = []
    all_probs = []

    with torch.no_grad():
        for images, targets in tqdm(loader, desc="Evaluating", leave=False):
            images = images.to(device)
            targets = targets.to(device)

            outputs = model(images)
            loss = criterion(outputs, targets)
            probs = F.softmax(outputs, dim=1)

            total_loss += loss.item() * len(targets)
            preds = torch.argmax(outputs, dim=1)

            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(targets.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())

    avg_loss = total_loss / len(loader.dataset)
    metrics = compute_metrics(all_targets, all_preds, np.array(all_probs))
    metrics["loss"] = avg_loss
    return avg_loss, metrics, np.array(all_probs)


# ─────────────────────────────────────────────────────────────────────────────
# 6. Main Training Workflow
# ─────────────────────────────────────────────────────────────────────────────

def run_classical_training(
    model_name: str = "resnet18",
    epochs: int = 15,
    batch_size: int = 32,
    lr: float = 1e-4,
    gamma: float = 2.0,
    patience: int = 5,
    subset: Optional[int] = None,
    wandb_project: str = "hqnn-retinal-classification",
    wandb_mode: str = "offline",
) -> Dict[str, float]:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n=======================================================")
    print(f" Starting Classical Training: {model_name.upper()}")
    print(f" Device: {device} | Epochs: {epochs} | Batch Size: {batch_size} | LR: {lr}")
    print(f"=======================================================")

    # Setup splits
    train_df, val_df, test_df = get_or_create_splits()

    if subset is not None and subset > 0:
        print(f">> Running on debug subset: {subset} samples per split")
        train_df = train_df.head(subset)
        val_df = val_df.head(subset)
        test_df = test_df.head(subset)

    # Class weights for focal loss
    class_weights = calculate_class_weights(train_df).to(device)
    print("Class weights for Focal Loss (Grades 0..4):", [round(w.item(), 3) for w in class_weights])

    # Datasets and Loaders
    image_dir = Path("data/aptos2019/train_images")
    cache_dir = Path("data/processed_224")

    train_tf, eval_tf = get_transforms()
    train_dataset = PreprocessedRetinalDataset(train_df, image_dir=image_dir, cache_dir=cache_dir, transform=train_tf)
    val_dataset = PreprocessedRetinalDataset(val_df, image_dir=image_dir, cache_dir=cache_dir, transform=eval_tf)
    test_dataset = PreprocessedRetinalDataset(test_df, image_dir=image_dir, cache_dir=cache_dir, transform=eval_tf)

    # Use 0 workers on Windows to prevent multi-processing spawn overhead
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # Instantiate Model
    if model_name.lower() == "resnet18":
        model = get_resnet18_model(num_classes=5, pretrained=True)
        checkpoint_name = "resnet18_baseline.pt"
    elif model_name.lower() == "mobilenet_v2":
        model = get_mobilenet_v2_model(num_classes=5, pretrained=True)
        checkpoint_name = "mobilenet_v2_baseline.pt"
    else:
        raise ValueError(f"Unknown model name: {model_name}. Choose 'resnet18' or 'mobilenet_v2'.")

    model = model.to(device)

    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Model: {model_name} | Total Params: {total_params:,} | Trainable: {trainable_params:,}")

    # Loss, Optimizer & Scheduler
    criterion = FocalLoss(alpha=class_weights, gamma=gamma)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=2)

    # W&B Init (with graceful offline fallback)
    use_wandb = False
    try:
        import wandb
        wandb.init(
            project=wandb_project,
            name=f"{model_name}_baseline",
            mode=wandb_mode,
            config={
                "model": model_name,
                "epochs": epochs,
                "batch_size": batch_size,
                "lr": lr,
                "focal_gamma": gamma,
                "total_params": total_params,
                "trainable_params": trainable_params,
            },
        )
        use_wandb = True
    except Exception as e:
        print(f"W&B could not be initialized ({e}). Logging to console only.")

    checkpoints_dir = Path("checkpoints")
    checkpoints_dir.mkdir(exist_ok=True)
    best_checkpoint_path = checkpoints_dir / checkpoint_name

    best_val_f1 = -1.0
    epochs_no_improve = 0

    # Training Loop
    for epoch in range(1, epochs + 1):
        start_time = time.time()
        tr_loss, tr_acc, tr_f1, tr_qwk = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_metrics, _ = evaluate(model, val_loader, criterion, device)
        duration = time.time() - start_time

        val_acc = val_metrics["accuracy"]
        val_f1 = val_metrics["macro_f1"]
        val_qwk = val_metrics["qwk"]
        val_auc = val_metrics.get("auc_roc", 0.0)

        scheduler.step(val_f1)

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] ({duration:.1f}s) | "
            f"Train Loss: {tr_loss:.4f}, Acc: {tr_acc:.4f}, F1: {tr_f1:.4f}, QWK: {tr_qwk:.4f} | "
            f"Val Loss: {val_loss:.4f}, Acc: {val_acc:.4f}, F1: {val_f1:.4f}, QWK: {val_qwk:.4f}, AUC: {val_auc:.4f}"
        )

        if use_wandb:
            wandb.log(
                {
                    "epoch": epoch,
                    "train/loss": tr_loss,
                    "train/acc": tr_acc,
                    "train/macro_f1": tr_f1,
                    "train/qwk": tr_qwk,
                    "val/loss": val_loss,
                    "val/acc": val_acc,
                    "val/macro_f1": val_f1,
                    "val/qwk": val_qwk,
                    "val/auc_roc": val_auc,
                    "lr": optimizer.param_groups[0]["lr"],
                }
            )

        # Early Stopping on Validation Macro-F1
        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            epochs_no_improve = 0
            torch.save(
                {
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "optimizer_state_dict": optimizer.state_dict(),
                    "val_metrics": val_metrics,
                    "model_name": model_name,
                    "total_params": total_params,
                },
                best_checkpoint_path,
            )
            print(f"  --> Saved new best checkpoint to {best_checkpoint_path} (Val Macro-F1: {val_f1:.4f})")
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= patience:
                print(f"Early stopping triggered after {epoch} epochs (Patience: {patience}).")
                break

    # Final Evaluation on Held-Out Test Split (15%)
    print("\n-------------------------------------------------------")
    print(f" Loading Best Checkpoint for Final Held-Out Test Evaluation...")
    checkpoint = torch.load(best_checkpoint_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])

    # Measure inference latency over test set
    t_start = time.time()
    test_loss, test_metrics, _ = evaluate(model, test_loader, criterion, device)
    latency_ms = ((time.time() - t_start) / len(test_dataset)) * 1000.0

    test_metrics["test_latency_ms"] = latency_ms
    test_metrics["total_params"] = total_params
    test_metrics["trainable_params"] = trainable_params

    print(f"\n================ FINAL TEST RESULTS: {model_name.upper()} ================")
    print(f" Accuracy:           {test_metrics['accuracy'] * 100:.2f}%")
    print(f" Macro-F1:           {test_metrics['macro_f1']:.4f}")
    print(f" Quadratic Kappa:    {test_metrics['qwk']:.4f}")
    print(f" AUC-ROC:            {test_metrics.get('auc_roc', 0.0):.4f}")
    print(f" Parameters:         {total_params:,}")
    print(f" Latency:            {latency_ms:.2f} ms / image")
    print(f" Checkpoint:         {best_checkpoint_path}")
    print(f"=======================================================================\n")

    if use_wandb:
        wandb.log(
            {
                "test/accuracy": test_metrics["accuracy"],
                "test/macro_f1": test_metrics["macro_f1"],
                "test/qwk": test_metrics["qwk"],
                "test/auc_roc": test_metrics.get("auc_roc", 0.0),
                "test/latency_ms": latency_ms,
            }
        )
        wandb.finish()

    return test_metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Classical Baselines on APTOS 2019")
    parser.add_argument("--model", type=str, default="resnet18", choices=["resnet18", "mobilenet_v2"], help="Model backbone")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--gamma", type=float, default=2.0, help="Focal loss gamma parameter")
    parser.add_argument("--patience", type=int, default=5, help="Early stopping patience")
    parser.add_argument("--subset", type=int, default=None, help="Optional subset size for fast debug")
    parser.add_argument("--wandb-mode", type=str, default="offline", choices=["online", "offline", "disabled"])
    args = parser.parse_args()

    run_classical_training(
        model_name=args.model,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        gamma=args.gamma,
        patience=args.patience,
        subset=args.subset,
        wandb_mode=args.wandb_mode,
    )
