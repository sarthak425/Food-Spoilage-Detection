package com.spoilai.repository;

import com.spoilai.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findTop50ByOrderByCreatedAtDesc();
    List<Alert> findAllByAcknowledgedFalseOrderByCreatedAtDesc();
    List<Alert> findAllByFoodSampleIdOrderByCreatedAtDesc(Long foodSampleId);
    long countByAcknowledgedFalse();
}
