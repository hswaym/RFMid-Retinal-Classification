"""ResNet18 Classical Baseline for Diabetic Retinopathy Classification.

Provides a full 5-class classifier and a reusable truncated feature extractor
returning 512-dimensional pooled embeddings for the hybrid quantum-classical pipeline.
"""

from typing import Optional
import torch
import torch.nn as nn
from torchvision.models import ResNet18_Weights, resnet18


class ResNet18FeatureExtractor(nn.Module):
    """Truncated ResNet18 backbone outputting 512-dimensional feature vectors."""

    def __init__(self, pretrained: bool = True, freeze_backbone: bool = False) -> None:
        super().__init__()
        weights = ResNet18_Weights.DEFAULT if pretrained else None
        base_model = resnet18(weights=weights)

        # Retain all layers up through adaptive average pooling
        self.conv1 = base_model.conv1
        self.bn1 = base_model.bn1
        self.relu = base_model.relu
        self.maxpool = base_model.maxpool
        self.layer1 = base_model.layer1
        self.layer2 = base_model.layer2
        self.layer3 = base_model.layer3
        self.layer4 = base_model.layer4
        self.avgpool = base_model.avgpool

        self.feature_dim = 512

        if freeze_backbone:
            for param in self.parameters():
                param.requires_grad = False

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Extracts 512-d pooled features from input images.

        Args:
            x: Input tensor of shape (B, 3, 224, 224).

        Returns:
            Feature tensor of shape (B, 512).
        """
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)

        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)

        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        return x


class ResNet18Baseline(nn.Module):
    """ResNet18 baseline with 512 -> 5 classification head."""

    def __init__(
        self,
        num_classes: int = 5,
        pretrained: bool = True,
        dropout: float = 0.2,
        freeze_backbone: bool = False,
    ) -> None:
        super().__init__()
        self.feature_extractor = ResNet18FeatureExtractor(
            pretrained=pretrained,
            freeze_backbone=freeze_backbone,
        )
        self.dropout = nn.Dropout(p=dropout) if dropout > 0 else nn.Identity()
        self.fc = nn.Linear(self.feature_extractor.feature_dim, num_classes)

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        """Returns 512-dim pooled feature embeddings."""
        return self.feature_extractor(x)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass through backbone and linear classification head.

        Args:
            x: Input tensor of shape (B, 3, 224, 224).

        Returns:
            Raw logits tensor of shape (B, num_classes).
        """
        features = self.extract_features(x)
        features = self.dropout(features)
        logits = self.fc(features)
        return logits


def get_feature_extractor(
    pretrained: bool = True,
    freeze_backbone: bool = False,
) -> ResNet18FeatureExtractor:
    """Returns truncated ResNet18 feature extractor (outputs 512-dim vector)."""
    return ResNet18FeatureExtractor(
        pretrained=pretrained,
        freeze_backbone=freeze_backbone,
    )


def get_resnet18_model(
    num_classes: int = 5,
    pretrained: bool = True,
    dropout: float = 0.2,
    freeze_backbone: bool = False,
) -> ResNet18Baseline:
    """Returns complete ResNet18 5-class baseline model."""
    return ResNet18Baseline(
        num_classes=num_classes,
        pretrained=pretrained,
        dropout=dropout,
        freeze_backbone=freeze_backbone,
    )


if __name__ == "__main__":
    print("Testing ResNet18 Baseline...")
    model = get_resnet18_model(num_classes=5, pretrained=True)
    extractor = get_feature_extractor(pretrained=True)

    dummy_input = torch.randn(2, 3, 224, 224)

    with torch.no_grad():
        out_logits = model(dummy_input)
        out_features = extractor(dummy_input)

    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

    print(f"Model Output Shape (Logits): {list(out_logits.shape)} (Expected: [2, 5])")
    print(f"Extractor Output Shape:      {list(out_features.shape)} (Expected: [2, 512])")
    print(f"Total Parameters:            {total_params:,}")
    print(f"Trainable Parameters:        {trainable_params:,}")
