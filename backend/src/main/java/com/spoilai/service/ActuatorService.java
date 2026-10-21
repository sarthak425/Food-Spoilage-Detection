package com.spoilai.service;

import com.spoilai.dto.ActuatorCommandDto;
import com.spoilai.dto.ActuatorStatusDto;
import com.spoilai.entity.ActuatorEvent;
import com.spoilai.repository.ActuatorEventRepository;
import com.spoilai.websocket.WebSocketSensorPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActuatorService {

    private final ActuatorEventRepository actuatorEventRepository;
    private final WebSocketSensorPublisher webSocketPublisher;

    // In-memory simulated current states
    private final ActuatorStatusDto currentStatus = new ActuatorStatusDto();

    public ActuatorService(ActuatorEventRepository actuatorEventRepository,
                           WebSocketSensorPublisher webSocketPublisher) {
        this.actuatorEventRepository = actuatorEventRepository;
        this.webSocketPublisher = webSocketPublisher;
    }

    public ActuatorStatusDto getCurrentStatus() {
        return currentStatus;
    }

    public List<ActuatorEvent> getRecentEvents() {
        return actuatorEventRepository.findTop50ByOrderByTimestampDesc();
    }

    @Transactional
    public ActuatorStatusDto triggerActuator(ActuatorCommandDto command) {
        String type = command.getActuatorType().toUpperCase();
        String state = command.getTargetState().toUpperCase();

        switch (type) {
            case "COOLING_FAN" -> currentStatus.setCoolingFan(state);
            case "VENTILATION_FAN" -> currentStatus.setVentilationFan(state);
            case "BUZZER" -> currentStatus.setBuzzer(state);
            case "LED_INDICATOR" -> currentStatus.setLedIndicator(state);
            case "SERVO_SORTER" -> currentStatus.setServoSorter(state);
        }

        currentStatus.setLastUpdated(LocalDateTime.now());

        // Log the simulated actuator event
        ActuatorEvent event = new ActuatorEvent(
                command.getDeviceId(),
                command.getFoodSampleId(),
                type,
                state,
                "MANUAL_SIMULATION",
                command.getReason() != null ? command.getReason() : "Triggered from smart control panel"
        );
        actuatorEventRepository.save(event);

        // Broadcast to WebSocket clients
        webSocketPublisher.publishActuatorStatus(currentStatus);

        return currentStatus;
    }

    @Transactional
    public void evaluateActuatorAutomations(double temp, double humidity, double gasVal) {
        boolean statusChanged = false;

        // Auto cooling fan trigger
        if (temp > 28.0 && "OFF".equals(currentStatus.getCoolingFan())) {
            currentStatus.setCoolingFan("ON");
            logAutoEvent("COOLING_FAN", "ON", "Auto-engaged due to temperature exceeding 28.0°C");
            statusChanged = true;
        } else if (temp <= 24.0 && "ON".equals(currentStatus.getCoolingFan())) {
            currentStatus.setCoolingFan("OFF");
            logAutoEvent("COOLING_FAN", "OFF", "Auto-disengaged: temperature normalized");
            statusChanged = true;
        }

        // Auto ventilation fan for gas/humidity
        if ((gasVal > 400.0 || humidity > 75.0) && "OFF".equals(currentStatus.getVentilationFan())) {
            currentStatus.setVentilationFan("ON");
            logAutoEvent("VENTILATION_FAN", "ON", "Auto-engaged to exhaust high volatiles/humidity");
            statusChanged = true;
        } else if (gasVal <= 320.0 && humidity <= 60.0 && "ON".equals(currentStatus.getVentilationFan())) {
            currentStatus.setVentilationFan("OFF");
            logAutoEvent("VENTILATION_FAN", "OFF", "Auto-disengaged: atmosphere purged");
            statusChanged = true;
        }

        // Auto LED indicator color
        String targetLed = (gasVal > 440.0 || temp > 32.0) ? "RED" :
                           (gasVal > 360.0 || temp > 27.0) ? "YELLOW" : "GREEN";
        if (!targetLed.equals(currentStatus.getLedIndicator())) {
            currentStatus.setLedIndicator(targetLed);
            statusChanged = true;
        }

        // Auto buzzer on critical
        if ("RED".equals(targetLed) && "OFF".equals(currentStatus.getBuzzer())) {
            currentStatus.setBuzzer("ON");
            logAutoEvent("BUZZER", "ON", "Audible alarm sounded for critical spoilage conditions");
            statusChanged = true;
        } else if (!"RED".equals(targetLed) && "ON".equals(currentStatus.getBuzzer())) {
            currentStatus.setBuzzer("OFF");
            statusChanged = true;
        }

        if (statusChanged) {
            currentStatus.setLastUpdated(LocalDateTime.now());
            webSocketPublisher.publishActuatorStatus(currentStatus);
        }
    }

    private void logAutoEvent(String type, String state, String reason) {
        ActuatorEvent event = new ActuatorEvent("VIRTUAL_SENSOR_01", 1L, type, state, "AUTO_RULE", reason);
        actuatorEventRepository.save(event);
    }
}
