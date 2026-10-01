package com.example.smartattendance.dto;

import com.example.smartattendance.entity.SessionStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class AttendanceSessionDto {
    private UUID id;
    private UUID organizationId;
    private UUID facultyId;
    private String facultyName;
    private UUID subjectId;
    private String subjectName;
    private String subjectCode;
    private LocalDate sessionDate;
    private Instant startTime;
    private Instant endTime;
    private Instant thresholdTime;
    private SessionStatus status;
    private long totalEnrolledStudents;
    private long presentCount;
    private long lateCount;
    private long absentCount;
    private double attendancePercentage;
    private Instant createdAt;

    public AttendanceSessionDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

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

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public Instant getThresholdTime() { return thresholdTime; }
    public void setThresholdTime(Instant thresholdTime) { this.thresholdTime = thresholdTime; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public long getTotalEnrolledStudents() { return totalEnrolledStudents; }
    public void setTotalEnrolledStudents(long totalEnrolledStudents) { this.totalEnrolledStudents = totalEnrolledStudents; }

    public long getPresentCount() { return presentCount; }
    public void setPresentCount(long presentCount) { this.presentCount = presentCount; }

    public long getLateCount() { return lateCount; }
    public void setLateCount(long lateCount) { this.lateCount = lateCount; }

    public long getAbsentCount() { return absentCount; }
    public void setAbsentCount(long absentCount) { this.absentCount = absentCount; }

    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
