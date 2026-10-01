package com.example.smartattendance.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CreateEnrollmentRequest {
    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Subject ID is required")
    private UUID subjectId;

    private UUID facultyId;
    private String academicTerm;

    public CreateEnrollmentRequest() {}

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public UUID getSubjectId() { return subjectId; }
    public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }

    public UUID getFacultyId() { return facultyId; }
    public void setFacultyId(UUID facultyId) { this.facultyId = facultyId; }

    public String getAcademicTerm() { return academicTerm; }
    public void setAcademicTerm(String academicTerm) { this.academicTerm = academicTerm; }
}
