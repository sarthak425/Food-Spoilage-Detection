package com.spoilai.dto;

import java.time.LocalDateTime;

public class ActuatorStatusDto {
    private String coolingFan = "OFF";
    private String ventilationFan = "OFF";
    private String buzzer = "OFF";
    private String ledIndicator = "GREEN";
    private String servoSorter = "IDLE";
    private LocalDateTime lastUpdated = LocalDateTime.now();

    public ActuatorStatusDto() {}

    public String getCoolingFan() { return coolingFan; }
    public void setCoolingFan(String coolingFan) { this.coolingFan = coolingFan; }
    public String getVentilationFan() { return ventilationFan; }
    public void setVentilationFan(String ventilationFan) { this.ventilationFan = ventilationFan; }
    public String getBuzzer() { return buzzer; }
    public void setBuzzer(String buzzer) { this.buzzer = buzzer; }
    public String getLedIndicator() { return ledIndicator; }
    public void setLedIndicator(String ledIndicator) { this.ledIndicator = ledIndicator; }
    public String getServoSorter() { return servoSorter; }
    public void setServoSorter(String servoSorter) { this.servoSorter = servoSorter; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
