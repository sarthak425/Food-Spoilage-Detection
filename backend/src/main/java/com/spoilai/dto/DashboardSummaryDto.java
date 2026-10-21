package com.spoilai.dto;

import java.util.List;

public class DashboardSummaryDto {
    private Long totalMonitoredSamples;
    private Long freshCount;
    private Long earlySpoilageCount;
    private Long moderateSpoilageCount;
    private Long severeSpoilageCount;
    private Double currentRiskScore;
    private Double estimatedShelfLifeDays;
    private Long activeAlertsCount;
    private Boolean sensorsConnected;
    private Boolean simulatorRunning;
    private SensorReadingResponseDto latestReading;
    private List<AlertDto> recentAlerts;

    public DashboardSummaryDto() {}

    public Long getTotalMonitoredSamples() { return totalMonitoredSamples; }
    public void setTotalMonitoredSamples(Long totalMonitoredSamples) { this.totalMonitoredSamples = totalMonitoredSamples; }
    public Long getFreshCount() { return freshCount; }
    public void setFreshCount(Long freshCount) { this.freshCount = freshCount; }
    public Long getEarlySpoilageCount() { return earlySpoilageCount; }
    public void setEarlySpoilageCount(Long earlySpoilageCount) { this.earlySpoilageCount = earlySpoilageCount; }
    public Long getModerateSpoilageCount() { return moderateSpoilageCount; }
    public void setModerateSpoilageCount(Long moderateSpoilageCount) { this.moderateSpoilageCount = moderateSpoilageCount; }
    public Long getSevereSpoilageCount() { return severeSpoilageCount; }
    public void setSevereSpoilageCount(Long severeSpoilageCount) { this.severeSpoilageCount = severeSpoilageCount; }
    public Double getCurrentRiskScore() { return currentRiskScore; }
    public void setCurrentRiskScore(Double currentRiskScore) { this.currentRiskScore = currentRiskScore; }
    public Double getEstimatedShelfLifeDays() { return estimatedShelfLifeDays; }
    public void setEstimatedShelfLifeDays(Double estimatedShelfLifeDays) { this.estimatedShelfLifeDays = estimatedShelfLifeDays; }
    public Long getActiveAlertsCount() { return activeAlertsCount; }
    public void setActiveAlertsCount(Long activeAlertsCount) { this.activeAlertsCount = activeAlertsCount; }
    public Boolean getSensorsConnected() { return sensorsConnected; }
    public void setSensorsConnected(Boolean sensorsConnected) { this.sensorsConnected = sensorsConnected; }
    public Boolean getSimulatorRunning() { return simulatorRunning; }
    public void setSimulatorRunning(Boolean simulatorRunning) { this.simulatorRunning = simulatorRunning; }
    public SensorReadingResponseDto getLatestReading() { return latestReading; }
    public void setLatestReading(SensorReadingResponseDto latestReading) { this.latestReading = latestReading; }
    public List<AlertDto> getRecentAlerts() { return recentAlerts; }
    public void setRecentAlerts(List<AlertDto> recentAlerts) { this.recentAlerts = recentAlerts; }
}
