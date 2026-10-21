package com.spoilai.repository;

import com.spoilai.entity.ModelRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ModelRegistryRepository extends JpaRepository<ModelRegistry, Long> {
    Optional<ModelRegistry> findByModelName(String modelName);
    List<ModelRegistry> findAllByTaskType(String taskType);
}
