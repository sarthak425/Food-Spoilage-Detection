package com.spoilai.repository;

import com.spoilai.entity.ActuatorEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActuatorEventRepository extends JpaRepository<ActuatorEvent, Long> {
    List<ActuatorEvent> findTop50ByOrderByTimestampDesc();
    List<ActuatorEvent> findAllByDeviceIdOrderByTimestampDesc(String deviceId);
}
