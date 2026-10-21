package com.spoilai.dto;

public class ActuatorCommandDto {
    private String deviceId;
    private Long foodSampleId;
    private String actuatorType;
    private String targetState;
    private String reason;

    public ActuatorCommandDto() {}

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public Long getFoodSampleId() { return foodSampleId; }
    public void setFoodSampleId(Long foodSampleId) { this.foodSampleId = foodSampleId; }
    public String getActuatorType() { return actuatorType; }
    public void setActuatorType(String actuatorType) { this.actuatorType = actuatorType; }
    public String getTargetState() { return targetState; }
    public void setTargetState(String targetState) { this.targetState = targetState; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
