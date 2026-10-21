package com.spoilai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_readings", indexes = {
    @Index(name = "idx_reading_sample_time", columnList = "food_sample_id, timestamp"),
    @Index(name = "idx_reading_device_time", columnList = "device_id, timestamp"),
    @Index(name = "idx_reading_source", columnList = "source")
})
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false, length = 64)
    private String deviceId;

    @Column(name = "food_sample_id")
    private Long foodSampleId;

    @Column(nullable = false, length = 20)
    private String source = "SIMULATED";

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "temperature_c", nullable = false)
    private Double temperatureC;

    @Column(name = "humidity_percent", nullable = false)
    private Double humidityPercent;

    @Column(name = "gas_sensor", length = 30)
    private String gasSensor = "MQ135";

    @Column(name = "gas_value", nullable = false)
    private Double gasValue;

    @Column(name = "gas_unit", length = 20)
    private String gasUnit = "RAW_ADC";

    @Column(name = "gas_calibrated")
    private Boolean gasCalibrated = false;

    @Column(name = "weight_grams")
    private Double weightGrams;

    @Column(name = "light_lux")
    private Double lightLux;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public SensorReading() {}

    public SensorReading(String deviceId, Long foodSampleId, String source, LocalDateTime timestamp,
                         Double temperatureC, Double humidityPercent, String gasSensor,
                         Double gasValue, String gasUnit, Boolean gasCalibrated,
                         Double weightGrams, Double lightLux) {
        this.deviceId = deviceId;
        this.foodSampleId = foodSampleId;
        this.source = source != null ? source : "SIMULATED";
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
        this.temperatureC = temperatureC;
        this.humidityPercent = humidityPercent;
        this.gasSensor = gasSensor != null ? gasSensor : "MQ135";
        this.gasValue = gasValue;
        this.gasUnit = gasUnit != null ? gasUnit : "RAW_ADC";
        this.gasCalibrated = gasCalibrated != null ? gasCalibrated : false;
        this.weightGrams = weightGrams;
        this.lightLux = lightLux;
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
        this.createdAt = LocalDateTime.now();
    }

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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
