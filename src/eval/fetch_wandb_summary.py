"""Fetches exact raw W&B summary metrics for all project runs.

Usage:
    python -m src.eval.fetch_wandb_summary
"""

import json
import sys
from typing import Any, Dict


def fetch_all_run_summaries(
    project_path: str = "hswaym016-simple/hqnn-retinal-classification",
) -> Dict[str, Dict[str, Any]]:
    try:
        import wandb
    except ImportError:
        print("wandb is not installed. Run 'pip install wandb'.")
        sys.exit(1)

    try:
        api = wandb.Api()
        runs = api.runs(project_path)
    except Exception as e:
        print(f"Error accessing W&B API for project '{project_path}': {e}")
        print("\nPlease authenticate with W&B using one of the following methods:")
        print("  1. Run `wandb login` in your terminal.")
        print("  2. Or set the environment variable: $env:WANDB_API_KEY=\"<your_key>\" (PowerShell)")
        return {}

    all_summaries = {}
    print(f"Connected to W&B. Found {len(runs)} run(s) in {project_path}:\n")

    for run in runs:
        name = run.name or run.id
        summary_dict = dict(run.summary._json_dict)

        # Filter and extract relevant test metrics
        test_metrics = {
            k: v for k, v in summary_dict.items()
            if any(term in k.lower() for term in ["test", "accuracy", "f1", "qwk", "auc", "latency", "epoch", "loss"])
        }

        all_summaries[name] = {
            "id": run.id,
            "state": run.state,
            "created_at": run.created_at,
            "url": run.url,
            "summary": summary_dict,
            "test_metrics": test_metrics,
        }

        print("=" * 70)
        print(f"RUN: {name} (ID: {run.id}, State: {run.state})")
        print(f"URL: {run.url}")
        print("-" * 70)
        print("RAW W&B SUMMARY METRICS:")
        print(json.dumps(summary_dict, indent=2))
        print("=" * 70 + "\n")

    return all_summaries


if __name__ == "__main__":
    fetch_all_run_summaries()
