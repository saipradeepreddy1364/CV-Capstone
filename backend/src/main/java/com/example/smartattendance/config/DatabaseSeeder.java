package com.example.smartattendance.config;

import com.example.smartattendance.entity.*;
import com.example.smartattendance.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationMemberRepository memberRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceSettingsRepository settingsRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(OrganizationRepository organizationRepository,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          OrganizationMemberRepository memberRepository,
                          DepartmentRepository departmentRepository,
                          CourseRepository courseRepository,
                          SubjectRepository subjectRepository,
                          FacultyRepository facultyRepository,
                          StudentRepository studentRepository,
                          EnrollmentRepository enrollmentRepository,
                          AttendanceSettingsRepository settingsRepository,
                          AttendanceSessionRepository sessionRepository,
                          AttendanceRecordRepository recordRepository,
                          PasswordEncoder passwordEncoder) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.memberRepository = memberRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
        this.subjectRepository = subjectRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.settingsRepository = settingsRepository;
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (organizationRepository.findByCode("ABC_UNIV").isPresent()) {
            logger.info("ABC University sample data already seeded.");
            return;
        }

        logger.info("Seeding ABC University development structure...");

        // 1. Organization
        Organization org = new Organization(
                "ABC University",
                "ABC_UNIV",
                "admin@abc.edu",
                "+1 (555) 019-2834",
                "100 University Boulevard, Tech Valley, CA 94016"
        );
        org = organizationRepository.save(org);

        // 2. Roles
        for (RoleType rt : RoleType.values()) {
            if (roleRepository.findByName(rt.name()).isEmpty()) {
                roleRepository.save(new Role(rt.name(), "Role for " + rt.name()));
            }
        }

        // 3. Organization Settings
        AttendanceSettings settings = new AttendanceSettings(org.getId());
        settings.setThresholdMinutes(10);
        settings.setMinimumRecognitionConfidence(0.75);
        settings.setSessionDurationMinutes(60);
        settingsRepository.save(settings);

        // 4. Admin User
        User admin = new User(
                org.getId(),
                "admin@abc.edu",
                passwordEncoder.encode("Password123!"),
                "System",
                "Administrator",
                "+1 555-0100",
                RoleType.ORGANIZATION_ADMIN
        );
        admin = userRepository.save(admin);
        memberRepository.save(new OrganizationMember(org.getId(), admin.getId(), RoleType.ORGANIZATION_ADMIN));

        // 5. Departments
        Department csDept = departmentRepository.save(new Department(org.getId(), "Computer Science", "CS"));
        Department itDept = departmentRepository.save(new Department(org.getId(), "Information Technology", "IT"));
        Department ecDept = departmentRepository.save(new Department(org.getId(), "Electronics", "EC"));

        // 6. Course
        Course csCourse = courseRepository.save(new Course(org.getId(), csDept.getId(), "B.Tech Computer Science and Engineering", "BTECH_CSE"));

        // 7. Subjects
        Subject javaSub = subjectRepository.save(new Subject(org.getId(), csDept.getId(), csCourse.getId(), "Java Programming", "CS301", 4));
        Subject dbmsSub = subjectRepository.save(new Subject(org.getId(), csDept.getId(), csCourse.getId(), "DBMS", "CS302", 3));
        Subject osSub = subjectRepository.save(new Subject(org.getId(), csDept.getId(), csCourse.getId(), "Operating Systems", "CS303", 3));

        // 8. Faculty
        String[][] facultySeed = {
                {"Faculty 001", "Alan", "Turing", "faculty1@abc.edu", "FAC001", "Professor & HoD"},
                {"Faculty 002", "Ada", "Lovelace", "faculty2@abc.edu", "FAC002", "Associate Professor"},
                {"Faculty 003", "Grace", "Hopper", "faculty3@abc.edu", "FAC003", "Assistant Professor"}
        };
        List<Faculty> faculties = new ArrayList<>();
        for (String[] f : facultySeed) {
            User fUser = new User(org.getId(), f[3], passwordEncoder.encode("Password123!"), f[1], f[2], "+1 555-020" + f[4].charAt(5), RoleType.FACULTY);
            fUser = userRepository.save(fUser);
            memberRepository.save(new OrganizationMember(org.getId(), fUser.getId(), RoleType.FACULTY));

            Faculty faculty = new Faculty(org.getId(), fUser.getId(), csDept.getId(), f[4], f[5]);
            faculties.add(facultyRepository.save(faculty));
        }

        // 9. Students
        String[][] studentSeed = {
                {"STU001", "John", "Doe", "stu001@abc.edu"},
                {"STU002", "Jane", "Smith", "stu002@abc.edu"},
                {"STU003", "Bob", "Johnson", "stu003@abc.edu"},
                {"STU004", "Alice", "Williams", "stu004@abc.edu"},
                {"STU005", "Charlie", "Brown", "stu005@abc.edu"}
        };
        List<Student> students = new ArrayList<>();
        int count = 1;
        for (String[] s : studentSeed) {
            User sUser = new User(org.getId(), s[3], passwordEncoder.encode("Password123!"), s[1], s[2], "+1 555-030" + count, RoleType.STUDENT);
            sUser = userRepository.save(sUser);
            memberRepository.save(new OrganizationMember(org.getId(), sUser.getId(), RoleType.STUDENT));

            Student student = new Student(org.getId(), sUser.getId(), csDept.getId(), csCourse.getId(), s[0], 2024, 4);
            students.add(studentRepository.save(student));
            count++;
        }

        // 10. Enrollments
        // Enroll all 5 students in Java Programming (Faculty 001), DBMS (Faculty 002), OS (Faculty 003)
        Subject[] subjects = {javaSub, dbmsSub, osSub};
        for (int i = 0; i < subjects.length; i++) {
            Subject sub = subjects[i];
            Faculty fac = faculties.get(i);
            for (Student stu : students) {
                enrollmentRepository.save(new Enrollment(org.getId(), stu.getId(), sub.getId(), fac.getId(), "Spring 2026"));
            }
        }

        // 11. Sample Previous Sessions & Attendance for Calendar / Dashboard testing
        LocalDate today = LocalDate.now();
        Instant now = Instant.now();

        // Yesterday's session
        LocalDate yesterday = today.minusDays(1);
        AttendanceSession pastSession = new AttendanceSession(
                org.getId(),
                faculties.get(0).getId(),
                javaSub.getId(),
                yesterday,
                now.minus(25, ChronoUnit.HOURS),
                now.minus(24, ChronoUnit.HOURS),
                now.minus(24, ChronoUnit.HOURS).minus(50, ChronoUnit.MINUTES),
                SessionStatus.COMPLETED
        );
        pastSession = sessionRepository.save(pastSession);

        recordRepository.save(new AttendanceRecord(org.getId(), students.get(0).getId(), faculties.get(0).getId(), javaSub.getId(), pastSession.getId(), yesterday, now.minus(25, ChronoUnit.HOURS).plus(4, ChronoUnit.MINUTES), AttendanceStatus.PRESENT, 0.94));
        recordRepository.save(new AttendanceRecord(org.getId(), students.get(1).getId(), faculties.get(0).getId(), javaSub.getId(), pastSession.getId(), yesterday, now.minus(25, ChronoUnit.HOURS).plus(6, ChronoUnit.MINUTES), AttendanceStatus.PRESENT, 0.91));
        recordRepository.save(new AttendanceRecord(org.getId(), students.get(2).getId(), faculties.get(0).getId(), javaSub.getId(), pastSession.getId(), yesterday, now.minus(25, ChronoUnit.HOURS).plus(14, ChronoUnit.MINUTES), AttendanceStatus.LATE, 0.88));
        recordRepository.save(new AttendanceRecord(org.getId(), students.get(3).getId(), faculties.get(0).getId(), javaSub.getId(), pastSession.getId(), yesterday, now.minus(25, ChronoUnit.HOURS), AttendanceStatus.ABSENT, 0.0));
        recordRepository.save(new AttendanceRecord(org.getId(), students.get(4).getId(), faculties.get(0).getId(), javaSub.getId(), pastSession.getId(), yesterday, now.minus(25, ChronoUnit.HOURS).plus(3, ChronoUnit.MINUTES), AttendanceStatus.PRESENT, 0.96));

        // Today's active session for live demo
        AttendanceSession activeSession = new AttendanceSession(
                org.getId(),
                faculties.get(0).getId(),
                javaSub.getId(),
                today,
                now.minus(5, ChronoUnit.MINUTES),
                now.plus(55, ChronoUnit.MINUTES),
                now.plus(5, ChronoUnit.MINUTES),
                SessionStatus.ACTIVE
        );
        sessionRepository.save(activeSession);

        logger.info("ABC University seed completed successfully.");
        logger.info("Admin: admin@abc.edu / Password123!");
        logger.info("Faculty: faculty1@abc.edu / Password123!");
        logger.info("Student: stu001@abc.edu / Password123!");
    }
}
