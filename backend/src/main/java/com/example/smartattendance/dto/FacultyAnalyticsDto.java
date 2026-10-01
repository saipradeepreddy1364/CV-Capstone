package com.example.smartattendance.dto;

import java.util.List;
import java.util.Map;

public class FacultyAnalyticsDto {
    private long assignedStudents;
    private long todayClasses;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private double averageAttendance;
    private List<Map<String, Object>> subjectBreakdowns;

    public FacultyAnalyticsDto() {}

    public long getAssignedStudents() { return assignedStudents; }
    public void setAssignedStudents(long assignedStudents) { this.assignedStudents = assignedStudents; }

    public long getTodayClasses() { return todayClasses; }
    public void setTodayClasses(long todayClasses) { this.todayClasses = todayClasses; }

    public long getPresentCount() { return presentCount; }
    public void setPresentCount(long presentCount) { this.presentCount = presentCount; }

    public long getAbsentCount() { return absentCount; }
    public void setAbsentCount(long absentCount) { this.absentCount = absentCount; }

    public long getLateCount() { return lateCount; }
    public void setLateCount(long lateCount) { this.lateCount = lateCount; }

    public double getAverageAttendance() { return averageAttendance; }
    public void setAverageAttendance(double averageAttendance) { this.averageAttendance = averageAttendance; }

    public List<Map<String, Object>> getSubjectBreakdowns() { return subjectBreakdowns; }
    public void setSubjectBreakdowns(List<Map<String, Object>> subjectBreakdowns) { this.subjectBreakdowns = subjectBreakdowns; }
}
