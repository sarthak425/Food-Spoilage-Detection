package com.spoilai.dto;

import java.time.LocalDateTime;

public class FoodSampleResponseDto {
    private Long id;
    private String sampleName;
    private String foodCategory;
    private String batchNumber;
    private String storageCondition;
    private Double initialWeightGrams;
    private String notes;
    private String deviceId;
    private String status;
    private String imageUrl;
    private LocalDateTime createdAt;
    private SensorReadingResponseDto latestReading;

    public FoodSampleResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public SensorReadingResponseDto getLatestReading() { return latestReading; }
    public void setLatestReading(SensorReadingResponseDto latestReading) { this.latestReading = latestReading; }
}
