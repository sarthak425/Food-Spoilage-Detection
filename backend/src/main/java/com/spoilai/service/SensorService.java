package com.spoilai.service;

import com.spoilai.dto.SensorReadingRequestDto;
import com.spoilai.dto.SensorReadingResponseDto;
import com.spoilai.entity.Device;
import com.spoilai.entity.SensorReading;
import com.spoilai.exception.InvalidSensorReadingException;
import com.spoilai.repository.DeviceRepository;
import com.spoilai.repository.SensorReadingRepository;
import com.spoilai.websocket.WebSocketSensorPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SensorService {

    private final SensorReadingRepository sensorReadingRepository;
    private final DeviceRepository deviceRepository;
    private final AlertService alertService;
    private final ActuatorService actuatorService;
    private final WebSocketSensorPublisher webSocketPublisher;

    public SensorService(SensorReadingRepository sensorReadingRepository,
                         DeviceRepository deviceRepository,
                         AlertService alertService,
                         ActuatorService actuatorService,
                         WebSocketSensorPublisher webSocketPublisher) {
        this.sensorReadingRepository = sensorReadingRepository;
        this.deviceRepository = deviceRepository;
        this.alertService = alertService;
        this.actuatorService = actuatorService;
        this.webSocketPublisher = webSocketPublisher;
    }

    @Transactional
    public SensorReadingResponseDto ingestReading(SensorReadingRequestDto dto) {
        // 1. Validate Sensor Value Ranges
        validateReadingRanges(dto);

        // 2. Validate / Update Device
        Device device = deviceRepository.findByDeviceId(dto.getDeviceId())
                .orElseGet(() -> {
                    Device newDevice = new Device(dto.getDeviceId(), "Auto-Discovered Node",
                            "SIMULATED".equalsIgnoreCase(dto.getSource()) ? "VIRTUAL" : "ESP32_REAL", "ONLINE");
                    return deviceRepository.save(newDevice);
                });
        device.setLastSeenAt(LocalDateTime.now());
        device.setStatus("ONLINE");
        deviceRepository.save(device);

        // 3. Prevent Rapid Duplicates (< 400ms from same device)
        Optional<SensorReading> lastReadingOpt = sensorReadingRepository.findTopByDeviceIdOrderByTimestampDesc(dto.getDeviceId());
        if (lastReadingOpt.isPresent() && dto.getTimestamp() != null) {
            LocalDateTime lastTime = lastReadingOpt.get().getTimestamp();
            if (lastTime != null && Math.abs(java.time.Duration.between(lastTime, dto.getTimestamp()).toMillis()) < 400) {
                // Return existing to prevent duplicate spike
                return mapToDto(lastReadingOpt.get());
            }
        }

        // 4. Construct Entity
        SensorReading reading = new SensorReading();
        reading.setDeviceId(dto.getDeviceId());
        reading.setFoodSampleId(dto.getFoodSampleId());
        reading.setSource(dto.getSource() != null ? dto.getSource().toUpperCase() : "SIMULATED");
        reading.setTimestamp(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now());
        reading.setTemperatureC(dto.getTemperatureC());
        reading.setHumidityPercent(dto.getHumidityPercent());

        if (dto.getGas() != null) {
            reading.setGasSensor(dto.getGas().getSensor());
            reading.setGasValue(dto.getGas().getValue() != null ? dto.getGas().getValue() : 0.0);
            reading.setGasUnit(dto.getGas().getUnit());
            reading.setGasCalibrated(dto.getGas().getCalibrated());
        } else {
            reading.setGasSensor("MQ135");
            reading.setGasValue(0.0);
            reading.setGasUnit("RAW_ADC");
            reading.setGasCalibrated(false);
        }

        reading.setWeightGrams(dto.getWeightGrams());
        reading.setLightLux(dto.getLightLux());

        // 5. Persist to MySQL
        SensorReading saved = sensorReadingRepository.save(reading);
        SensorReadingResponseDto responseDto = mapToDto(saved);

        // 6. Threshold Checks & Alerts
        alertService.evaluateSensorThresholds(dto);

        // 7. Actuator Automation Rules (Simulated)
        double gasVal = (dto.getGas() != null && dto.getGas().getValue() != null) ? dto.getGas().getValue() : 0.0;
        actuatorService.evaluateActuatorAutomations(dto.getTemperatureC(), dto.getHumidityPercent(), gasVal);

        // 8. Real-Time Broadcast via WebSocket
        webSocketPublisher.publishSensorReading(responseDto);

        return responseDto;
    }

    public void validateReadingRanges(SensorReadingRequestDto dto) {
        if (dto.getTemperatureC() != null && (dto.getTemperatureC() < -40.0 || dto.getTemperatureC() > 85.0)) {
            throw new InvalidSensorReadingException("Temperature reading out of plausible physical range (-40°C to 85°C): " + dto.getTemperatureC());
        }
        if (dto.getHumidityPercent() != null && (dto.getHumidityPercent() < 0.0 || dto.getHumidityPercent() > 100.0)) {
            throw new InvalidSensorReadingException("Humidity reading out of range (0% to 100%): " + dto.getHumidityPercent());
        }
        if (dto.getGas() != null && dto.getGas().getValue() != null && dto.getGas().getValue() < 0.0) {
            throw new InvalidSensorReadingException("Gas reading cannot be negative: " + dto.getGas().getValue());
        }
        if (dto.getWeightGrams() != null && dto.getWeightGrams() < 0.0) {
            throw new InvalidSensorReadingException("Weight reading cannot be negative: " + dto.getWeightGrams());
        }
    }

    public Optional<SensorReadingResponseDto> getLatestReading() {
        return sensorReadingRepository.findTopByOrderByTimestampDesc().map(this::mapToDto);
    }

    public Optional<SensorReadingResponseDto> getLatestReadingForSample(Long sampleId) {
        return sensorReadingRepository.findTopByFoodSampleIdOrderByTimestampDesc(sampleId).map(this::mapToDto);
    }

    public List<SensorReadingResponseDto> getRecentHistory(Long sampleId) {
        List<SensorReading> readings = (sampleId != null)
                ? sensorReadingRepository.findTop50ByFoodSampleIdOrderByTimestampDesc(sampleId)
                : sensorReadingRepository.findTop50ByDeviceIdOrderByTimestampDesc("VIRTUAL_SENSOR_01");

        return readings.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SensorReadingResponseDto mapToDto(SensorReading r) {
        SensorReadingResponseDto dto = new SensorReadingResponseDto();
        dto.setId(r.getId());
        dto.setDeviceId(r.getDeviceId());
        dto.setFoodSampleId(r.getFoodSampleId());
        dto.setSource(r.getSource());
        dto.setTimestamp(r.getTimestamp());
        dto.setTemperatureC(r.getTemperatureC());
        dto.setHumidityPercent(r.getHumidityPercent());
        dto.setGasSensor(r.getGasSensor());
        dto.setGasValue(r.getGasValue());
        dto.setGasUnit(r.getGasUnit());
        dto.setGasCalibrated(r.getGasCalibrated());
        dto.setWeightGrams(r.getWeightGrams());
        dto.setLightLux(r.getLightLux());
        return dto;
    }
}
