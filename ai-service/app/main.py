from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime

app = FastAPI(
    title="Spoil AI — Computer Vision & Multimodal Intelligence Service",
    description="FastAPI microservice providing YOLOv8 image analysis, LSTM/CNN sensor predictions, and attention-based multimodal fusion.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SensorDataPoint(BaseModel):
    timestamp: Optional[str] = None
    temperatureC: float
    humidityPercent: float
    gasValue: float
    weightGrams: Optional[float] = None
    lightLux: Optional[float] = None

class SensorPredictRequest(BaseModel):
    foodSampleId: Optional[int] = None
    foodCategory: str
    readings: List[SensorDataPoint]

class FusionPredictRequest(BaseModel):
    foodSampleId: Optional[int] = None
    foodCategory: str
    imageId: Optional[str] = None
    recentReadings: List[SensorDataPoint]

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "spoil-ai-intelligence",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@app.get("/models/status")
def get_models_status():
    return {
        "models": [
            {
                "name": "YOLOv8-FoodSpoil-Vision",
                "version": "1.0.0",
                "type": "OBJECT_DETECTION",
                "status": "DEMO_MODE",
                "trained": False,
                "notes": "Pretrained generic weights. Spoilage visual classifier pending domain dataset."
            },
            {
                "name": "LSTM-Sensor-TimeSeries",
                "version": "1.0.0",
                "type": "SENSOR_CLASSIFICATION",
                "status": "DEMO_MODE",
                "trained": False,
                "notes": "Rules and heuristic baseline active until trained time-series weights loaded."
            },
            {
                "name": "Multimodal-Attention-Fusion",
                "version": "1.0.0",
                "type": "MULTIMODAL_FUSION",
                "status": "DEMO_MODE",
                "trained": False,
                "notes": "Target research architecture: Cross-attention fusion between visual & environmental embeddings."
            }
        ]
    }

@app.post("/predict/image")
async def predict_image(
    file: UploadFile = File(...),
    foodCategory: str = Form("APPLE")
):
    """
    Image Analysis Endpoint (Phase 3 Foundation).
    Detects food category, detects visual anomalies, and reports confidence.
    """
    valid_categories = ["APPLE", "BANANA", "TOMATO", "MANGO", "OTHER"]
    cat_upper = foodCategory.upper()
    if cat_upper not in valid_categories:
        return {
            "success": False,
            "error_code": "UNSUPPORTED_FOOD_TYPE",
            "message": f"Food category '{foodCategory}' is not currently supported."
        }

    return {
        "success": True,
        "foodCategory": cat_upper,
        "is_trained_model": False,
        "model_name": "YOLOv8-FoodSpoil-Vision",
        "model_version": "1.0.0",
        "status": "DEMO_MODE",
        "filename": file.filename,
        "detected_items": [
            {
                "label": cat_upper.capitalize(),
                "confidence": 0.88,
                "box": [50, 50, 320, 320]
            }
        ],
        "spoilage_features": {
            "surface_browning_percent": 12.5,
            "discoloration_score": 0.18,
            "texture_softening_detected": False
        },
        "spoilage_stage": "FRESH",
        "confidence": 0.85,
        "warning": "Demonstration prediction. Model requires domain-specific fine-tuning for production spoilage certification."
    }

@app.post("/predict/sensor")
def predict_sensor(data: SensorPredictRequest):
    """
    Sensor Time-Series Analysis Endpoint (Phase 4 Foundation).
    """
    if not data.readings:
        raise HTTPException(status_code=400, detail="At least one reading required")

    latest = data.readings[-1]
    temp = latest.temperatureC
    gas = latest.gasValue
    hum = latest.humidityPercent

    # Algorithmic heuristic baseline for sensor time series
    risk_score = min(100.0, max(0.0, (temp - 20) * 3.5 + (gas - 300) * 0.25 + (hum - 60) * 0.5))

    stage = "FRESH"
    if risk_score > 75:
        stage = "SEVERE_SPOILAGE"
    elif risk_score > 50:
        stage = "MODERATE_SPOILAGE"
    elif risk_score > 25:
        stage = "EARLY_SPOILAGE"

    return {
        "success": True,
        "foodCategory": data.foodCategory,
        "is_trained_model": False,
        "model_name": "LSTM-Sensor-TimeSeries",
        "model_version": "1.0.0",
        "status": "DEMO_MODE",
        "spoilage_stage": stage,
        "risk_score": round(risk_score, 1),
        "confidence": 0.82,
        "data_points_analyzed": len(data.readings),
        "warning": "Rule-based demonstration output. Not certified food safety evidence."
    }

@app.post("/predict/fusion")
def predict_fusion(data: FusionPredictRequest):
    """
    Multimodal Attention-Based Fusion Endpoint.
    """
    return {
        "success": True,
        "foodCategory": data.foodCategory,
        "is_trained_model": False,
        "model_name": "Multimodal-Attention-Fusion",
        "model_version": "1.0.0",
        "status": "DEMO_MODE",
        "overall_stage": "FRESH",
        "risk_score": 18.5,
        "confidence": 0.87,
        "modalities_used": ["VISION_FEATURES", "TIME_SERIES_ENVIRONMENTAL"],
        "attention_weights": {
            "visual_branch": 0.45,
            "sensor_branch": 0.55
        },
        "estimated_shelf_life_hours": 96.0,
        "warning": "Demonstration fusion model active. Real weights require joint image-sensor aligned training dataset."
    }

@app.post("/predict/shelf-life")
def predict_shelf_life(foodCategory: str = "APPLE", riskScore: float = 20.0):
    baseline_days = {
        "APPLE": 14.0,
        "BANANA": 5.0,
        "TOMATO": 7.0,
        "MANGO": 6.0,
        "OTHER": 7.0
    }
    base = baseline_days.get(foodCategory.upper(), 7.0)
    remaining_days = max(0.2, round(base * (1.0 - (riskScore / 100.0)), 1))

    return {
        "success": True,
        "foodCategory": foodCategory,
        "estimated_remaining_days": remaining_days,
        "estimated_remaining_hours": round(remaining_days * 24, 1),
        "risk_score": riskScore,
        "status": "EXPERIMENTAL",
        "warning": "Experimental estimate only. Not certified food safety guarantee."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
