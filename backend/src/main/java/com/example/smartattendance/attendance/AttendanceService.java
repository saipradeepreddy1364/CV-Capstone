package com.example.smartattendance.attendance;

import com.example.smartattendance.dto.*;
import com.example.smartattendance.entity.*;
import com.example.smartattendance.exception.ApiException;
import com.example.smartattendance.exception.ForbiddenException;
import com.example.smartattendance.exception.ResourceNotFoundException;
import com.example.smartattendance.repository.*;
import com.example.smartattendance.security.UserPrincipal;
import com.example.smartattendance.service.AuditService;
import com.example.smartattendance.service.AuthService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.opencsv.CSVWriter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final AttendanceSettingsRepository settingsRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final AuthService authService;
    private final AuditService auditService;

    public AttendanceService(AttendanceSessionRepository sessionRepository,
                             AttendanceRecordRepository recordRepository,
                             AttendanceSettingsRepository settingsRepository,
                             EnrollmentRepository enrollmentRepository,
                             StudentRepository studentRepository,
                             UserRepository userRepository,
                             FacultyRepository facultyRepository,
                             SubjectRepository subjectRepository,
                             AuthService authService,
                             AuditService auditService) {
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.settingsRepository = settingsRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.facultyRepository = facultyRepository;
        this.subjectRepository = subjectRepository;
        this.authService = authService;
        this.auditService = auditService;
    }

    @Transactional
    public AttendanceSessionDto createSession(CreateAttendanceSessionRequest request, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        Subject subject = subjectRepository.findByIdAndOrganizationId(request.getSubjectId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found in organization"));

        UUID facultyId = request.getFacultyId();
        if (principal.getRole() == RoleType.FACULTY) {
            Faculty faculty = facultyRepository.findByUserIdAndOrganizationId(principal.getId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user"));
            facultyId = faculty.getId();
        } else if (facultyId == null) {
            throw new ApiException("Faculty ID is required", HttpStatus.BAD_REQUEST, "FACULTY_REQUIRED");
        }

        AttendanceSettings settings = settingsRepository.findByOrganizationId(orgId)
                .orElseGet(() -> new AttendanceSettings(orgId));

        int duration = (request.getDurationMinutes() != null && request.getDurationMinutes() > 0)
                ? request.getDurationMinutes()
                : settings.getSessionDurationMinutes();

        int threshold = (request.getThresholdMinutes() != null && request.getThresholdMinutes() > 0)
                ? request.getThresholdMinutes()
                : settings.getThresholdMinutes();

        LocalDate sessionDate = request.getSessionDate() != null ? request.getSessionDate() : LocalDate.now();
        Instant now = Instant.now();
        Instant startTime = now;
        Instant thresholdTime = now.plus(threshold, ChronoUnit.MINUTES);
        Instant endTime = now.plus(duration, ChronoUnit.MINUTES);

        AttendanceSession session = new AttendanceSession(
                orgId,
                facultyId,
                subject.getId(),
                sessionDate,
                startTime,
                endTime,
                thresholdTime,
                SessionStatus.SCHEDULED
        );
        AttendanceSession saved = sessionRepository.save(session);

        auditService.log(orgId, principal.getId(), "ATTENDANCE_SESSION_CREATE", "AttendanceSession", saved.getId().toString(),
                "Created attendance session for subject " + subject.getName(), ipAddress);

        return toDto(saved);
    }

    @Transactional
    public AttendanceSessionDto startSession(UUID sessionId, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        AttendanceSession session = sessionRepository.findByIdAndOrganizationId(sessionId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found"));

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new ApiException("Cannot start an already completed attendance session", HttpStatus.BAD_REQUEST, "SESSION_ALREADY_COMPLETED");
        }

        AttendanceSettings settings = settingsRepository.findByOrganizationId(principal.getOrganizationId())
                .orElseGet(() -> new AttendanceSettings(principal.getOrganizationId()));

        Instant now = Instant.now();
        int thresholdMinutes = settings.getThresholdMinutes();
        int durationMinutes = settings.getSessionDurationMinutes();

        session.setStartTime(now);
        session.setThresholdTime(now.plus(thresholdMinutes, ChronoUnit.MINUTES));
        session.setEndTime(now.plus(durationMinutes, ChronoUnit.MINUTES));
        session.setStatus(SessionStatus.ACTIVE);
        session.setUpdatedAt(now);

        AttendanceSession saved = sessionRepository.save(session);

        auditService.log(principal.getOrganizationId(), principal.getId(), "ATTENDANCE_SESSION_START", "AttendanceSession", saved.getId().toString(),
                "Started active attendance session", ipAddress);

        return toDto(saved);
    }

    @Transactional
    public AttendanceSessionDto stopSession(UUID sessionId, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        AttendanceSession session = sessionRepository.findByIdAndOrganizationId(sessionId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found"));

        Instant now = Instant.now();
        session.setStatus(SessionStatus.COMPLETED);
        session.setEndTime(now);
        session.setUpdatedAt(now);
        AttendanceSession saved = sessionRepository.save(session);

        // Mark remaining unrecorded enrolled students as ABSENT
        List<Enrollment> enrollments = enrollmentRepository.findByOrganizationIdAndSubjectId(session.getOrganizationId(), session.getSubjectId());
        for (Enrollment enrollment : enrollments) {
            if (!recordRepository.existsByAttendanceSessionIdAndStudentId(session.getId(), enrollment.getStudentId())) {
                AttendanceRecord absentRecord = new AttendanceRecord(
                        session.getOrganizationId(),
                        enrollment.getStudentId(),
                        session.getFacultyId(),
                        session.getSubjectId(),
                        session.getId(),
                        session.getSessionDate(),
                        now,
                        AttendanceStatus.ABSENT,
                        0.0
                );
                recordRepository.save(absentRecord);
            }
        }

        auditService.log(principal.getOrganizationId(), principal.getId(), "ATTENDANCE_SESSION_STOP", "AttendanceSession", saved.getId().toString(),
                "Stopped attendance session and marked absentees", ipAddress);

        return toDto(saved);
    }

    public LiveAttendanceResponseDto getLiveAttendance(UUID sessionId) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        AttendanceSession session = sessionRepository.findByIdAndOrganizationId(sessionId, principal.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found"));

        LiveAttendanceResponseDto dto = new LiveAttendanceResponseDto();
        dto.setSessionId(session.getId());
        dto.setSessionDate(session.getSessionDate());
        dto.setStartTime(session.getStartTime());
        dto.setThresholdTime(session.getThresholdTime());
        dto.setEndTime(session.getEndTime());
        dto.setStatus(session.getStatus());

        subjectRepository.findById(session.getSubjectId()).ifPresent(sub -> {
            dto.setSubjectName(sub.getName());
            dto.setSubjectCode(sub.getCode());
        });

        facultyRepository.findById(session.getFacultyId()).ifPresent(fac -> {
            userRepository.findById(fac.getUserId()).ifPresent(u -> dto.setFacultyName(u.getFullName()));
        });

        // Get all enrolled students for this subject
        List<Enrollment> enrollments = enrollmentRepository.findByOrganizationIdAndSubjectId(session.getOrganizationId(), session.getSubjectId());
        List<AttendanceRecord> records = recordRepository.findByAttendanceSessionId(session.getId());
        Map<UUID, AttendanceRecord> recordByStudent = records.stream()
                .collect(Collectors.toMap(AttendanceRecord::getStudentId, r -> r, (a, b) -> a));

        List<LiveStudentAttendanceDto> studentList = new ArrayList<>();
        int presentCount = 0;
        int lateCount = 0;
        int absentCount = 0;

        for (Enrollment enrollment : enrollments) {
            Optional<Student> studentOpt = studentRepository.findById(enrollment.getStudentId());
            if (studentOpt.isEmpty()) continue;
            Student student = studentOpt.get();
            String studentName = userRepository.findById(student.getUserId())
                    .map(User::getFullName).orElse("Student");

            AttendanceRecord rec = recordByStudent.get(student.getId());
            AttendanceStatus status = AttendanceStatus.ABSENT;
            Instant checkInTime = null;
            Double confidence = null;

            if (rec != null) {
                status = rec.getStatus();
                checkInTime = rec.getCheckInTime();
                confidence = rec.getRecognitionConfidence();
                if (status == AttendanceStatus.PRESENT) presentCount++;
                else if (status == AttendanceStatus.LATE) lateCount++;
                else absentCount++;
            } else {
                absentCount++;
            }

            studentList.add(new LiveStudentAttendanceDto(
                    student.getId(),
                    student.getStudentNumber(),
                    studentName,
                    status,
                    checkInTime,
                    confidence
            ));
        }

        // Sort student list alphabetically
        studentList.sort(Comparator.comparing(LiveStudentAttendanceDto::getStudentName));

        int totalStudents = enrollments.size();
        double percentage = (totalStudents > 0)
                ? (((double) (presentCount + lateCount) / totalStudents) * 100.0)
                : 0.0;

        dto.setTotalStudents(totalStudents);
        dto.setPresentCount(presentCount);
        dto.setLateCount(lateCount);
        dto.setAbsentCount(absentCount);
        dto.setAttendancePercentage(Math.round(percentage * 10.0) / 10.0);
        dto.setStudents(studentList);

        return dto;
    }

    public List<AttendanceSessionDto> getSessions() {
        UserPrincipal principal = authService.getCurrentPrincipal();
        if (principal.getRole() == RoleType.FACULTY) {
            Optional<Faculty> facOpt = facultyRepository.findByUserIdAndOrganizationId(principal.getId(), principal.getOrganizationId());
            if (facOpt.isPresent()) {
                return sessionRepository.findByOrganizationIdAndFacultyId(principal.getOrganizationId(), facOpt.get().getId())
                        .stream().map(this::toDto).collect(Collectors.toList());
            }
        }
        return sessionRepository.findByOrganizationId(principal.getOrganizationId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public StudentAttendanceStatsDto getStudentStats(UUID studentId) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        Student student = studentRepository.findByIdAndOrganizationId(studentId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (principal.getRole() == RoleType.STUDENT) {
            Optional<Student> selfStudent = studentRepository.findByUserId(principal.getId());
            if (selfStudent.isEmpty() || !selfStudent.get().getId().equals(student.getId())) {
                throw new ForbiddenException("Students may only view their own attendance stats");
            }
        }

        List<AttendanceRecord> records = recordRepository.findByOrganizationIdAndStudentId(orgId, student.getId());
        long totalRecords = records.size();
        long present = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long late = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
        long absent = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();

        // Standard 1 hour class default
        double totalHours = totalRecords * 1.0;
        double attendedHours = (present * 1.0) + (late * 0.8);
        double percentage = (totalHours > 0) ? ((attendedHours / totalHours) * 100.0) : 0.0;

        StudentAttendanceStatsDto dto = new StudentAttendanceStatsDto();
        dto.setStudentId(student.getId());
        dto.setStudentNumber(student.getStudentNumber());
        userRepository.findById(student.getUserId()).ifPresent(u -> dto.setStudentName(u.getFullName()));
        dto.setTotalClasses(totalRecords);
        dto.setAttendedClasses(present + late);
        dto.setAbsentClasses(absent);
        dto.setLateClasses(late);
        dto.setTotalHours(totalHours);
        dto.setAttendedHours(Math.round(attendedHours * 10.0) / 10.0);
        dto.setAttendancePercentage(Math.round(percentage * 10.0) / 10.0);

        List<AttendanceRecordDto> recent = records.stream()
                .sorted(Comparator.comparing(AttendanceRecord::getAttendanceDate).reversed())
                .limit(30)
                .map(this::toRecordDto)
                .collect(Collectors.toList());
        dto.setRecentRecords(recent);

        return dto;
    }

    public List<AttendanceRecordDto> getReports(UUID studentId, UUID facultyId, UUID subjectId, AttendanceStatus status, LocalDate startDate, LocalDate endDate) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        List<AttendanceRecord> records = recordRepository.searchRecords(orgId, studentId, facultyId, subjectId, status, startDate, endDate);
        return records.stream().map(this::toRecordDto).collect(Collectors.toList());
    }

    public byte[] exportReportsCsv(UUID studentId, UUID facultyId, UUID subjectId, AttendanceStatus status, LocalDate startDate, LocalDate endDate) {
        List<AttendanceRecordDto> records = getReports(studentId, facultyId, subjectId, status, startDate, endDate);
        StringWriter writer = new StringWriter();
        try (CSVWriter csvWriter = new CSVWriter(writer)) {
            csvWriter.writeNext(new String[]{"Record ID", "Student ID", "Student Name", "Faculty", "Subject", "Date", "Check-in Time", "Status", "Confidence"});
            for (AttendanceRecordDto r : records) {
                csvWriter.writeNext(new String[]{
                        r.getId().toString(),
                        r.getStudentNumber(),
                        r.getStudentName(),
                        r.getFacultyName(),
                        r.getSubjectName(),
                        r.getAttendanceDate().toString(),
                        r.getCheckInTime() != null ? r.getCheckInTime().toString() : "N/A",
                        r.getStatus().name(),
                        r.getRecognitionConfidence() != null ? String.format("%.2f", r.getRecognitionConfidence()) : "N/A"
                });
            }
        } catch (Exception e) {
            throw new ApiException("Failed to generate CSV report: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return writer.toString().getBytes();
    }

    public byte[] exportReportsPdf(UUID studentId, UUID facultyId, UUID subjectId, AttendanceStatus status, LocalDate startDate, LocalDate endDate) {
        List<AttendanceRecordDto> records = getReports(studentId, facultyId, subjectId, status, startDate, endDate);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
            Paragraph title = new Paragraph("Smart Attendance System - Official Attendance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2f, 3f, 3f, 3f, 2f, 2f, 2f});

            String[] headers = {"Student #", "Student Name", "Faculty", "Subject", "Date", "Check-in", "Status"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE)));
                cell.setBackgroundColor(new Color(30, 41, 59));
                cell.setPadding(6);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            for (AttendanceRecordDto r : records) {
                table.addCell(new Phrase(r.getStudentNumber() != null ? r.getStudentNumber() : "", FontFactory.getFont(FontFactory.HELVETICA, 10)));
                table.addCell(new Phrase(r.getStudentName() != null ? r.getStudentName() : "", FontFactory.getFont(FontFactory.HELVETICA, 10)));
                table.addCell(new Phrase(r.getFacultyName() != null ? r.getFacultyName() : "", FontFactory.getFont(FontFactory.HELVETICA, 10)));
                table.addCell(new Phrase(r.getSubjectName() != null ? r.getSubjectName() : "", FontFactory.getFont(FontFactory.HELVETICA, 10)));
                table.addCell(new Phrase(r.getAttendanceDate().toString(), FontFactory.getFont(FontFactory.HELVETICA, 10)));
                table.addCell(new Phrase(r.getCheckInTime() != null ? r.getCheckInTime().toString().substring(11, 16) : "-", FontFactory.getFont(FontFactory.HELVETICA, 10)));
                table.addCell(new Phrase(r.getStatus().name(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new ApiException("Failed to generate PDF report: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return out.toByteArray();
    }

    public AttendanceSettingsDto getSettings() {
        UserPrincipal principal = authService.getCurrentPrincipal();
        AttendanceSettings settings = settingsRepository.findByOrganizationId(principal.getOrganizationId())
                .orElseGet(() -> settingsRepository.save(new AttendanceSettings(principal.getOrganizationId())));

        AttendanceSettingsDto dto = new AttendanceSettingsDto();
        dto.setId(settings.getId());
        dto.setOrganizationId(settings.getOrganizationId());
        dto.setThresholdMinutes(settings.getThresholdMinutes());
        dto.setLateEnabled(settings.getLateEnabled());
        dto.setLateStatus(settings.getLateStatus());
        dto.setMinimumRecognitionConfidence(settings.getMinimumRecognitionConfidence());
        dto.setSessionDurationMinutes(settings.getSessionDurationMinutes());
        return dto;
    }

    @Transactional
    public AttendanceSettingsDto updateSettings(UpdateAttendanceSettingsRequest request, String ipAddress) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        AttendanceSettings settings = settingsRepository.findByOrganizationId(principal.getOrganizationId())
                .orElseGet(() -> new AttendanceSettings(principal.getOrganizationId()));

        if (request.getThresholdMinutes() != null) settings.setThresholdMinutes(request.getThresholdMinutes());
        if (request.getLateEnabled() != null) settings.setLateEnabled(request.getLateEnabled());
        if (request.getLateStatus() != null) settings.setLateStatus(request.getLateStatus());
        if (request.getMinimumRecognitionConfidence() != null) settings.setMinimumRecognitionConfidence(request.getMinimumRecognitionConfidence());
        if (request.getSessionDurationMinutes() != null) settings.setSessionDurationMinutes(request.getSessionDurationMinutes());

        AttendanceSettings saved = settingsRepository.save(settings);
        auditService.log(principal.getOrganizationId(), principal.getId(), "UPDATE_SETTINGS", "AttendanceSettings", saved.getId().toString(),
                "Updated attendance organization settings", ipAddress);

        return getSettings();
    }

    public AttendanceSessionDto toDto(AttendanceSession session) {
        AttendanceSessionDto dto = new AttendanceSessionDto();
        dto.setId(session.getId());
        dto.setOrganizationId(session.getOrganizationId());
        dto.setFacultyId(session.getFacultyId());
        facultyRepository.findById(session.getFacultyId()).ifPresent(f -> {
            userRepository.findById(f.getUserId()).ifPresent(u -> dto.setFacultyName(u.getFullName()));
        });
        dto.setSubjectId(session.getSubjectId());
        subjectRepository.findById(session.getSubjectId()).ifPresent(s -> {
            dto.setSubjectName(s.getName());
            dto.setSubjectCode(s.getCode());
        });
        dto.setSessionDate(session.getSessionDate());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setThresholdTime(session.getThresholdTime());
        dto.setStatus(session.getStatus());
        dto.setCreatedAt(session.getCreatedAt());

        long totalEnrolled = enrollmentRepository.countBySubjectId(session.getSubjectId());
        dto.setTotalEnrolledStudents(totalEnrolled);

        List<AttendanceRecord> records = recordRepository.findByAttendanceSessionId(session.getId());
        long present = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long late = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
        long absent = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();

        dto.setPresentCount(present);
        dto.setLateCount(late);
        dto.setAbsentCount(absent);
        double pct = (totalEnrolled > 0) ? (((double) (present + late) / totalEnrolled) * 100.0) : 0.0;
        dto.setAttendancePercentage(Math.round(pct * 10.0) / 10.0);

        return dto;
    }

    public AttendanceRecordDto toRecordDto(AttendanceRecord r) {
        AttendanceRecordDto dto = new AttendanceRecordDto();
        dto.setId(r.getId());
        dto.setOrganizationId(r.getOrganizationId());
        dto.setStudentId(r.getStudentId());
        studentRepository.findById(r.getStudentId()).ifPresent(s -> {
            dto.setStudentNumber(s.getStudentNumber());
            userRepository.findById(s.getUserId()).ifPresent(u -> dto.setStudentName(u.getFullName()));
        });
        dto.setFacultyId(r.getFacultyId());
        facultyRepository.findById(r.getFacultyId()).ifPresent(f -> {
            userRepository.findById(f.getUserId()).ifPresent(u -> dto.setFacultyName(u.getFullName()));
        });
        dto.setSubjectId(r.getSubjectId());
        subjectRepository.findById(r.getSubjectId()).ifPresent(s -> {
            dto.setSubjectName(s.getName());
            dto.setSubjectCode(s.getCode());
        });
        dto.setAttendanceSessionId(r.getAttendanceSessionId());
        dto.setAttendanceDate(r.getAttendanceDate());
        dto.setCheckInTime(r.getCheckInTime());
        dto.setStatus(r.getStatus());
        dto.setRecognitionConfidence(r.getRecognitionConfidence());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
