package com.spoilai.service;

import com.spoilai.dto.GasReadingDto;
import com.spoilai.dto.SensorReadingRequestDto;
import com.spoilai.dto.SimulatorControlDto;
import com.spoilai.dto.SimulatorStatusDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class SimulatorService {

    private static final Logger logger = LoggerFactory.getLogger(SimulatorService.class);

    private final SensorService sensorService;
    private final ThreadPoolTaskScheduler taskScheduler;
    private final Random random = new Random();

    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private final AtomicLong readingsGenerated = new AtomicLong(0);
    private ScheduledFuture<?> scheduledTask;

    private long intervalMs = 3000L;
    private String currentScenario = "NORMAL";
    private Long targetSampleId = 1L;
    private String targetDeviceId = "VIRTUAL_SENSOR_01";

    // Telemetry state variables (smooth time-series wandering)
    private double currentTemp = 24.5;
    private double currentHumidity = 58.0;
    private double currentGas = 320.0;
    private double currentWeight = 500.0;
    private double currentLight = 120.0;

    public SimulatorService(SensorService sensorService) {
        this.sensorService = sensorService;
        this.taskScheduler = new ThreadPoolTaskScheduler();
        this.taskScheduler.setPoolSize(2);
        this.taskScheduler.setThreadNamePrefix("virtual-sensor-");
        this.taskScheduler.initialize();
    }

    public synchronized SimulatorStatusDto startSimulation(SimulatorControlDto control) {
        if (control != null) {
            if (control.getIntervalMs() != null && control.getIntervalMs() >= 500) {
                this.intervalMs = control.getIntervalMs();
            }
            if (control.getScenario() != null) {
                this.currentScenario = control.getScenario().toUpperCase();
            }
            if (control.getFoodSampleId() != null) {
                this.targetSampleId = control.getFoodSampleId();
            }
            if (control.getDeviceId() != null) {
                this.targetDeviceId = control.getDeviceId();
            }
        }

        initializeScenarioBaselines();

        if (isRunning.compareAndSet(false, true)) {
            scheduledTask = taskScheduler.scheduleAtFixedRate(this::generateAndIngestTelemetry, Duration.ofMillis(intervalMs));
            logger.info("Virtual Sensor Simulator started with scenario: {} at interval: {}ms", currentScenario, intervalMs);
        } else {
            // Re-schedule with new parameters if already running
            if (scheduledTask != null) {
                scheduledTask.cancel(false);
            }
            scheduledTask = taskScheduler.scheduleAtFixedRate(this::generateAndIngestTelemetry, Duration.ofMillis(intervalMs));
        }

        return getStatus();
    }

    public synchronized SimulatorStatusDto stopSimulation() {
        if (isRunning.compareAndSet(true, false)) {
            if (scheduledTask != null) {
                scheduledTask.cancel(false);
                scheduledTask = null;
            }
            logger.info("Virtual Sensor Simulator stopped.");
        }
        return getStatus();
    }

    public synchronized SimulatorStatusDto setScenario(String scenario) {
        this.currentScenario = scenario.toUpperCase();
        initializeScenarioBaselines();
        logger.info("Simulation scenario switched to: {}", currentScenario);
        return getStatus();
    }

    private void initializeScenarioBaselines() {
        switch (currentScenario) {
            case "WARMING" -> {
                currentTemp = 28.5;
                currentHumidity = 65.0;
                currentGas = 385.0;
                currentLight = 140.0;
            }
            case "HIGH_HUMIDITY" -> {
                currentTemp = 26.0;
                currentHumidity = 86.0;
                currentGas = 410.0;
                currentLight = 90.0;
            }
            case "SPOILAGE_PRONE" -> {
                currentTemp = 33.5;
                currentHumidity = 89.0;
                currentGas = 520.0;
                currentLight = 180.0;
            }
            default -> { // NORMAL
                currentTemp = 22.0;
                currentHumidity = 55.0;
                currentGas = 310.0;
                currentLight = 120.0;
            }
        }
    }

    private void generateAndIngestTelemetry() {
        try {
            // Apply slight random Brownian walk around target scenario range
            double tempDrift = (random.nextDouble() - 0.48) * 0.4;
            double humDrift = (random.nextDouble() - 0.48) * 0.8;
            double gasDrift = (random.nextDouble() - 0.45) * 6.0;
            double lightDrift = (random.nextDouble() - 0.5) * 5.0;

            currentTemp = Math.round((currentTemp + tempDrift) * 10.0) / 10.0;
            currentHumidity = Math.round((currentHumidity + humDrift) * 10.0) / 10.0;
            currentGas = Math.round((currentGas + gasDrift) * 10.0) / 10.0;
            currentLight = Math.max(10.0, Math.round((currentLight + lightDrift) * 10.0) / 10.0);

            // Subtle progressive weight loss (evaporation / ripening)
            currentWeight = Math.max(100.0, Math.round((currentWeight - (random.nextDouble() * 0.05)) * 10.0) / 10.0);

            // Construct DTO marked explicitly as SIMULATED
            SensorReadingRequestDto dto = new SensorReadingRequestDto();
            dto.setDeviceId(targetDeviceId);
            dto.setFoodSampleId(targetSampleId);
            dto.setSource("SIMULATED");
            dto.setTimestamp(LocalDateTime.now());
            dto.setTemperatureC(currentTemp);
            dto.setHumidityPercent(currentHumidity);
            dto.setGas(new GasReadingDto("MQ135", currentGas, "RAW_ADC", false));
            dto.setWeightGrams(currentWeight);
            dto.setLightLux(currentLight);

            sensorService.ingestReading(dto);
            readingsGenerated.incrementAndGet();

        } catch (Exception e) {
            logger.error("Error generating simulated telemetry reading: {}", e.getMessage());
        }
    }

    public SimulatorStatusDto getStatus() {
        return new SimulatorStatusDto(
                isRunning.get(),
                intervalMs,
                currentScenario,
                targetSampleId,
                targetDeviceId,
                readingsGenerated.get(),
                sensorService.getLatestReading().orElse(null)
        );
    }
}
