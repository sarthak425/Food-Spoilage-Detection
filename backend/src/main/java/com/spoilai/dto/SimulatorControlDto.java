package com.spoilai.dto;

public class SimulatorControlDto {
    private String action;
    private Long intervalMs = 3000L;
    private String scenario = "NORMAL";
    private Long foodSampleId = 1L;
    private String deviceId = "VIRTUAL_SENSOR_01";

    public SimulatorControlDto() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public Long getIntervalMs() { return intervalMs; }
    public void setIntervalMs(Long intervalMs) { this.intervalMs = intervalMs; }
    public String getScenario() { return scenario; }
    public void setScenario(String scenario) { this.scenario = scenario; }
    public Long getFoodSampleId() { return foodSampleId; }
    public void setFoodSampleId(Long foodSampleId) { this.foodSampleId = foodSampleId; }
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
}
