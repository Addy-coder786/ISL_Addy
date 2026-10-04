"""Per-frame landmark geometry encoder (the spec's "Landmark MLP")."""

from __future__ import annotations

import torch
from torch import nn


class LandmarkMLP(nn.Module):
    """[B, T, D_in] -> [B, T, D_out]. Learns a geometry representation, not the sign itself."""

    def __init__(self, input_dim: int, hidden_dim: int = 256, output_dim: int = 128, dropout: float = 0.2):
        super().__init__()
        self.output_dim = output_dim
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, output_dim),
            nn.LayerNorm(output_dim),
            nn.GELU(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)
