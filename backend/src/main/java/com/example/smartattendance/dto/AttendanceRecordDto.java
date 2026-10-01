package com.example.smartattendance.dto;

import com.example.smartattendance.entity.AttendanceStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class AttendanceRecordDto {
    private UUID id;
    private UUID organizationId;
    private UUID studentId;
    private String studentName;
    private String studentNumber;
    private UUID facultyId;
    private String facultyName;
    private UUID subjectId;
    private String subjectName;
    private String subjectCode;
    private UUID attendanceSessionId;
    private LocalDate attendanceDate;
    private Instant checkInTime;
    private AttendanceStatus status;
    private Double recognitionConfidence;
    private Instant createdAt;

    public AttendanceRecordDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }

    public UUID getFacultyId() { return facultyId; }
    public void setFacultyId(UUID facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public UUID getSubjectId() { return subjectId; }
    public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public UUID getAttendanceSessionId() { return attendanceSessionId; }
    public void setAttendanceSessionId(UUID attendanceSessionId) { this.attendanceSessionId = attendanceSessionId; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public Instant getCheckInTime() { return checkInTime; }
    public void setCheckInTime(Instant checkInTime) { this.checkInTime = checkInTime; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public Double getRecognitionConfidence() { return recognitionConfidence; }
    public void setRecognitionConfidence(Double recognitionConfidence) { this.recognitionConfidence = recognitionConfidence; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
