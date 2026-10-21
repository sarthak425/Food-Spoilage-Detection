package com.spoilai.dto;

import java.time.LocalDateTime;

public class SensorReadingResponseDto {
    private Long id;
    private String deviceId;
    private Long foodSampleId;
    private String source;
    private LocalDateTime timestamp;
    private Double temperatureC;
    private Double humidityPercent;
    private String gasSensor;
    private Double gasValue;
    private String gasUnit;
    private Boolean gasCalibrated;
    private Double weightGrams;
    private Double lightLux;

    public SensorReadingResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public String getGasSensor() { return gasSensor; }
    public void setGasSensor(String gasSensor) { this.gasSensor = gasSensor; }
    public Double getGasValue() { return gasValue; }
    public void setGasValue(Double gasValue) { this.gasValue = gasValue; }
    public String getGasUnit() { return gasUnit; }
    public void setGasUnit(String gasUnit) { this.gasUnit = gasUnit; }
    public Boolean getGasCalibrated() { return gasCalibrated; }
    public void setGasCalibrated(Boolean gasCalibrated) { this.gasCalibrated = gasCalibrated; }
    public Double getWeightGrams() { return weightGrams; }
    public void setWeightGrams(Double weightGrams) { this.weightGrams = weightGrams; }
    public Double getLightLux() { return lightLux; }
    public void setLightLux(Double lightLux) { this.lightLux = lightLux; }
}
