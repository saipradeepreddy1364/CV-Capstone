package com.example.smartattendance.controller;

import com.example.smartattendance.dto.ApiResponse;
import com.example.smartattendance.dto.CreateDepartmentRequest;
import com.example.smartattendance.dto.DepartmentDto;
import com.example.smartattendance.service.DepartmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.ok(departmentService.getDepartments()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDto>> createDepartment(
            @Valid @RequestBody CreateDepartmentRequest request,
            HttpServletRequest httpRequest) {
        DepartmentDto created = departmentService.createDepartment(request, httpRequest.getRemoteAddr());
        return new ResponseEntity<>(ApiResponse.ok("Department created successfully", created), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable UUID id, HttpServletRequest httpRequest) {
        departmentService.deleteDepartment(id, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Department deleted successfully", null));
    }
}
