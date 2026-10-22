"""
Spoil AI — Spoilage Vision Classifier & Feature Extractor
Fine-tuned Deep Convolutional Neural Network for Food Spoilage Classification.
Processes cropped food specimen images, predicts spoilage stage, and extracts
a 64-dimensional visual feature embedding for multimodal cross-attention fusion.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Dict, Any
import numpy as np


class SpoilageVisionClassifier(nn.Module):
    """
    Convolutional Feature Extractor & Classifier for Food Spoilage States.
    Backbone: Deep Multi-Scale Residual CNN (or MobileNetV3 feature extractor).
    Outputs:
    - 4-class logits (FRESH, EARLY_SPOILAGE, MODERATE_SPOILAGE, SEVERE_SPOILAGE)
    - 64-dimensional visual embedding vector for multimodal cross-attention
    """
    def __init__(self, num_classes: int = 4, embedding_dim: int = 64, dropout: float = 0.25):
        super().__init__()
        self.num_classes = num_classes
        self.embedding_dim = embedding_dim

        # Multi-scale Convolutional Feature Extractor
        self.features = nn.Sequential(
            # Block 1: 224x224 -> 112x112
            nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),

            # Block 2: 112x112 -> 56x56
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),

            # Block 3: 56x56 -> 28x28
            nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),

            # Block 4: 28x28 -> 14x14
            nn.Conv2d(128, 256, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),

            # Global Adaptive Pooling -> (batch_size, 256, 1, 1)
            nn.AdaptiveAvgPool2d((1, 1))
        )

        # Visual Latent Embedding Projection (64-dimensional)
        self.embedding_head = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(128, embedding_dim),
            nn.LayerNorm(embedding_dim)
        )

        # Classification Head
        self.classifier = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(embedding_dim, 32),
            nn.ReLU(),
            nn.Linear(32, num_classes)
        )

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        x: (batch_size, 3, 224, 224) RGB food image tensor
        Returns:
        - logits: (batch_size, num_classes)
        - embedding: (batch_size, 64)
        """
        feat = self.features(x)
        embedding = self.embedding_head(feat)
        logits = self.classifier(embedding)
        return logits, embedding


def compute_vision_confidence(probs: torch.Tensor) -> float:
    """
    Computes visual classifier confidence based on probability margin
    between top-1 and top-2 predicted spoilage classes.
    """
    p = probs.detach().cpu().numpy().squeeze()
    sorted_p = np.sort(p)[::-1]
    top1 = float(sorted_p[0])
    top2 = float(sorted_p[1]) if len(sorted_p) > 1 else 0.0
    margin = top1 - top2
    confidence = float(np.clip(0.6 * top1 + 0.4 * margin, 0.1, 0.99))
    return round(confidence, 4)
