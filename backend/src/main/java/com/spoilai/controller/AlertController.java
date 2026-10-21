package com.spoilai.controller;

import com.spoilai.dto.AlertDto;
import com.spoilai.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts", description = "Smart threshold alert notifications and acknowledgment")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    @Operation(summary = "Get list of recent alerts")
    public ResponseEntity<List<AlertDto>> getAlerts(@RequestParam(defaultValue = "false") boolean unacknowledgedOnly) {
        if (unacknowledgedOnly) {
            return ResponseEntity.ok(alertService.getUnacknowledgedAlerts());
        }
        return ResponseEntity.ok(alertService.getRecentAlerts());
    }

    @PutMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge an alert by ID")
    public ResponseEntity<AlertDto> acknowledgeAlert(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(id));
    }
}
