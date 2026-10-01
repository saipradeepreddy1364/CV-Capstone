package com.example.smartattendance.service;

import com.example.smartattendance.dto.FacultyAnalyticsDto;
import com.example.smartattendance.dto.OrganizationAnalyticsDto;
import com.example.smartattendance.dto.StudentAnalyticsDto;
import com.example.smartattendance.entity.*;
import com.example.smartattendance.exception.ForbiddenException;
import com.example.smartattendance.exception.ResourceNotFoundException;
import com.example.smartattendance.repository.*;
import com.example.smartattendance.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final OrganizationRepository organizationRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AuthService authService;

    public AnalyticsService(OrganizationRepository organizationRepository,
                            FacultyRepository facultyRepository,
                            StudentRepository studentRepository,
                            DepartmentRepository departmentRepository,
                            CourseRepository courseRepository,
                            SubjectRepository subjectRepository,
                            AttendanceSessionRepository sessionRepository,
                            AttendanceRecordRepository recordRepository,
                            EnrollmentRepository enrollmentRepository,
                            AuthService authService) {
        this.organizationRepository = organizationRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
        this.subjectRepository = subjectRepository;
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.authService = authService;
    }

    public OrganizationAnalyticsDto getOrganizationAnalytics() {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        OrganizationAnalyticsDto dto = new OrganizationAnalyticsDto();
        dto.setTotalFaculty(facultyRepository.countByOrganizationId(orgId));
        dto.setTotalStudents(studentRepository.countByOrganizationId(orgId));
        dto.setTotalDepartments(departmentRepository.countByOrganizationId(orgId));
        dto.setTotalCourses(courseRepository.countByOrganizationId(orgId));
        dto.setTotalSubjects(subjectRepository.countByOrganizationId(orgId));

        LocalDate today = LocalDate.now();
        dto.setTodaySessions(sessionRepository.countByOrganizationIdAndSessionDate(orgId, today));
        dto.setPresentToday(recordRepository.countByOrganizationIdAndAttendanceDateAndStatus(orgId, today, AttendanceStatus.PRESENT));
        dto.setAbsentToday(recordRepository.countByOrganizationIdAndAttendanceDateAndStatus(orgId, today, AttendanceStatus.ABSENT));
        dto.setLateToday(recordRepository.countByOrganizationIdAndAttendanceDateAndStatus(orgId, today, AttendanceStatus.LATE));

        // Average Attendance %
        List<AttendanceRecord> allRecords = recordRepository.findByOrganizationId(orgId);
        long presentOrLate = allRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.LATE).count();
        double avg = (allRecords.size() > 0) ? (((double) presentOrLate / allRecords.size()) * 100.0) : 0.0;
        dto.setAverageAttendancePercentage(Math.round(avg * 10.0) / 10.0);

        // Weekly Trends (last 7 days)
        List<Map<String, Object>> weekly = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long pres = recordRepository.countByOrganizationIdAndAttendanceDateAndStatus(orgId, d, AttendanceStatus.PRESENT);
            long ab = recordRepository.countByOrganizationIdAndAttendanceDateAndStatus(orgId, d, AttendanceStatus.ABSENT);
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("date", d.toString());
            dayMap.put("day", d.getDayOfWeek().name().substring(0, 3));
            dayMap.put("present", pres);
            dayMap.put("absent", ab);
            weekly.add(dayMap);
        }
        dto.setWeeklyTrends(weekly);

        // Department breakdown
        List<Department> departments = departmentRepository.findByOrganizationId(orgId);
        List<Map<String, Object>> deptStats = new ArrayList<>();
        for (Department dept : departments) {
            Map<String, Object> dm = new HashMap<>();
            dm.put("name", dept.getName());
            dm.put("students", studentRepository.findByOrganizationIdAndDepartmentId(orgId, dept.getId()).size());
            deptStats.add(dm);
        }
        dto.setDepartmentStats(deptStats);

        return dto;
    }

    public FacultyAnalyticsDto getFacultyAnalytics(UUID facultyId) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        Faculty faculty = facultyRepository.findByIdAndOrganizationId(facultyId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found in organization"));

        LocalDate today = LocalDate.now();
        List<AttendanceSession> facultySessionsToday = sessionRepository.findByOrganizationIdAndFacultyId(orgId, faculty.getId())
                .stream().filter(s -> s.getSessionDate().equals(today)).collect(Collectors.toList());

        List<Enrollment> enrollments = enrollmentRepository.findByOrganizationIdAndFacultyId(orgId, faculty.getId());
        long assignedStudents = enrollments.stream().map(Enrollment::getStudentId).distinct().count();

        List<AttendanceRecord> facultyRecords = recordRepository.findByOrganizationIdAndFacultyId(orgId, faculty.getId());
        long present = facultyRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long late = facultyRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
        long absent = facultyRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();

        double avg = (facultyRecords.size() > 0) ? (((double) (present + late) / facultyRecords.size()) * 100.0) : 0.0;

        FacultyAnalyticsDto dto = new FacultyAnalyticsDto();
        dto.setAssignedStudents(assignedStudents);
        dto.setTodayClasses(facultySessionsToday.size());
        dto.setPresentCount(present);
        dto.setAbsentCount(absent);
        dto.setLateCount(late);
        dto.setAverageAttendance(Math.round(avg * 10.0) / 10.0);

        // Subject breakdowns
        List<UUID> subjectIds = enrollments.stream().map(Enrollment::getSubjectId).distinct().collect(Collectors.toList());
        List<Map<String, Object>> subjectBreakdowns = new ArrayList<>();
        for (UUID sId : subjectIds) {
            subjectRepository.findById(sId).ifPresent(sub -> {
                Map<String, Object> sm = new HashMap<>();
                sm.put("subjectName", sub.getName());
                sm.put("enrolledCount", enrollmentRepository.countBySubjectId(sId));
                subjectBreakdowns.add(sm);
            });
        }
        dto.setSubjectBreakdowns(subjectBreakdowns);

        return dto;
    }

    public StudentAnalyticsDto getStudentAnalytics(UUID studentId) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        UUID orgId = principal.getOrganizationId();

        Student student = studentRepository.findByIdAndOrganizationId(studentId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (principal.getRole() == RoleType.STUDENT) {
            Optional<Student> selfStudent = studentRepository.findByUserId(principal.getId());
            if (selfStudent.isEmpty() || !selfStudent.get().getId().equals(student.getId())) {
                throw new ForbiddenException("Students may only access their own analytics");
            }
        }

        List<AttendanceRecord> records = recordRepository.findByOrganizationIdAndStudentId(orgId, student.getId());
        long total = records.size();
        long present = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long late = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
        long absent = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();

        double totalHours = total * 1.0;
        double attendedHours = (present * 1.0) + (late * 0.8);
        double pct = (totalHours > 0) ? ((attendedHours / totalHours) * 100.0) : 0.0;

        StudentAnalyticsDto dto = new StudentAnalyticsDto();
        dto.setOverallAttendancePercentage(Math.round(pct * 10.0) / 10.0);
        dto.setTotalClasses(total);
        dto.setAttendedClasses(present + late);
        dto.setAbsentClasses(absent);
        dto.setLateClasses(late);
        dto.setTotalHours(totalHours);
        dto.setAttendedHours(Math.round(attendedHours * 10.0) / 10.0);

        // Subject breakdown
        Map<UUID, List<AttendanceRecord>> bySubject = records.stream().collect(Collectors.groupingBy(AttendanceRecord::getSubjectId));
        List<Map<String, Object>> subList = new ArrayList<>();
        bySubject.forEach((subId, recs) -> {
            subjectRepository.findById(subId).ifPresent(sub -> {
                long p = recs.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.LATE).count();
                double sp = (((double) p / recs.size()) * 100.0);
                Map<String, Object> sm = new HashMap<>();
                sm.put("subjectName", sub.getName());
                sm.put("total", recs.size());
                sm.put("attended", p);
                sm.put("percentage", Math.round(sp * 10.0) / 10.0);
                subList.add(sm);
            });
        });
        dto.setSubjectAttendance(subList);

        // Monthly trends
        Map<String, List<AttendanceRecord>> byMonth = records.stream().collect(Collectors.groupingBy(r -> r.getAttendanceDate().getMonth().name().substring(0, 3)));
        List<Map<String, Object>> monthList = new ArrayList<>();
        byMonth.forEach((month, recs) -> {
            long p = recs.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.LATE).count();
            double mp = (((double) p / recs.size()) * 100.0);
            Map<String, Object> mm = new HashMap<>();
            mm.put("month", month);
            mm.put("percentage", Math.round(mp * 10.0) / 10.0);
            monthList.add(mm);
        });
        dto.setMonthlyTrends(monthList);

        return dto;
    }
}
