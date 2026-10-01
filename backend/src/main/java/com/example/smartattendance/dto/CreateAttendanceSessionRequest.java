package com.example.smartattendance.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public class CreateAttendanceSessionRequest {
    @NotNull(message = "Subject ID is required")
    private UUID subjectId;

    private UUID facultyId;
    private LocalDate sessionDate;
    private Integer durationMinutes = 60;
    private Integer thresholdMinutes = 10;

    public CreateAttendanceSessionRequest() {}

    public UUID getSubjectId() { return subjectId; }
    public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }

    public UUID getFacultyId() { return facultyId; }
    public void setFacultyId(UUID facultyId) { this.facultyId = facultyId; }

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getThresholdMinutes() { return thresholdMinutes; }
    public void setThresholdMinutes(Integer thresholdMinutes) { this.thresholdMinutes = thresholdMinutes; }
}
