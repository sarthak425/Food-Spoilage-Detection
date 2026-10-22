"""
Spoil AI — AI Microservice Comprehensive Test Suite (unittest)
Validates:
1. Deep Learning Model Registry & Demonstration Mode Transparency.
2. Sequential Sensor BiLSTM Inference & Decoupled Sensor Confidence.
3. Trainable Multimodal Attention Fusion & Separated Confidences (detection, sensor, spoilage).
4. Vision Spoilage CNN & Photometric Analysis.
5. Kinetic Shelf-Life Validation metrics.
"""

import io
import unittest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.vision import analyze_food_image_cv


class TestAiMicroservice(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "HEALTHY")
        self.assertEqual(data["service"], "spoil-ai-intelligence")

    def test_02_models_status_demonstration_mode(self):
        response = self.client.get("/models/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["global_mode"], "DEMONSTRATION MODE")
        self.assertIn("DEMONSTRATION MODE", data["mode_disclaimer"])

        model_names = [m["name"] for m in data["models"]]
        self.assertIn("YOLOv8-Nano-Food-Detector", model_names)
        self.assertIn("Spoilage-Vision-CNN-Classifier", model_names)
        self.assertIn("PyTorch-BiLSTM-Sensor-TimeSeries", model_names)
        self.assertIn("Trainable-Multimodal-Attention-Fusion", model_names)
        self.assertIn("Arrhenius-Q10-ShelfLife-Kinetic-Model", model_names)

        # Check that accuracy and confidence metrics are reported
        for m in data["models"]:
            self.assertTrue("confidence_metric" in m or "validation_metrics" in m)

        # Check shelf-life validation report
        shelf_val = data.get("shelf_life_validation", {})
        self.assertEqual(shelf_val.get("status"), "VALIDATED")
        self.assertIn("mae_days", shelf_val.get("metrics", {}))
        self.assertGreater(shelf_val["metrics"]["r2_score"], 0.90)

    def test_03_predict_sensor_lstm(self):
        payload = {
            "foodCategory": "APPLE",
            "readings": [
                {"temperatureC": 12.0, "humidityPercent": 55.0, "gasValue": 180.0, "weightGrams": 150.0, "lightLux": 250.0},
                {"temperatureC": 12.5, "humidityPercent": 56.0, "gasValue": 185.0, "weightGrams": 150.0, "lightLux": 250.0},
                {"temperatureC": 13.0, "humidityPercent": 56.5, "gasValue": 190.0, "weightGrams": 149.8, "lightLux": 250.0},
                {"temperatureC": 13.2, "humidityPercent": 57.0, "gasValue": 195.0, "weightGrams": 149.7, "lightLux": 250.0},
                {"temperatureC": 13.5, "humidityPercent": 58.0, "gasValue": 200.0, "weightGrams": 149.5, "lightLux": 250.0}
            ]
        }
        response = self.client.post("/predict/sensor", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["mode"], "DEMONSTRATION MODE (SYNTHETIC BENCHMARK)")
        self.assertEqual(data["model_name"], "PyTorch-BiLSTM-Sensor-TimeSeries")
        self.assertIn(data["spoilage_stage"], ["FRESH", "EARLY_SPOILAGE", "MODERATE_SPOILAGE", "SEVERE_SPOILAGE"])
        self.assertIn("sensor_confidence", data)
        self.assertTrue(0.0 <= data["sensor_confidence"] <= 1.0)
        self.assertEqual(len(data["temporal_attention_weights"]), 10)
        self.assertEqual(len(data["sensor_embedding"]), 64)

    def test_04_predict_multimodal_fusion_decoupled_confidences(self):
        payload = {
            "foodCategory": "BANANA",
            "browningPercent": 14.5,
            "discolorationScore": 0.22,
            "detectionConfidence": 0.94,
            "visionConfidence": 0.89,
            "recentReadings": [
                {"temperatureC": 20.0, "humidityPercent": 65.0, "gasValue": 320.0, "weightGrams": 120.0, "lightLux": 200.0},
                {"temperatureC": 21.0, "humidityPercent": 66.0, "gasValue": 330.0, "weightGrams": 119.5, "lightLux": 200.0},
                {"temperatureC": 22.0, "humidityPercent": 68.0, "gasValue": 350.0, "weightGrams": 119.0, "lightLux": 200.0}
            ]
        }
        response = self.client.post("/predict/fusion", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["mode"], "DEMONSTRATION MODE (SYNTHETIC BENCHMARK)")
        self.assertEqual(data["model_name"], "Trainable-Multimodal-Attention-Fusion")

        # Verify explicitly decoupled confidences
        self.assertIn("detection_confidence", data)
        self.assertIn("sensor_confidence", data)
        self.assertIn("vision_confidence", data)
        self.assertIn("spoilage_confidence", data)
        self.assertEqual(data["detection_confidence"], 0.94)
        self.assertTrue(0.0 <= data["spoilage_confidence"] <= 1.0)

        # Verify cross-attention weights
        attn = data["attention_weights"]
        self.assertIn("visual_branch", attn)
        self.assertIn("sensor_branch", attn)
        self.assertEqual(round(attn["visual_branch"] + attn["sensor_branch"], 1), 1.0)

        # Verify shelf-life estimation attached
        self.assertGreater(data["estimated_shelf_life_days"], 0)
        self.assertGreater(data["estimated_shelf_life_hours"], 0)

    def test_05_predict_shelf_life_empirical(self):
        response = self.client.post("/predict/shelf-life?foodCategory=APPLE&riskScore=30.0&storageTempC=20.0")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["mode"], "DEMONSTRATION MODE (CALIBRATED EMPIRICAL BENCHMARK)")
        self.assertGreater(data["estimated_remaining_days"], 0)
        self.assertIn("validation_summary", data)
        self.assertLessEqual(data["validation_summary"]["mae_days"], 0.50)
        self.assertGreaterEqual(data["validation_summary"]["r2_score"], 0.90)

    def test_06_image_vision_analysis(self):
        img = Image.new("RGB", (256, 256), color=(200, 50, 50))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        img_bytes = buf.getvalue()

        result = analyze_food_image_cv(img_bytes, requested_category="APPLE")
        self.assertTrue(result["success"])
        self.assertEqual(result["mode"], "DEMONSTRATION MODE (SYNTHETIC BENCHMARK)")
        self.assertIn("detection_confidence", result)
        self.assertIn("vision_confidence", result)
        self.assertIn("spoilage_features", result)
        self.assertIn("surface_browning_percent", result["spoilage_features"])
        self.assertIn("discoloration_score", result["spoilage_features"])
        self.assertGreater(len(result["detected_items"]), 0)


if __name__ == "__main__":
    unittest.main()
