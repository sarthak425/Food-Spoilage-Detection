package com.spoilai.controller;

import com.spoilai.dto.SensorReadingRequestDto;
import com.spoilai.dto.SensorReadingResponseDto;
import com.spoilai.service.SensorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensors")
@Tag(name = "Sensors", description = "Sensor ingestion API (DHT22, MQ135, HX711, Light) and telemetry retrieval")
public class SensorController {

    private final SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    @PostMapping("/readings")
    @Operation(summary = "Receive sensor telemetry from ESP32 or Virtual Simulator")
    public ResponseEntity<SensorReadingResponseDto> ingestReading(@Valid @RequestBody SensorReadingRequestDto readingDto) {
        return ResponseEntity.ok(sensorService.ingestReading(readingDto));
    }

    @GetMapping("/latest")
    @Operation(summary = "Get the latest overall sensor measurement")
    public ResponseEntity<SensorReadingResponseDto> getLatestReading() {
        return sensorService.getLatestReading()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/latest/{sampleId}")
    @Operation(summary = "Get the latest sensor measurement for a specific food sample")
    public ResponseEntity<SensorReadingResponseDto> getLatestReadingForSample(@PathVariable Long sampleId) {
        return sensorService.getLatestReadingForSample(sampleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/history")
    @Operation(summary = "Get recent sensor readings history")
    public ResponseEntity<List<SensorReadingResponseDto>> getHistory(@RequestParam(required = false) Long sampleId) {
        return ResponseEntity.ok(sensorService.getRecentHistory(sampleId));
    }

    @GetMapping("/history/{sampleId}")
    @Operation(summary = "Get recent sensor readings history for a specific food sample")
    public ResponseEntity<List<SensorReadingResponseDto>> getSampleHistory(@PathVariable Long sampleId) {
        return ResponseEntity.ok(sensorService.getRecentHistory(sampleId));
    }
}
