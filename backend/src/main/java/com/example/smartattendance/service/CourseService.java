package com.example.smartattendance.service;

import com.example.smartattendance.dto.CourseDto;
import com.example.smartattendance.dto.CreateCourseRequest;
import com.example.smartattendance.entity.Course;
import com.example.smartattendance.entity.Department;
import com.example.smartattendance.exception.ConflictException;
import com.example.smartattendance.exception.ResourceNotFoundException;
import com.example.smartattendance.repository.CourseRepository;
import com.example.smartattendance.repository.DepartmentRepository;
import com.example.smartattendance.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
    private final AuthService authService;
    private final AuditService auditService;

    public CourseService(CourseRepository courseRepository, DepartmentRepository departmentRepository, AuthService authService, AuditService auditService) {
        this.courseRepository = courseRepository;
        this.departmentRepository = departmentRepository;
        this.authService = authService;
        this.auditService = auditService;
    }

    public List<CourseDto> getCourses() {
        UserPrincipal principal = authService.getCurrentPrincipal();
        return courseRepository.findByOrganizationId(principal.getOrganizationId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public CourseDto createCourse(CreateCourseRequest request, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        Department department = departmentRepository.findByIdAndOrganizationId(request.getDepartmentId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found in organization"));

        if (courseRepository.existsByOrganizationIdAndCode(orgId, request.getCode().trim().toUpperCase())) {
            throw new ConflictException("Course code already exists in this organization");
        }

        Course course = new Course(orgId, department.getId(), request.getName().trim(), request.getCode().trim().toUpperCase());
        Course saved = courseRepository.save(course);

        auditService.log(orgId, principal.getId(), "CREATE", "Course", saved.getId().toString(), "Created course " + saved.getName(), ipAddress);

        return toDto(saved);
    }

    @Transactional
    public void deleteCourse(UUID courseId, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Course course = courseRepository.findByIdAndOrganizationId(courseId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found in organization"));

        courseRepository.delete(course);
        auditService.log(principal.getOrganizationId(), principal.getId(), "DELETE", "Course", courseId.toString(), "Deleted course " + course.getName(), ipAddress);
    }

    public CourseDto toDto(Course course) {
        CourseDto dto = new CourseDto();
        dto.setId(course.getId());
        dto.setOrganizationId(course.getOrganizationId());
        dto.setDepartmentId(course.getDepartmentId());
        departmentRepository.findById(course.getDepartmentId())
                .ifPresent(d -> dto.setDepartmentName(d.getName()));
        dto.setName(course.getName());
        dto.setCode(course.getCode());
        dto.setCreatedAt(course.getCreatedAt());
        return dto;
    }
}
