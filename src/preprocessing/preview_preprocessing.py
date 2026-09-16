"""Generate and save preprocessing comparison figures for mid-sem review.

Samples 10 representative fundus images (2 from each of the 5 DR grades)
and plots: Raw Image vs. Ben Graham Circular Crop (224x224) vs. Green-Channel CLAHE.
Outputs are saved to reports/preprocessing_samples/.
"""

from pathlib import Path
import cv2
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from src.preprocessing.ben_graham_crop import circle_crop_fov
from src.preprocessing.clahe import apply_green_channel_clahe
from src.preprocessing.dataset import DR_GRADES


def run_preprocessing_preview(
    csv_path: str = "data/aptos2019/train.csv",
    img_dir: str = "data/aptos2019/train_images",
    output_dir: str = "reports/preprocessing_samples",
    samples_per_grade: int = 2,
) -> None:
    csv_path = Path(csv_path)
    img_dir = Path(img_dir)
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(csv_path)

    # Select 2 balanced samples for each of the 5 grades
    selected_rows = []
    for grade in range(5):
        grade_df = df[df["diagnosis"] == grade]
        samples = grade_df.head(samples_per_grade)
        selected_rows.append(samples)

    sample_df = pd.concat(selected_rows).reset_index(drop=True)
    print(f"Selected {len(sample_df)} sample images across 5 grades.")

    # Storage for collage
    collage_data = []

    for idx, row in sample_df.iterrows():
        id_code = row["id_code"]
        grade = int(row["diagnosis"])
        grade_name = DR_GRADES[grade]
        img_path = img_dir / f"{id_code}.png"

        bgr = cv2.imread(str(img_path))
        if bgr is None:
            print(f"Warning: Could not read {img_path}")
            continue

        raw_rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        orig_h, orig_w = raw_rgb.shape[:2]

        # Step 1: Circular crop & resize to 224x224
        cropped_rgb = circle_crop_fov(raw_rgb, output_size=224)

        # Step 2: Green-channel CLAHE
        clahe_rgb = apply_green_channel_clahe(cropped_rgb, clip_limit=2.0, tile_grid_size=(8, 8))

        collage_data.append((id_code, grade, grade_name, raw_rgb, cropped_rgb, clahe_rgb))

        # Save individual 3-panel comparison figure
        fig, axes = plt.subplots(1, 3, figsize=(14, 5))
        axes[0].imshow(raw_rgb)
        axes[0].set_title(f"Raw Input: {id_code}\nGrade {grade} ({grade_name}) | {orig_w}x{orig_h}", fontsize=11)
        axes[0].axis("off")

        axes[1].imshow(cropped_rgb)
        axes[1].set_title("1. Ben Graham Circular Crop\n(Resized to 224x224)", fontsize=11)
        axes[1].axis("off")

        axes[2].imshow(clahe_rgb)
        axes[2].set_title("2. Green-Channel CLAHE\n(Vessel & Lesion Enhanced)", fontsize=11)
        axes[2].axis("off")

        plt.tight_layout()
        single_save_path = out_dir / f"sample_{idx:02d}_grade_{grade}_{id_code}.png"
        plt.savefig(single_save_path, dpi=200, bbox_inches="tight")
        plt.close(fig)
        print(f"[{idx+1}/{len(sample_df)}] Saved comparison to {single_save_path.name}")

    # Generate full 10-sample overview grid
    fig, axes = plt.subplots(len(collage_data), 3, figsize=(12, 3.2 * len(collage_data)))
    for i, (id_code, grade, grade_name, raw_img, crop_img, clahe_img) in enumerate(collage_data):
        axes[i, 0].imshow(raw_img)
        axes[i, 0].set_title(f"Raw [{id_code}] - Grade {grade}: {grade_name}", fontsize=9)
        axes[i, 0].axis("off")

        axes[i, 1].imshow(crop_img)
        axes[i, 1].set_title("Circular Crop (224x224)", fontsize=9)
        axes[i, 1].axis("off")

        axes[i, 2].imshow(clahe_img)
        axes[i, 2].set_title("Green-Channel CLAHE (224x224)", fontsize=9)
        axes[i, 2].axis("off")

    plt.suptitle("APTOS 2019 Preprocessing Pipeline (10 Representative Samples Across All 5 Grades)", fontsize=13, y=1.002)
    plt.tight_layout()
    grid_save_path = out_dir / "preprocessing_comparison_grid.png"
    plt.savefig(grid_save_path, dpi=200, bbox_inches="tight")
    plt.close(fig)
    print(f"\nSaved comprehensive overview grid to: {grid_save_path}")


if __name__ == "__main__":
    run_preprocessing_preview()
