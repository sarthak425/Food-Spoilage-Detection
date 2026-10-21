package com.spoilai.service;

import com.spoilai.dto.DashboardSummaryDto;
import com.spoilai.dto.SensorReadingResponseDto;
import com.spoilai.entity.FoodSample;
import com.spoilai.repository.AlertRepository;
import com.spoilai.repository.FoodSampleRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DashboardService {

    private final FoodSampleRepository foodSampleRepository;
    private final SensorService sensorService;
    private final SimulatorService simulatorService;
    private final AlertService alertService;
    private final AlertRepository alertRepository;

    public DashboardService(FoodSampleRepository foodSampleRepository,
                            SensorService sensorService,
                            SimulatorService simulatorService,
                            AlertService alertService,
                            AlertRepository alertRepository) {
        this.foodSampleRepository = foodSampleRepository;
        this.sensorService = sensorService;
        this.simulatorService = simulatorService;
        this.alertService = alertService;
        this.alertRepository = alertRepository;
    }

    public DashboardSummaryDto getDashboardSummary() {
        DashboardSummaryDto summary = new DashboardSummaryDto();

        List<FoodSample> samples = foodSampleRepository.findAll();
        summary.setTotalMonitoredSamples((long) samples.size());

        // Latest reading
        Optional<SensorReadingResponseDto> latestOpt = sensorService.getLatestReading();
        summary.setLatestReading(latestOpt.orElse(null));

        // Sensor connection status (online if reading received within last 45 seconds)
        boolean connected = false;
        double currentTemp = 24.0;
        double currentGas = 320.0;
        double currentHumidity = 55.0;

        if (latestOpt.isPresent()) {
            SensorReadingResponseDto r = latestOpt.get();
            if (r.getTimestamp() != null) {
                long secondsSince = Math.abs(Duration.between(r.getTimestamp(), LocalDateTime.now()).toSeconds());
                connected = secondsSince < 45;
            }
            if (r.getTemperatureC() != null) currentTemp = r.getTemperatureC();
            if (r.getGasValue() != null) currentGas = r.getGasValue();
            if (r.getHumidityPercent() != null) currentHumidity = r.getHumidityPercent();
        }
        summary.setSensorsConnected(connected);
        summary.setSimulatorRunning(simulatorService.getStatus().getRunning());

        // Spoilage risk calculation (0.0 to 100.0%)
        // High gas (>450), High Temp (>30), High Humidity (>80) increase risk
        double tempRisk = Math.max(0.0, Math.min(40.0, (currentTemp - 20.0) * 3.5));
        double gasRisk = Math.max(0.0, Math.min(40.0, (currentGas - 300.0) * 0.25));
        double humRisk = Math.max(0.0, Math.min(20.0, (currentHumidity - 60.0) * 0.6));
        double totalRisk = Math.round(Math.max(5.0, Math.min(99.0, tempRisk + gasRisk + humRisk)) * 10.0) / 10.0;
        summary.setCurrentRiskScore(totalRisk);

        // Food Spoilage category breakdown based on current active samples
        if (totalRisk < 30.0) {
            summary.setFreshCount(Math.max(1L, (long) Math.ceil(samples.size() * 0.75)));
            summary.setEarlySpoilageCount((long) Math.floor(samples.size() * 0.25));
            summary.setModerateSpoilageCount(0L);
            summary.setSevereSpoilageCount(0L);
            summary.setEstimatedShelfLifeDays(5.5);
        } else if (totalRisk < 60.0) {
            summary.setFreshCount((long) Math.floor(samples.size() * 0.4));
            summary.setEarlySpoilageCount((long) Math.ceil(samples.size() * 0.5));
            summary.setModerateSpoilageCount((long) Math.floor(samples.size() * 0.1));
            summary.setSevereSpoilageCount(0L);
            summary.setEstimatedShelfLifeDays(2.5);
        } else if (totalRisk < 80.0) {
            summary.setFreshCount(0L);
            summary.setEarlySpoilageCount((long) Math.floor(samples.size() * 0.3));
            summary.setModerateSpoilageCount((long) Math.ceil(samples.size() * 0.5));
            summary.setSevereSpoilageCount((long) Math.floor(samples.size() * 0.2));
            summary.setEstimatedShelfLifeDays(1.0);
        } else {
            summary.setFreshCount(0L);
            summary.setEarlySpoilageCount(0L);
            summary.setModerateSpoilageCount((long) Math.floor(samples.size() * 0.3));
            summary.setSevereSpoilageCount((long) Math.ceil(samples.size() * 0.7));
            summary.setEstimatedShelfLifeDays(0.2);
        }

        // Active alerts
        summary.setActiveAlertsCount(alertRepository.countByAcknowledgedFalse());
        summary.setRecentAlerts(alertService.getRecentAlerts().stream().limit(5).toList());

        return summary;
    }
}
