package com.example.smartattendance.dto;

import com.example.smartattendance.entity.AttendanceStatus;
import java.time.Instant;
import java.util.UUID;

public class LiveStudentAttendanceDto {
    private UUID studentId;
    private String studentNumber;
    private String studentName;
    private AttendanceStatus status; // PRESENT, LATE, ABSENT
    private Instant recognitionTime;
    private Double confidence;

    public LiveStudentAttendanceDto() {}

    public LiveStudentAttendanceDto(UUID studentId, String studentNumber, String studentName, AttendanceStatus status, Instant recognitionTime, Double confidence) {
        this.studentId = studentId;
        this.studentNumber = studentNumber;
        this.studentName = studentName;
        this.status = status;
        this.recognitionTime = recognitionTime;
        this.confidence = confidence;
    }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public Instant getRecognitionTime() { return recognitionTime; }
    public void setRecognitionTime(Instant recognitionTime) { this.recognitionTime = recognitionTime; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
}
