"""Evaluation package: Metrics, Ablations, and Benchmarks."""

from src.eval.metrics import compute_metrics, compute_confusion_matrix

__all__ = ["compute_metrics", "compute_confusion_matrix"]
