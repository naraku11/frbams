import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './login'
import { Dashboard } from './admin-dashboard'
import { KioskWelcoming, KioskScanning, KioskClassroom } from './admin-kiosk'
import { AttendanceLog } from './admin-log'
import { Enrollment, Reports, Settings, LeaveRequests } from './admin-misc'
import { NotificationsScreen } from './notifications'
import { Subjects, OfflineSync, CourseManager, KioskOffline } from './extras'
import { StudentList } from './students'

function Guard({ children }) {
  const authed = localStorage.getItem('frbams_authed') === '1'
  return authed ? children : <Navigate to="/login" replace />
}

function KioskPage() {
  const [variant, setVariant] = React.useState('welcoming')
  const Comp = variant === 'scanning' ? KioskScanning : variant === 'classroom' ? KioskClassroom : KioskWelcoming
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', gap: 8, padding: '10px 20px', borderBottom: '1px solid var(--line)',
        background: 'var(--bg)', alignItems: 'center',
      }}>
        <span className="fm-muted" style={{ fontSize: 12 }}>Kiosk view:</span>
        {['welcoming', 'scanning', 'classroom', 'offline'].map(v => (
          <button key={v} className={`fm-btn${variant === v ? ' dark' : ''}`} style={{ fontSize: 12, padding: '5px 12px' }}
            onClick={() => setVariant(v)}>
            {v}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {variant === 'offline' ? <KioskOffline /> : <Comp />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Guard><Navigate to="/dashboard" replace /></Guard>} />
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/kiosk"     element={<Guard><KioskPage /></Guard>} />
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
        <Route path="*"          element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
