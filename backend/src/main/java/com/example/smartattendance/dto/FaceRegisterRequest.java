package com.example.smartattendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class FaceRegisterRequest {
    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotBlank(message = "Face image data is required")
    private String imageBase64;

    public FaceRegisterRequest() {}

    public FaceRegisterRequest(UUID studentId, String imageBase64) {
        this.studentId = studentId;
        this.imageBase64 = imageBase64;
    }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
}
