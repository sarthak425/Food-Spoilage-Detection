package com.spoilai.controller;

import com.spoilai.dto.ActuatorCommandDto;
import com.spoilai.dto.ActuatorStatusDto;
import com.spoilai.entity.ActuatorEvent;
import com.spoilai.service.ActuatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actuators")
@Tag(name = "Actuators", description = "Virtual actuator control panel (cooling, ventilation, buzzer, LED, sorter)")
public class ActuatorController {

    private final ActuatorService actuatorService;

    public ActuatorController(ActuatorService actuatorService) {
        this.actuatorService = actuatorService;
    }

    @GetMapping("/state")
    @Operation(summary = "Get current virtual actuator operational state")
    public ResponseEntity<ActuatorStatusDto> getActuatorStatus() {
        return ResponseEntity.ok(actuatorService.getCurrentStatus());
    }

    @PostMapping("/trigger")
    @Operation(summary = "Manually trigger or test simulated actuator state")
    public ResponseEntity<ActuatorStatusDto> triggerActuator(@RequestBody ActuatorCommandDto command) {
        return ResponseEntity.ok(actuatorService.triggerActuator(command));
    }

    @GetMapping("/events")
    @Operation(summary = "Get recent actuator activation event history")
    public ResponseEntity<List<ActuatorEvent>> getRecentEvents() {
        return ResponseEntity.ok(actuatorService.getRecentEvents());
    }
}
