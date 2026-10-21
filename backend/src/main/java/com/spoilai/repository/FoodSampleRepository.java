package com.spoilai.repository;

import com.spoilai.entity.FoodSample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodSampleRepository extends JpaRepository<FoodSample, Long> {
    List<FoodSample> findAllByStatus(String status);
    List<FoodSample> findAllByDeviceId(String deviceId);
    List<FoodSample> findAllByFoodCategory(String foodCategory);
    Optional<FoodSample> findFirstByDeviceIdOrderByCreatedAtDesc(String deviceId);
}
