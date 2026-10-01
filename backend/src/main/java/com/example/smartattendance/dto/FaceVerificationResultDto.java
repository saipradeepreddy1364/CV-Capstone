package com.example.smartattendance.dto;

import com.example.smartattendance.entity.AttendanceStatus;
import java.time.Instant;
import java.util.UUID;

public class FaceVerificationResultDto {
    private boolean verified;
    private Double confidence;
    private UUID studentId;
    private String studentName;
    private String studentNumber;
    private AttendanceStatus status;
    private Instant checkInTime;
    private String message;

    public FaceVerificationResultDto() {}

    public FaceVerificationResultDto(boolean verified, Double confidence, UUID studentId, String studentName, String studentNumber, AttendanceStatus status, Instant checkInTime, String message) {
        this.verified = verified;
        this.confidence = confidence;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentNumber = studentNumber;
        this.status = status;
        this.checkInTime = checkInTime;
        this.message = message;
    }

    public static FaceVerificationResultDto failure(String message) {
        FaceVerificationResultDto res = new FaceVerificationResultDto();
        res.setVerified(false);
        res.setMessage(message);
        return res;
    }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public Instant getCheckInTime() { return checkInTime; }
    public void setCheckInTime(Instant checkInTime) { this.checkInTime = checkInTime; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
