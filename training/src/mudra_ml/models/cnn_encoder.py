"""Appearance encoder for RGB (hand-crop) frames: pretrained CNN with the classifier removed.

Not used by the landmark-only INCLUDE experiments (that release has no RGB). Kept ready for
ablations D/E once video frames are available; features can be precomputed and cached
with the backbone frozen to fit an 8 GB GPU.
"""

from __future__ import annotations

import torch
from torch import nn
from torchvision import models

IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)

_BACKBONES = {
    "resnet18": (models.resnet18, models.ResNet18_Weights.DEFAULT),
    "mobilenet_v3_small": (models.mobilenet_v3_small, models.MobileNet_V3_Small_Weights.DEFAULT),
}


class CNNEncoder(nn.Module):
    """[B, T, 3, H, W] (ImageNet-normalised) -> [B, T, feature_dim]."""

    def __init__(self, backbone: str = "resnet18", pretrained: bool = True, freeze: bool = True):
        super().__init__()
        if backbone not in _BACKBONES:
            raise ValueError(f"Unknown backbone {backbone!r}; choose from {sorted(_BACKBONES)}")
        builder, weights = _BACKBONES[backbone]
        net = builder(weights=weights if pretrained else None)
        if backbone.startswith("resnet"):
            self.feature_dim = net.fc.in_features
            net.fc = nn.Identity()
        else:
            self.feature_dim = net.classifier[0].in_features
            net.classifier = nn.Identity()
        self.backbone = net
        self.set_trainable(not freeze)

    def set_trainable(self, trainable: bool, last_block_only: bool = False) -> None:
        """Freeze everything, unfreeze everything, or unfreeze only the last block (fine-tuning stage)."""
        for p in self.backbone.parameters():
            p.requires_grad = trainable and not last_block_only
        if trainable and last_block_only:
            last = self.backbone.layer4 if hasattr(self.backbone, "layer4") else self.backbone.features[-1]
            for p in last.parameters():
                p.requires_grad = True

    def forward(self, frames: torch.Tensor) -> torch.Tensor:
        b, t = frames.shape[:2]
        feats = self.backbone(frames.flatten(0, 1))
        return feats.view(b, t, -1)
