-- Spoil AI — Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS spoil_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spoil_ai;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_username (username),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 2. Devices Table (ESP32 and Virtual Devices)
CREATE TABLE IF NOT EXISTS devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL UNIQUE,
    device_name VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255),
    device_type VARCHAR(20) NOT NULL DEFAULT 'VIRTUAL', -- VIRTUAL, ESP32_REAL
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE', -- ONLINE, OFFLINE, MAINTENANCE
    last_seen_at TIMESTAMP NULL,
    calibration_metadata TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_device_id (device_id),
    INDEX idx_device_status (status)
) ENGINE=InnoDB;

-- 3. Food Samples Table
CREATE TABLE IF NOT EXISTS food_samples (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sample_name VARCHAR(100) NOT NULL,
    food_category VARCHAR(50) NOT NULL, -- APPLE, BANANA, TOMATO, MANGO, OTHER
    batch_number VARCHAR(50) NOT NULL,
    storage_condition VARCHAR(50) DEFAULT 'AMBIENT', -- AMBIENT, REFRIGERATED, CONTROLLED
    initial_weight_grams DOUBLE NULL,
    notes TEXT NULL,
    user_id BIGINT NULL,
    device_id VARCHAR(64) NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED, SPOILED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_food_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_food_device FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE SET NULL,
    INDEX idx_food_category (food_category),
    INDEX idx_food_device (device_id)
) ENGINE=InnoDB;

-- 4. Sensor Readings Table (Both Simulated and Real ESP32)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL,
    food_sample_id BIGINT NULL,
    source VARCHAR(20) NOT NULL DEFAULT 'SIMULATED', -- SIMULATED, REAL_ESP32
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    temperature_c DOUBLE NOT NULL,
    humidity_percent DOUBLE NOT NULL,
    gas_sensor VARCHAR(30) DEFAULT 'MQ135',
    gas_value DOUBLE NOT NULL,
    gas_unit VARCHAR(20) DEFAULT 'RAW_ADC', -- RAW_ADC, PPM
    gas_calibrated BOOLEAN DEFAULT FALSE,
    weight_grams DOUBLE NULL,
    light_lux DOUBLE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reading_food FOREIGN KEY (food_sample_id) REFERENCES food_samples(id) ON DELETE SET NULL,
    CONSTRAINT fk_reading_device FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE,
    INDEX idx_reading_sample_time (food_sample_id, timestamp),
    INDEX idx_reading_device_time (device_id, timestamp),
    INDEX idx_reading_source (source)
) ENGINE=InnoDB;

-- 5. Food Images Table
CREATE TABLE IF NOT EXISTS food_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_sample_id BIGINT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    capture_source VARCHAR(20) DEFAULT 'UPLOAD', -- UPLOAD, CAMERA
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_image_food FOREIGN KEY (food_sample_id) REFERENCES food_samples(id) ON DELETE CASCADE,
    INDEX idx_image_sample (food_sample_id)
) ENGINE=InnoDB;

-- 6. AI Predictions Table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_sample_id BIGINT NOT NULL,
    model_type VARCHAR(30) NOT NULL, -- VISION, SENSOR, FUSION
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    is_trained_model BOOLEAN NOT NULL DEFAULT FALSE,
    prediction_stage VARCHAR(30) NOT NULL, -- FRESH, EARLY_SPOILAGE, MODERATE_SPOILAGE, SEVERE_SPOILAGE
    confidence DOUBLE NOT NULL DEFAULT 0.0,
    shelf_life_hours DOUBLE NULL,
    raw_output_json LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pred_food FOREIGN KEY (food_sample_id) REFERENCES food_samples(id) ON DELETE CASCADE,
    INDEX idx_pred_sample (food_sample_id),
    INDEX idx_pred_type (model_type)
) ENGINE=InnoDB;

-- 7. Spoilage Analyses (Unified Report)
CREATE TABLE IF NOT EXISTS spoilage_analyses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_sample_id BIGINT NOT NULL,
    overall_spoilage_stage VARCHAR(30) NOT NULL,
    risk_score DOUBLE NOT NULL,
    estimated_shelf_life_hours DOUBLE NULL,
    confidence DOUBLE NOT NULL,
    explanation_summary TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analysis_food FOREIGN KEY (food_sample_id) REFERENCES food_samples(id) ON DELETE CASCADE,
    INDEX idx_analysis_sample (food_sample_id)
) ENGINE=InnoDB;

-- 8. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_sample_id BIGINT NULL,
    device_id VARCHAR(64) NULL,
    alert_type VARCHAR(50) NOT NULL, -- TEMPERATURE_HIGH, HUMIDITY_HIGH, GAS_ANOMALY, SPOILAGE_RISK, SENSOR_OFFLINE
    severity VARCHAR(20) NOT NULL, -- INFO, WARNING, CRITICAL
    message VARCHAR(255) NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alert_sample FOREIGN KEY (food_sample_id) REFERENCES food_samples(id) ON DELETE SET NULL,
    CONSTRAINT fk_alert_device FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE SET NULL,
    INDEX idx_alert_severity (severity),
    INDEX idx_alert_acknowledged (acknowledged)
) ENGINE=InnoDB;

-- 9. Actuator Events Table
CREATE TABLE IF NOT EXISTS actuator_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(64) NULL,
    food_sample_id BIGINT NULL,
    actuator_type VARCHAR(50) NOT NULL, -- COOLING_FAN, VENTILATION_FAN, BUZZER, LED_INDICATOR, SERVO_SORTER
    target_state VARCHAR(20) NOT NULL, -- ON, OFF, ACTIVE, IDLE
    triggered_by VARCHAR(30) NOT NULL DEFAULT 'MANUAL_SIMULATION', -- AUTO_RULE, MANUAL_SIMULATION
    reason VARCHAR(255) NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_actuator_device (device_id)
) ENGINE=InnoDB;

-- 10. Model Registry Table
CREATE TABLE IF NOT EXISTS model_registry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL UNIQUE,
    version VARCHAR(50) NOT NULL,
    task_type VARCHAR(50) NOT NULL, -- OBJECT_DETECTION, SENSOR_CLASSIFICATION, MULTIMODAL_FUSION
    status VARCHAR(30) NOT NULL DEFAULT 'DEMO_MODE', -- AVAILABLE, NOT_AVAILABLE, DEMO_MODE
    file_path VARCHAR(255) NULL,
    metrics_json TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;