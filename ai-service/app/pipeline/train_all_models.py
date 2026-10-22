"""
Spoil AI — Deep Learning Training & Benchmark Pipeline
Trains:
1. PyTorch SensorLSTMClassifier (Sequential multi-sensor time-series)
2. PyTorch SpoilageVisionClassifier (Cropped food image spoilage classification)
3. PyTorch MultimodalAttentionFusionModel (Trainable cross-modal attention fusion)
4. Evaluates & saves validation metrics with DEMONSTRATION MODE transparency notices.
"""

import os
import json
import datetime
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split

from app.pipeline.dataset_preparation import (
    generate_multimodal_dataset,
    AlignedMultimodalDataset,
    STAGE_LABELS,
    SENSOR_MEANS,
    SENSOR_STDS
)
from app.models.sensor_lstm import SensorLSTMClassifier
from app.models.spoilage_cnn import SpoilageVisionClassifier
from app.models.attention_fusion import MultimodalAttentionFusionModel
from app.pipeline.validate_shelf_life import run_shelf_life_validation

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))
os.makedirs(MODELS_DIR, exist_ok=True)


def train_models():
    print("=" * 65)
    print("  Spoil AI — End-to-End Deep Learning Training Pipeline")
    print("  Status: DEMONSTRATION MODE (Synthesized Empirical Benchmark)")
    print("=" * 65)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f">> Training device: {device}")

    # 1. Dataset Generation & Loading
    print(">> Generating aligned multimodal food dataset (N=2000 samples)...")
    raw_data = generate_multimodal_dataset(n_samples=2000, seq_len=10, random_seed=42)
    dataset = AlignedMultimodalDataset(
        sensors=raw_data["sensors"],
        images=raw_data["images"],
        stages=raw_data["stages"],
        shelf_lifes=raw_data["shelf_lifes"]
    )

    # Train / Val / Test split: 70% / 15% / 15%
    total_len = len(dataset)
    train_len = int(0.70 * total_len)
    val_len = int(0.15 * total_len)
    test_len = total_len - train_len - val_len

    train_set, val_set, test_set = random_split(
        dataset, [train_len, val_len, test_len],
        generator=torch.Generator().manual_seed(42)
    )

    train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_set, batch_size=32, shuffle=False)
    test_loader = DataLoader(test_set, batch_size=32, shuffle=False)

    print(f">> Dataset splits: Train={train_len}, Val={val_len}, Test={test_len}")

    # 2. Instantiate Neural Architectures
    sensor_model = SensorLSTMClassifier(input_dim=5, hidden_dim=64, num_layers=2, num_classes=4).to(device)
    vision_model = SpoilageVisionClassifier(num_classes=4, embedding_dim=64).to(device)
    fusion_model = MultimodalAttentionFusionModel(embed_dim=64, num_classes=4).to(device)

    criterion_cls = nn.CrossEntropyLoss()
    criterion_reg = nn.MSELoss()

    optimizer = optim.Adam([
        {"params": sensor_model.parameters(), "lr": 1e-3},
        {"params": vision_model.parameters(), "lr": 1e-3},
        {"params": fusion_model.parameters(), "lr": 1e-3}
    ], weight_decay=1e-4)

    # 3. Training Loop (Joint multimodal fine-tuning)
    epochs = 12
    print(f">> Beginning joint training over {epochs} epochs...")

    for epoch in range(1, epochs + 1):
        sensor_model.train()
        vision_model.train()
        fusion_model.train()

        running_loss = 0.0
        correct_fusion = 0
        total_samples = 0

        for batch in train_loader:
            s_seq = batch["sensor"].to(device)      # (B, 10, 5)
            img = batch["image"].to(device)          # (B, 3, 224, 224)
            stage_labels = batch["stage"].to(device) # (B,)

            # Target risk score: 0 -> 10, 1 -> 35, 2 -> 65, 3 -> 90
            target_risk = (stage_labels.float() * 26.6 + 10.0).unsqueeze(1)

            optimizer.zero_grad()

            # Forward passes through unimodal encoders
            s_logits, s_emb, _ = sensor_model(s_seq)
            v_logits, v_emb = vision_model(img)

            # Multimodal attention fusion
            f_logits, f_risk, _ = fusion_model(v_emb, s_emb)

            loss_s = criterion_cls(s_logits, stage_labels)
            loss_v = criterion_cls(v_logits, stage_labels)
            loss_f_cls = criterion_cls(f_logits, stage_labels)
            loss_f_risk = criterion_reg(f_risk, target_risk) * 0.01

            total_loss = loss_s + loss_v + loss_f_cls + loss_f_risk
            total_loss.backward()
            optimizer.step()

            running_loss += total_loss.item() * s_seq.size(0)
            preds = torch.argmax(f_logits, dim=-1)
            correct_fusion += (preds == stage_labels).sum().item()
            total_samples += s_seq.size(0)

        epoch_loss = running_loss / total_samples
        epoch_acc = correct_fusion / total_samples

        if epoch % 3 == 0 or epoch == epochs:
            print(f"   [Epoch {epoch:02d}/{epochs:02d}] Joint Loss: {epoch_loss:.4f} | Fusion Train Acc: {epoch_acc * 100:.2f}%")

    # 4. Evaluation on Hold-Out Test Set
    sensor_model.eval()
    vision_model.eval()
    fusion_model.eval()

    test_correct_s = 0
    test_correct_v = 0
    test_correct_f = 0
    test_total = 0

    with torch.no_grad():
        for batch in test_loader:
            s_seq = batch["sensor"].to(device)
            img = batch["image"].to(device)
            stage_labels = batch["stage"].to(device)

            s_logits, s_emb, _ = sensor_model(s_seq)
            v_logits, v_emb = vision_model(img)
            f_logits, f_risk, _ = fusion_model(v_emb, s_emb)

            test_correct_s += (torch.argmax(s_logits, dim=-1) == stage_labels).sum().item()
            test_correct_v += (torch.argmax(v_logits, dim=-1) == stage_labels).sum().item()
            test_correct_f += (torch.argmax(f_logits, dim=-1) == stage_labels).sum().item()
            test_total += s_seq.size(0)

    acc_s = round(float(test_correct_s / test_total) * 100.0, 2)
    acc_v = round(float(test_correct_v / test_total) * 100.0, 2)
    acc_f = round(float(test_correct_f / test_total) * 100.0, 2)

    print("=" * 65)
    print(f">> Hold-Out Test Results (N={test_total}):")
    print(f"   - Sensor LSTM Test Accuracy:       {acc_s}%")
    print(f"   - Spoilage Vision CNN Accuracy:     {acc_v}%")
    print(f"   - Multimodal Attention Fusion Acc:  {acc_f}%")
    print("=" * 65)

    # 5. Save PyTorch Model Checkpoints
    sensor_ckpt_path = os.path.join(MODELS_DIR, "sensor_lstm.pt")
    vision_ckpt_path = os.path.join(MODELS_DIR, "spoilage_cnn.pt")
    fusion_ckpt_path = os.path.join(MODELS_DIR, "attention_fusion.pt")

    torch.save(sensor_model.state_dict(), sensor_ckpt_path)
    torch.save(vision_model.state_dict(), vision_ckpt_path)
    torch.save(fusion_model.state_dict(), fusion_ckpt_path)

    # 6. Save Metadata & Calibration Artifacts
    metadata = {
        "mode": "DEMONSTRATION MODE (SYNTHETIC BENCHMARK)",
        "demonstration_warning": "These models and metrics are evaluated on scientifically synthesized degradation kinetics. DO NOT use as certified food safety diagnostics without empirical lab calibration.",
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "models": {
            "sensor_lstm": {
                "name": "PyTorch-BiLSTM-Sensor-TimeSeries",
                "architecture": "Bidirectional LSTM (2 layers, hidden_dim=64) + Temporal Self-Attention",
                "test_accuracy_percent": acc_s,
                "input_features": ["temperatureC", "humidityPercent", "gasValue", "weightGrams", "lightLux"],
                "sensor_means": SENSOR_MEANS.tolist(),
                "sensor_stds": SENSOR_STDS.tolist(),
                "status": "ONLINE"
            },
            "spoilage_vision_cnn": {
                "name": "Spoilage-Vision-CNN-Classifier",
                "architecture": "Deep Multi-Scale Residual CNN + 64-d Visual Latent Embedding",
                "test_accuracy_percent": acc_v,
                "status": "ONLINE"
            },
            "attention_fusion": {
                "name": "Trainable-Multimodal-Attention-Fusion",
                "architecture": "Cross-Modal Scaled Dot-Product Attention (Vision-to-Sensor & Sensor-to-Vision)",
                "test_accuracy_percent": acc_f,
                "status": "ONLINE"
            }
        },
        "stage_labels": STAGE_LABELS
    }

    meta_path = os.path.join(MODELS_DIR, "models_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    # 7. Run Shelf-Life Empirical Validation
    shelf_life_res = run_shelf_life_validation()

    print(">> All deep learning models, metadata, and validation reports saved successfully.")
    return metadata


if __name__ == "__main__":
    train_models()
