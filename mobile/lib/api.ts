import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AttendanceRecord, CourseSession, LeaveRequest, Student } from './types';

// Set this to your Hostinger domain once deployed
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://your-domain.com/api';

async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem('auth_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; student: Student }>('/auth/student/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: () => request<void>('/auth/logout', { method: 'POST' }),
  },

  student: {
    me: () => request<Student>('/student/me'),
    attendance: (params?: { month?: string }) =>
      request<AttendanceRecord[]>(
        `/student/me/attendance${params?.month ? `?month=${params.month}` : ''}`,
      ),
    schedule: (date?: string) =>
      request<CourseSession[]>(`/student/me/schedule${date ? `?date=${date}` : ''}`),
    termRate: () => request<{ rate: number; attended: number; total: number }>('/student/me/term-rate'),
    leaveRequests: () => request<LeaveRequest[]>('/student/me/leave-requests'),
    submitLeave: (body: { dateFrom: string; dateTo: string; reason: string; type: string }) =>
      request<LeaveRequest>('/student/me/leave-requests', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  attendance: {
    checkIn: (body: {
      method: 'face' | 'pin';
      confidence?: number;
      locationLat?: number;
      locationLng?: number;
      locationAccuracyM?: number;
      geofenceId?: number;
      distanceM?: number;
      deviceUuid: string;
      capturedAt: string;
    }) =>
      request<{ recordId: number; status: string }>('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    checkOut: (body: { locationLat?: number; locationLng?: number; deviceUuid: string }) =>
      request<{ recordId: number }>('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    syncOfflineQueue: (items: object[]) =>
      request<{ synced: number; conflicts: number }>('/attendance/sync', {
        method: 'POST',
        body: JSON.stringify({ events: items }),
      }),
  },
};
