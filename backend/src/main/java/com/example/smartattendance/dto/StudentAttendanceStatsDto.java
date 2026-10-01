package com.example.smartattendance.dto;

import java.util.List;
import java.util.UUID;

public class StudentAttendanceStatsDto {
    private UUID studentId;
    private String studentName;
    private String studentNumber;
    private long totalClasses;
    private long attendedClasses;
    private long absentClasses;
    private long lateClasses;
    private double totalHours;
    private double attendedHours;
    private double attendancePercentage;
    private List<AttendanceRecordDto> recentRecords;

    public StudentAttendanceStatsDto() {}

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }

    public long getTotalClasses() { return totalClasses; }
    public void setTotalClasses(long totalClasses) { this.totalClasses = totalClasses; }

    public long getAttendedClasses() { return attendedClasses; }
    public void setAttendedClasses(long attendedClasses) { this.attendedClasses = attendedClasses; }

    public long getAbsentClasses() { return absentClasses; }
    public void setAbsentClasses(long absentClasses) { this.absentClasses = absentClasses; }

    public long getLateClasses() { return lateClasses; }
    public void setLateClasses(long lateClasses) { this.lateClasses = lateClasses; }

    public double getTotalHours() { return totalHours; }
    public void setTotalHours(double totalHours) { this.totalHours = totalHours; }

    public double getAttendedHours() { return attendedHours; }
    public void setAttendedHours(double attendedHours) { this.attendedHours = attendedHours; }

    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public List<AttendanceRecordDto> getRecentRecords() { return recentRecords; }
    public void setRecentRecords(List<AttendanceRecordDto> recentRecords) { this.recentRecords = recentRecords; }
}
