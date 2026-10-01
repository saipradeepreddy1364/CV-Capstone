package com.example.smartattendance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

public class CreateFacultyRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String phone;
    private UUID departmentId;

    @NotBlank(message = "Faculty number is required")
    private String facultyNumber;

    private String designation;
    private List<UUID> assignedSubjectIds;

    public CreateFacultyRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public String getFacultyNumber() { return facultyNumber; }
    public void setFacultyNumber(String facultyNumber) { this.facultyNumber = facultyNumber; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public List<UUID> getAssignedSubjectIds() { return assignedSubjectIds; }
    public void setAssignedSubjectIds(List<UUID> assignedSubjectIds) { this.assignedSubjectIds = assignedSubjectIds; }
}
