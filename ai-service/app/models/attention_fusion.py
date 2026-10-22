"""
Spoil AI — Trainable Multimodal Attention Fusion Network
Combines aligned food specimen visual embeddings and sequential environmental sensor embeddings
using learned cross-modal scaled dot-product attention.
Outputs explicit modality attention weights, combined spoilage risk score, and decoupled confidences.
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Dict, Any
import numpy as np


class CrossModalAttentionLayer(nn.Module):
    """
    Scaled dot-product cross-modal attention between Visual and Sensor features.
    """
    def __init__(self, embed_dim: int = 64):
        super().__init__()
        self.embed_dim = embed_dim
        self.scale = 1.0 / math.sqrt(embed_dim)

        # Projections for Vision-to-Sensor attention
        self.w_q_v = nn.Linear(embed_dim, embed_dim)
        self.w_k_s = nn.Linear(embed_dim, embed_dim)
        self.w_v_s = nn.Linear(embed_dim, embed_dim)

        # Projections for Sensor-to-Vision attention
        self.w_q_s = nn.Linear(embed_dim, embed_dim)
        self.w_k_v = nn.Linear(embed_dim, embed_dim)
        self.w_v_v = nn.Linear(embed_dim, embed_dim)

        # Modality gating
        self.gate = nn.Sequential(
            nn.Linear(embed_dim * 2, 2),
            nn.Softmax(dim=-1)
        )

    def forward(self, v_emb: torch.Tensor, s_emb: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        v_emb: (batch_size, embed_dim)
        s_emb: (batch_size, embed_dim)
        Returns:
        - fused_repr: (batch_size, embed_dim * 2)
        - attention_weights: (batch_size, 2) [alpha_vision, alpha_sensor]
        """
        # Cross-attention: Visual query attending to Sensor key-value
        q_v = self.w_q_v(v_emb)
        k_s = self.w_k_s(s_emb)
        v_s = self.w_v_s(s_emb)
        score_v2s = torch.sum(q_v * k_s, dim=-1, keepdim=True) * self.scale
        attn_s = torch.sigmoid(score_v2s) * v_s

        # Cross-attention: Sensor query attending to Visual key-value
        q_s = self.w_q_s(s_emb)
        k_v = self.w_k_v(v_emb)
        v_v = self.w_v_v(v_emb)
        score_s2v = torch.sum(q_s * k_v, dim=-1, keepdim=True) * self.scale
        attn_v = torch.sigmoid(score_s2v) * v_v

        # Gated fusion
        pair = torch.cat([v_emb, s_emb], dim=-1)
        weights = self.gate(pair)  # (batch_size, 2) -> [alpha_v, alpha_s]

        alpha_v = weights[:, 0:1]
        alpha_s = weights[:, 1:2]

        weighted_v = alpha_v * (v_emb + attn_v)
        weighted_s = alpha_s * (s_emb + attn_s)

        fused = torch.cat([weighted_v, weighted_s], dim=-1)  # (batch_size, embed_dim * 2)
        return fused, weights


class MultimodalAttentionFusionModel(nn.Module):
    """
    Trainable Multimodal Fusion Network.
    Accepts 64-d visual embedding + 64-d sensor LSTM embedding.
    Predicts:
    1. Spoilage Stage Logits (4 classes)
    2. Continuous Risk Score (0 - 100)
    3. Explicit Modality Attention Weights (alpha_visual, alpha_sensor)
    """
    def __init__(self, embed_dim: int = 64, num_classes: int = 4, dropout: float = 0.2):
        super().__init__()
        self.cross_attn = CrossModalAttentionLayer(embed_dim=embed_dim)

        self.classifier = nn.Sequential(
            nn.Linear(embed_dim * 2, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Dropout(dropout),
            nn.Linear(64, num_classes)
        )

        self.risk_regressor = nn.Sequential(
            nn.Linear(embed_dim * 2, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()  # Multiplied by 100 in forward
        )

    def forward(self, v_emb: torch.Tensor, s_emb: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        v_emb: (batch_size, 64)
        s_emb: (batch_size, 64)
        Returns:
        - logits: (batch_size, num_classes)
        - risk_score: (batch_size, 1) in range [0, 100]
        - attention_weights: (batch_size, 2) [alpha_v, alpha_s]
        """
        fused, weights = self.cross_attn(v_emb, s_emb)
        logits = self.classifier(fused)
        risk = self.risk_regressor(fused) * 100.0
        return logits, risk, weights


def compute_multimodal_confidence(probs: torch.Tensor, alpha_weights: torch.Tensor) -> float:
    """
    Computes calibrated Multimodal Spoilage Confidence.
    Peak class probability balanced by modality agreement (lower divergence between modalities).
    """
    p = probs.detach().cpu().numpy().squeeze()
    max_p = float(np.max(p))
    w = alpha_weights.detach().cpu().numpy().squeeze()
    # Modality balance bonus: if both modalities contribute smoothly, confidence is higher
    balance = float(1.0 - abs(w[0] - w[1]) * 0.25)
    confidence = float(np.clip(max_p * balance, 0.2, 0.99))
    return round(confidence, 4)
