package com.example.smartattendance.dto;

public class UpdateAttendanceSettingsRequest {
    private Integer thresholdMinutes;
    private Boolean lateEnabled;
    private String lateStatus;
    private Double minimumRecognitionConfidence;
    private Integer sessionDurationMinutes;

    public UpdateAttendanceSettingsRequest() {}

    public Integer getThresholdMinutes() { return thresholdMinutes; }
    public void setThresholdMinutes(Integer thresholdMinutes) { this.thresholdMinutes = thresholdMinutes; }

    public Boolean getLateEnabled() { return lateEnabled; }
    public void setLateEnabled(Boolean lateEnabled) { this.lateEnabled = lateEnabled; }

    public String getLateStatus() { return lateStatus; }
    public void setLateStatus(String lateStatus) { this.lateStatus = lateStatus; }

    public Double getMinimumRecognitionConfidence() { return minimumRecognitionConfidence; }
    public void setMinimumRecognitionConfidence(Double minimumRecognitionConfidence) { this.minimumRecognitionConfidence = minimumRecognitionConfidence; }

    public Integer getSessionDurationMinutes() { return sessionDurationMinutes; }
    public void setSessionDurationMinutes(Integer sessionDurationMinutes) { this.sessionDurationMinutes = sessionDurationMinutes; }
}
