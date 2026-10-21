package com.spoilai.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class SensorReadingRequestDto {

    @NotNull(message = "deviceId is required")
    private String deviceId;

    private Long foodSampleId;

    private String source = "SIMULATED";

    private LocalDateTime timestamp;

    @NotNull(message = "temperatureC is required")
    private Double temperatureC;

    @NotNull(message = "humidityPercent is required")
    private Double humidityPercent;

    private GasReadingDto gas;

    private Double weightGrams;

    private Double lightLux;

    public SensorReadingRequestDto() {}

    public SensorReadingRequestDto(String deviceId, Long foodSampleId, String source, LocalDateTime timestamp,
                                   Double temperatureC, Double humidityPercent, GasReadingDto gas,
                                   Double weightGrams, Double lightLux) {
        this.deviceId = deviceId;
        this.foodSampleId = foodSampleId;
        this.source = source != null ? source : "SIMULATED";
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
        this.temperatureC = temperatureC;
        this.humidityPercent = humidityPercent;
        this.gas = gas;
        this.weightGrams = weightGrams;
        this.lightLux = lightLux;
    }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public Long getFoodSampleId() { return foodSampleId; }
    public void setFoodSampleId(Long foodSampleId) { this.foodSampleId = foodSampleId; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Double getTemperatureC() { return temperatureC; }
    public void setTemperatureC(Double temperatureC) { this.temperatureC = temperatureC; }
    public Double getHumidityPercent() { return humidityPercent; }
    public void setHumidityPercent(Double humidityPercent) { this.humidityPercent = humidityPercent; }
    public GasReadingDto getGas() { return gas; }
    public void setGas(GasReadingDto gas) { this.gas = gas; }
    public Double getWeightGrams() { return weightGrams; }
    public void setWeightGrams(Double weightGrams) { this.weightGrams = weightGrams; }
    public Double getLightLux() { return lightLux; }
    public void setLightLux(Double lightLux) { this.lightLux = lightLux; }
}
