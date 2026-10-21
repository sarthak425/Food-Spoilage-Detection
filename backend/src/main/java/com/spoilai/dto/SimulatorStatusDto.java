package com.spoilai.dto;

public class SimulatorStatusDto {
    private Boolean running;
    private Long intervalMs;
    private String scenario;
    private Long foodSampleId;
    private String deviceId;
    private Long readingsGenerated;
    private SensorReadingResponseDto latestReading;

    public SimulatorStatusDto() {}

    public SimulatorStatusDto(Boolean running, Long intervalMs, String scenario, Long foodSampleId,
                              String deviceId, Long readingsGenerated, SensorReadingResponseDto latestReading) {
        this.running = running;
        this.intervalMs = intervalMs;
        this.scenario = scenario;
        this.foodSampleId = foodSampleId;
        this.deviceId = deviceId;
        this.readingsGenerated = readingsGenerated;
        this.latestReading = latestReading;
    }

    public Boolean getRunning() { return running; }
    public void setRunning(Boolean running) { this.running = running; }
    public Long getIntervalMs() { return intervalMs; }
    public void setIntervalMs(Long intervalMs) { this.intervalMs = intervalMs; }
    public String getScenario() { return scenario; }
    public void setScenario(String scenario) { this.scenario = scenario; }
    public Long getFoodSampleId() { return foodSampleId; }
    public void setFoodSampleId(Long foodSampleId) { this.foodSampleId = foodSampleId; }
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public Long getReadingsGenerated() { return readingsGenerated; }
    public void setReadingsGenerated(Long readingsGenerated) { this.readingsGenerated = readingsGenerated; }
    public SensorReadingResponseDto getLatestReading() { return latestReading; }
    public void setLatestReading(SensorReadingResponseDto latestReading) { this.latestReading = latestReading; }
}
