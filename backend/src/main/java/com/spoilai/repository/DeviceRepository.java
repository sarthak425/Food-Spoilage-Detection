package com.spoilai.repository;

import com.spoilai.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    Optional<Device> findByDeviceId(String deviceId);
    Boolean existsByDeviceId(String deviceId);
    List<Device> findAllByStatus(String status);
}
