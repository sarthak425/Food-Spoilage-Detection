package com.spoilai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "actuator_events")
public class ActuatorEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", length = 64)
    private String deviceId;

    @Column(name = "food_sample_id")
    private Long foodSampleId;

    @Column(name = "actuator_type", nullable = false, length = 50)
    private String actuatorType;

    @Column(name = "target_state", nullable = false, length = 20)
    private String targetState;

    @Column(name = "triggered_by", nullable = false, length = 30)
    private String triggeredBy = "MANUAL_SIMULATION";

    @Column(length = 255)
    private String reason;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public ActuatorEvent() {}

    public ActuatorEvent(String deviceId, Long foodSampleId, String actuatorType, String targetState, String triggeredBy, String reason) {
        this.deviceId = deviceId;
        this.foodSampleId = foodSampleId;
        this.actuatorType = actuatorType;
        this.targetState = targetState;
        this.triggeredBy = triggeredBy != null ? triggeredBy : "MANUAL_SIMULATION";
        this.reason = reason;
        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public Long getFoodSampleId() { return foodSampleId; }
    public void setFoodSampleId(Long foodSampleId) { this.foodSampleId = foodSampleId; }
    public String getActuatorType() { return actuatorType; }
    public void setActuatorType(String actuatorType) { this.actuatorType = actuatorType; }
    public String getTargetState() { return targetState; }
    public void setTargetState(String targetState) { this.targetState = targetState; }
    public String getTriggeredBy() { return triggeredBy; }
    public void setTriggeredBy(String triggeredBy) { this.triggeredBy = triggeredBy; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
