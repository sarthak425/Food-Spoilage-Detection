package com.spoilai.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class DeviceDto {
    private Long id;

    @NotBlank(message = "deviceId is required")
    private String deviceId;

    @NotBlank(message = "deviceName is required")
    private String deviceName;

    private String apiKey;
    private String deviceType = "VIRTUAL";
    private String status = "ONLINE";
    private LocalDateTime lastSeenAt;
    private String calibrationMetadata;

    public DeviceDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public String getDeviceType() { return deviceType; }
    public void setDeviceType(String deviceType) { this.deviceType = deviceType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }
    public String getCalibrationMetadata() { return calibrationMetadata; }
    public void setCalibrationMetadata(String calibrationMetadata) { this.calibrationMetadata = calibrationMetadata; }
}
