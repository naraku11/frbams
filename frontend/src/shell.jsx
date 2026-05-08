// shell.jsx — Sidebar + topbar shells used by web screens
import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { I } from './icons'
import { api } from './api'

// ── Mobile sidebar context ───────────────────────────────────────────────────
export const SidebarCtx = React.createContext({ open: false, setOpen: () => {} })

export function SidebarProvider({ children }) {
  const [open, setOpen] = React.useState(false)
  // Close on route change
  const location = useLocation()
  React.useEffect(() => setOpen(false), [location.pathname])
  return (
    <SidebarCtx.Provider value={{ open, setOpen }}>
      {children}
    </SidebarCtx.Provider>
  )
}

const NAV_DEFS = [
  { label: 'Dashboard',      icon: 'Home',    to: '/dashboard' },
  { label: 'Attendance Log', icon: 'Log',     to: '/log',      badgeKey: 'todayCheckins' },
  { label: 'Students',       icon: 'Users',   to: '/students', badgeKey: 'totalStudents' },
  { label: 'Reports',        icon: 'Chart',   to: '/reports' },
]
const NAV2_DEFS = [
  { label: 'Leave Requests', icon: 'Leave',    to: '/leave',    badgeKey: 'pendingLeave' },
  { label: 'Notifications',  icon: 'Bell',     to: '/alerts' },
  { label: 'Settings',       icon: 'Settings', to: '/settings' },
]
const NAV3_DEFS = [
  { label: 'Course / Program', icon: 'Book',   to: '/programs' },
  { label: 'Curriculum',       icon: 'Layers', to: '/curriculum' },
  { label: 'Section',          icon: 'Grid4',  to: '/sections' },
]

// Breadcrumb label map
const ROUTE_LABELS = {
  '/dashboard':  'Dashboard',
  '/log':        'Attendance Log',
  '/students':   'Students',
  '/reports':    'Reports',
  '/leave':      'Leave Requests',
  '/alerts':     'Notifications',
  '/settings':   'Settings',
  '/programs':   'Course / Program',
  '/curriculum': 'Curriculum',
  '/sections':   'Section',
}

function NavItem({ item, counts }) {
  const badge = item.badgeKey ? (counts[item.badgeKey] ?? null) : null
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => isActive ? 'active' : ''}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        {React.createElement(I[item.icon], { size: 15 })}
        {item.label}
      </span>
      {badge != null && badge > 0 && <span className="fm-nav-badge">{badge}</span>}
    </NavLink>
  )
}

function UVMark({ logoUrl, shortName }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="logo"
        style={{ width: 30, height: 30, objectFit: 'contain', borderRadius: 6, flexShrink: 0 }}
      />
    )
  }
  return (
    <div className="fm-brand-mark" style={{ fontSize: 11, fontWeight: 900, letterSpacing: '-0.03em' }}>
      {shortName || 'UV'}
    </div>
  )
}

function readBranding() {
  try { return JSON.parse(localStorage.getItem('frbams_branding') || '{}') } catch { return {} }
}

export function Sidebar({ layout = 'sidebar' }) {
  const navigate  = useNavigate()
  const { open, setOpen } = React.useContext(SidebarCtx)
  const user      = (() => { try { return JSON.parse(localStorage.getItem('frbams_user') || '{}') } catch { return {} } })()
  const initials  = user.initials ?? 'DW'
  const name      = user.name ?? 'Dr. Wexler'
  const role      = user.role ?? 'Vice Principal'
  const [counts,   setCounts]   = React.useState({})
  const [branding, setBranding] = React.useState(readBranding)

  React.useEffect(() => {
    const onStorage = () => setBranding(readBranding())
    window.addEventListener('storage', onStorage)
    window.addEventListener('frbams:branding', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('frbams:branding', onStorage)
    }
  }, [])

  React.useEffect(() => {
    api.badgeCounts().then(setCounts).catch(() => {})
  }, [])

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
          <UVMark logoUrl={branding.logoUrl} shortName={branding.shortName} />
          <span style={{ color: 'var(--side-brand-fg, var(--fg))' }}>{branding.schoolName || 'FRBAMS'}</span>
        </div>
        <div className="fm-topnav-links">
          {NAV_DEFS.map(n => (
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
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fm-side-overlay"
          onClick={() => setOpen(false)}
          style={{ zIndex: 98 }}
        />
      )}
    <div className={`fm-side${open ? ' open' : ''}`} style={{ zIndex: 99 }}>
      {/* Brand */}
      <div className="fm-side-top">
        <div className="fm-brand">
          <UVMark logoUrl={branding.logoUrl} shortName={branding.shortName} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{
              color: 'var(--side-brand-fg)',
              fontWeight: 800, fontSize: 15,
              letterSpacing: '-0.03em', lineHeight: 1.1,
            }}>FRBAMS</span>
            <span style={{
              color: 'var(--side-fg)',
              fontSize: 9, letterSpacing: '0.03em',
              lineHeight: 1, opacity: 0.65,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}>{branding.schoolName || 'University of the Visayas'}</span>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 8 }}>
        <div className="fm-side-section">Live</div>
        <nav className="fm-nav">
          {NAV_DEFS.map(n => <NavItem key={n.to} item={n} counts={counts} />)}
        </nav>
        <div className="fm-side-section">Manage</div>
        <nav className="fm-nav">
          {NAV2_DEFS.map(n => <NavItem key={n.to} item={n} counts={counts} />)}
        </nav>
        <div className="fm-side-section">Academic</div>
        <nav className="fm-nav">
          {NAV3_DEFS.map(n => <NavItem key={n.to} item={n} counts={counts} />)}
        </nav>
      </div>

      {/* Footer */}
      <div className="fm-side-foot">
        <div className="fm-avatar" style={{
          background: 'linear-gradient(135deg, #D4AC2E 0%, var(--accent) 100%)',
          color: 'var(--side-bg)',
          boxShadow: '0 2px 8px rgba(201,162,39,0.35), 0 0 0 2px rgba(255,255,255,0.14)',
        }}>{initials}</div>
        <div style={{ fontSize: 12, lineHeight: 1.35, flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, color: 'var(--side-fg-strong)', fontSize: 12.5,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{name}</div>
          <div style={{ fontSize: 10, color: 'var(--side-fg)', marginTop: 1.5, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{role}</div>
        </div>
        <button
          className="fm-btn icon"
          onClick={logout}
          title="Sign out"
          style={{
            flexShrink: 0, padding: '6px',
            color: 'var(--side-fg)',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: 'none',
          }}
        >
          <I.Arrow size={13} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </div>
    </>
  )
}

export function TopBar({ right }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { setOpen } = React.useContext(SidebarCtx)
  const [q, setQ] = React.useState('')

  // Derive current page label for breadcrumb
  const pageLabel = ROUTE_LABELS[location.pathname] ?? null

  return (
    <div className="fm-topbar">
      {/* Mobile hamburger */}
      <button
        className="fm-hamburger"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        <span /><span /><span />
      </button>

      {/* Left: breadcrumb */}
      <div className="fm-topbar-title">
        <span style={{ color: 'var(--fg-4)', fontSize: 12 }}>FRBAMS</span>
        {pageLabel && (
          <>
            <span className="fm-topbar-sep">/</span>
            <span className="fm-topbar-crumb-chip">{pageLabel}</span>
          </>
        )}
      </div>

      {/* Center: search */}
      <div className="fm-search" style={{ margin: '0 auto' }}>
        <I.Search size={13} style={{ color: 'var(--fg-4)', flexShrink: 0 }} />
        <input
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13, color: 'var(--fg)', width: '100%',
          }}
          placeholder="Search students, classes, IDs…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && q.trim()) {
              navigate('/students?q=' + encodeURIComponent(q.trim()))
              setQ('')
            }
          }}
        />
        {q && (
          <button
            onClick={() => setQ('')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--fg-4)', padding: 0, display: 'flex', flexShrink: 0,
            }}
          >
            <I.X size={12} />
          </button>
        )}
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {right}
        {/* Live indicator — animated pulse dot */}
        <span className="fm-pill dot ok" style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase',
          background: 'var(--green-soft)',
          color: 'var(--green)',
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--green) 22%, transparent)`,
        }}>Live</span>
        <NavLink to="/alerts" style={{ display: 'flex' }}>
          <button className="fm-btn icon" title="Notifications" style={{ position: 'relative' }}>
            <I.Bell size={15} />
          </button>
        </NavLink>
      </div>
    </div>
  )
}
