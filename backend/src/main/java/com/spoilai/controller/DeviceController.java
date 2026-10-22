package com.spoilai.controller;

import com.spoilai.dto.DeviceDto;
import com.spoilai.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@Tag(name = "Devices", description = "ESP32 and Virtual IoT node registration and status")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Register a new device (ESP32 or Virtual node)")
    public ResponseEntity<DeviceDto> registerDevice(@Valid @RequestBody DeviceDto deviceDto) {
        return ResponseEntity.ok(deviceService.registerDevice(deviceDto));
    }

    @GetMapping
    @Operation(summary = "List all registered devices")
    public ResponseEntity<List<DeviceDto>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @GetMapping("/{deviceId}")
    @Operation(summary = "Get specific device details by Device ID")
    public ResponseEntity<DeviceDto> getDeviceById(@PathVariable String deviceId) {
        return ResponseEntity.ok(deviceService.getDeviceById(deviceId));
    }
}
