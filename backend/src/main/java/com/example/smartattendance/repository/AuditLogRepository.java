package com.example.smartattendance.repository;

import com.example.smartattendance.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByOrganizationIdOrderByTimestampDesc(UUID organizationId);
    List<AuditLog> findByUserIdOrderByTimestampDesc(UUID userId);
}
