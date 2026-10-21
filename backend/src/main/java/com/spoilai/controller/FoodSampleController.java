package com.spoilai.controller;

import com.spoilai.dto.FoodSampleRequestDto;
import com.spoilai.dto.FoodSampleResponseDto;
import com.spoilai.service.FoodSampleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-samples")
@Tag(name = "Food Samples", description = "Register and manage food sample monitoring batches")
public class FoodSampleController {

    private final FoodSampleService foodSampleService;

    public FoodSampleController(FoodSampleService foodSampleService) {
        this.foodSampleService = foodSampleService;
    }

    @PostMapping
    @Operation(summary = "Register a new food sample / monitoring batch")
    public ResponseEntity<FoodSampleResponseDto> createFoodSample(@Valid @RequestBody FoodSampleRequestDto requestDto) {
        return ResponseEntity.ok(foodSampleService.createFoodSample(requestDto));
    }

    @GetMapping
    @Operation(summary = "List all monitored food samples")
    public ResponseEntity<List<FoodSampleResponseDto>> getAllFoodSamples() {
        return ResponseEntity.ok(foodSampleService.getAllFoodSamples());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get food sample details by ID")
    public ResponseEntity<FoodSampleResponseDto> getFoodSampleById(@PathVariable Long id) {
        return ResponseEntity.ok(foodSampleService.getFoodSampleById(id));
    }
}
