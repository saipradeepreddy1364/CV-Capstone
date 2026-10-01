package com.example.smartattendance.service;

import com.example.smartattendance.dto.OrganizationDto;
import com.example.smartattendance.dto.UpdateOrganizationRequest;
import com.example.smartattendance.entity.Organization;
import com.example.smartattendance.exception.ForbiddenException;
import com.example.smartattendance.exception.ResourceNotFoundException;
import com.example.smartattendance.repository.OrganizationRepository;
import com.example.smartattendance.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final AuthService authService;
    private final AuditService auditService;

    public OrganizationService(OrganizationRepository organizationRepository, AuthService authService, AuditService auditService) {
        this.organizationRepository = organizationRepository;
        this.authService = authService;
        this.auditService = auditService;
    }

    public OrganizationDto getOrganization(UUID organizationId) {
        verifyOrgAccess(organizationId);
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        return toDto(org);
    }

    @Transactional
    public OrganizationDto updateOrganization(UUID organizationId, UpdateOrganizationRequest request, String ipAddress) {
        verifyOrgAccess(organizationId);
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        org.setName(request.getName());
        org.setEmail(request.getEmail());
        org.setPhone(request.getPhone());
        org.setAddress(request.getAddress());
        org.setUpdatedAt(Instant.now());

        Organization saved = organizationRepository.save(org);

        UserPrincipal currentPrincipal = authService.getCurrentPrincipal();
        auditService.log(organizationId, currentPrincipal.getId(), "UPDATE", "Organization", organizationId.toString(), "Organization updated", ipAddress);

        return toDto(saved);
    }

    public void verifyOrgAccess(UUID targetOrgId) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        if (principal.getOrganizationId() == null || !principal.getOrganizationId().equals(targetOrgId)) {
            throw new ForbiddenException("Organization access denied. Cross-organization access is strictly forbidden.");
        }
    }

    public OrganizationDto toDto(Organization org) {
        OrganizationDto dto = new OrganizationDto();
        dto.setId(org.getId());
        dto.setName(org.getName());
        dto.setCode(org.getCode());
        dto.setEmail(org.getEmail());
        dto.setPhone(org.getPhone());
        dto.setAddress(org.getAddress());
        dto.setCreatedAt(org.getCreatedAt());
        dto.setUpdatedAt(org.getUpdatedAt());
        return dto;
    }
}
