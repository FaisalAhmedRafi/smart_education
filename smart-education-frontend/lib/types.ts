export type Role = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  section?: string;
  academicYear: string;
  classTeacherId?: string;
  classTeacher?: User;
  createdAt: string;
}

export interface Student {
  id: string;
  fullName: string;
  dob?: string;
  gender?: string;
  rollNumber: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  classRoomId?: string;
  classRoom?: ClassRoom;
  userId?: string;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: string;
  studentId: string;
  student?: Student;
  classRoomId: string;
  date: string;
  status: AttendanceStatus;
  markedById?: string;
  remarks?: string;
  createdAt: string;
}

export type ExamType = 'quiz' | 'assignment' | 'midterm' | 'final';

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  examType: ExamType;
  marksObtained: number;
  totalMarks: number;
  term: string;
  recordedById?: string;
  createdAt: string;
}
