"""MobileNetV2 Classical Baseline for Diabetic Retinopathy Classification.

Provides a full 5-class classifier and a reusable truncated feature extractor
returning 1280-dimensional pooled embeddings.
"""

from typing import Optional
import torch
import torch.nn as nn
from torchvision.models import MobileNet_V2_Weights, mobilenet_v2


class MobileNetV2FeatureExtractor(nn.Module):
    """Truncated MobileNetV2 backbone outputting 1280-dimensional feature vectors."""

    def __init__(self, pretrained: bool = True, freeze_backbone: bool = False) -> None:
        super().__init__()
        weights = MobileNet_V2_Weights.DEFAULT if pretrained else None
        base_model = mobilenet_v2(weights=weights)

        self.features = base_model.features
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.feature_dim = 1280

        if freeze_backbone:
            for param in self.parameters():
                param.requires_grad = False

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Extracts 1280-d pooled features from input images.

        Args:
            x: Input tensor of shape (B, 3, 224, 224).

        Returns:
            Feature tensor of shape (B, 1280).
        """
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        return x


class MobileNetV2Baseline(nn.Module):
    """MobileNetV2 baseline with 1280 -> 5 classification head."""

    def __init__(
        self,
        num_classes: int = 5,
        pretrained: bool = True,
        dropout: float = 0.2,
        freeze_backbone: bool = False,
    ) -> None:
        super().__init__()
        self.feature_extractor = MobileNetV2FeatureExtractor(
            pretrained=pretrained,
            freeze_backbone=freeze_backbone,
        )
        self.classifier = nn.Sequential(
            nn.Dropout(p=dropout) if dropout > 0 else nn.Identity(),
            nn.Linear(self.feature_extractor.feature_dim, num_classes),
        )

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        """Returns 1280-dim pooled feature embeddings."""
        return self.feature_extractor(x)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass through backbone and linear classification head.

        Args:
            x: Input tensor of shape (B, 3, 224, 224).

        Returns:
            Raw logits tensor of shape (B, num_classes).
        """
        features = self.extract_features(x)
        logits = self.classifier(features)
        return logits


def get_feature_extractor(
    pretrained: bool = True,
    freeze_backbone: bool = False,
) -> MobileNetV2FeatureExtractor:
    """Returns truncated MobileNetV2 feature extractor (outputs 1280-dim vector)."""
    return MobileNetV2FeatureExtractor(
        pretrained=pretrained,
        freeze_backbone=freeze_backbone,
    )


def get_mobilenet_v2_model(
    num_classes: int = 5,
    pretrained: bool = True,
    dropout: float = 0.2,
    freeze_backbone: bool = False,
) -> MobileNetV2Baseline:
    """Returns complete MobileNetV2 5-class baseline model."""
    return MobileNetV2Baseline(
        num_classes=num_classes,
        pretrained=pretrained,
        dropout=dropout,
        freeze_backbone=freeze_backbone,
    )


if __name__ == "__main__":
    print("Testing MobileNetV2 Baseline...")
    model = get_mobilenet_v2_model(num_classes=5, pretrained=True)
    extractor = get_feature_extractor(pretrained=True)

    dummy_input = torch.randn(2, 3, 224, 224)

    with torch.no_grad():
        out_logits = model(dummy_input)
        out_features = extractor(dummy_input)

    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

    print(f"Model Output Shape (Logits): {list(out_logits.shape)} (Expected: [2, 5])")
    print(f"Extractor Output Shape:      {list(out_features.shape)} (Expected: [2, 1280])")
    print(f"Total Parameters:            {total_params:,}")
    print(f"Trainable Parameters:        {trainable_params:,}")
