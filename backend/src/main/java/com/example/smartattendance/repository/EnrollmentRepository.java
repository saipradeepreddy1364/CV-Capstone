package com.example.smartattendance.repository;

import com.example.smartattendance.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByOrganizationId(UUID organizationId);
    List<Enrollment> findByStudentId(UUID studentId);
    List<Enrollment> findBySubjectId(UUID subjectId);
    List<Enrollment> findByFacultyId(UUID facultyId);
    List<Enrollment> findByOrganizationIdAndFacultyId(UUID organizationId, UUID facultyId);
    List<Enrollment> findByOrganizationIdAndSubjectId(UUID organizationId, UUID subjectId);
    Optional<Enrollment> findByStudentIdAndSubjectId(UUID studentId, UUID subjectId);
    Optional<Enrollment> findByIdAndOrganizationId(UUID id, UUID organizationId);
    boolean existsByStudentIdAndSubjectId(UUID studentId, UUID subjectId);
    long countByOrganizationId(UUID organizationId);
    long countBySubjectId(UUID subjectId);
}
