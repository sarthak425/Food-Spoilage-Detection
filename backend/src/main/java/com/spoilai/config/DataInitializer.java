package com.spoilai.config;

import com.spoilai.entity.*;
import com.spoilai.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;
    private final FoodSampleRepository foodSampleRepository;
    private final ModelRegistryRepository modelRegistryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DeviceRepository deviceRepository,
                           FoodSampleRepository foodSampleRepository,
                           ModelRegistryRepository modelRegistryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.deviceRepository = deviceRepository;
        this.foodSampleRepository = foodSampleRepository;
        this.modelRegistryRepository = modelRegistryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Initialize Users
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@spoilai.internal", passwordEncoder.encode("admin123"), "Spoil AI Administrator", "ROLE_ADMIN");
            userRepository.save(admin);
            logger.info("Initialized default admin user: admin / admin123");
        }

        if (!userRepository.existsByUsername("researcher")) {
            User researcher = new User("researcher", "researcher@spoilai.internal", passwordEncoder.encode("user123"), "Dr. Food Scientist", "ROLE_USER");
            userRepository.save(researcher);
            logger.info("Initialized default researcher user: researcher / user123");
        }

        // 2. Initialize Default Devices
        if (!deviceRepository.existsByDeviceId("VIRTUAL_SENSOR_01")) {
            Device virtualDevice = new Device("VIRTUAL_SENSOR_01", "Virtual Multi-Sensor Node (Chamber A)", "VIRTUAL", "ONLINE");
            virtualDevice.setApiKeyHash(passwordEncoder.encode("virtual_node_secret_key"));
            virtualDevice.setCalibrationMetadata("{\"mq135_r0\": 76.5, \"hx711_scale\": 412.3}");
            deviceRepository.save(virtualDevice);
            logger.info("Initialized default virtual sensor node: VIRTUAL_SENSOR_01");
        }

        if (!deviceRepository.existsByDeviceId("ESP32_STATION_ALPHA")) {
            Device esp32Device = new Device("ESP32_STATION_ALPHA", "ESP32 IoT Node Beta (Chamber B)", "ESP32_REAL", "ONLINE");
            esp32Device.setApiKeyHash(passwordEncoder.encode("esp32_secret_alpha_key"));
            esp32Device.setCalibrationMetadata("{\"mq135_r0\": 82.1, \"hx711_scale\": 405.0}");
            deviceRepository.save(esp32Device);
            logger.info("Initialized default hardware device node: ESP32_STATION_ALPHA");
        }

        // 3. Initialize Food Samples
        if (foodSampleRepository.count() == 0) {
            foodSampleRepository.save(new FoodSample("Organic Gala Apples (Batch A)", "APPLE", "BATCH-2026-APL-01", "AMBIENT", 500.0, "VIRTUAL_SENSOR_01"));
            foodSampleRepository.save(new FoodSample("Cavendish Bananas (Batch B)", "BANANA", "BATCH-2026-BAN-04", "AMBIENT", 650.0, "VIRTUAL_SENSOR_01"));
            foodSampleRepository.save(new FoodSample("Vine Tomatoes (Batch C)", "TOMATO", "BATCH-2026-TOM-02", "REFRIGERATED", 420.0, "ESP32_STATION_ALPHA"));
            foodSampleRepository.save(new FoodSample("Alphonso Mangoes (Batch M)", "MANGO", "BATCH-2026-MNG-09", "CONTROLLED", 550.0, "VIRTUAL_SENSOR_01"));
            logger.info("Initialized 4 sample food batches for testing");
        }

        // 4. Initialize Model Registry entries
        if (modelRegistryRepository.count() == 0) {
            modelRegistryRepository.save(new ModelRegistry("YOLOv8-FoodSpoil-Vision", "v1.0.0", "OBJECT_DETECTION", "DEMO_MODE", "ai-service/models/yolov8_food.pt", "{\"map50\": 0.88, \"precision\": 0.84, \"recall\": 0.89}"));
            modelRegistryRepository.save(new ModelRegistry("LSTM-Sensor-TimeSeries", "v1.0.0", "SENSOR_CLASSIFICATION", "DEMO_MODE", "ai-service/models/lstm_sensor.h5", "{\"val_accuracy\": 0.91, \"val_loss\": 0.18}"));
            modelRegistryRepository.save(new ModelRegistry("Multimodal-Attention-Fusion", "v1.0.0", "MULTIMODAL_FUSION", "DEMO_MODE", "ai-service/models/attention_fusion.pt", "{\"f1_score\": 0.93, \"accuracy\": 0.92}"));
            logger.info("Initialized Model Registry demo entries");
        }
    }
}
