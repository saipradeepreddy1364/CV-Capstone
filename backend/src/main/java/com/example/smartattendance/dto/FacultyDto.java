package com.example.smartattendance.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class FacultyDto {
    private UUID id;
    private UUID organizationId;
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private UUID departmentId;
    private String departmentName;
    private String facultyNumber;
    private String designation;
    private List<SubjectDto> assignedSubjects;
    private Instant createdAt;

    public FacultyDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getFacultyNumber() { return facultyNumber; }
    public void setFacultyNumber(String facultyNumber) { this.facultyNumber = facultyNumber; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public List<SubjectDto> getAssignedSubjects() { return assignedSubjects; }
    public void setAssignedSubjects(List<SubjectDto> assignedSubjects) { this.assignedSubjects = assignedSubjects; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
