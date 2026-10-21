package com.spoilai.controller;

import com.spoilai.dto.SimulatorControlDto;
import com.spoilai.dto.SimulatorStatusDto;
import com.spoilai.service.SimulatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/simulator")
@Tag(name = "Sensor Simulator", description = "Control and monitor virtual DHT22, MQ135, and HX711 simulations")
public class SimulatorController {

    private final SimulatorService simulatorService;

    public SimulatorController(SimulatorService simulatorService) {
        this.simulatorService = simulatorService;
    }

    @PostMapping("/start")
    @Operation(summary = "Start virtual sensor simulation")
    public ResponseEntity<SimulatorStatusDto> startSimulator(@RequestBody(required = false) SimulatorControlDto controlDto) {
        return ResponseEntity.ok(simulatorService.startSimulation(controlDto));
    }

    @PostMapping("/stop")
    @Operation(summary = "Stop virtual sensor simulation")
    public ResponseEntity<SimulatorStatusDto> stopSimulator() {
        return ResponseEntity.ok(simulatorService.stopSimulation());
    }

    @GetMapping("/status")
    @Operation(summary = "Get current virtual simulator status and telemetry metrics")
    public ResponseEntity<SimulatorStatusDto> getStatus() {
        return ResponseEntity.ok(simulatorService.getStatus());
    }

    @PostMapping("/scenario")
    @Operation(summary = "Switch simulation scenario: NORMAL, WARMING, HIGH_HUMIDITY, SPOILAGE_PRONE")
    public ResponseEntity<SimulatorStatusDto> setScenario(@RequestBody Map<String, String> payload) {
        String scenario = payload.getOrDefault("scenario", "NORMAL");
        return ResponseEntity.ok(simulatorService.setScenario(scenario));
    }
}
