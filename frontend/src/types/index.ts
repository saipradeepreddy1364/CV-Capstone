export type RoleType = 'ORGANIZATION_ADMIN' | 'FACULTY' | 'STUDENT';

export type SessionStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface UserDto {
  id: string;
  organizationId: string;
  organizationName?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  role: RoleType;
  facultyId?: string;
  studentId?: string;
  identificationNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserDto;
}

export interface OrganizationDto {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentDto {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface CourseDto {
  id: string;
  organizationId: string;
  departmentId: string;
  departmentName?: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface SubjectDto {
  id: string;
  organizationId: string;
  departmentId?: string;
  departmentName?: string;
  courseId?: string;
  courseName?: string;
  name: string;
  code: string;
  credits: number;
  createdAt: string;
}

export interface FacultyDto {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  departmentId?: string;
  departmentName?: string;
  facultyNumber: string;
  designation?: string;
  assignedSubjects?: SubjectDto[];
  createdAt: string;
}

export interface StudentDto {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  departmentId?: string;
  departmentName?: string;
  courseId?: string;
  courseName?: string;
  studentNumber: string;
  batchYear?: number;
  semester?: number;
  faceRegistered: boolean;
  createdAt: string;
}

export interface EnrollmentDto {
  id: string;
  organizationId: string;
  studentId: string;
  studentName?: string;
  studentNumber?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  facultyId?: string;
  facultyName?: string;
  academicTerm?: string;
  createdAt: string;
}

export interface AttendanceSessionDto {
  id: string;
  organizationId: string;
  facultyId: string;
  facultyName?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  thresholdTime: string;
  status: SessionStatus;
  totalEnrolledStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendancePercentage: number;
  createdAt: string;
}

export interface LiveStudentAttendanceDto {
  studentId: string;
  studentNumber: string;
  studentName: string;
  status: AttendanceStatus;
  recognitionTime?: string;
  confidence?: number;
}

export interface LiveAttendanceResponseDto {
  sessionId: string;
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  sessionDate: string;
  startTime: string;
  thresholdTime: string;
  endTime: string;
  status: SessionStatus;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendancePercentage: number;
  students: LiveStudentAttendanceDto[];
}

export interface AttendanceRecordDto {
  id: string;
  organizationId: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  facultyId: string;
  facultyName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  attendanceSessionId: string;
  attendanceDate: string;
  checkInTime: string;
  status: AttendanceStatus;
  recognitionConfidence?: number;
  createdAt: string;
}

export interface StudentAttendanceStatsDto {
  studentId: string;
  studentName: string;
  studentNumber: string;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  lateClasses: number;
  totalHours: number;
  attendedHours: number;
  attendancePercentage: number;
  recentRecords: AttendanceRecordDto[];
}

export interface AttendanceSettingsDto {
  id: string;
  organizationId: string;
  thresholdMinutes: number;
  lateEnabled: boolean;
  lateStatus: string;
  minimumRecognitionConfidence: number;
  sessionDurationMinutes: number;
}

export interface OrganizationAnalyticsDto {
  totalFaculty: number;
  totalStudents: number;
  totalDepartments: number;
  totalCourses: number;
  totalSubjects: number;
  todaySessions: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageAttendancePercentage: number;
  weeklyTrends: { date: string; day: string; present: number; absent: number }[];
  departmentStats: { name: string; students: number }[];
}

export interface FacultyAnalyticsDto {
  assignedStudents: number;
  todayClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  averageAttendance: number;
  subjectBreakdowns: { subjectName: string; enrolledCount: number }[];
}

export interface StudentAnalyticsDto {
  overallAttendancePercentage: number;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  lateClasses: number;
  totalHours: number;
  attendedHours: number;
  subjectAttendance: { subjectName: string; total: number; attended: number; percentage: number }[];
  monthlyTrends: { month: string; percentage: number }[];
}

export interface AuditLogDto {
  id: string;
  organizationId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
}

export interface FaceVerificationResultDto {
  verified: boolean;
  studentId?: string;
  studentName?: string;
  studentNumber?: string;
  confidence?: number;
  status?: AttendanceStatus;
  message?: string;
}
