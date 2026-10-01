package com.example.smartattendance.controller;

import com.example.smartattendance.dto.ApiResponse;
import com.example.smartattendance.dto.CreateSubjectRequest;
import com.example.smartattendance.dto.SubjectDto;
import com.example.smartattendance.service.SubjectService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getSubjects() {
        return ResponseEntity.ok(ApiResponse.ok(subjectService.getSubjects()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<SubjectDto>> createSubject(
            @Valid @RequestBody CreateSubjectRequest request,
            HttpServletRequest httpRequest) {
        SubjectDto created = subjectService.createSubject(request, httpRequest.getRemoteAddr());
        return new ResponseEntity<>(ApiResponse.ok("Subject created successfully", created), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable UUID id, HttpServletRequest httpRequest) {
        subjectService.deleteSubject(id, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Subject deleted successfully", null));
    }
}
