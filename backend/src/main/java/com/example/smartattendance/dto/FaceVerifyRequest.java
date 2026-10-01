package com.example.smartattendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class FaceVerifyRequest {
    @NotNull(message = "Attendance session ID is required")
    private UUID sessionId;

    @NotBlank(message = "Face image data is required")
    private String imageBase64;

    public FaceVerifyRequest() {}

    public FaceVerifyRequest(UUID sessionId, String imageBase64) {
        this.sessionId = sessionId;
        this.imageBase64 = imageBase64;
    }

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
}
