package com.example.smartattendance.controller;

import com.example.smartattendance.dto.ApiResponse;
import com.example.smartattendance.dto.FacultyAnalyticsDto;
import com.example.smartattendance.dto.OrganizationAnalyticsDto;
import com.example.smartattendance.dto.StudentAnalyticsDto;
import com.example.smartattendance.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/organization")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<OrganizationAnalyticsDto>> getOrganizationAnalytics() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getOrganizationAnalytics()));
    }

    @GetMapping("/faculty/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<FacultyAnalyticsDto>> getFacultyAnalytics(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getFacultyAnalytics(id)));
    }

    @GetMapping("/student/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<StudentAnalyticsDto>> getStudentAnalytics(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getStudentAnalytics(id)));
    }
}
