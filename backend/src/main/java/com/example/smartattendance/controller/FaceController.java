package com.example.smartattendance.controller;

import com.example.smartattendance.dto.ApiResponse;
import com.example.smartattendance.dto.FaceRegisterRequest;
import com.example.smartattendance.dto.FaceVerificationResultDto;
import com.example.smartattendance.dto.FaceVerifyRequest;
import com.example.smartattendance.face.FaceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/face")
public class FaceController {

    private final FaceService faceService;

    public FaceController(FaceService faceService) {
        this.faceService = faceService;
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<String>> registerFace(
            @Valid @RequestBody FaceRegisterRequest request,
            HttpServletRequest httpRequest) {
        faceService.registerFace(request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Face registered securely and associated with student profile", "SUCCESS"));
    }

    @DeleteMapping("/{studentId}")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<Void>> deleteFaceProfile(
            @PathVariable UUID studentId,
            HttpServletRequest httpRequest) {
        faceService.deleteFaceProfile(studentId, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Biometric face profile deleted successfully", null));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<FaceVerificationResultDto>> verifyFace(
            @Valid @RequestBody FaceVerifyRequest request,
            HttpServletRequest httpRequest) {
        FaceVerificationResultDto result = faceService.verifyFaceAndMarkAttendance(request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok(result.getMessage(), result));
    }
}
