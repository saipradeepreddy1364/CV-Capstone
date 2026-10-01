package com.example.smartattendance.controller;

import com.example.smartattendance.dto.ApiResponse;
import com.example.smartattendance.dto.StudentDto;
import com.example.smartattendance.dto.UpdateStudentRequest;
import com.example.smartattendance.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<StudentDto>> getStudentById(@PathVariable UUID id) {
        StudentDto dto = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<StudentDto>> updateStudent(
            @PathVariable UUID id,
            @RequestBody UpdateStudentRequest request,
            HttpServletRequest httpRequest) {
        StudentDto updated = studentService.updateStudent(id, request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Student updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable UUID id, HttpServletRequest httpRequest) {
        studentService.deleteStudent(id, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Student deleted successfully", null));
    }
}
