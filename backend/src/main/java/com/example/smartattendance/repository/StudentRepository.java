package com.example.smartattendance.repository;

import com.example.smartattendance.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    List<Student> findByOrganizationId(UUID organizationId);
    Optional<Student> findByIdAndOrganizationId(UUID id, UUID organizationId);
    Optional<Student> findByUserId(UUID userId);
    Optional<Student> findByUserIdAndOrganizationId(UUID userId, UUID organizationId);
    Optional<Student> findByOrganizationIdAndStudentNumber(UUID organizationId, String studentNumber);
    boolean existsByOrganizationIdAndStudentNumber(UUID organizationId, String studentNumber);
    List<Student> findByOrganizationIdAndDepartmentId(UUID organizationId, UUID departmentId);
    List<Student> findByOrganizationIdAndCourseId(UUID organizationId, UUID courseId);
    long countByOrganizationId(UUID organizationId);
}
