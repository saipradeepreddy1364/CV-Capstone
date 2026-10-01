package com.example.smartattendance.dto;

import com.example.smartattendance.entity.SessionStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class LiveAttendanceResponseDto {
    private UUID sessionId;
    private String subjectName;
    private String subjectCode;
    private String facultyName;
    private LocalDate sessionDate;
    private Instant startTime;
    private Instant thresholdTime;
    private Instant endTime;
    private SessionStatus status;

    private int totalStudents;
    private int presentCount;
    private int absentCount;
    private int lateCount;
    private double attendancePercentage;

    private List<LiveStudentAttendanceDto> students;

    public LiveAttendanceResponseDto() {}

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getThresholdTime() { return thresholdTime; }
    public void setThresholdTime(Instant thresholdTime) { this.thresholdTime = thresholdTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

    public int getPresentCount() { return presentCount; }
    public void setPresentCount(int presentCount) { this.presentCount = presentCount; }

    public int getAbsentCount() { return absentCount; }
    public void setAbsentCount(int absentCount) { this.absentCount = absentCount; }

    public int getLateCount() { return lateCount; }
    public void setLateCount(int lateCount) { this.lateCount = lateCount; }

    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public List<LiveStudentAttendanceDto> getStudents() { return students; }
    public void setStudents(List<LiveStudentAttendanceDto> students) { this.students = students; }
}
