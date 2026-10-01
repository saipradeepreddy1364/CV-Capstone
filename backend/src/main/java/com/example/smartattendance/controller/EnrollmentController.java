package com.example.smartattendance.controller;

import com.example.smartattendance.dto.ApiResponse;
import com.example.smartattendance.dto.CreateEnrollmentRequest;
import com.example.smartattendance.dto.EnrollmentDto;
import com.example.smartattendance.service.EnrollmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<EnrollmentDto>>> getEnrollments() {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.getEnrollments()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<EnrollmentDto>> createEnrollment(
            @Valid @RequestBody CreateEnrollmentRequest request,
            HttpServletRequest httpRequest) {
        EnrollmentDto created = enrollmentService.createEnrollment(request, httpRequest.getRemoteAddr());
        return new ResponseEntity<>(ApiResponse.ok("Enrollment created successfully", created), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEnrollment(@PathVariable UUID id, HttpServletRequest httpRequest) {
        enrollmentService.deleteEnrollment(id, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Enrollment deleted successfully", null));
    }
}
