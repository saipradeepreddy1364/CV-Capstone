package com.example.smartattendance.repository;

import com.example.smartattendance.entity.AttendanceSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceSettingsRepository extends JpaRepository<AttendanceSettings, UUID> {
    Optional<AttendanceSettings> findByOrganizationId(UUID organizationId);
    boolean existsByOrganizationId(UUID organizationId);
}
