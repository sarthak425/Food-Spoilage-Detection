package com.spoilai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spoilai.dto.GasReadingDto;
import com.spoilai.dto.SensorReadingRequestDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Unauthenticated request to actuators state must return 401 Unauthorized")
    void testUnauthenticatedActuatorAccessBlocked() throws Exception {
        mockMvc.perform(get("/api/actuators/state"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unauthenticated request to devices list must return 401 Unauthorized")
    void testUnauthenticatedDeviceAccessBlocked() throws Exception {
        mockMvc.perform(get("/api/devices"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unauthenticated request to sensor history must return 401 Unauthorized")
    void testUnauthenticatedSensorHistoryBlocked() throws Exception {
        mockMvc.perform(get("/api/sensors/history"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unauthenticated sensor ingestion without JWT or device headers must return 401 Unauthorized")
    void testUnauthenticatedSensorIngestionBlocked() throws Exception {
        SensorReadingRequestDto dto = new SensorReadingRequestDto();
        dto.setDeviceId("ESP32_STATION_ALPHA");
        dto.setTemperatureC(24.5);
        dto.setHumidityPercent(60.0);
        dto.setGas(new GasReadingDto("MQ135", 300.0, "RAW_ADC", false));

        mockMvc.perform(post("/api/sensors/readings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Hardware ESP32 with valid X-Device-Id and X-Device-Key must successfully ingest telemetry")
    void testAuthenticatedEsp32IngestionSuccess() throws Exception {
        SensorReadingRequestDto dto = new SensorReadingRequestDto();
        dto.setDeviceId("ESP32_STATION_ALPHA");
        dto.setSource("REAL");
        dto.setTemperatureC(22.4);
        dto.setHumidityPercent(58.0);
        dto.setGas(new GasReadingDto("MQ135", 280.0, "RAW_ADC", false));
        dto.setWeightGrams(420.0);

        mockMvc.perform(post("/api/sensors/readings")
                .header("X-Device-Id", "ESP32_STATION_ALPHA")
                .header("X-Device-Key", "esp32_secret_alpha_key")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("ESP32 ingestion with invalid X-Device-Key must be rejected with 401 Unauthorized")
    void testEsp32IngestionInvalidKeyRejected() throws Exception {
        SensorReadingRequestDto dto = new SensorReadingRequestDto();
        dto.setDeviceId("ESP32_STATION_ALPHA");
        dto.setTemperatureC(22.4);
        dto.setHumidityPercent(58.0);

        mockMvc.perform(post("/api/sensors/readings")
                .header("X-Device-Id", "ESP32_STATION_ALPHA")
                .header("X-Device-Key", "WRONG_KEY_ATTACK")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Device spoofing attempt (authenticated header differs from payload deviceId) must be rejected with 401")
    void testDeviceSpoofingRejected() throws Exception {
        SensorReadingRequestDto dto = new SensorReadingRequestDto();
        dto.setDeviceId("VIRTUAL_SENSOR_01"); // Spoofed payload ID
        dto.setTemperatureC(22.4);
        dto.setHumidityPercent(58.0);

        mockMvc.perform(post("/api/sensors/readings")
                .header("X-Device-Id", "ESP32_STATION_ALPHA")
                .header("X-Device-Key", "esp32_secret_alpha_key")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "researcher", roles = {"USER"})
    @DisplayName("Authenticated user with ROLE_USER can access sensor history and actuator state")
    void testAuthenticatedUserCanAccessProtectedEndpoints() throws Exception {
        mockMvc.perform(get("/api/sensors/history"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/actuators/state"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/devices"))
                .andExpect(status().isOk());
    }
}
