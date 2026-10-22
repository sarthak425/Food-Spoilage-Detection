package com.spoilai;

import com.spoilai.dto.SensorReadingRequestDto;
import com.spoilai.dto.SensorReadingResponseDto;
import com.spoilai.service.SensorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
public class SensorHistoryIntegrationTest {

    @Autowired
    private SensorService sensorService;

    @Test
    @DisplayName("Verify that real ESP32 readings and simulated readings are properly stored and retrieved")
    void testRealAndSimulatedSensorRetrieval() {
        // Ingest reading from real ESP32
        SensorReadingRequestDto realDto = new SensorReadingRequestDto();
        realDto.setDeviceId("ESP32_STATION_ALPHA");
        realDto.setSource("REAL");
        realDto.setTemperatureC(21.5);
        realDto.setHumidityPercent(55.0);
        SensorReadingResponseDto realSaved = sensorService.ingestReading(realDto);
        assertNotNull(realSaved.getId());
        assertEquals("REAL", realSaved.getSource());

        // Ingest reading from virtual simulator node
        SensorReadingRequestDto simDto = new SensorReadingRequestDto();
        simDto.setDeviceId("VIRTUAL_SENSOR_01");
        simDto.setSource("SIMULATED");
        simDto.setTemperatureC(28.0);
        simDto.setHumidityPercent(75.0);
        SensorReadingResponseDto simSaved = sensorService.ingestReading(simDto);
        assertNotNull(simSaved.getId());
        assertEquals("SIMULATED", simSaved.getSource());

        // Query overall history (must contain readings from all devices)
        List<SensorReadingResponseDto> allHistory = sensorService.getRecentHistory(null, null, null);
        assertFalse(allHistory.isEmpty());

        // Query specifically for ESP32_STATION_ALPHA
        List<SensorReadingResponseDto> esp32History = sensorService.getRecentHistory(null, "ESP32_STATION_ALPHA", null);
        assertFalse(esp32History.isEmpty());
        assertTrue(esp32History.stream().allMatch(r -> "ESP32_STATION_ALPHA".equals(r.getDeviceId())));

        // Query specifically for REAL source
        List<SensorReadingResponseDto> realHistory = sensorService.getRecentHistory(null, null, "REAL");
        assertFalse(realHistory.isEmpty());
        assertTrue(realHistory.stream().allMatch(r -> "REAL".equals(r.getSource())));
    }
}
