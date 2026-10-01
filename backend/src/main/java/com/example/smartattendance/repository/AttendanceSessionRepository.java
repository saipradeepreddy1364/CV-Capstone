package com.example.smartattendance.repository;

import com.example.smartattendance.entity.AttendanceSession;
import com.example.smartattendance.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, UUID> {
    List<AttendanceSession> findByOrganizationId(UUID organizationId);
    List<AttendanceSession> findByOrganizationIdAndFacultyId(UUID organizationId, UUID facultyId);
    List<AttendanceSession> findByOrganizationIdAndSubjectId(UUID organizationId, UUID subjectId);
    List<AttendanceSession> findByOrganizationIdAndSessionDate(UUID organizationId, LocalDate date);
    List<AttendanceSession> findByOrganizationIdAndStatus(UUID organizationId, SessionStatus status);
    Optional<AttendanceSession> findByIdAndOrganizationId(UUID id, UUID organizationId);
    long countByOrganizationIdAndSessionDate(UUID organizationId, LocalDate date);
    long countByOrganizationId(UUID organizationId);
}
