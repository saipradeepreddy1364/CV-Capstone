package com.example.smartattendance.service;

import com.example.smartattendance.dto.CreateEnrollmentRequest;
import com.example.smartattendance.dto.EnrollmentDto;
import com.example.smartattendance.dto.StudentDto;
import com.example.smartattendance.entity.Enrollment;
import com.example.smartattendance.entity.Faculty;
import com.example.smartattendance.entity.Student;
import com.example.smartattendance.entity.Subject;
import com.example.smartattendance.exception.ConflictException;
import com.example.smartattendance.exception.ForbiddenException;
import com.example.smartattendance.exception.ResourceNotFoundException;
import com.example.smartattendance.repository.*;
import com.example.smartattendance.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final StudentService studentService;
    private final AuthService authService;
    private final AuditService auditService;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             StudentRepository studentRepository,
                             SubjectRepository subjectRepository,
                             FacultyRepository facultyRepository,
                             UserRepository userRepository,
                             StudentService studentService,
                             AuthService authService,
                             AuditService auditService) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.studentService = studentService;
        this.authService = authService;
        this.auditService = auditService;
    }

    public List<EnrollmentDto> getEnrollments() {
        UserPrincipal principal = authService.getCurrentPrincipal();
        return enrollmentRepository.findByOrganizationId(principal.getOrganizationId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<StudentDto> getStudentsByFaculty(UUID facultyId) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Faculty faculty = facultyRepository.findByIdAndOrganizationId(facultyId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found in organization"));

        List<UUID> studentIds = enrollmentRepository.findByOrganizationIdAndFacultyId(principal.getOrganizationId(), faculty.getId())
                .stream().map(Enrollment::getStudentId).distinct().collect(Collectors.toList());

        return studentRepository.findAllById(studentIds).stream()
                .filter(s -> s.getOrganizationId().equals(principal.getOrganizationId()))
                .map(studentService::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnrollmentDto createEnrollment(CreateEnrollmentRequest request, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        // 1. Verify student belongs to organization
        Student student = studentRepository.findByIdAndOrganizationId(request.getStudentId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found in your organization"));

        // 2. Verify subject belongs to organization
        Subject subject = subjectRepository.findByIdAndOrganizationId(request.getSubjectId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found in your organization"));

        // 3. Verify faculty belongs to organization if provided
        if (request.getFacultyId() != null) {
            facultyRepository.findByIdAndOrganizationId(request.getFacultyId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found in your organization"));
        }

        // 4. Duplicate check
        if (enrollmentRepository.existsByStudentIdAndSubjectId(student.getId(), subject.getId())) {
            throw new ConflictException("Student is already enrolled in this subject");
        }

        Enrollment enrollment = new Enrollment(
                orgId,
                student.getId(),
                subject.getId(),
                request.getFacultyId(),
                request.getAcademicTerm()
        );
        Enrollment saved = enrollmentRepository.save(enrollment);

        auditService.log(orgId, principal.getId(), "ENROLLMENT", "Enrollment", saved.getId().toString(),
                "Enrolled student " + student.getStudentNumber() + " in subject " + subject.getName(), ipAddress);

        return toDto(saved);
    }

    @Transactional
    public void deleteEnrollment(UUID enrollmentId, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Enrollment enrollment = enrollmentRepository.findByIdAndOrganizationId(enrollmentId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found in your organization"));

        enrollmentRepository.delete(enrollment);
        auditService.log(principal.getOrganizationId(), principal.getId(), "DELETE_ENROLLMENT", "Enrollment", enrollmentId.toString(),
                "Deleted enrollment", ipAddress);
    }

    public EnrollmentDto toDto(Enrollment enrollment) {
        EnrollmentDto dto = new EnrollmentDto();
        dto.setId(enrollment.getId());
        dto.setOrganizationId(enrollment.getOrganizationId());
        dto.setStudentId(enrollment.getStudentId());
        studentRepository.findById(enrollment.getStudentId()).ifPresent(s -> {
            dto.setStudentNumber(s.getStudentNumber());
            userRepository.findById(s.getUserId()).ifPresent(u -> dto.setStudentName(u.getFullName()));
        });

        dto.setSubjectId(enrollment.getSubjectId());
        subjectRepository.findById(enrollment.getSubjectId()).ifPresent(sub -> {
            dto.setSubjectName(sub.getName());
            dto.setSubjectCode(sub.getCode());
        });

        dto.setFacultyId(enrollment.getFacultyId());
        if (enrollment.getFacultyId() != null) {
            facultyRepository.findById(enrollment.getFacultyId()).ifPresent(f -> {
                userRepository.findById(f.getUserId()).ifPresent(u -> dto.setFacultyName(u.getFullName()));
            });
        }

        dto.setAcademicTerm(enrollment.getAcademicTerm());
        dto.setCreatedAt(enrollment.getCreatedAt());
        return dto;
    }
}
