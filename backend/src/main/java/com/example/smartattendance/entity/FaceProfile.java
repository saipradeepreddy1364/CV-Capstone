package com.example.smartattendance.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "face_profiles", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id"})
})
public class FaceProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "student_id", nullable = false, unique = true)
    private UUID studentId;

    @Lob
    @Column(name = "embedding_data", nullable = false, columnDefinition = "TEXT")
    private String embeddingData;

    @Column(name = "embedding_dimension", nullable = false)
    private Integer embeddingDimension = 128;

    @Column(name = "algorithm", length = 50)
    private String algorithm = "DLIB_HOG_LBP_V2";

    @Column(name = "quality_score")
    private Double qualityScore = 1.0;

    @Column(name = "registered_by")
    private UUID registeredBy;

    @Column(name = "registered_at", nullable = false, updatable = false)
    private Instant registeredAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public FaceProfile() {}

    public FaceProfile(UUID organizationId, UUID studentId, String embeddingData, Integer embeddingDimension, String algorithm, Double qualityScore, UUID registeredBy) {
        this.organizationId = organizationId;
        this.studentId = studentId;
        this.embeddingData = embeddingData;
        this.embeddingDimension = (embeddingDimension != null) ? embeddingDimension : 128;
        this.algorithm = (algorithm != null) ? algorithm : "DLIB_HOG_LBP_V2";
        this.qualityScore = (qualityScore != null) ? qualityScore : 1.0;
        this.registeredBy = registeredBy;
        this.registeredAt = Instant.now();
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

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public String getEmbeddingData() { return embeddingData; }
    public void setEmbeddingData(String embeddingData) { this.embeddingData = embeddingData; }

    public Integer getEmbeddingDimension() { return embeddingDimension; }
    public void setEmbeddingDimension(Integer embeddingDimension) { this.embeddingDimension = embeddingDimension; }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public Double getQualityScore() { return qualityScore; }
    public void setQualityScore(Double qualityScore) { this.qualityScore = qualityScore; }

    public UUID getRegisteredBy() { return registeredBy; }
    public void setRegisteredBy(UUID registeredBy) { this.registeredBy = registeredBy; }

    public Instant getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(Instant registeredAt) { this.registeredAt = registeredAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
