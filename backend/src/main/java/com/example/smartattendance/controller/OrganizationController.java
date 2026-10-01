package com.example.smartattendance.controller;

import com.example.smartattendance.dto.*;
import com.example.smartattendance.service.FacultyService;
import com.example.smartattendance.service.OrganizationService;
import com.example.smartattendance.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final FacultyService facultyService;
    private final StudentService studentService;

    public OrganizationController(OrganizationService organizationService,
                                  FacultyService facultyService,
                                  StudentService studentService) {
        this.organizationService = organizationService;
        this.facultyService = facultyService;
        this.studentService = studentService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrganizationDto>> getOrganization(@PathVariable UUID id) {
        OrganizationDto dto = organizationService.getOrganization(id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<OrganizationDto>> updateOrganization(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrganizationRequest request,
            HttpServletRequest httpRequest) {
        OrganizationDto updated = organizationService.updateOrganization(id, request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Organization updated successfully", updated));
    }

    @GetMapping("/{id}/faculty")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<FacultyDto>>> getFaculty(@PathVariable UUID id) {
        List<FacultyDto> list = facultyService.getFacultyByOrganization(id);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{id}/faculty")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<FacultyDto>> createFaculty(
            @PathVariable UUID id,
            @Valid @RequestBody CreateFacultyRequest request,
            HttpServletRequest httpRequest) {
        FacultyDto created = facultyService.createFaculty(id, request, httpRequest.getRemoteAddr());
        return new ResponseEntity<>(ApiResponse.ok("Faculty created successfully", created), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<StudentDto>>> getStudents(@PathVariable UUID id) {
        List<StudentDto> list = studentService.getStudentsByOrganization(id);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{id}/students")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<StudentDto>> createStudent(
            @PathVariable UUID id,
            @Valid @RequestBody CreateStudentRequest request,
            HttpServletRequest httpRequest) {
        StudentDto created = studentService.createStudent(id, request, httpRequest.getRemoteAddr());
        return new ResponseEntity<>(ApiResponse.ok("Student created successfully", created), HttpStatus.CREATED);
    }
}
