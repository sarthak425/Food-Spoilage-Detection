package com.spoilai.dto;

import java.time.LocalDateTime;

public class AlertDto {
    private Long id;
    private Long foodSampleId;
    private String deviceId;
    private String alertType;
    private String severity;
    private String message;
    private Boolean acknowledged;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime createdAt;

    public AlertDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getFoodSampleId() { return foodSampleId; }
    public void setFoodSampleId(Long foodSampleId) { this.foodSampleId = foodSampleId; }
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Boolean getAcknowledged() { return acknowledged; }
    public void setAcknowledged(Boolean acknowledged) { this.acknowledged = acknowledged; }
    public LocalDateTime getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
