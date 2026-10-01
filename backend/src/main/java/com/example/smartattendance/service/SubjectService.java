package com.example.smartattendance.service;

import com.example.smartattendance.dto.CreateSubjectRequest;
import com.example.smartattendance.dto.SubjectDto;
import com.example.smartattendance.entity.Subject;
import com.example.smartattendance.exception.ConflictException;
import com.example.smartattendance.exception.ResourceNotFoundException;
import com.example.smartattendance.repository.CourseRepository;
import com.example.smartattendance.repository.DepartmentRepository;
import com.example.smartattendance.repository.SubjectRepository;
import com.example.smartattendance.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final AuthService authService;
    private final AuditService auditService;

    public SubjectService(SubjectRepository subjectRepository,
                          DepartmentRepository departmentRepository,
                          CourseRepository courseRepository,
                          AuthService authService,
                          AuditService auditService) {
        this.subjectRepository = subjectRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
        this.authService = authService;
        this.auditService = auditService;
    }

    public List<SubjectDto> getSubjects() {
        UserPrincipal principal = authService.getCurrentPrincipal();
        return subjectRepository.findByOrganizationId(principal.getOrganizationId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public SubjectDto createSubject(CreateSubjectRequest request, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        if (subjectRepository.existsByOrganizationIdAndCode(orgId, request.getCode().trim().toUpperCase())) {
            throw new ConflictException("Subject code already exists in this organization");
        }

        Subject subject = new Subject(
                orgId,
                request.getDepartmentId(),
                request.getCourseId(),
                request.getName().trim(),
                request.getCode().trim().toUpperCase(),
                request.getCredits()
        );
        Subject saved = subjectRepository.save(subject);

        auditService.log(orgId, principal.getId(), "CREATE", "Subject", saved.getId().toString(), "Created subject " + saved.getName(), ipAddress);

        return toDto(saved);
    }

    @Transactional
    public void deleteSubject(UUID subjectId, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Subject subject = subjectRepository.findByIdAndOrganizationId(subjectId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found in organization"));

        subjectRepository.delete(subject);
        auditService.log(principal.getOrganizationId(), principal.getId(), "DELETE", "Subject", subjectId.toString(), "Deleted subject " + subject.getName(), ipAddress);
    }

    public SubjectDto toDto(Subject subject) {
        SubjectDto dto = new SubjectDto();
        dto.setId(subject.getId());
        dto.setOrganizationId(subject.getOrganizationId());
        dto.setDepartmentId(subject.getDepartmentId());
        if (subject.getDepartmentId() != null) {
            departmentRepository.findById(subject.getDepartmentId())
                    .ifPresent(d -> dto.setDepartmentName(d.getName()));
        }
        dto.setCourseId(subject.getCourseId());
        if (subject.getCourseId() != null) {
            courseRepository.findById(subject.getCourseId())
                    .ifPresent(c -> dto.setCourseName(c.getName()));
        }
        dto.setName(subject.getName());
        dto.setCode(subject.getCode());
        dto.setCredits(subject.getCredits());
        dto.setCreatedAt(subject.getCreatedAt());
        return dto;
    }
}
