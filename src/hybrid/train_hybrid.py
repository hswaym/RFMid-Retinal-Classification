"""Hybrid Quantum-Classical CNN Training Pipeline (Prompt 3.5).

Mirrors train_classical.py's workflow:
- Identical 70/15/15 stratified APTOS splits.
- Class-weighted multi-class Focal Loss (gamma=2.0).
- Adam optimizer and early stopping on validation Macro-F1.
- Standardized logging of Accuracy, Macro-F1, AUC-ROC, and Quadratic Weighted Kappa (QWK).
- Checkpoint saving to checkpoints/hqnn_4qubit_best.pt.
- Supports training directly on extracted 512-d features or raw images.
"""

import argparse
import os
import time
from pathlib import Path
from typing import Dict, Optional, Tuple

import albumentations as A
from albumentations.pytorch import ToTensorV2
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset, TensorDataset
from tqdm import tqdm

from src.classical.resnet_baseline import get_feature_extractor
from src.classical.train_classical import (
    FocalLoss,
    PreprocessedRetinalDataset,
    calculate_class_weights,
    get_or_create_splits,
    get_transforms,
)
from src.eval.metrics import compute_metrics
from src.hybrid.hybrid_model import HybridQuantumCNN, get_hybrid_model_from_config


# ─────────────────────────────────────────────────────────────────────────────
# 1. Feature Pre-Extraction for Accelerated Quantum Epochs
# ─────────────────────────────────────────────────────────────────────────────

def get_or_extract_features(
    model: HybridQuantumCNN,
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    test_df: pd.DataFrame,
    device: torch.device,
    batch_size: int = 32,
    features_dir: str = "data/features",
) -> Tuple[TensorDataset, TensorDataset, TensorDataset]:
    """Caches or loads 512-d feature representations to accelerate quantum simulation epochs."""
    feat_path = Path(features_dir)
    feat_path.mkdir(parents=True, exist_ok=True)

    suffix = f"_{len(train_df)}_{len(val_df)}_{len(test_df)}"
    tr_feat_file = feat_path / f"train_features{suffix}.pt"
    val_feat_file = feat_path / f"val_features{suffix}.pt"
    te_feat_file = feat_path / f"test_features{suffix}.pt"

    # 1. Check for exact split cache
    if tr_feat_file.exists() and val_feat_file.exists() and te_feat_file.exists():
        tr_data = torch.load(tr_feat_file, map_location="cpu")
        val_data = torch.load(val_feat_file, map_location="cpu")
        te_data = torch.load(te_feat_file, map_location="cpu")

        if (
            len(tr_data["labels"]) == len(train_df)
            and len(val_data["labels"]) == len(val_df)
            and len(te_data["labels"]) == len(test_df)
        ):
            print(f"Loaded pre-extracted 512-d features from disk cache ({suffix}).")
            return (
                TensorDataset(tr_data["features"], tr_data["labels"]),
                TensorDataset(val_data["features"], val_data["labels"]),
                TensorDataset(te_data["features"], te_data["labels"]),
            )

    # 2. Check for full features cache to index into
    full_tr_file = feat_path / "train_features_full.pt"
    full_val_file = feat_path / "val_features_full.pt"
    full_te_file = feat_path / "test_features_full.pt"

    if full_tr_file.exists() and full_val_file.exists() and full_te_file.exists():
        tr_data = torch.load(full_tr_file, map_location="cpu")
        val_data = torch.load(full_val_file, map_location="cpu")
        te_data = torch.load(full_te_file, map_location="cpu")

        if "id_codes" in tr_data and "id_codes" in val_data and "id_codes" in te_data:
            tr_map = {code: i for i, code in enumerate(tr_data["id_codes"])}
            val_map = {code: i for i, code in enumerate(val_data["id_codes"])}
            te_map = {code: i for i, code in enumerate(te_data["id_codes"])}

            if (
                all(c in tr_map for c in train_df["id_code"])
                and all(c in val_map for c in val_df["id_code"])
                and all(c in te_map for c in test_df["id_code"])
            ):
                print("Sliced features directly from full cached representations.")
                tr_idx = [tr_map[c] for c in train_df["id_code"]]
                val_idx = [val_map[c] for c in val_df["id_code"]]
                te_idx = [te_map[c] for c in test_df["id_code"]]

                return (
                    TensorDataset(tr_data["features"][tr_idx], tr_data["labels"][tr_idx]),
                    TensorDataset(val_data["features"][val_idx], val_data["labels"][val_idx]),
                    TensorDataset(te_data["features"][te_idx], te_data["labels"][te_idx]),
                )

    print(f"Extracting 512-d ResNet18 feature vectors for dataset splits ({len(train_df)}/{len(val_df)}/{len(test_df)})...")
    image_dir = Path("data/aptos2019/train_images")
    cache_dir = Path("data/processed_224")
    _, eval_tf = get_transforms()

    def _extract_df(df: pd.DataFrame) -> Tuple[torch.Tensor, torch.Tensor]:
        ds = PreprocessedRetinalDataset(df, image_dir=image_dir, cache_dir=cache_dir, transform=eval_tf)
        loader = DataLoader(ds, batch_size=batch_size, shuffle=False, num_workers=0)
        all_feats = []
        all_targets = []
        model.eval()
        with torch.no_grad():
            for imgs, targets in tqdm(loader, desc=f"Extracting ({len(df)} samples)", leave=False):
                imgs = imgs.to(device)
                feats = model.extract_features(imgs)
                all_feats.append(feats.cpu())
                all_targets.append(targets.cpu())
        return torch.cat(all_feats, dim=0), torch.cat(all_targets, dim=0)

    tr_feats, tr_targets = _extract_df(train_df)
    val_feats, val_targets = _extract_df(val_df)
    te_feats, te_targets = _extract_df(test_df)

    torch.save({"features": tr_feats, "labels": tr_targets, "id_codes": train_df["id_code"].tolist()}, tr_feat_file)
    torch.save({"features": val_feats, "labels": val_targets, "id_codes": val_df["id_code"].tolist()}, val_feat_file)
    torch.save({"features": te_feats, "labels": te_targets, "id_codes": test_df["id_code"].tolist()}, te_feat_file)
    print(f"Saved feature representations to {feat_path} ({suffix})")

    # If this extraction corresponds to the full split, also save as full cache
    if len(train_df) == 2563 and len(val_df) == 549 and len(test_df) == 550:
        torch.save({"features": tr_feats, "labels": tr_targets, "id_codes": train_df["id_code"].tolist()}, full_tr_file)
        torch.save({"features": val_feats, "labels": val_targets, "id_codes": val_df["id_code"].tolist()}, full_val_file)
        torch.save({"features": te_feats, "labels": te_targets, "id_codes": test_df["id_code"].tolist()}, full_te_file)
        print("Also saved full feature representations for fast subset slicing in future runs.")

    return (
        TensorDataset(tr_feats, tr_targets),
        TensorDataset(val_feats, val_targets),
        TensorDataset(te_feats, te_targets),
    )


# ─────────────────────────────────────────────────────────────────────────────
# 2. Training and Evaluation Loops
# ─────────────────────────────────────────────────────────────────────────────

def train_hybrid_epoch(
    model: HybridQuantumCNN,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
    is_feature_input: bool = True,
) -> Tuple[float, float, float, float]:
    model.train()
    total_loss = 0.0
    all_preds = []
    all_targets = []

    for inputs, targets in tqdm(loader, desc="Hybrid Training", leave=False):
        inputs = inputs.to(device)
        targets = targets.to(device)

        optimizer.zero_grad()
        if is_feature_input:
            outputs = model.forward_from_features(inputs)
        else:
            outputs = model(inputs)

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


def evaluate_hybrid(
    model: HybridQuantumCNN,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    is_feature_input: bool = True,
) -> Tuple[float, Dict[str, float], np.ndarray]:
    model.eval()
    total_loss = 0.0
    all_preds = []
    all_targets = []
    all_probs = []

    with torch.no_grad():
        for inputs, targets in tqdm(loader, desc="Hybrid Evaluating", leave=False):
            inputs = inputs.to(device)
            targets = targets.to(device)

            if is_feature_input:
                outputs = model.forward_from_features(inputs)
            else:
                outputs = model(inputs)

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
# 3. Main Hybrid Training Workflow
# ─────────────────────────────────────────────────────────────────────────────

def run_hybrid_training(
    config_path: str = "configs/hybrid_4qubit.yaml",
    subset_fraction: float = 0.20,
    epochs: Optional[int] = None,
    batch_size: Optional[int] = None,
    lr: Optional[float] = None,
    use_raw_images: bool = False,
    wandb_mode: str = "offline",
) -> Dict[str, float]:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Load configuration
    model = get_hybrid_model_from_config(config_path).to(device)
    param_info = model.get_parameter_breakdown()

    print(f"\n=======================================================")
    print(f" Starting Hybrid Quantum-Classical Training")
    print(f" Config: {config_path}")
    print(f" Qubits: {model.n_qubits} | Quantum Layers: {model.n_layers} | Device: {device}")
    print(f" Decision Stage Trainable Params: {param_info['total_trainable']:,} (Quantum: {param_info['quantum_trainable']})")
    print(f"=======================================================")

    # Setup Splits
    train_df, val_df, test_df = get_or_create_splits()

    # Apply subset fraction if specified (default 20% for quantum simulation speed validation)
    if subset_fraction is not None and 0.0 < subset_fraction < 1.0:
        from sklearn.model_selection import train_test_split
        # Stratified sampling to maintain class proportions across all DR grades
        train_df, _ = train_test_split(
            train_df,
            train_size=subset_fraction,
            random_state=42,
            stratify=train_df["diagnosis"],
        )
        val_df, _ = train_test_split(
            val_df,
            train_size=subset_fraction,
            random_state=42,
            stratify=val_df["diagnosis"],
        )
        test_df, _ = train_test_split(
            test_df,
            train_size=subset_fraction,
            random_state=42,
            stratify=test_df["diagnosis"],
        )
        train_df = train_df.reset_index(drop=True)
        val_df = val_df.reset_index(drop=True)
        test_df = test_df.reset_index(drop=True)
        print(f">> Subsetting data (stratified) to {subset_fraction*100:.0f}%: Train={len(train_df)}, Val={len(val_df)}, Test={len(test_df)}")

    class_weights = calculate_class_weights(train_df).to(device)
    print("Class weights for Focal Loss:", [round(w.item(), 3) for w in class_weights])

    batch_sz = batch_size or 16
    num_epochs = epochs or 10
    learning_rate = lr or 1e-4

    # Prepare Data Loaders
    is_feature_mode = not use_raw_images
    if is_feature_mode:
        tr_ds, val_ds, te_ds = get_or_extract_features(model, train_df, val_df, test_df, device)
        train_loader = DataLoader(tr_ds, batch_size=batch_sz, shuffle=True, num_workers=0)
        val_loader = DataLoader(val_ds, batch_size=batch_sz, shuffle=False, num_workers=0)
        test_loader = DataLoader(te_ds, batch_size=batch_sz, shuffle=False, num_workers=0)
    else:
        train_tf, eval_tf = get_transforms()
        image_dir = Path("data/aptos2019/train_images")
        cache_dir = Path("data/processed_224")
        tr_ds = PreprocessedRetinalDataset(train_df, image_dir=image_dir, cache_dir=cache_dir, transform=train_tf)
        val_ds = PreprocessedRetinalDataset(val_df, image_dir=image_dir, cache_dir=cache_dir, transform=eval_tf)
        te_ds = PreprocessedRetinalDataset(test_df, image_dir=image_dir, cache_dir=cache_dir, transform=eval_tf)
        train_loader = DataLoader(tr_ds, batch_size=batch_sz, shuffle=True, num_workers=0)
        val_loader = DataLoader(val_ds, batch_size=batch_sz, shuffle=False, num_workers=0)
        test_loader = DataLoader(te_ds, batch_size=batch_sz, shuffle=False, num_workers=0)

    # Optimization Setup
    # Train decision stage (compressor, quantum layer, and head)
    trainable_params = [p for p in model.parameters() if p.requires_grad]
    optimizer = torch.optim.Adam(trainable_params, lr=learning_rate, weight_decay=1e-4)
    criterion = FocalLoss(alpha=class_weights, gamma=2.0)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=2)

    # W&B Logging setup
    use_wandb = False
    try:
        import wandb
        wandb.init(
            project="hqnn-retinal-classification",
            name=f"hqnn_{model.n_qubits}qubit_training",
            mode=wandb_mode,
            config={
                "n_qubits": model.n_qubits,
                "n_layers": model.n_layers,
                "compression_method": model.compression_method,
                "subset_fraction": subset_fraction,
                "epochs": num_epochs,
                "batch_size": batch_sz,
                "lr": learning_rate,
                "trainable_params": param_info["total_trainable"],
                "quantum_params": param_info["quantum_trainable"],
            },
        )
        use_wandb = True
    except Exception as e:
        print(f"W&B could not be initialized ({e}). Logging to console only.")

    checkpoints_dir = Path("checkpoints")
    checkpoints_dir.mkdir(exist_ok=True)
    best_checkpoint_path = checkpoints_dir / f"hqnn_{model.n_qubits}qubit_best.pt"

    best_val_f1 = -1.0
    patience = 5
    epochs_no_improve = 0

    # Training Loop
    for epoch in range(1, num_epochs + 1):
        t_start = time.time()
        tr_loss, tr_acc, tr_f1, tr_qwk = train_hybrid_epoch(
            model, train_loader, criterion, optimizer, device, is_feature_input=is_feature_mode
        )
        val_loss, val_metrics, _ = evaluate_hybrid(
            model, val_loader, criterion, device, is_feature_input=is_feature_mode
        )
        duration = time.time() - t_start

        val_acc = val_metrics["accuracy"]
        val_f1 = val_metrics["macro_f1"]
        val_qwk = val_metrics["qwk"]
        val_auc = val_metrics.get("auc_roc", 0.0)

        scheduler.step(val_f1)

        print(
            f"Epoch [{epoch:02d}/{num_epochs:02d}] ({duration:.1f}s) | "
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

        # Early stopping on validation Macro-F1
        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            epochs_no_improve = 0
            torch.save(
                {
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "val_metrics": val_metrics,
                    "n_qubits": model.n_qubits,
                    "n_layers": model.n_layers,
                    "compression_method": model.compression_method,
                    "trainable_params": param_info["total_trainable"],
                },
                best_checkpoint_path,
            )
            print(f"  --> Saved new best checkpoint to {best_checkpoint_path} (Val Macro-F1: {val_f1:.4f})")
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= patience:
                print(f"Early stopping triggered after {epoch} epochs without improvement.")
                break

    # Final Evaluation on Held-Out Test Split
    print("\n-------------------------------------------------------")
    print(f"Loading Best Checkpoint for Final Held-Out Test Evaluation...")
    checkpoint = torch.load(best_checkpoint_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])

    t_eval = time.time()
    test_loss, test_metrics, _ = evaluate_hybrid(
        model, test_loader, criterion, device, is_feature_input=is_feature_mode
    )
    latency_ms = ((time.time() - t_eval) / len(test_df)) * 1000.0

    test_metrics["latency_ms"] = latency_ms
    test_metrics["trainable_params"] = param_info["total_trainable"]
    test_metrics["quantum_params"] = param_info["quantum_trainable"]

    print(f"\n================ FINAL TEST RESULTS: HQNN ({model.n_qubits}-QUBIT) ================")
    print(f" Accuracy:            {test_metrics['accuracy'] * 100:.2f}%")
    print(f" Macro-F1:            {test_metrics['macro_f1']:.4f}")
    print(f" Quadratic Kappa:     {test_metrics['qwk']:.4f}")
    print(f" AUC-ROC:             {test_metrics.get('auc_roc', 0.0):.4f}")
    print(f" Trainable Params:    {param_info['total_trainable']:,} (Quantum: {param_info['quantum_trainable']})")
    print(f" Latency:             {latency_ms:.2f} ms / sample")
    print(f" Checkpoint:          {best_checkpoint_path}")
    print(f"========================================================================\n")

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
    parser = argparse.ArgumentParser(description="Train Hybrid Quantum-Classical CNN")
    parser.add_argument("--config", type=str, default="configs/hybrid_4qubit.yaml", help="Path to YAML configuration")
    parser.add_argument("--subset", type=float, default=0.20, help="Fraction of data to use (default: 0.20)")
    parser.add_argument("--epochs", type=int, default=5, help="Number of epochs (default: 5)")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size (default: 16)")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate (default: 1e-4)")
    parser.add_argument("--use-images", action="store_true", help="Train directly on raw images instead of pre-extracted features")
    parser.add_argument("--wandb-mode", type=str, default="offline", choices=["online", "offline", "disabled"])
    args = parser.parse_args()

    run_hybrid_training(
        config_path=args.config,
        subset_fraction=args.subset,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        use_raw_images=args.use_images,
        wandb_mode=args.wandb_mode,
    )
