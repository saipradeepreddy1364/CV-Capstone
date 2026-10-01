package com.example.smartattendance.service;

import com.example.smartattendance.dto.CreateDepartmentRequest;
import com.example.smartattendance.dto.DepartmentDto;
import com.example.smartattendance.entity.Department;
import com.example.smartattendance.exception.ConflictException;
import com.example.smartattendance.exception.ResourceNotFoundException;
import com.example.smartattendance.repository.DepartmentRepository;
import com.example.smartattendance.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final AuthService authService;
    private final AuditService auditService;

    public DepartmentService(DepartmentRepository departmentRepository, AuthService authService, AuditService auditService) {
        this.departmentRepository = departmentRepository;
        this.authService = authService;
        this.auditService = auditService;
    }

    public List<DepartmentDto> getDepartments() {
        UserPrincipal principal = authService.getCurrentPrincipal();
        return departmentRepository.findByOrganizationId(principal.getOrganizationId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest request, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        if (departmentRepository.existsByOrganizationIdAndCode(orgId, request.getCode().trim().toUpperCase())) {
            throw new ConflictException("Department code already exists in this organization");
        }

        Department department = new Department(orgId, request.getName().trim(), request.getCode().trim().toUpperCase());
        Department saved = departmentRepository.save(department);

        auditService.log(orgId, principal.getId(), "CREATE", "Department", saved.getId().toString(), "Created department " + saved.getName(), ipAddress);

        return toDto(saved);
    }

    @Transactional
    public void deleteDepartment(UUID departmentId, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Department department = departmentRepository.findByIdAndOrganizationId(departmentId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found in organization"));

        departmentRepository.delete(department);
        auditService.log(principal.getOrganizationId(), principal.getId(), "DELETE", "Department", departmentId.toString(), "Deleted department " + department.getName(), ipAddress);
    }

    public DepartmentDto toDto(Department dept) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(dept.getId());
        dto.setOrganizationId(dept.getOrganizationId());
        dto.setName(dept.getName());
        dto.setCode(dept.getCode());
        dto.setCreatedAt(dept.getCreatedAt());
        return dto;
    }
}
