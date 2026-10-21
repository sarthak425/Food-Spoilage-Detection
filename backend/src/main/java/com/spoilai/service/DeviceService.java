package com.spoilai.service;

import com.spoilai.dto.DeviceDto;
import com.spoilai.entity.Device;
import com.spoilai.exception.ResourceNotFoundException;
import com.spoilai.repository.DeviceRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final PasswordEncoder passwordEncoder;

    public DeviceService(DeviceRepository deviceRepository, PasswordEncoder passwordEncoder) {
        this.deviceRepository = deviceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public DeviceDto registerDevice(DeviceDto dto) {
        if (deviceRepository.existsByDeviceId(dto.getDeviceId())) {
            throw new IllegalArgumentException("Device with ID " + dto.getDeviceId() + " is already registered.");
        }

        Device device = new Device();
        device.setDeviceId(dto.getDeviceId());
        device.setDeviceName(dto.getDeviceName());
        device.setDeviceType(dto.getDeviceType() != null ? dto.getDeviceType() : "ESP32_REAL");
        device.setStatus("ONLINE");
        device.setLastSeenAt(LocalDateTime.now());
        device.setCalibrationMetadata(dto.getCalibrationMetadata());

        // Generate raw API Key for the device if not provided
        String rawApiKey = dto.getApiKey();
        if (rawApiKey == null || rawApiKey.isBlank()) {
            rawApiKey = "spoil_key_" + UUID.randomUUID().toString().replace("-", "");
        }
        device.setApiKeyHash(passwordEncoder.encode(rawApiKey));

        Device saved = deviceRepository.save(device);

        DeviceDto response = mapToDto(saved);
        response.setApiKey(rawApiKey); // Return raw key only once at registration
        return response;
    }

    public List<DeviceDto> getAllDevices() {
        return deviceRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DeviceDto getDeviceById(String deviceId) {
        Device device = deviceRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + deviceId));
        return mapToDto(device);
    }

    @Transactional
    public void recordHeartbeat(String deviceId) {
        deviceRepository.findByDeviceId(deviceId).ifPresent(d -> {
            d.setLastSeenAt(LocalDateTime.now());
            d.setStatus("ONLINE");
            deviceRepository.save(d);
        });
    }

    public boolean validateDeviceKey(String deviceId, String rawApiKey) {
        return deviceRepository.findByDeviceId(deviceId)
                .map(device -> device.getApiKeyHash() != null && passwordEncoder.matches(rawApiKey, device.getApiKeyHash()))
                .orElse(false);
    }

    private DeviceDto mapToDto(Device device) {
        DeviceDto dto = new DeviceDto();
        dto.setId(device.getId());
        dto.setDeviceId(device.getDeviceId());
        dto.setDeviceName(device.getDeviceName());
        dto.setDeviceType(device.getDeviceType());
        dto.setStatus(device.getStatus());
        dto.setLastSeenAt(device.getLastSeenAt());
        dto.setCalibrationMetadata(device.getCalibrationMetadata());
        return dto;
    }
}
