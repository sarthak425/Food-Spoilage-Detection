-- Spoil AI — Seed Data for Development & Testing
USE spoil_ai;

-- 1. Insert Default Devices (ESP32 and Virtual Devices)
INSERT INTO devices (device_id, device_name, api_key_hash, device_type, status, calibration_metadata)
VALUES 
('VIRTUAL_SENSOR_01', 'Virtual Multi-Sensor Node (Chamber A)', '$2a$10$e8K7bA1k9z7bQ8mQzR7eOedU8oV7u3w2oP9wK0yE3jD8qZ1aX6z1a', 'VIRTUAL', 'ONLINE', '{"mq135_r0": 76.5, "hx711_scale": 412.3}'),
('ESP32_STATION_ALPHA', 'ESP32 IoT Node Beta (Chamber B)', '$2a$10$e8K7bA1k9z7bQ8mQzR7eOedU8oV7u3w2oP9wK0yE3jD8qZ1aX6z1a', 'ESP32_REAL', 'ONLINE', '{"mq135_r0": 82.1, "hx711_scale": 405.0}')
ON DUPLICATE KEY UPDATE device_name=VALUES(device_name);

-- 2. Insert Default Admin & User (Password: admin123 and user123)
-- BCrypt for 'admin123': $2a$10$7vN34b3eQ4GqGz3U4QWdOuD6cQvLqD7jW9Bv0YhMv4Kz7F2R.22mi
-- BCrypt for 'user123':  $2a$10$pLdZ4EaH/8tT1w5X8uUZOu5u.kF6Kk2M0gG1aG7Y0aF4C1S6T1w4e
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES 
('admin', 'admin@spoilai.internal', '$2a$10$7vN34b3eQ4GqGz3U4QWdOuD6cQvLqD7jW9Bv0YhMv4Kz7F2R.22mi', 'Spoil AI Admin', 'ROLE_ADMIN'),
('researcher', 'researcher@spoilai.internal', '$2a$10$pLdZ4EaH/8tT1w5X8uUZOu5u.kF6Kk2M0gG1aG7Y0aF4C1S6T1w4e', 'Dr. Food Scientist', 'ROLE_USER')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 3. Insert Initial Food Samples
INSERT INTO food_samples (id, sample_name, food_category, batch_number, storage_condition, initial_weight_grams, notes, user_id, device_id, status)
VALUES
(1, 'Organic Gala Apples (Batch A)', 'APPLE', 'BATCH-2026-APL-01', 'AMBIENT', 500.0, 'Monitoring ambient temperature decay and ethylene release', 1, 'VIRTUAL_SENSOR_01', 'ACTIVE'),
(2, 'Cavendish Bananas (Batch B)', 'BANANA', 'BATCH-2026-BAN-04', 'AMBIENT', 650.0, 'Rapid ripening tracking via MQ135 sensor readings', 1, 'VIRTUAL_SENSOR_01', 'ACTIVE'),
(3, 'Vine Tomatoes (Batch C)', 'TOMATO', 'BATCH-2026-TOM-02', 'REFRIGERATED', 420.0, 'Cold storage mold & softness observation', 1, 'ESP32_STATION_ALPHA', 'ACTIVE'),
(4, 'Alphonso Mangoes (Batch M)', 'MANGO', 'BATCH-2026-MNG-09', 'CONTROLLED', 550.0, 'Controlled atmosphere sensor telemetry test', 2, 'VIRTUAL_SENSOR_01', 'ACTIVE')
ON DUPLICATE KEY UPDATE sample_name=VALUES(sample_name);

-- 4. Insert Initial Model Registry Records
INSERT INTO model_registry (model_name, version, task_type, status, file_path, metrics_json)
VALUES
('YOLOv8-FoodSpoil-Vision', 'v1.0.0', 'OBJECT_DETECTION', 'DEMO_MODE', 'ai-service/models/yolov8_food.pt', '{"map50": 0.88, "precision": 0.84, "recall": 0.89}'),
('LSTM-Sensor-TimeSeries', 'v1.0.0', 'SENSOR_CLASSIFICATION', 'DEMO_MODE', 'ai-service/models/lstm_sensor.h5', '{"val_accuracy": 0.91, "val_loss": 0.18}'),
('Multimodal-Attention-Fusion', 'v1.0.0', 'MULTIMODAL_FUSION', 'DEMO_MODE', 'ai-service/models/attention_fusion.pt', '{"f1_score": 0.93, "accuracy": 0.92}')
ON DUPLICATE KEY UPDATE version=VALUES(version);

-- 5. Insert Sample Alerts
INSERT INTO alerts (food_sample_id, device_id, alert_type, severity, message, acknowledged)
VALUES
(1, 'VIRTUAL_SENSOR_01', 'TEMPERATURE_HIGH', 'WARNING', 'Chamber A temperature exceeded optimal storage threshold (26.8°C)', FALSE),
(2, 'VIRTUAL_SENSOR_01', 'GAS_ANOMALY', 'CRITICAL', 'Significant surge in VOC/Gas concentration detected for Banana Batch B (480 ADC)', FALSE);
