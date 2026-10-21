package com.spoilai.service;

import com.spoilai.dto.AlertDto;
import com.spoilai.dto.SensorReadingRequestDto;
import com.spoilai.entity.Alert;
import com.spoilai.exception.ResourceNotFoundException;
import com.spoilai.repository.AlertRepository;
import com.spoilai.websocket.WebSocketSensorPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final WebSocketSensorPublisher webSocketPublisher;

    public AlertService(AlertRepository alertRepository, WebSocketSensorPublisher webSocketPublisher) {
        this.alertRepository = alertRepository;
        this.webSocketPublisher = webSocketPublisher;
    }

    public List<AlertDto> getRecentAlerts() {
        return alertRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AlertDto> getUnacknowledgedAlerts() {
        return alertRepository.findAllByAcknowledgedFalseOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlertDto acknowledgeAlert(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));
        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(LocalDateTime.now());
        return mapToDto(alertRepository.save(alert));
    }

    @Transactional
    public void evaluateSensorThresholds(SensorReadingRequestDto reading) {
        // Temperature Rule
        if (reading.getTemperatureC() != null) {
            if (reading.getTemperatureC() >= 32.0) {
                createAndBroadcastAlert(reading.getFoodSampleId(), reading.getDeviceId(),
                        "TEMPERATURE_HIGH", "CRITICAL",
                        String.format("Critical temperature spike: %.1f°C! Accelerates microbial spoilage.", reading.getTemperatureC()));
            } else if (reading.getTemperatureC() >= 27.0) {
                createAndBroadcastAlert(reading.getFoodSampleId(), reading.getDeviceId(),
                        "TEMPERATURE_HIGH", "WARNING",
                        String.format("Elevated storage temperature: %.1f°C. Exceeds recommended preservation limit.", reading.getTemperatureC()));
            }
        }

        // Humidity Rule
        if (reading.getHumidityPercent() != null && reading.getHumidityPercent() >= 80.0) {
            createAndBroadcastAlert(reading.getFoodSampleId(), reading.getDeviceId(),
                    "HUMIDITY_HIGH", "WARNING",
                    String.format("High relative humidity: %.1f%%. High risk of moisture condensation & mold proliferation.", reading.getHumidityPercent()));
        }

        // Gas (MQ135) Volatiles Rule
        if (reading.getGas() != null && reading.getGas().getValue() != null) {
            double gasVal = reading.getGas().getValue();
            if (gasVal >= 450.0) {
                createAndBroadcastAlert(reading.getFoodSampleId(), reading.getDeviceId(),
                        "GAS_ANOMALY", "CRITICAL",
                        String.format("Significant volatile organic gas surge: %.0f %s. High indication of anaerobic spoilage/ethylene.",
                                gasVal, reading.getGas().getUnit()));
            } else if (gasVal >= 380.0) {
                createAndBroadcastAlert(reading.getFoodSampleId(), reading.getDeviceId(),
                        "GAS_ANOMALY", "WARNING",
                        String.format("Elevated VOC gas concentration: %.0f %s. Approaching spoilage threshold.",
                                gasVal, reading.getGas().getUnit()));
            }
        }
    }

    @Transactional
    public AlertDto createAndBroadcastAlert(Long foodSampleId, String deviceId, String type, String severity, String message) {
        Alert alert = new Alert(foodSampleId, deviceId, type, severity, message);
        Alert saved = alertRepository.save(alert);
        AlertDto dto = mapToDto(saved);
        webSocketPublisher.publishAlert(dto);
        return dto;
    }

    public AlertDto mapToDto(Alert alert) {
        AlertDto dto = new AlertDto();
        dto.setId(alert.getId());
        dto.setFoodSampleId(alert.getFoodSampleId());
        dto.setDeviceId(alert.getDeviceId());
        dto.setAlertType(alert.getAlertType());
        dto.setSeverity(alert.getSeverity());
        dto.setMessage(alert.getMessage());
        dto.setAcknowledged(alert.getAcknowledged());
        dto.setAcknowledgedAt(alert.getAcknowledgedAt());
        dto.setCreatedAt(alert.getCreatedAt());
        return dto;
    }
}
