package com.spoilai.service;

import com.spoilai.entity.FoodSample;
import com.spoilai.exception.ResourceNotFoundException;
import com.spoilai.repository.FoodSampleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final String aiServiceUrl;
    private final FoodSampleRepository foodSampleRepository;
    private final RestClient restClient;
    private final Path uploadDir = Paths.get("./uploads/food-images");

    public AiService(@Value("${spoilai.ai-service.url:http://localhost:8000}") String aiServiceUrl,
                     FoodSampleRepository foodSampleRepository) {
        this.aiServiceUrl = aiServiceUrl.replaceAll("/$", "");
        this.foodSampleRepository = foodSampleRepository;
        this.restClient = RestClient.builder().baseUrl(this.aiServiceUrl).build();

        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            logger.error("Failed to initialize food image upload directory: {}", e.getMessage());
        }
    }

    public Map<String, Object> analyzeFoodImage(MultipartFile file, String foodCategory, Long sampleId) {
        // 1. Validation
        validateImageFile(file);

        // 2. Storage
        String fileExtension = getSafeExtension(file.getContentType());
        String storedFilename = "food_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + fileExtension;
        Path targetPath = uploadDir.toAbsolutePath().normalize().resolve(storedFilename).normalize();

        if (!targetPath.startsWith(uploadDir.toAbsolutePath().normalize())) {
            throw new SecurityException("Illegal path traversal attempt detected in filename.");
        }

        try {
            Files.copy(file.getInputStream(), targetPath);
        } catch (IOException e) {
            logger.error("Failed to store uploaded food image: {}", e.getMessage());
            throw new RuntimeException("Could not store uploaded image: " + e.getMessage());
        }

        String imageServeUrl = "/uploads/food-images/" + storedFilename;

        // 3. Associate with Food Sample if provided
        if (sampleId != null) {
            Optional<FoodSample> sampleOpt = foodSampleRepository.findById(sampleId);
            if (sampleOpt.isPresent()) {
                FoodSample sample = sampleOpt.get();
                sample.setImageUrl(imageServeUrl);
                foodSampleRepository.save(sample);
            }
        }

        // 4. Forward to FastAPI Python AI Service
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
                }
            };

            body.add("file", resource);
            body.add("foodCategory", foodCategory != null ? foodCategory.toUpperCase() : "APPLE");

            Map<String, Object> response = restClient.post()
                    .uri("/predict/image")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response != null) {
                Map<String, Object> enriched = new HashMap<>(response);
                enriched.put("stored_image_url", imageServeUrl);
                enriched.put("image_file_name", storedFilename);
                enriched.put("file_size_bytes", file.getSize());
                return enriched;
            }
        } catch (Exception e) {
            logger.warn("FastAPI prediction service unavailable or returned error at {}: {}", aiServiceUrl, e.getMessage());
        }

        // Graceful fallback response when AI service is offline
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("success", true);
        fallback.put("foodCategory", foodCategory != null ? foodCategory.toUpperCase() : "APPLE");
        fallback.put("is_trained_model", false);
        fallback.put("model_name", "YOLOv8-FoodSpoil-Vision");
        fallback.put("status", "STANDBY");
        fallback.put("stored_image_url", imageServeUrl);
        fallback.put("image_file_name", storedFilename);
        fallback.put("file_size_bytes", file.getSize());
        fallback.put("detected_items", List.of());
        fallback.put("spoilage_stage", "ANALYSIS_PENDING");
        fallback.put("warning", "Image securely received and stored. AI inference engine currently initializing on " + aiServiceUrl);
        return fallback;
    }

    public Map<String, Object> predictSensorTimeSeries(Map<String, Object> payload) {
        try {
            return restClient.post()
                    .uri("/predict/sensor")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException e) {
            logger.warn("AI sensor inference call failed: {}", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("success", false);
            fallback.put("error", "AI service unreachable at " + aiServiceUrl);
            return fallback;
        }
    }

    public Map<String, Object> predictMultimodalFusion(Map<String, Object> payload) {
        try {
            return restClient.post()
                    .uri("/predict/fusion")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException e) {
            logger.warn("AI multimodal fusion call failed: {}", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("success", false);
            fallback.put("error", "AI service unreachable at " + aiServiceUrl);
            return fallback;
        }
    }

    public Map<String, Object> predictShelfLife(String foodCategory, Double riskScore) {
        try {
            return restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/predict/shelf-life")
                            .queryParam("foodCategory", foodCategory != null ? foodCategory : "APPLE")
                            .queryParam("riskScore", riskScore != null ? riskScore : 20.0)
                            .build())
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException e) {
            logger.warn("AI shelf life estimation call failed: {}", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("success", false);
            fallback.put("error", "AI service unreachable at " + aiServiceUrl);
            return fallback;
        }
    }

    public Map<String, Object> getAiModelsStatus() {
        try {
            return restClient.get()
                    .uri("/models/status")
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException e) {
            logger.warn("Could not reach AI service models status: {}", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("status", "OFFLINE");
            fallback.put("service_url", aiServiceUrl);
            fallback.put("models", List.of(
                    Map.of("name", "YOLOv8-FoodSpoil-Vision", "status", "OFFLINE"),
                    Map.of("name", "LSTM-Sensor-TimeSeries", "status", "OFFLINE"),
                    Map.of("name", "Multimodal-Attention-Fusion", "status", "OFFLINE")
            ));
            return fallback;
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file must not be empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Image file exceeds maximum permitted size of 10MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported image format. Allowed formats: JPEG, PNG, WEBP.");
        }

        // Magic bytes validation
        try {
            byte[] header = file.getBytes();
            if (!isValidMagicBytes(header, contentType)) {
                throw new IllegalArgumentException("File content does not match reported image format header.");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read image bytes for format validation.");
        }
    }

    private boolean isValidMagicBytes(byte[] bytes, String contentType) {
        if (bytes == null || bytes.length < 8) return false;

        // JPEG: FF D8 FF
        if (contentType.equalsIgnoreCase("image/jpeg") || contentType.equalsIgnoreCase("image/jpg")) {
            return (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF);
        }

        // PNG: 89 50 4E 47
        if (contentType.equalsIgnoreCase("image/png")) {
            return (bytes[0] == (byte) 0x89 && bytes[1] == (byte) 0x50 && bytes[2] == (byte) 0x4E && bytes[3] == (byte) 0x47);
        }

        // WEBP: starts with "RIFF" and has "WEBP" at offset 8
        if (contentType.equalsIgnoreCase("image/webp")) {
            return bytes.length >= 12 &&
                    bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
                    bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
        }

        return false;
    }

    private String getSafeExtension(String contentType) {
        if (contentType == null) return "jpg";
        return switch (contentType.toLowerCase()) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "jpg";
        };
    }
}
