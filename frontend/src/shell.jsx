// shell.jsx — Sidebar + topbar shells used by web screens
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { I } from './icons'

const NAV = [
  { label: 'Dashboard',      icon: 'Home',    to: '/dashboard' },
  { label: 'Live Capture',   icon: 'Camera',  to: '/kiosk' },
  { label: 'Attendance Log', icon: 'Log',     to: '/log',      badge: '324' },
  { label: 'Students',       icon: 'Users',   to: '/students', badge: '548' },
  { label: 'Enrollment',     icon: 'Face',    to: '/enroll' },
  { label: 'Reports',        icon: 'Chart',   to: '/reports' },
]
const NAV2 = [
  { label: 'Leave Requests', icon: 'Leave',    to: '/leave',    badge: '4' },
  { label: 'Notifications',  icon: 'Bell',     to: '/alerts' },
  { label: 'Settings',       icon: 'Settings', to: '/settings' },
]

function NavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => isActive ? 'active' : ''}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {React.createElement(I[item.icon], { size: 15 })}
        {item.label}
      </span>
      {item.badge && <span className="fm-nav-badge">{item.badge}</span>}
    </NavLink>
  )
}

function UVMark() {
  return (
    <div className="fm-brand-mark" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '-0.02em' }}>
      UV
    </div>
  )
}

export function Sidebar({ layout = 'sidebar' }) {
  const navigate  = useNavigate()
  const user      = (() => { try { return JSON.parse(localStorage.getItem('frbams_user') || '{}') } catch { return {} } })()
  const initials  = user.initials ?? 'DW'
  const name      = user.name ?? 'Dr. Wexler'
  const role      = user.role ?? 'Vice Principal'

  const logout = () => {
    localStorage.removeItem('frbams_authed')
    localStorage.removeItem('frbams_token')
    localStorage.removeItem('frbams_user')
    navigate('/login')
  }

  if (layout === 'topnav') {
    return (
      <div className="fm-topnav">
        <div className="fm-brand">
          <UVMark />
          <span style={{ color: 'var(--side-brand-fg, var(--fg))' }}>FRBAMS</span>
        </div>
        <div className="fm-topnav-links">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => isActive ? 'active' : ''}>
              {n.label}
            </NavLink>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="fm-btn icon"><I.Bell /></button>
          <div className="fm-avatar sm" style={{ cursor: 'pointer' }} onClick={logout}>{initials}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fm-side">
      <div className="fm-side-top">
        <div className="fm-brand">
          <UVMark />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
            <span style={{
              color: 'var(--side-brand-fg)',
              fontWeight: 700, fontSize: 14.5,
              letterSpacing: '-0.025em', lineHeight: 1.1,
            }}>FRBAMS</span>
            <span style={{
              color: 'var(--side-fg)',
              fontSize: 9.5, letterSpacing: '0.01em',
              lineHeight: 1, opacity: 0.8,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>University of the Visayas</span>
          </div>
        </div>
      </div>
      <div className="fm-side-section">Live</div>
      <nav className="fm-nav">
        {NAV.map(n => <NavItem key={n.to} item={n} />)}
      </nav>
      <div className="fm-side-section">Manage</div>
      <nav className="fm-nav">
        {NAV2.map(n => <NavItem key={n.to} item={n} />)}
      </nav>
      <div className="fm-side-foot">
        <div className="fm-avatar">{initials}</div>
        <div style={{ fontSize: 12, lineHeight: 1.3, flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, color: 'var(--side-fg-strong)' }}>{name}</div>
          <div style={{ fontSize: 11, color: 'var(--side-fg)', marginTop: 1 }}>{role}</div>
        </div>
        <button
          className="fm-btn icon"
          onClick={logout}
          title="Sign out"
          style={{ flexShrink: 0, padding: '6px', color: 'var(--side-fg)' }}
        >
          <I.Arrow size={14} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </div>
  )
}

export function TopBar({ search = 'Search students, classes, IDs…', right }) {
  return (
    <div className="fm-topbar">
      <div className="fm-search">
        <I.Search size={14} />
        <span>{search}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {right}
        <span className="fm-pill mono dot ok">Live</span>
        <NavLink to="/alerts">
          <button className="fm-btn icon" title="Notifications"><I.Bell /></button>
        </NavLink>
      </div>
    </div>
  )
}
