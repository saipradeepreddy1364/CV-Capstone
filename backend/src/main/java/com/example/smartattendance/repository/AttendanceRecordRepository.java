package com.example.smartattendance.repository;

import com.example.smartattendance.entity.AttendanceRecord;
import com.example.smartattendance.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    List<AttendanceRecord> findByOrganizationId(UUID organizationId);
    List<AttendanceRecord> findByAttendanceSessionId(UUID attendanceSessionId);
    Optional<AttendanceRecord> findByAttendanceSessionIdAndStudentId(UUID attendanceSessionId, UUID studentId);
    boolean existsByAttendanceSessionIdAndStudentId(UUID attendanceSessionId, UUID studentId);
    List<AttendanceRecord> findByStudentId(UUID studentId);
    List<AttendanceRecord> findByOrganizationIdAndStudentId(UUID organizationId, UUID studentId);
    List<AttendanceRecord> findByOrganizationIdAndSubjectId(UUID organizationId, UUID subjectId);
    List<AttendanceRecord> findByOrganizationIdAndFacultyId(UUID organizationId, UUID facultyId);
    List<AttendanceRecord> findByOrganizationIdAndAttendanceDate(UUID organizationId, LocalDate attendanceDate);
    
    long countByOrganizationIdAndAttendanceDateAndStatus(UUID organizationId, LocalDate date, AttendanceStatus status);
    long countByStudentId(UUID studentId);
    long countByStudentIdAndStatus(UUID studentId, AttendanceStatus status);
    
    @Query("SELECT r FROM AttendanceRecord r WHERE r.organizationId = :orgId " +
           "AND (:studentId IS NULL OR r.studentId = :studentId) " +
           "AND (:facultyId IS NULL OR r.facultyId = :facultyId) " +
           "AND (:subjectId IS NULL OR r.subjectId = :subjectId) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:startDate IS NULL OR r.attendanceDate >= :startDate) " +
           "AND (:endDate IS NULL OR r.attendanceDate <= :endDate) " +
           "ORDER BY r.attendanceDate DESC, r.checkInTime DESC")
    List<AttendanceRecord> searchRecords(
            @Param("orgId") UUID orgId,
            @Param("studentId") UUID studentId,
            @Param("facultyId") UUID facultyId,
            @Param("subjectId") UUID subjectId,
            @Param("status") AttendanceStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
