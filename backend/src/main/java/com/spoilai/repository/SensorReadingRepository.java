package com.spoilai.repository;

import com.spoilai.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
    List<SensorReading> findTop50ByOrderByTimestampDesc();
    List<SensorReading> findTop50ByFoodSampleIdOrderByTimestampDesc(Long foodSampleId);
    List<SensorReading> findTop50ByDeviceIdOrderByTimestampDesc(String deviceId);
    List<SensorReading> findTop50BySourceOrderByTimestampDesc(String source);
    List<SensorReading> findTop50ByDeviceIdAndFoodSampleIdOrderByTimestampDesc(String deviceId, Long foodSampleId);

    List<SensorReading> findTop100ByOrderByTimestampDesc();
    Optional<SensorReading> findTopByFoodSampleIdOrderByTimestampDesc(Long foodSampleId);
    Optional<SensorReading> findTopByDeviceIdOrderByTimestampDesc(String deviceId);
    Optional<SensorReading> findTopByOrderByTimestampDesc();

    @Query("SELECT r FROM SensorReading r WHERE r.foodSampleId = :foodSampleId ORDER BY r.timestamp ASC")
    List<SensorReading> findAllByFoodSampleIdAsc(@Param("foodSampleId") Long foodSampleId);

    long countBySource(String source);
}
