package com.spoilai.dto;

import jakarta.validation.constraints.NotBlank;

public class FoodSampleRequestDto {

    @NotBlank(message = "sampleName is required")
    private String sampleName;

    @NotBlank(message = "foodCategory is required")
    private String foodCategory;

    @NotBlank(message = "batchNumber is required")
    private String batchNumber;

    private String storageCondition = "AMBIENT";
    private Double initialWeightGrams;
    private String notes;
    private String deviceId;

    public FoodSampleRequestDto() {}

    public String getSampleName() { return sampleName; }
    public void setSampleName(String sampleName) { this.sampleName = sampleName; }
    public String getFoodCategory() { return foodCategory; }
    public void setFoodCategory(String foodCategory) { this.foodCategory = foodCategory; }
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public String getStorageCondition() { return storageCondition; }
    public void setStorageCondition(String storageCondition) { this.storageCondition = storageCondition; }
    public Double getInitialWeightGrams() { return initialWeightGrams; }
    public void setInitialWeightGrams(Double initialWeightGrams) { this.initialWeightGrams = initialWeightGrams; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
}
