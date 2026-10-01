package com.example.smartattendance.repository;

import com.example.smartattendance.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByOrganizationId(UUID organizationId);
    List<Course> findByOrganizationIdAndDepartmentId(UUID organizationId, UUID departmentId);
    Optional<Course> findByIdAndOrganizationId(UUID id, UUID organizationId);
    Optional<Course> findByOrganizationIdAndCode(UUID organizationId, String code);
    boolean existsByOrganizationIdAndCode(UUID organizationId, String code);
    long countByOrganizationId(UUID organizationId);
}
