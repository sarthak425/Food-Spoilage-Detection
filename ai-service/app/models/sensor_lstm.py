"""
Spoil AI — Sequential Sensor Deep Learning Architecture
Implements an actual PyTorch Bidirectional LSTM with temporal self-attention
for multivariate sensor time-series classification and feature embedding extraction.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Tuple, Dict, Any


class TemporalSelfAttention(nn.Module):
    """
    Computes learned attention weights across time steps in the sensor sequence.
    """
    def __init__(self, hidden_dim: int):
        super().__init__()
        self.attn_linear = nn.Linear(hidden_dim, 1)

    def forward(self, lstm_outputs: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        # lstm_outputs shape: (batch_size, seq_len, hidden_dim)
        scores = self.attn_linear(lstm_outputs)  # (batch_size, seq_len, 1)
        weights = F.softmax(scores, dim=1)        # (batch_size, seq_len, 1)
        # Context vector is weighted sum across time
        context = torch.sum(weights * lstm_outputs, dim=1)  # (batch_size, hidden_dim)
        return context, weights.squeeze(-1)


class SensorLSTMClassifier(nn.Module):
    """
    Bidirectional LSTM Classifier for Multi-Sensor Temporal Sequences.
    Input features: [TemperatureC, HumidityPercent, GasValue, WeightGrams, LightLux]
    Outputs:
    - 4-class logits (FRESH, EARLY_SPOILAGE, MODERATE_SPOILAGE, SEVERE_SPOILAGE)
    - 64-dimensional temporal sensor embedding for multimodal cross-attention fusion
    - Temporal attention weights across the sensor time series
    """
    def __init__(self, input_dim: int = 5, hidden_dim: int = 64, num_layers: int = 2,
                 num_classes: int = 4, dropout: float = 0.2):
        super().__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_classes = num_classes

        # Initial feature projection
        self.proj = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.ReLU(),
            nn.BatchNorm1d(32)
        )

        # 2-layer Bidirectional LSTM
        self.lstm = nn.LSTM(
            input_size=32,
            hidden_size=hidden_dim // 2,  # Bidirectional doubles it back to hidden_dim
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0.0
        )

        # Temporal attention mechanism
        self.temporal_attention = TemporalSelfAttention(hidden_dim=hidden_dim)

        # Latent multimodal embedding layer (64-dimensional)
        self.embedding_head = nn.Sequential(
            nn.Linear(hidden_dim, 64),
            nn.ReLU(),
            nn.LayerNorm(64)
        )

        # Classification Head
        self.classifier = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, num_classes)
        )

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        x: Tensor of shape (batch_size, seq_len, input_dim)
        Returns:
        - logits: (batch_size, num_classes)
        - embedding: (batch_size, 64)
        - temporal_weights: (batch_size, seq_len)
        """
        batch_size, seq_len, _ = x.shape

        # Reshape to project per-timestep features
        x_reshaped = x.view(batch_size * seq_len, self.input_dim)
        proj = self.proj(x_reshaped)
        proj = proj.view(batch_size, seq_len, 32)

        # Pass through bidirectional LSTM
        lstm_out, _ = self.lstm(proj)  # (batch_size, seq_len, hidden_dim)

        # Attention pool across temporal dimension
        context, temp_weights = self.temporal_attention(lstm_out)  # (batch_size, hidden_dim)

        # Generate latent representation for multimodal fusion
        embedding = self.embedding_head(context)  # (batch_size, 64)

        # Class logits
        logits = self.classifier(embedding)  # (batch_size, num_classes)

        return logits, embedding, temp_weights


def compute_sequence_confidence(probs: torch.Tensor, temp_weights: torch.Tensor) -> float:
    """
    Computes a decoupled confidence score for sensor prediction.
    Derived from:
    1. Maximum class probability (certainty).
    2. Normalized Shannon entropy of the probability distribution (uncertainty penalty).
    """
    p = probs.detach().cpu().numpy().squeeze()
    max_p = float(np.max(p))
    # Normalized entropy penalty: H in [0, 1] for 4 classes
    entropy = -np.sum(p * np.log(np.clip(p, 1e-7, 1.0))) / np.log(len(p))
    confidence = float(np.clip(max_p * (1.0 - 0.4 * entropy), 0.05, 0.99))
    return round(confidence, 4)
