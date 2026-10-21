package com.spoilai.websocket;

import com.spoilai.dto.AlertDto;
import com.spoilai.dto.ActuatorStatusDto;
import com.spoilai.dto.SensorReadingResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class WebSocketSensorPublisher {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketSensorPublisher.class);

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketSensorPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishSensorReading(SensorReadingResponseDto reading) {
        try {
            // Broadcast to global live sensor topic
            messagingTemplate.convertAndSend("/topic/sensors/latest", reading);

            // Broadcast to sample-specific topic if sample ID is present
            if (reading.getFoodSampleId() != null) {
                messagingTemplate.convertAndSend("/topic/sensors/" + reading.getFoodSampleId(), reading);
            }
        } catch (Exception e) {
            logger.error("Failed to publish sensor reading via WebSocket: {}", e.getMessage());
        }
    }

    public void publishAlert(AlertDto alert) {
        try {
            messagingTemplate.convertAndSend("/topic/alerts", alert);
        } catch (Exception e) {
            logger.error("Failed to publish alert via WebSocket: {}", e.getMessage());
        }
    }

    public void publishActuatorStatus(ActuatorStatusDto status) {
        try {
            messagingTemplate.convertAndSend("/topic/actuators", status);
        } catch (Exception e) {
            logger.error("Failed to publish actuator status via WebSocket: {}", e.getMessage());
        }
    }
}
