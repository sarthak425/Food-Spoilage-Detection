package com.spoilai.dto;

public class GasReadingDto {
    private String sensor = "MQ135";
    private Double value;
    private String unit = "RAW_ADC";
    private Boolean calibrated = false;

    public GasReadingDto() {}

    public GasReadingDto(String sensor, Double value, String unit, Boolean calibrated) {
        this.sensor = sensor != null ? sensor : "MQ135";
        this.value = value;
        this.unit = unit != null ? unit : "RAW_ADC";
        this.calibrated = calibrated != null ? calibrated : false;
    }

    public String getSensor() { return sensor; }
    public void setSensor(String sensor) { this.sensor = sensor; }
    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Boolean getCalibrated() { return calibrated; }
    public void setCalibrated(Boolean calibrated) { this.calibrated = calibrated; }
}
