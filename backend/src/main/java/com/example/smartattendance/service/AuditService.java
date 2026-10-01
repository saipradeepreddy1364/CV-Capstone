package com.example.smartattendance.service;

import com.example.smartattendance.entity.AuditLog;
import com.example.smartattendance.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(UUID organizationId, UUID userId, String action, String entity, String entityId, String metadata, String ipAddress) {
        try {
            AuditLog auditLog = new AuditLog(organizationId, userId, action, entity, entityId, metadata, ipAddress);
            auditLogRepository.save(auditLog);
            logger.info("AUDIT: [org={}] [user={}] {} on {} ({})", organizationId, userId, action, entity, entityId);
        } catch (Exception e) {
            logger.error("Failed to persist audit log: {}", e.getMessage());
        }
    }
}
