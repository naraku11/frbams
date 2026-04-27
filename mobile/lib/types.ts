export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
export type CheckInMethod = 'face' | 'pin';
export type CourseSessionStatus = 'done' | 'next' | 'upcoming' | 'missed';

export interface Student {
  id: number;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  gradeLabel: string;
  photoUrl: string | null;
}

export interface CourseSession {
  id: number;
  courseCode: string;
  courseName: string;
  teacher: string;
  room: string;
  startTime: string;   // "09:30"
  endTime: string;     // "10:20"
  date: string;        // "2026-04-26"
  sessionStatus: CourseSessionStatus;
  attendanceStatus: AttendanceStatus | null;
}

export interface AttendanceRecord {
  id: number;
  recordDate: string;       // "2026-04-26"
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  method: CheckInMethod | 'manual';
  confidence: number | null;
  locationLabel: string | null;
  courseName: string | null;
}

export interface LeaveRequest {
  id: number;
  dateFrom: string;
  dateTo: string;
  reason: string;
  type: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  submittedAt: string;
}

export interface OfflineQueueItem {
  localId: string;
  studentId: number;
  capturedAt: string;
  method: CheckInMethod;
  confidence: number | null;
  locationLat: number | null;
  locationLng: number | null;
  courseName: string | null;
  synced: boolean;
}

export interface GeofenceStatus {
  inside: boolean;
  distanceMeters: number;
  accuracyMeters: number;
  lat: number;
  lng: number;
  zoneName: string;
}
