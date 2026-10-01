package com.example.smartattendance.service;

import com.example.smartattendance.dto.AuditLogDto;
import com.example.smartattendance.entity.AuditLog;
import com.example.smartattendance.entity.User;
import com.example.smartattendance.repository.AuditLogRepository;
import com.example.smartattendance.repository.UserRepository;
import com.example.smartattendance.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository, AuthService authService) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    public List<AuditLogDto> getAuditLogs() {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        List<AuditLog> logs = auditLogRepository.findByOrganizationIdOrderByTimestampDesc(orgId);
        return logs.stream().map(log -> {
            AuditLogDto dto = new AuditLogDto();
            dto.setId(log.getId());
            dto.setOrganizationId(log.getOrganizationId());
            dto.setUserId(log.getUserId());
            if (log.getUserId() != null) {
                userRepository.findById(log.getUserId()).ifPresent(u -> {
                    dto.setUserEmail(u.getEmail());
                    dto.setUserName(u.getFullName());
                });
            }
            dto.setAction(log.getAction());
            dto.setEntity(log.getEntity());
            dto.setEntityId(log.getEntityId());
            dto.setMetadata(log.getMetadata());
            dto.setIpAddress(log.getIpAddress());
            dto.setTimestamp(log.getTimestamp());
            return dto;
        }).collect(Collectors.toList());
    }
}
