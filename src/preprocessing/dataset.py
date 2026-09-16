"""APTOS 2019 Blindness Detection Dataset module.

Provides a PyTorch Dataset for loading and transforming retinal fundus images
along with their 5-grade Diabetic Retinopathy severity labels.
"""

from pathlib import Path
from typing import Callable, Optional, Tuple, Union

import cv2
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset
from PIL import Image

# Standard clinical 5-class severity grade mapping
DR_GRADES = {
    0: "No DR",
    1: "Mild",
    2: "Moderate",
    3: "Severe",
    4: "Proliferative DR",
}


class APTOSDataset(Dataset):
    """PyTorch Dataset for APTOS 2019 Diabetic Retinopathy fundus images.

    Args:
        df_or_csv_path: Path to CSV or pandas DataFrame containing 'id_code' and 'diagnosis'.
        image_dir: Path to directory containing the fundus image files.
        transform: Albumentations or torchvision transform callable.
        extension: Image file extension (default: '.png').
        use_rgb: Convert BGR images from OpenCV to RGB (default: True).
    """

    def __init__(
        self,
        df_or_csv_path: Union[str, Path, pd.DataFrame],
        image_dir: Union[str, Path],
        transform: Optional[Callable] = None,
        extension: str = ".png",
        use_rgb: bool = True,
    ) -> None:
        super().__init__()
        if isinstance(df_or_csv_path, pd.DataFrame):
            self.df = df_or_csv_path.copy().reset_index(drop=True)
        else:
            csv_path = Path(df_or_csv_path)
            if not csv_path.exists():
                raise FileNotFoundError(f"Annotations file not found: {csv_path}")
            self.df = pd.read_csv(csv_path)

        self.image_dir = Path(image_dir)
        if not self.image_dir.exists():
            raise FileNotFoundError(f"Image directory not found: {self.image_dir}")

        if "id_code" not in self.df.columns or "diagnosis" not in self.df.columns:
            raise ValueError(
                f"CSV must contain 'id_code' and 'diagnosis' columns. Found: {list(self.df.columns)}"
            )

        self.transform = transform
        self.extension = extension
        self.use_rgb = use_rgb

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        row = self.df.iloc[idx]
        id_code = str(row["id_code"])
        label = int(row["diagnosis"])

        image_path = self.image_dir / f"{id_code}{self.extension}"
        if not image_path.exists():
            # Fallback check without extension appending if already present
            image_path = self.image_dir / id_code
            if not image_path.exists():
                raise FileNotFoundError(f"Image not found: {image_path}")

        image = cv2.imread(str(image_path))
        if image is None:
            raise ValueError(f"Failed to load image from path: {image_path}")

        if self.use_rgb:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        if self.transform is not None:
            # Albumentations convention: transform(image=image)['image']
            try:
                transformed = self.transform(image=image)
                image = transformed["image"]
            except TypeError:
                # torchvision / PIL convention fallback
                pil_image = Image.fromarray(image)
                image = self.transform(pil_image)

        # If not converted to tensor by transform, convert manually
        if not isinstance(image, torch.Tensor):
            image = torch.from_numpy(image).permute(2, 0, 1).float() / 255.0

        label_tensor = torch.tensor(label, dtype=torch.long)
        return image, label_tensor

    def get_class_distribution(self) -> pd.DataFrame:
        """Returns distribution of classes in the dataset."""
        counts = self.df["diagnosis"].value_counts().sort_index()
        total = len(self.df)
        dist_df = pd.DataFrame(
            {
                "Grade": counts.index,
                "Clinical_Label": [DR_GRADES.get(g, f"Grade {g}") for g in counts.index],
                "Count": counts.values,
                "Percentage": (counts.values / total) * 100.0,
            }
        )
        return dist_df


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Inspect APTOS 2019 Dataset")
    parser.add_argument(
        "--csv",
        type=str,
        default="data/aptos2019/train.csv",
        help="Path to train.csv",
    )
    parser.add_argument(
        "--img-dir",
        type=str,
        default="data/aptos2019/train_images",
        help="Path to train_images folder",
    )
    args = parser.parse_args()

    print("=================================================================")
    print("           APTOS 2019 Blindness Detection Dataset                ")
    print("=================================================================")
    dataset = APTOSDataset(df_or_csv_path=args.csv, image_dir=args.img_dir)
    print(f"Total labeled samples: {len(dataset)}\n")

    dist = dataset.get_class_distribution()
    print("Class Distribution:")
    print(dist.to_string(index=False))
    print("-----------------------------------------------------------------")

    print("\nVerifying first 5 samples:")
    for i in range(min(5, len(dataset))):
        img, lbl = dataset[i]
        grade_name = DR_GRADES.get(lbl.item(), "Unknown")
        id_code = dataset.df.iloc[i]["id_code"]
        print(
            f"Sample {i}: id={id_code} | Label={lbl.item()} ({grade_name}) | Tensor Shape={list(img.shape)} | Min={img.min():.2f}, Max={img.max():.2f}"
        )
    print("=================================================================")
