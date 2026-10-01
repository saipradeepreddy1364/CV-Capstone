package com.example.smartattendance.repository;

import com.example.smartattendance.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    List<Subject> findByOrganizationId(UUID organizationId);
    List<Subject> findByOrganizationIdAndDepartmentId(UUID organizationId, UUID departmentId);
    List<Subject> findByOrganizationIdAndCourseId(UUID organizationId, UUID courseId);
    Optional<Subject> findByIdAndOrganizationId(UUID id, UUID organizationId);
    Optional<Subject> findByOrganizationIdAndCode(UUID organizationId, String code);
    boolean existsByOrganizationIdAndCode(UUID organizationId, String code);
    long countByOrganizationId(UUID organizationId);
}
