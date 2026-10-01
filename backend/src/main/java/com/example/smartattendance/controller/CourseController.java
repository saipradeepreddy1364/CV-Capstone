package com.example.smartattendance.controller;

import com.example.smartattendance.dto.ApiResponse;
import com.example.smartattendance.dto.CourseDto;
import com.example.smartattendance.dto.CreateCourseRequest;
import com.example.smartattendance.service.CourseService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDto>>> getCourses() {
        return ResponseEntity.ok(ApiResponse.ok(courseService.getCourses()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> createCourse(
            @Valid @RequestBody CreateCourseRequest request,
            HttpServletRequest httpRequest) {
        CourseDto created = courseService.createCourse(request, httpRequest.getRemoteAddr());
        return new ResponseEntity<>(ApiResponse.ok("Course created successfully", created), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable UUID id, HttpServletRequest httpRequest) {
        courseService.deleteCourse(id, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Course deleted successfully", null));
    }
}
