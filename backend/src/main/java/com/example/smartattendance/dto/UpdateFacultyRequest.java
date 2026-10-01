package com.example.smartattendance.dto;

import java.util.List;
import java.util.UUID;

public class UpdateFacultyRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private UUID departmentId;
    private String designation;
    private List<UUID> assignedSubjectIds;

    public UpdateFacultyRequest() {}

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public List<UUID> getAssignedSubjectIds() { return assignedSubjectIds; }
    public void setAssignedSubjectIds(List<UUID> assignedSubjectIds) { this.assignedSubjectIds = assignedSubjectIds; }
}
