"""Evaluation metrics for Diabetic Retinopathy classification.

Computes standard evaluation metrics:
- Overall Accuracy
- Macro-averaged F1-Score
- Quadratic Weighted Kappa (QWK, official APTOS competition metric)
- Macro-averaged AUC-ROC (One-vs-Rest)
- Confusion Matrix
"""

from typing import Dict, Optional, Tuple, Union
import numpy as np
import torch
from sklearn.metrics import (
    accuracy_score,
    cohen_kappa_score,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)


def compute_metrics(
    y_true: Union[np.ndarray, torch.Tensor],
    y_pred: Union[np.ndarray, torch.Tensor],
    y_prob: Optional[Union[np.ndarray, torch.Tensor]] = None,
    num_classes: int = 5,
) -> Dict[str, float]:
    """Computes comprehensive metrics for multi-class DR grading.

    Args:
        y_true: Ground-truth class labels (1D array-like of integers 0..num_classes-1).
        y_pred: Predicted class labels (1D array-like of integers 0..num_classes-1).
        y_prob: Predicted class probabilities (shape: [N, num_classes]). Optional for AUC.
        num_classes: Total number of classes (default: 5).

    Returns:
        Dictionary containing 'accuracy', 'macro_f1', 'qwk', and optionally 'auc_roc'.
    """
    if isinstance(y_true, torch.Tensor):
        y_true = y_true.detach().cpu().numpy()
    if isinstance(y_pred, torch.Tensor):
        y_pred = y_pred.detach().cpu().numpy()
    if isinstance(y_prob, torch.Tensor):
        y_prob = y_prob.detach().cpu().numpy()

    y_true = np.asarray(y_true).astype(int)
    y_pred = np.asarray(y_pred).astype(int)

    acc = float(accuracy_score(y_true, y_pred))
    macro_f1 = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
    qwk = float(cohen_kappa_score(y_true, y_pred, weights="quadratic"))

    metrics = {
        "accuracy": acc,
        "macro_f1": macro_f1,
        "qwk": qwk,
    }

    if y_prob is not None:
        try:
            # Check that there are at least two classes present in y_true
            unique_classes = np.unique(y_true)
            if len(unique_classes) > 1:
                # Multi-class OvR Macro AUC-ROC
                auc = float(
                    roc_auc_score(
                        y_true,
                        y_prob,
                        multi_class="ovr",
                        average="macro",
                        labels=list(range(num_classes)),
                    )
                )
                metrics["auc_roc"] = 0.0 if np.isnan(auc) else auc
            else:
                metrics["auc_roc"] = 0.0
        except Exception:
            metrics["auc_roc"] = 0.0

    return metrics


def compute_confusion_matrix(
    y_true: Union[np.ndarray, torch.Tensor],
    y_pred: Union[np.ndarray, torch.Tensor],
    num_classes: int = 5,
) -> np.ndarray:
    """Computes the confusion matrix across all specified classes."""
    if isinstance(y_true, torch.Tensor):
        y_true = y_true.detach().cpu().numpy()
    if isinstance(y_pred, torch.Tensor):
        y_pred = y_pred.detach().cpu().numpy()
    return confusion_matrix(y_true, y_pred, labels=list(range(num_classes)))
