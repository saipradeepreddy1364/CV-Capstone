package com.example.smartattendance.dto;

import java.util.List;
import java.util.Map;

public class StudentAnalyticsDto {
    private double overallAttendancePercentage;
    private long totalClasses;
    private long attendedClasses;
    private long absentClasses;
    private long lateClasses;
    private double totalHours;
    private double attendedHours;
    private List<Map<String, Object>> subjectAttendance;
    private List<Map<String, Object>> monthlyTrends;

    public StudentAnalyticsDto() {}

    public double getOverallAttendancePercentage() { return overallAttendancePercentage; }
    public void setOverallAttendancePercentage(double overallAttendancePercentage) { this.overallAttendancePercentage = overallAttendancePercentage; }

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

    public List<Map<String, Object>> getSubjectAttendance() { return subjectAttendance; }
    public void setSubjectAttendance(List<Map<String, Object>> subjectAttendance) { this.subjectAttendance = subjectAttendance; }

    public List<Map<String, Object>> getMonthlyTrends() { return monthlyTrends; }
    public void setMonthlyTrends(List<Map<String, Object>> monthlyTrends) { this.monthlyTrends = monthlyTrends; }
}
