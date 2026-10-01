package com.example.smartattendance.service;

import com.example.smartattendance.dto.CreateFacultyRequest;
import com.example.smartattendance.dto.FacultyDto;
import com.example.smartattendance.dto.SubjectDto;
import com.example.smartattendance.dto.UpdateFacultyRequest;
import com.example.smartattendance.entity.Faculty;
import com.example.smartattendance.entity.OrganizationMember;
import com.example.smartattendance.entity.RoleType;
import com.example.smartattendance.entity.User;
import com.example.smartattendance.exception.ConflictException;
import com.example.smartattendance.exception.ForbiddenException;
import com.example.smartattendance.exception.ResourceNotFoundException;
import com.example.smartattendance.repository.*;
import com.example.smartattendance.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final OrganizationMemberRepository memberRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final AuditService auditService;
    private final SubjectService subjectService;

    public FacultyService(FacultyRepository facultyRepository,
                          UserRepository userRepository,
                          OrganizationMemberRepository memberRepository,
                          DepartmentRepository departmentRepository,
                          SubjectRepository subjectRepository,
                          EnrollmentRepository enrollmentRepository,
                          PasswordEncoder passwordEncoder,
                          AuthService authService,
                          AuditService auditService,
                          SubjectService subjectService) {
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
        this.auditService = auditService;
        this.subjectService = subjectService;
    }

    public List<FacultyDto> getFacultyByOrganization(UUID organizationId) {
        verifyOrgAccess(organizationId);
        return facultyRepository.findByOrganizationId(organizationId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public FacultyDto getFacultyById(UUID facultyId) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Faculty faculty = facultyRepository.findByIdAndOrganizationId(facultyId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found in organization"));
        return toDto(faculty);
    }

    @Transactional
    public FacultyDto createFaculty(UUID organizationId, CreateFacultyRequest request, String ipAddress) {
        verifyOrgAccess(organizationId);
        UserPrincipal principal = authService.getCurrentPrincipal();

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ConflictException("Email is already registered in the system");
        }
        if (facultyRepository.existsByOrganizationIdAndFacultyNumber(organizationId, request.getFacultyNumber().trim())) {
            throw new ConflictException("Faculty number already exists in this organization");
        }

        // 1. Create User account
        User user = new User(
                organizationId,
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName().trim(),
                request.getLastName().trim(),
                request.getPhone(),
                RoleType.FACULTY
        );
        User savedUser = userRepository.save(user);

        // 2. Add Organization Membership
        OrganizationMember member = new OrganizationMember(organizationId, savedUser.getId(), RoleType.FACULTY);
        memberRepository.save(member);

        // 3. Create Faculty Record
        Faculty faculty = new Faculty(
                organizationId,
                savedUser.getId(),
                request.getDepartmentId(),
                request.getFacultyNumber().trim(),
                request.getDesignation()
        );
        Faculty savedFaculty = facultyRepository.save(faculty);

        auditService.log(organizationId, principal.getId(), "CREATE", "Faculty", savedFaculty.getId().toString(), "Created faculty " + savedUser.getFullName(), ipAddress);

        return toDto(savedFaculty);
    }

    @Transactional
    public FacultyDto updateFaculty(UUID facultyId, UpdateFacultyRequest request, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Faculty faculty = facultyRepository.findByIdAndOrganizationId(facultyId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found in organization"));

        User user = userRepository.findById(faculty.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty user record not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) user.setLastName(request.getLastName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        userRepository.save(user);

        if (request.getDepartmentId() != null) faculty.setDepartmentId(request.getDepartmentId());
        if (request.getDesignation() != null) faculty.setDesignation(request.getDesignation().trim());
        Faculty saved = facultyRepository.save(faculty);

        auditService.log(principal.getOrganizationId(), principal.getId(), "UPDATE", "Faculty", facultyId.toString(), "Updated faculty " + user.getFullName(), ipAddress);

        return toDto(saved);
    }

    @Transactional
    public void deleteFaculty(UUID facultyId, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Faculty faculty = facultyRepository.findByIdAndOrganizationId(facultyId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found in organization"));

        User user = userRepository.findById(faculty.getUserId()).orElse(null);
        facultyRepository.delete(faculty);
        if (user != null) {
            userRepository.delete(user);
        }

        auditService.log(principal.getOrganizationId(), principal.getId(), "DELETE", "Faculty", facultyId.toString(), "Deleted faculty", ipAddress);
    }

    private void verifyOrgAccess(UUID targetOrgId) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        if (principal.getOrganizationId() == null || !principal.getOrganizationId().equals(targetOrgId)) {
            throw new ForbiddenException("Cross-organization access is strictly forbidden");
        }
    }

    public FacultyDto toDto(Faculty faculty) {
        FacultyDto dto = new FacultyDto();
        dto.setId(faculty.getId());
        dto.setOrganizationId(faculty.getOrganizationId());
        dto.setUserId(faculty.getUserId());
        dto.setDepartmentId(faculty.getDepartmentId());
        if (faculty.getDepartmentId() != null) {
            departmentRepository.findById(faculty.getDepartmentId())
                    .ifPresent(d -> dto.setDepartmentName(d.getName()));
        }
        dto.setFacultyNumber(faculty.getFacultyNumber());
        dto.setDesignation(faculty.getDesignation());
        dto.setCreatedAt(faculty.getCreatedAt());

        userRepository.findById(faculty.getUserId()).ifPresent(user -> {
            dto.setEmail(user.getEmail());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setFullName(user.getFullName());
            dto.setPhone(user.getPhone());
        });

        // Find assigned subjects through enrollments
        List<UUID> subjectIds = enrollmentRepository.findByOrganizationIdAndFacultyId(faculty.getOrganizationId(), faculty.getId())
                .stream().map(e -> e.getSubjectId()).distinct().collect(Collectors.toList());
        List<SubjectDto> subjects = subjectRepository.findAllById(subjectIds).stream()
                .map(subjectService::toDto).collect(Collectors.toList());
        dto.setAssignedSubjects(subjects);

        return dto;
    }
}
