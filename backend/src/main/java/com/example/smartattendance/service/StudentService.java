package com.example.smartattendance.service;

import com.example.smartattendance.dto.CreateStudentRequest;
import com.example.smartattendance.dto.StudentDto;
import com.example.smartattendance.dto.UpdateStudentRequest;
import com.example.smartattendance.entity.OrganizationMember;
import com.example.smartattendance.entity.RoleType;
import com.example.smartattendance.entity.Student;
import com.example.smartattendance.entity.User;
import com.example.smartattendance.exception.ConflictException;
import com.example.smartattendance.exception.ForbiddenException;
import com.example.smartattendance.exception.ResourceNotFoundException;
import com.example.smartattendance.repository.*;
import com.example.smartattendance.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final OrganizationMemberRepository memberRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final FaceProfileRepository faceProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final AuditService auditService;

    public StudentService(StudentRepository studentRepository,
                          UserRepository userRepository,
                          OrganizationMemberRepository memberRepository,
                          DepartmentRepository departmentRepository,
                          CourseRepository courseRepository,
                          FaceProfileRepository faceProfileRepository,
                          PasswordEncoder passwordEncoder,
                          AuthService authService,
                          AuditService auditService) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
        this.faceProfileRepository = faceProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
        this.auditService = auditService;
    }

    public List<StudentDto> getStudentsByOrganization(UUID organizationId) {
        verifyOrgAccess(organizationId);
        return studentRepository.findByOrganizationId(organizationId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public StudentDto getStudentById(UUID studentId) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Student student = studentRepository.findByIdAndOrganizationId(studentId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found in organization"));
        return toDto(student);
    }

    @Transactional
    public StudentDto createStudent(UUID organizationId, CreateStudentRequest request, String ipAddress) {
        verifyOrgAccess(organizationId);
        UserPrincipal principal = authService.getCurrentPrincipal();

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ConflictException("Email is already registered in the system");
        }
        if (studentRepository.existsByOrganizationIdAndStudentNumber(organizationId, request.getStudentNumber().trim())) {
            throw new ConflictException("Student number already exists in this organization");
        }

        // 1. Create User account
        User user = new User(
                organizationId,
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName().trim(),
                request.getLastName().trim(),
                request.getPhone(),
                RoleType.STUDENT
        );
        User savedUser = userRepository.save(user);

        // 2. Add Organization Membership
        OrganizationMember member = new OrganizationMember(organizationId, savedUser.getId(), RoleType.STUDENT);
        memberRepository.save(member);

        // 3. Create Student record
        Student student = new Student(
                organizationId,
                savedUser.getId(),
                request.getDepartmentId(),
                request.getCourseId(),
                request.getStudentNumber().trim(),
                request.getBatchYear(),
                request.getSemester()
        );
        Student savedStudent = studentRepository.save(student);

        auditService.log(organizationId, principal.getId(), "CREATE", "Student", savedStudent.getId().toString(), "Created student " + savedUser.getFullName(), ipAddress);

        return toDto(savedStudent);
    }

    @Transactional
    public StudentDto updateStudent(UUID studentId, UpdateStudentRequest request, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Student student = studentRepository.findByIdAndOrganizationId(studentId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found in organization"));

        User user = userRepository.findById(student.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Student user record not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) user.setLastName(request.getLastName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        userRepository.save(user);

        if (request.getDepartmentId() != null) student.setDepartmentId(request.getDepartmentId());
        if (request.getCourseId() != null) student.setCourseId(request.getCourseId());
        if (request.getBatchYear() != null) student.setBatchYear(request.getBatchYear());
        if (request.getSemester() != null) student.setSemester(request.getSemester());

        Student saved = studentRepository.save(student);

        auditService.log(principal.getOrganizationId(), principal.getId(), "UPDATE", "Student", studentId.toString(), "Updated student " + user.getFullName(), ipAddress);

        return toDto(saved);
    }

    @Transactional
    public void deleteStudent(UUID studentId, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Student student = studentRepository.findByIdAndOrganizationId(studentId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found in organization"));

        User user = userRepository.findById(student.getUserId()).orElse(null);
        studentRepository.delete(student);
        if (user != null) {
            userRepository.delete(user);
        }

        auditService.log(principal.getOrganizationId(), principal.getId(), "DELETE", "Student", studentId.toString(), "Deleted student", ipAddress);
    }

    private void verifyOrgAccess(UUID targetOrgId) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        if (principal.getOrganizationId() == null || !principal.getOrganizationId().equals(targetOrgId)) {
            throw new ForbiddenException("Cross-organization access is strictly forbidden");
        }
    }

    public StudentDto toDto(Student student) {
        StudentDto dto = new StudentDto();
        dto.setId(student.getId());
        dto.setOrganizationId(student.getOrganizationId());
        dto.setUserId(student.getUserId());
        dto.setDepartmentId(student.getDepartmentId());
        if (student.getDepartmentId() != null) {
            departmentRepository.findById(student.getDepartmentId())
                    .ifPresent(d -> dto.setDepartmentName(d.getName()));
        }
        dto.setCourseId(student.getCourseId());
        if (student.getCourseId() != null) {
            courseRepository.findById(student.getCourseId())
                    .ifPresent(c -> dto.setCourseName(c.getName()));
        }
        dto.setStudentNumber(student.getStudentNumber());
        dto.setBatchYear(student.getBatchYear());
        dto.setSemester(student.getSemester());
        dto.setFaceRegistered(faceProfileRepository.existsByStudentId(student.getId()));
        dto.setCreatedAt(student.getCreatedAt());

        userRepository.findById(student.getUserId()).ifPresent(user -> {
            dto.setEmail(user.getEmail());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setFullName(user.getFullName());
            dto.setPhone(user.getPhone());
        });

        return dto;
    }
}
