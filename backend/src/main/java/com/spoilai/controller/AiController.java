package com.spoilai.controller;

import com.spoilai.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Intelligence", description = "Food image analysis, sensor time-series classification, and multimodal fusion")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping(value = "/predict/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and analyze a food image with computer vision spoilage models")
    public ResponseEntity<Map<String, Object>> analyzeImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "foodCategory", required = false, defaultValue = "APPLE") String foodCategory,
            @RequestParam(value = "sampleId", required = false) Long sampleId) {
        return ResponseEntity.ok(aiService.analyzeFoodImage(file, foodCategory, sampleId));
    }

    @PostMapping("/predict/sensor")
    @Operation(summary = "Predict spoilage stage and risk index from sensor time-series sequence")
    public ResponseEntity<Map<String, Object>> predictSensor(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(aiService.predictSensorTimeSeries(payload));
    }

    @PostMapping("/predict/fusion")
    @Operation(summary = "Multimodal cross-attention prediction combining visual features and sensor volatility")
    public ResponseEntity<Map<String, Object>> predictFusion(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(aiService.predictMultimodalFusion(payload));
    }

    @PostMapping("/predict/shelf-life")
    @Operation(summary = "Estimate remaining shelf life based on degradation kinetics")
    public ResponseEntity<Map<String, Object>> predictShelfLife(
            @RequestParam(defaultValue = "APPLE") String foodCategory,
            @RequestParam(defaultValue = "20.0") Double riskScore) {
        return ResponseEntity.ok(aiService.predictShelfLife(foodCategory, riskScore));
    }

    @GetMapping("/models/status")
    @Operation(summary = "Retrieve real-time operational status and metrics of registered AI models")
    public ResponseEntity<Map<String, Object>> getModelsStatus() {
        return ResponseEntity.ok(aiService.getAiModelsStatus());
    }
}
