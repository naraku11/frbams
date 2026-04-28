// api.js — Admin frontend API client
// In development, Vite proxies /api → PHP backend on localhost:8000
// In production, requests go to the same origin under /api (or VITE_API_URL)

const BASE = import.meta.env.VITE_API_URL ?? '/api'

function token() {
  return localStorage.getItem('frbams_token') ?? ''
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (token()) headers['Authorization'] = `Bearer ${token()}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
  return json
}

export const api = {
  auth: {
    login:  (email, password) => request('POST', '/auth/admin/login', { email, password }),
    logout: ()               => request('POST', '/auth/logout'),
  },
  dashboard:               ()             => request('GET',   '/admin/dashboard'),
  students:                (params = {})  => request('GET',   '/admin/students?'    + new URLSearchParams(params)),
  studentDetail:           (id)           => request('GET',   `/admin/students/${id}`),
  attendance:              (params = {})  => request('GET',   '/admin/attendance?'  + new URLSearchParams(params)),
  leaveRequests:           (status = 'pending') => request('GET', `/admin/leave-requests?status=${status}`),
  approveLeave:            (id)           => request('POST',  `/admin/leave-requests/${id}/approve`),
  declineLeave:            (id)           => request('POST',  `/admin/leave-requests/${id}/decline`),
  reports:                 (month)        => request('GET',   `/admin/reports?month=${month}`),
  notifications:           (params = {})  => request('GET',   '/admin/notifications?' + new URLSearchParams(params)),
  cameras:                 ()             => request('GET',   '/admin/cameras'),
  grades:                  ()             => request('GET',   '/admin/grades'),
  enrollStudent:           (body)         => request('POST',  '/admin/students', body),
  recognitionSettings:     ()             => request('GET',   '/admin/settings/recognition'),
  saveRecognitionSettings: (body)         => request('PATCH', '/admin/settings/recognition', body),
  badgeCounts:             ()             => request('GET',   '/admin/badge-counts'),
  teachers:                ()             => request('GET',   '/admin/teachers'),
  departments:             ()             => request('GET',   '/admin/departments'),
  rooms:                   ()             => request('GET',   '/admin/rooms'),
  courses:                 (params = {})  => request('GET',   '/admin/courses?' + new URLSearchParams(params)),
  createCourse:            (body)         => request('POST',  '/admin/courses', body),
  offlineQueue:            ()             => request('GET',   '/admin/offline-queue'),
  notificationRules:       ()             => request('GET',   '/admin/notification-rules'),
  updateNotificationRule:  (id, body)     => request('PATCH', `/admin/notification-rules/${id}`, body),
  updateAttendance:        (id, body)     => request('PATCH', `/admin/attendance/${id}`, body),
}
