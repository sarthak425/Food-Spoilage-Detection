package com.spoilai.service;

import com.spoilai.dto.FoodSampleRequestDto;
import com.spoilai.dto.FoodSampleResponseDto;
import com.spoilai.dto.SensorReadingResponseDto;
import com.spoilai.entity.FoodSample;
import com.spoilai.entity.SensorReading;
import com.spoilai.exception.ResourceNotFoundException;
import com.spoilai.repository.FoodSampleRepository;
import com.spoilai.repository.SensorReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FoodSampleService {

    private final FoodSampleRepository foodSampleRepository;
    private final SensorReadingRepository sensorReadingRepository;

    public FoodSampleService(FoodSampleRepository foodSampleRepository,
                             SensorReadingRepository sensorReadingRepository) {
        this.foodSampleRepository = foodSampleRepository;
        this.sensorReadingRepository = sensorReadingRepository;
    }

    @Transactional
    public FoodSampleResponseDto createFoodSample(FoodSampleRequestDto dto) {
        FoodSample sample = new FoodSample();
        sample.setSampleName(dto.getSampleName());
        sample.setFoodCategory(dto.getFoodCategory().toUpperCase());
        sample.setBatchNumber(dto.getBatchNumber());
        sample.setStorageCondition(dto.getStorageCondition() != null ? dto.getStorageCondition() : "AMBIENT");
        sample.setInitialWeightGrams(dto.getInitialWeightGrams());
        sample.setNotes(dto.getNotes());
        sample.setDeviceId(dto.getDeviceId());
        sample.setStatus("ACTIVE");

        FoodSample saved = foodSampleRepository.save(sample);
        return mapToDto(saved);
    }

    public List<FoodSampleResponseDto> getAllFoodSamples() {
        return foodSampleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FoodSampleResponseDto getFoodSampleById(Long id) {
        FoodSample sample = foodSampleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food sample not found with id: " + id));
        return mapToDto(sample);
    }

    private FoodSampleResponseDto mapToDto(FoodSample sample) {
        FoodSampleResponseDto dto = new FoodSampleResponseDto();
        dto.setId(sample.getId());
        dto.setSampleName(sample.getSampleName());
        dto.setFoodCategory(sample.getFoodCategory());
        dto.setBatchNumber(sample.getBatchNumber());
        dto.setStorageCondition(sample.getStorageCondition());
        dto.setInitialWeightGrams(sample.getInitialWeightGrams());
        dto.setNotes(sample.getNotes());
        dto.setDeviceId(sample.getDeviceId());
        dto.setStatus(sample.getStatus());
        dto.setCreatedAt(sample.getCreatedAt());

        // Find latest sensor reading if available
        Optional<SensorReading> latestOpt = sensorReadingRepository.findTopByFoodSampleIdOrderByTimestampDesc(sample.getId());
        latestOpt.ifPresent(r -> {
            SensorReadingResponseDto rd = new SensorReadingResponseDto();
            rd.setId(r.getId());
            rd.setDeviceId(r.getDeviceId());
            rd.setFoodSampleId(r.getFoodSampleId());
            rd.setSource(r.getSource());
            rd.setTimestamp(r.getTimestamp());
            rd.setTemperatureC(r.getTemperatureC());
            rd.setHumidityPercent(r.getHumidityPercent());
            rd.setGasSensor(r.getGasSensor());
            rd.setGasValue(r.getGasValue());
            rd.setGasUnit(r.getGasUnit());
            rd.setGasCalibrated(r.getGasCalibrated());
            rd.setWeightGrams(r.getWeightGrams());
            rd.setLightLux(r.getLightLux());
            dto.setLatestReading(rd);
        });

        return dto;
    }
}
