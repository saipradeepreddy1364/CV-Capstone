package com.example.smartattendance.repository;

import com.example.smartattendance.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, UUID> {
    List<Faculty> findByOrganizationId(UUID organizationId);
    Optional<Faculty> findByIdAndOrganizationId(UUID id, UUID organizationId);
    Optional<Faculty> findByUserId(UUID userId);
    Optional<Faculty> findByUserIdAndOrganizationId(UUID userId, UUID organizationId);
    Optional<Faculty> findByOrganizationIdAndFacultyNumber(UUID organizationId, String facultyNumber);
    boolean existsByOrganizationIdAndFacultyNumber(UUID organizationId, String facultyNumber);
    long countByOrganizationId(UUID organizationId);
}
