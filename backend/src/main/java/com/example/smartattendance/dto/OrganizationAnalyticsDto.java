package com.example.smartattendance.dto;

import java.util.List;
import java.util.Map;

public class OrganizationAnalyticsDto {
    private long totalFaculty;
    private long totalStudents;
    private long totalDepartments;
    private long totalCourses;
    private long totalSubjects;
    private long todaySessions;
    private long presentToday;
    private long absentToday;
    private long lateToday;
    private double averageAttendancePercentage;
    private List<Map<String, Object>> weeklyTrends;
    private List<Map<String, Object>> departmentStats;

    public OrganizationAnalyticsDto() {}

    public long getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(long totalFaculty) { this.totalFaculty = totalFaculty; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

    public long getTotalCourses() { return totalCourses; }
    public void setTotalCourses(long totalCourses) { this.totalCourses = totalCourses; }

    public long getTotalSubjects() { return totalSubjects; }
    public void setTotalSubjects(long totalSubjects) { this.totalSubjects = totalSubjects; }

    public long getTodaySessions() { return todaySessions; }
    public void setTodaySessions(long todaySessions) { this.todaySessions = todaySessions; }

    public long getPresentToday() { return presentToday; }
    public void setPresentToday(long presentToday) { this.presentToday = presentToday; }

    public long getAbsentToday() { return absentToday; }
    public void setAbsentToday(long absentToday) { this.absentToday = absentToday; }

    public long getLateToday() { return lateToday; }
    public void setLateToday(long lateToday) { this.lateToday = lateToday; }

    public double getAverageAttendancePercentage() { return averageAttendancePercentage; }
    public void setAverageAttendancePercentage(double averageAttendancePercentage) { this.averageAttendancePercentage = averageAttendancePercentage; }

    public List<Map<String, Object>> getWeeklyTrends() { return weeklyTrends; }
    public void setWeeklyTrends(List<Map<String, Object>> weeklyTrends) { this.weeklyTrends = weeklyTrends; }

    public List<Map<String, Object>> getDepartmentStats() { return departmentStats; }
    public void setDepartmentStats(List<Map<String, Object>> departmentStats) { this.departmentStats = departmentStats; }
}
