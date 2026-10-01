package com.example.smartattendance.face;

import com.example.smartattendance.dto.FaceRegisterRequest;
import com.example.smartattendance.dto.FaceVerificationResultDto;
import com.example.smartattendance.dto.FaceVerifyRequest;
import com.example.smartattendance.entity.*;
import com.example.smartattendance.exception.ApiException;
import com.example.smartattendance.exception.ConflictException;
import com.example.smartattendance.exception.ForbiddenException;
import com.example.smartattendance.exception.ResourceNotFoundException;
import com.example.smartattendance.repository.*;
import com.example.smartattendance.security.UserPrincipal;
import com.example.smartattendance.service.AuditService;
import com.example.smartattendance.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.image.BufferedImage;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FaceService {

    private static final Logger logger = LoggerFactory.getLogger(FaceService.class);

    private final FaceEngine faceEngine;
    private final FaceProfileRepository faceProfileRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceSettingsRepository settingsRepository;
    private final AuthService authService;
    private final AuditService auditService;

    @Value("${smartattendance.face.match-threshold:0.75}")
    private double defaultThreshold;

    public FaceService(FaceEngine faceEngine,
                       FaceProfileRepository faceProfileRepository,
                       StudentRepository studentRepository,
                       UserRepository userRepository,
                       AttendanceSessionRepository attendanceSessionRepository,
                       AttendanceRecordRepository attendanceRecordRepository,
                       EnrollmentRepository enrollmentRepository,
                       AttendanceSettingsRepository settingsRepository,
                       AuthService authService,
                       AuditService auditService) {
        this.faceEngine = faceEngine;
        this.faceProfileRepository = faceProfileRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.attendanceSessionRepository = attendanceSessionRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.settingsRepository = settingsRepository;
        this.authService = authService;
        this.auditService = auditService;
    }

    @Transactional
    public void registerFace(FaceRegisterRequest request, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        // 1. Verify student exists in current organization
        Student student = studentRepository.findByIdAndOrganizationId(request.getStudentId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found in your organization"));

        // 2. Authorization check: Admin, Faculty, or Student registering themselves
        if (principal.getRole() == RoleType.STUDENT) {
            Optional<Student> selfStudent = studentRepository.findByUserId(principal.getId());
            if (selfStudent.isEmpty() || !selfStudent.get().getId().equals(student.getId())) {
                throw new ForbiddenException("Students may only register their own face");
            }
        }

        // 3. Decode base64 image
        BufferedImage image = faceEngine.decodeBase64Image(request.getImageBase64());

        // 4. Real face detection, lighting check, blur check, single face guarantee
        FaceEngine.DetectionResult detection = faceEngine.detectSingleFace(image);

        // 5. Extract 128-dimensional biometric descriptor vector
        float[] embedding = faceEngine.extractFaceEmbedding(detection.faceImage);
        String serializedEmbedding = faceEngine.serializeEmbedding(embedding);

        // 6. Secure face profile persistence
        Optional<FaceProfile> existingOpt = faceProfileRepository.findByStudentId(student.getId());
        FaceProfile profile;
        if (existingOpt.isPresent()) {
            profile = existingOpt.get();
            profile.setEmbeddingData(serializedEmbedding);
            profile.setQualityScore(detection.qualityScore);
            profile.setRegisteredBy(principal.getId());
            profile.setUpdatedAt(Instant.now());
        } else {
            profile = new FaceProfile(
                    orgId,
                    student.getId(),
                    serializedEmbedding,
                    FaceEngine.EMBEDDING_DIMENSION,
                    "DLIB_HOG_LBP_V2",
                    detection.qualityScore,
                    principal.getId()
            );
        }
        faceProfileRepository.save(profile);

        // 7. Audit log (never log raw face biometric embeddings)
        auditService.log(orgId, principal.getId(), "FACE_REGISTRATION", "FaceProfile", student.getId().toString(),
                "Registered face for student " + student.getStudentNumber() + " with quality=" + String.format("%.2f", detection.qualityScore), ipAddress);
    }

    @Transactional
    public void deleteFaceProfile(UUID studentId, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        Student student = studentRepository.findByIdAndOrganizationId(studentId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found in your organization"));

        if (principal.getRole() == RoleType.STUDENT) {
            Optional<Student> selfStudent = studentRepository.findByUserId(principal.getId());
            if (selfStudent.isEmpty() || !selfStudent.get().getId().equals(student.getId())) {
                throw new ForbiddenException("Students may only delete their own face profile");
            }
        }

        faceProfileRepository.deleteByStudentIdAndOrganizationId(student.getId(), orgId);

        auditService.log(orgId, principal.getId(), "FACE_DELETION", "FaceProfile", student.getId().toString(),
                "Deleted face profile for student " + student.getStudentNumber(), ipAddress);
    }

    @Transactional
    public FaceVerificationResultDto verifyFaceAndMarkAttendance(FaceVerifyRequest request, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        // 1. Session verification & Organization isolation
        AttendanceSession session = attendanceSessionRepository.findByIdAndOrganizationId(request.getSessionId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found in your organization"));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new ApiException("Attendance session is not currently ACTIVE (current status: " + session.getStatus() + ")",
                    HttpStatus.BAD_REQUEST, "SESSION_NOT_ACTIVE");
        }

        // 2. Authoritative server timestamp
        Instant now = Instant.now();

        // 3. Decode probe face image
        BufferedImage probeImage = faceEngine.decodeBase64Image(request.getImageBase64());

        // 4. Detect single face and validate image quality
        FaceEngine.DetectionResult detection = faceEngine.detectSingleFace(probeImage);

        // 5. Extract 128-dimensional biometric descriptor from probe face
        float[] probeEmbedding = faceEngine.extractFaceEmbedding(detection.faceImage);

        // 6. Retrieve all enrolled students for this session's subject
        List<Enrollment> enrollments = enrollmentRepository.findByOrganizationIdAndSubjectId(orgId, session.getSubjectId());
        if (enrollments.isEmpty()) {
            throw new ApiException("No students are enrolled in this subject", HttpStatus.BAD_REQUEST, "NO_ENROLLED_STUDENTS");
        }

        Set<UUID> enrolledStudentIds = enrollments.stream().map(Enrollment::getStudentId).collect(Collectors.toSet());

        // 7. Get face profiles of enrolled students
        List<FaceProfile> enrolledProfiles = faceProfileRepository.findByOrganizationId(orgId).stream()
                .filter(fp -> enrolledStudentIds.contains(fp.getStudentId()))
                .collect(Collectors.toList());

        if (enrolledProfiles.isEmpty()) {
            throw new ApiException("None of the enrolled students have registered their face yet", HttpStatus.BAD_REQUEST, "NO_FACES_REGISTERED");
        }

        // 8. Retrieve attendance settings for confidence threshold
        AttendanceSettings settings = settingsRepository.findByOrganizationId(orgId)
                .orElseGet(() -> new AttendanceSettings(orgId));
        double requiredThreshold = (settings.getMinimumRecognitionConfidence() != null)
                ? settings.getMinimumRecognitionConfidence()
                : defaultThreshold;

        // 9. Real Biometric Matching & Cosine Similarity across all enrolled students
        double bestSimilarity = -1.0;
        FaceProfile bestMatchProfile = null;

        for (FaceProfile profile : enrolledProfiles) {
            float[] storedEmbedding = faceEngine.deserializeEmbedding(profile.getEmbeddingData());
            double sim = faceEngine.calculateCosineSimilarity(probeEmbedding, storedEmbedding);
            if (sim > bestSimilarity) {
                bestSimilarity = sim;
                bestMatchProfile = profile;
            }
        }

        // 10. Threshold Check: If below threshold, reject!
        if (bestMatchProfile == null || bestSimilarity < requiredThreshold) {
            logger.warn("Face verification failed. Best similarity: {} < Threshold: {}", bestSimilarity, requiredThreshold);
            throw new ApiException("Face not recognized. Please try again.", HttpStatus.UNPROCESSABLE_ENTITY, "FACE_NOT_RECOGNIZED");
        }

        Student matchedStudent = studentRepository.findById(bestMatchProfile.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Matched student record not found"));

        User studentUser = userRepository.findById(matchedStudent.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Matched student user not found"));

        // 11. Duplicate Attendance Check: (attendance_session_id, student_id)
        if (attendanceRecordRepository.existsByAttendanceSessionIdAndStudentId(session.getId(), matchedStudent.getId())) {
            throw new ConflictException("Attendance already marked for student: " + studentUser.getFullName() + " (" + matchedStudent.getStudentNumber() + ")");
        }

        // 12. Timestamp Check against thresholdTime
        AttendanceStatus attendanceStatus;
        if (!now.isAfter(session.getThresholdTime())) {
            attendanceStatus = AttendanceStatus.PRESENT;
        } else {
            attendanceStatus = Boolean.TRUE.equals(settings.getLateEnabled())
                    ? AttendanceStatus.LATE
                    : AttendanceStatus.PRESENT;
        }

        // 13. Create Attendance Record
        AttendanceRecord record = new AttendanceRecord(
                orgId,
                matchedStudent.getId(),
                session.getFacultyId(),
                session.getSubjectId(),
                session.getId(),
                session.getSessionDate(),
                now,
                attendanceStatus,
                bestSimilarity
        );
        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);

        // 14. Audit Log
        auditService.log(orgId, principal.getId(), "FACE_VERIFICATION", "AttendanceRecord", savedRecord.getId().toString(),
                "Verified student " + matchedStudent.getStudentNumber() + " with confidence " + String.format("%.2f", bestSimilarity) + " -> " + attendanceStatus, ipAddress);

        return new FaceVerificationResultDto(
                true,
                bestSimilarity,
                matchedStudent.getId(),
                studentUser.getFullName(),
                matchedStudent.getStudentNumber(),
                attendanceStatus,
                now,
                "Attendance successfully marked as " + attendanceStatus + " for " + studentUser.getFullName()
        );
    }
}
