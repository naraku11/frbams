// api.js — Admin frontend API client
// In development, Vite proxies /api → PHP backend on localhost:8000
// In production, requests go to the same origin under /api (or VITE_API_URL)

const BASE = import.meta.env.VITE_API_URL ?? '/api'

function getToken() {
  return localStorage.getItem('frbams_token') ?? ''
}

async function request(method, path, body) {
  const tok = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (tok) headers['Authorization'] = `Bearer ${tok}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    // Token expired or invalid — clear auth state
    if (res.status === 401) {
      localStorage.removeItem('frbams_token')
      localStorage.removeItem('frbams_authed')
      localStorage.removeItem('frbams_user')
    }
    throw new Error(json.error ?? `HTTP ${res.status}`)
  }
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
  updateNotificationRule:  (id, body)     => request('PATCH',  `/admin/notification-rules/${id}`, body),
  updateAttendance:        (id, body)     => request('PATCH',  `/admin/attendance/${id}`, body),
  programs:                ()             => request('GET',    '/admin/programs'),
  createProgram:           (body)         => request('POST',   '/admin/programs', body),
  updateProgram:           (id, body)     => request('PATCH',  `/admin/programs/${id}`, body),
  deleteProgram:           (id)           => request('DELETE', `/admin/programs/${id}`),
  curricula:               ()             => request('GET',    '/admin/curricula'),
  createCurriculum:        (body)         => request('POST',   '/admin/curricula', body),
  updateCurriculum:        (id, body)     => request('PATCH',  `/admin/curricula/${id}`, body),
  deleteCurriculum:        (id)           => request('DELETE', `/admin/curricula/${id}`),
  sections:                ()             => request('GET',    '/admin/sections'),
  createSection:           (body)         => request('POST',   '/admin/sections', body),
  updateSection:           (id, body)     => request('PATCH',  `/admin/sections/${id}`, body),
  deleteSection:           (id)           => request('DELETE', `/admin/sections/${id}`),
  schoolInfo:              ()             => request('GET',    '/admin/school-info'),
  updateSchoolInfo:        (body)         => request('PATCH',  '/admin/school-info', body),
  uploadAsset: (file) => {
    const form = new FormData()
    form.append('file', file)
    const tok = getToken()
    return fetch(`${BASE}/admin/upload-asset`, {
      method: 'POST',
      headers: tok ? { Authorization: `Bearer ${tok}` } : {},
      body: form,
    }).then(r => r.json().then(j => { if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`); return j }))
  },
}
