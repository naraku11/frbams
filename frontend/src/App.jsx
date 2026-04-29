import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './login'
import { Dashboard } from './admin-dashboard'
import { AttendanceLog } from './admin-log'
import { Enrollment, Reports, Settings, LeaveRequests } from './admin-misc'
import { NotificationsScreen } from './notifications'
import { Subjects, OfflineSync, CourseManager } from './extras'
import { StudentList } from './students'
import { Programs, Curricula, Sections } from './admin-academic'

function Guard({ children }) {
  const authed = localStorage.getItem('frbams_authed') === '1'
  return authed ? children : <Navigate to="/login" replace />
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Guard><Navigate to="/dashboard" replace /></Guard>} />
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/log"       element={<Guard><AttendanceLog /></Guard>} />
        <Route path="/students"  element={<Guard><StudentList /></Guard>} />
        <Route path="/enroll"    element={<Guard><Enrollment /></Guard>} />
        <Route path="/reports"   element={<Guard><Reports /></Guard>} />
        <Route path="/leave"     element={<Guard><LeaveRequests /></Guard>} />
        <Route path="/alerts"    element={<Guard><NotificationsScreen /></Guard>} />
        <Route path="/settings"  element={<Guard><Settings /></Guard>} />
        <Route path="/subjects"  element={<Guard><Subjects /></Guard>} />
        <Route path="/sync"      element={<Guard><OfflineSync /></Guard>} />
        <Route path="/courses"   element={<Guard><CourseManager /></Guard>} />
        <Route path="/programs"    element={<Guard><Programs /></Guard>} />
        <Route path="/curriculum"  element={<Guard><Curricula /></Guard>} />
        <Route path="/sections"    element={<Guard><Sections /></Guard>} />
        <Route path="*"            element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
