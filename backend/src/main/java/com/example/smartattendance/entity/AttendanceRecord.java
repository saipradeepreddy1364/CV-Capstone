package com.example.smartattendance.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "attendance_records", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"attendance_session_id", "student_id"})
})
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "faculty_id", nullable = false)
    private UUID facultyId;

    @Column(name = "subject_id", nullable = false)
    private UUID subjectId;

    @Column(name = "attendance_session_id", nullable = false)
    private UUID attendanceSessionId;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "check_in_time", nullable = false)
    private Instant checkInTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AttendanceStatus status;

    @Column(name = "recognition_confidence")
    private Double recognitionConfidence;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AttendanceRecord() {}

    public AttendanceRecord(UUID organizationId, UUID studentId, UUID facultyId, UUID subjectId, UUID attendanceSessionId, LocalDate attendanceDate, Instant checkInTime, AttendanceStatus status, Double recognitionConfidence) {
        this.organizationId = organizationId;
        this.studentId = studentId;
        this.facultyId = facultyId;
        this.subjectId = subjectId;
        this.attendanceSessionId = attendanceSessionId;
        this.attendanceDate = attendanceDate;
        this.checkInTime = checkInTime;
        this.status = status;
        this.recognitionConfidence = recognitionConfidence;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public UUID getFacultyId() { return facultyId; }
    public void setFacultyId(UUID facultyId) { this.facultyId = facultyId; }

    public UUID getSubjectId() { return subjectId; }
    public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }

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
