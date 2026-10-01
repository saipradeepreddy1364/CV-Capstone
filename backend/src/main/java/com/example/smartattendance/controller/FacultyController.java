package com.example.smartattendance.controller;

import com.example.smartattendance.dto.ApiResponse;
import com.example.smartattendance.dto.FacultyDto;
import com.example.smartattendance.dto.StudentDto;
import com.example.smartattendance.dto.UpdateFacultyRequest;
import com.example.smartattendance.service.EnrollmentService;
import com.example.smartattendance.service.FacultyService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final FacultyService facultyService;
    private final EnrollmentService enrollmentService;

    public FacultyController(FacultyService facultyService, EnrollmentService enrollmentService) {
        this.facultyService = facultyService;
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<FacultyDto>> getFacultyById(@PathVariable UUID id) {
        FacultyDto dto = facultyService.getFacultyById(id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<FacultyDto>> updateFaculty(
            @PathVariable UUID id,
            @RequestBody UpdateFacultyRequest request,
            HttpServletRequest httpRequest) {
        FacultyDto updated = facultyService.updateFaculty(id, request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Faculty updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFaculty(@PathVariable UUID id, HttpServletRequest httpRequest) {
        facultyService.deleteFaculty(id, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Faculty deleted successfully", null));
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<StudentDto>>> getAssignedStudents(@PathVariable UUID id) {
        List<StudentDto> students = enrollmentService.getStudentsByFaculty(id);
        return ResponseEntity.ok(ApiResponse.ok(students));
    }
}
