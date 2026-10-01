package com.example.smartattendance.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "attendance_settings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id"})
})
public class AttendanceSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false, unique = true)
    private UUID organizationId;

    @Column(name = "threshold_minutes", nullable = false)
    private Integer thresholdMinutes = 10;

    @Column(name = "late_enabled", nullable = false)
    private Boolean lateEnabled = true;

    @Column(name = "late_status", nullable = false, length = 20)
    private String lateStatus = "LATE";

    @Column(name = "minimum_recognition_confidence", nullable = false)
    private Double minimumRecognitionConfidence = 0.75;

    @Column(name = "session_duration_minutes", nullable = false)
    private Integer sessionDurationMinutes = 60;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public AttendanceSettings() {}

    public AttendanceSettings(UUID organizationId) {
        this.organizationId = organizationId;
        this.thresholdMinutes = 10;
        this.lateEnabled = true;
        this.lateStatus = "LATE";
        this.minimumRecognitionConfidence = 0.75;
        this.sessionDurationMinutes = 60;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
