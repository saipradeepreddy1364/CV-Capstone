package com.example.smartattendance.controller;

import com.example.smartattendance.attendance.AttendanceService;
import com.example.smartattendance.dto.*;
import com.example.smartattendance.entity.AttendanceStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/sessions")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<AttendanceSessionDto>>> getSessions() {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getSessions()));
    }

    @PostMapping("/sessions")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<AttendanceSessionDto>> createSession(
            @Valid @RequestBody CreateAttendanceSessionRequest request,
            HttpServletRequest httpRequest) {
        AttendanceSessionDto created = attendanceService.createSession(request, httpRequest.getRemoteAddr());
        return new ResponseEntity<>(ApiResponse.ok("Attendance session created", created), HttpStatus.CREATED);
    }

    @PostMapping("/sessions/{id}/start")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<AttendanceSessionDto>> startSession(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {
        AttendanceSessionDto session = attendanceService.startSession(id, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Attendance session started", session));
    }

    @PostMapping("/sessions/{id}/stop")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<AttendanceSessionDto>> stopSession(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {
        AttendanceSessionDto session = attendanceService.stopSession(id, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Attendance session stopped", session));
    }

    @GetMapping("/sessions/{id}/live")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<LiveAttendanceResponseDto>> getLiveAttendance(@PathVariable UUID id) {
        LiveAttendanceResponseDto live = attendanceService.getLiveAttendance(id);
        return ResponseEntity.ok(ApiResponse.ok(live));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<StudentAttendanceStatsDto>> getStudentAttendance(@PathVariable UUID studentId) {
        StudentAttendanceStatsDto stats = attendanceService.getStudentStats(studentId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<List<AttendanceRecordDto>>> getReports(
            @RequestParam(required = false) UUID studentId,
            @RequestParam(required = false) UUID facultyId,
            @RequestParam(required = false) UUID subjectId,
            @RequestParam(required = false) AttendanceStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceRecordDto> records = attendanceService.getReports(studentId, facultyId, subjectId, status, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(records));
    }

    @GetMapping("/reports/export/csv")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<byte[]> exportReportsCsv(
            @RequestParam(required = false) UUID studentId,
            @RequestParam(required = false) UUID facultyId,
            @RequestParam(required = false) UUID subjectId,
            @RequestParam(required = false) AttendanceStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        byte[] csvData = attendanceService.exportReportsCsv(studentId, facultyId, subjectId, status, startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @GetMapping("/reports/export/pdf")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<byte[]> exportReportsPdf(
            @RequestParam(required = false) UUID studentId,
            @RequestParam(required = false) UUID facultyId,
            @RequestParam(required = false) UUID subjectId,
            @RequestParam(required = false) AttendanceStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        byte[] pdfData = attendanceService.exportReportsPdf(studentId, facultyId, subjectId, status, startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfData);
    }

    @GetMapping("/settings")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSettingsDto>> getSettings() {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getSettings()));
    }

    @PutMapping("/settings")
    @PreAuthorize("hasRole('ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSettingsDto>> updateSettings(
            @RequestBody UpdateAttendanceSettingsRequest request,
            HttpServletRequest httpRequest) {
        AttendanceSettingsDto updated = attendanceService.updateSettings(request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Settings updated successfully", updated));
    }
}
