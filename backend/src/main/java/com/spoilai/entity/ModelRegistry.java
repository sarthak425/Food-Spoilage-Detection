package com.spoilai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "model_registry")
public class ModelRegistry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_name", nullable = false, unique = true, length = 100)
    private String modelName;

    @Column(nullable = false, length = 50)
    private String version;

    @Column(name = "task_type", nullable = false, length = 50)
    private String taskType;

    @Column(nullable = false, length = 30)
    private String status = "DEMO_MODE";

    @Column(name = "file_path", length = 255)
    private String filePath;

    @Column(name = "metrics_json", columnDefinition = "TEXT")
    private String metricsJson;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public ModelRegistry() {}

    public ModelRegistry(String modelName, String version, String taskType, String status, String filePath, String metricsJson) {
        this.modelName = modelName;
        this.version = version;
        this.taskType = taskType;
        this.status = status;
        this.filePath = filePath;
        this.metricsJson = metricsJson;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getTaskType() { return taskType; }
    public void setTaskType(String taskType) { this.taskType = taskType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getMetricsJson() { return metricsJson; }
    public void setMetricsJson(String metricsJson) { this.metricsJson = metricsJson; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
