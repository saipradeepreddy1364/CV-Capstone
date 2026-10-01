package com.example.smartattendance.repository;

import com.example.smartattendance.entity.FaceProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FaceProfileRepository extends JpaRepository<FaceProfile, UUID> {
    Optional<FaceProfile> findByStudentId(UUID studentId);
    Optional<FaceProfile> findByStudentIdAndOrganizationId(UUID studentId, UUID organizationId);
    List<FaceProfile> findByOrganizationId(UUID organizationId);
    boolean existsByStudentId(UUID studentId);
    void deleteByStudentId(UUID studentId);
    void deleteByStudentIdAndOrganizationId(UUID studentId, UUID organizationId);
}
