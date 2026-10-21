package com.spoilai;

import com.spoilai.dto.GasReadingDto;
import com.spoilai.dto.SensorReadingRequestDto;
import com.spoilai.exception.InvalidSensorReadingException;
import com.spoilai.service.SensorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;

class SensorValidationTest {

    private SensorService sensorService;

    @BeforeEach
    void setUp() {
        // Pure POJO constructor without mocking framework needed
        sensorService = new SensorService(null, null, null, null, null);
    }

    @Test
    void testInvalidTemperatureThrowsException() {
        SensorReadingRequestDto dto = new SensorReadingRequestDto();
        dto.setDeviceId("ESP32_001");
        dto.setTemperatureC(150.0); // Plausibility failure (> 85C)
        dto.setHumidityPercent(50.0);

        assertThrows(InvalidSensorReadingException.class, () -> {
            sensorService.validateReadingRanges(dto);
        });
    }

    @Test
    void testNegativeHumidityThrowsException() {
        SensorReadingRequestDto dto = new SensorReadingRequestDto();
        dto.setDeviceId("ESP32_001");
        dto.setTemperatureC(25.0);
        dto.setHumidityPercent(-10.0);

        assertThrows(InvalidSensorReadingException.class, () -> {
            sensorService.validateReadingRanges(dto);
        });
    }

    @Test
    void testNegativeGasThrowsException() {
        SensorReadingRequestDto dto = new SensorReadingRequestDto();
        dto.setDeviceId("ESP32_001");
        dto.setTemperatureC(25.0);
        dto.setHumidityPercent(50.0);
        dto.setGas(new GasReadingDto("MQ135", -5.0, "RAW_ADC", false));

        assertThrows(InvalidSensorReadingException.class, () -> {
            sensorService.validateReadingRanges(dto);
        });
    }
}
