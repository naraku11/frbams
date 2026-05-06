// admin-dashboard.jsx — main analytics dashboard
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'

// ── Mini sparkline component ─────────────────────────────────────────────────
function Sparkline({ values = [], color = 'var(--accent)', height = 28 }) {
  if (!values.length) return null
  const max = Math.max(...values, 1)
  return (
    <div className="fm-sparkline" style={{ height }}>
      {values.map((v, i) => (
        <div
          key={i}
          className="fm-sparkline-bar"
          style={{
            height: `${Math.max(8, (v / max) * 100)}%`,
            background: i === values.length - 1 ? color : undefined,
            opacity: i === values.length - 1 ? 1 : 0.35 + (i / values.length) * 0.45,
          }}
        />
      ))}
    </div>
  )
}

// ── Progress ring component ──────────────────────────────────────────────────
function RateRing({ rate = 0, size = 64 }) {
  const r     = (size - 8) / 2
  const circ  = 2 * Math.PI * r
  const pct   = Math.min(100, Math.max(0, rate))
  const dash  = circ * (pct / 100)
  const gap   = circ - dash

  return (
    <svg width={size} height={size} className="fm-ring">
      <circle
        className="fm-ring-track"
        cx={size / 2} cy={size / 2} r={r}
        strokeWidth={6}
      />
      <circle
        className="fm-ring-fill"
        cx={size / 2} cy={size / 2} r={r}
        strokeWidth={6}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={0}
      />
    </svg>
  )
}

// ── Stat card configs ────────────────────────────────────────────────────────
const STAT_META = {
  present: {
    icon: 'Check',
    iconBg: 'color-mix(in srgb, var(--accent) 14%, transparent)',
    iconColor: 'var(--accent)',
  },
  late: {
    icon: 'Bell',
    iconBg: 'var(--amber-soft)',
    iconColor: 'var(--amber)',
  },
  absent: {
    icon: 'X',
    iconBg: 'var(--red-soft)',
    iconColor: 'var(--red)',
  },
  total: {
    icon: 'Users',
    iconBg: 'color-mix(in srgb, var(--blue) 12%, transparent)',
    iconColor: 'var(--blue)',
  },
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ eyebrow, num, sub, delta, dir = 'up', metaKey, sparkValues }) {
  const meta = STAT_META[metaKey] ?? STAT_META.total

  return (
    <div className="fm-card lift" style={{ flex: 1, minWidth: 0 }}>
      {/* Top row: label + icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="fm-eyebrow" style={{ paddingTop: 2, letterSpacing: '0.11em' }}>{eyebrow}</div>
        <div
          className="fm-stat-icon"
          style={{ background: meta.iconBg, color: meta.iconColor }}
        >
          {React.createElement(I[meta.icon], { size: 18 })}
        </div>
      </div>

      {/* Number + delta */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <div className="fm-stat-num">{num}</div>
        {delta && (
          <div className={`fm-delta ${dir}`}>
            {dir === 'up' ? '↗' : '↘'} {delta}
          </div>
        )}
      </div>

      {/* Sub label */}
      <div className="fm-muted mono" style={{ fontSize: 10.5, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>

      {/* Sparkline if values provided */}
      {sparkValues && sparkValues.length > 0 && (
        <Sparkline values={sparkValues} color={meta.iconColor} />
      )}
    </div>
  )
}

// ── Main Dashboard component ─────────────────────────────────────────────────
export function Dashboard({ layout = 'sidebar' }) {
  const navigate = useNavigate()
  const [data,   setData]   = React.useState(null)
  const [alerts, setAlerts] = React.useState([])
  React.useEffect(() => { api.dashboard().then(setData).catch(() => {}) }, [])
  React.useEffect(() => { api.notifications({ limit: 4 }).then(setAlerts).catch(() => {}) }, [])

  const exportDay = () => {
    const date = data?.date ?? new Date().toISOString().slice(0, 10)
    api.attendance({ date }).then(rows => {
      const header = 'Student,ID,Grade,Time,Status'
      const lines  = rows.map(r => [`"${r.name ?? ''}"`, r.studentCode ?? '', r.grade ?? '', r.time ?? '', r.status ?? ''].join(','))
      const blob   = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' })
      const a      = document.createElement('a')
      a.href       = URL.createObjectURL(blob)
      a.download   = `attendance-${date}.csv`
      a.click()
    }).catch(() => {})
  }

  const stats   = data?.stats   ?? {}
  const recent  = data?.recent  ?? []
  const bars    = data?.weekBars ?? []
  const byGrade = (data?.byGrade ?? []).map(r => ({ g: r.grade, n: Number(r.total), p: Number(r.present) }))

  // Derive sparkline values from weekly bars (% values)
  const sparkValues = bars.map(b => b.off ? 0 : (b.v ?? 0))

  const attendanceRate = stats.rate ?? 0

  return (
    <div className="fm-screen" data-screen-label="Admin Dashboard">
      {layout === 'sidebar' ? <Sidebar /> : null}
      <div className="fm-main">
        {layout === 'topnav' ? <Sidebar layout="topnav" /> : <TopBar />}
        <div className="fm-content">

          {/* ── Page header ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}>
            <div>
              <div className="fm-eyebrow" style={{ marginBottom: 8, letterSpacing: '0.12em' }}>
                {data?.date ?? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <h1 className="fm-h1">Attendance overview</h1>
              <div className="fm-muted" style={{ marginTop: 9, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--fg)' }}>{stats.present ?? '—'}</span>
                <span>of</span>
                <span style={{ fontWeight: 700, color: 'var(--fg)' }}>{stats.total ?? '—'}</span>
                <span>students checked in</span>
                {stats.late ? (
                  <>
                    <span style={{ color: 'var(--line)', fontSize: 16, lineHeight: 1 }}>·</span>
                    <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{stats.late} late</span>
                  </>
                ) : null}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 4 }}>
              <button className="fm-btn" onClick={exportDay}>
                <I.Export size={14} /> Export day
              </button>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
            <StatCard
              eyebrow="Present today"
              num={stats.present ?? '—'}
              sub={stats.total ? `${stats.rate ?? 0}% of enrolled` : 'Loading…'}
              metaKey="present"
              sparkValues={sparkValues}
            />
            <StatCard
              eyebrow="Late arrivals"
              num={stats.late ?? '—'}
              sub="marked late today"
              dir="dn"
              metaKey="late"
            />
            <StatCard
              eyebrow="Absent"
              num={stats.absent ?? '—'}
              sub="not checked in"
              dir="dn"
              metaKey="absent"
            />
            <StatCard
              eyebrow="Total enrolled"
              num={stats.total ?? '—'}
              sub="active students"
              metaKey="total"
            />
          </div>

          {/* ── Charts row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 248px', gap: 16, marginBottom: 16 }}>

            {/* Weekly bar chart */}
            <div className="fm-card" style={{ gridColumn: '1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                <div>
                  <h2 className="fm-h2">This week</h2>
                  <div className="fm-muted" style={{ fontSize: 11.5, marginTop: 5 }}>Daily attendance · last 7 days</div>
                </div>
              </div>
              <div style={{ height: 172, display: 'flex', alignItems: 'flex-end', gap: 10, paddingTop: 14 }}>
                {bars.map((b, i) => {
                  const isToday = i === bars.length - 1
                  const barH = b.off ? 4 : Math.max(b.v || 2, 2)
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                        <div style={{
                          width: '100%',
                          height: b.off ? 4 : `${barH}%`,
                          background: b.off
                            ? 'var(--line)'
                            : isToday
                              ? 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 110%, white 20%) 0%, var(--accent) 100%)'
                              : 'var(--fg-2)',
                          borderRadius: '5px 5px 0 0',
                          opacity: b.off ? 0.35 : isToday ? 1 : 0.45 + (i / bars.length) * 0.38,
                          boxShadow: isToday && !b.off
                            ? '0 0 14px rgba(201,162,39,0.32), 0 2px 6px rgba(0,0,0,0.15)'
                            : 'none',
                          position: 'relative',
                          transition: 'height 0.5s cubic-bezier(0.4,0,0.2,1)',
                        }}>
                          {!b.off && isToday && (
                            <div className="mono" style={{
                              position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                              fontSize: 10, color: 'var(--accent)', fontWeight: 800, whiteSpace: 'nowrap',
                            }}>{b.v}%</div>
                          )}
                        </div>
                      </div>
                      <div className="mono" style={{
                        fontSize: 10,
                        color: isToday ? 'var(--fg)' : 'var(--fg-4)',
                        fontWeight: isToday ? 800 : 400,
                      }}>{b.d}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* By grade */}
            <div className="fm-card" style={{ gridColumn: '2' }}>
              <h2 className="fm-h2">By grade level</h2>
              <div className="fm-muted" style={{ fontSize: 11.5, marginTop: 5, marginBottom: 20 }}>Current attendance · now</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {byGrade.map(r => {
                  const pct = r.n > 0 ? r.p / r.n : 0
                  const isLow = pct < 0.8
                  const pctLabel = r.n > 0 ? `${Math.round(pct * 100)}%` : '—'
                  return (
                    <div key={r.g}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 12.5, marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>{r.g}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>
                            {r.p}/{r.n}
                          </span>
                          <span className="mono" style={{
                            fontSize: 11,
                            color: isLow ? 'var(--amber)' : 'var(--accent)',
                            fontWeight: 700,
                          }}>{pctLabel}</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: 'var(--line-2)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct * 100}%`, height: '100%',
                          background: isLow
                            ? 'var(--amber)'
                            : 'linear-gradient(90deg, color-mix(in srgb, var(--accent) 80%, var(--side-bg) 20%) 0%, var(--accent) 100%)',
                          borderRadius: 99,
                          transition: 'width 0.65s cubic-bezier(0.4,0,0.2,1)',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Attendance rate ring */}
            <div className="fm-card" style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', gap: 0,
            }}>
              <div className="fm-eyebrow" style={{ marginBottom: 16, letterSpacing: '0.12em' }}>Attendance rate</div>
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <RateRing rate={attendanceRate} size={96} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                }}>
                  <span style={{
                    fontFamily: 'var(--display)', fontWeight: 800,
                    fontSize: 22, letterSpacing: '-0.05em',
                    lineHeight: 1, color: 'var(--fg)',
                  }}>{attendanceRate}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-3)', letterSpacing: 0 }}>%</span></span>
                </div>
              </div>
              <div className="fm-muted" style={{ fontSize: 11.5, marginTop: 16, lineHeight: 1.6 }}>
                of enrolled<br />students present
              </div>
              <div style={{
                marginTop: 14, padding: '5px 13px',
                background: attendanceRate >= 90 ? 'var(--accent-soft)'
                          : attendanceRate >= 80 ? 'var(--blue-soft)'
                          : 'var(--amber-soft)',
                borderRadius: 999, fontSize: 10.5, fontWeight: 700,
                color: attendanceRate >= 90 ? '#4E3500'
                     : attendanceRate >= 80 ? '#1D4E7A'
                     : '#6B3900',
                fontFamily: 'var(--mono)',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
              }}>
                {attendanceRate >= 90 ? 'Excellent' : attendanceRate >= 80 ? 'Good' : 'Needs attention'}
              </div>
            </div>
          </div>

          {/* ── Recent check-ins + alerts ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 288px', gap: 16 }}>

            {/* Recent table */}
            <div className="fm-card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="fm-h2">Recent check-ins</h2>
                  <div className="fm-muted" style={{ fontSize: 11.5, marginTop: 4 }}>Live · updating today</div>
                </div>
                <a
                  className="mono fm-section-link"
                  style={{ fontSize: 11.5 }}
                  onClick={() => navigate('/log')}
                >View all →</a>
              </div>

              <table className="fm-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 20 }}>Student</th>
                    <th>Class</th>
                    <th>Time</th>
                    <th>Confidence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.slice(0, 7).map(r => {
                    const hue = (parseInt((r.studentCode ?? '').replace(/\D/g, '')) * 37) % 360
                    return (
                      <tr key={r.id}>
                        <td style={{ paddingLeft: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              className="fm-avatar sm"
                              style={{ background: `oklch(0.84 0.13 ${hue})`, color: '#fff', fontWeight: 700 }}
                            >
                              {(r.name ?? '').split(' ').map(s => s[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                              <div className="mono fm-muted" style={{ fontSize: 10.5 }}>{r.studentCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="fm-muted" style={{ fontSize: 12.5 }}>{r.course ?? r.grade}</td>
                        <td className="mono" style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{r.time}</td>
                        <td className="mono" style={{ fontSize: 12 }}>
                          {r.conf != null ? (
                            <span style={{
                              color: r.conf >= 0.9 ? 'var(--accent)' : r.conf >= 0.75 ? 'var(--amber)' : 'var(--fg-3)',
                              fontWeight: r.conf >= 0.9 ? 600 : 400,
                            }}>
                              {(r.conf * 100).toFixed(1)}%
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          <span className={`fm-pill dot ${r.status === 'present' ? 'ok' : r.status === 'late' ? 'late' : 'ab'}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Alerts panel */}
            <div className="fm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 className="fm-h2">Alerts</h2>
                <span className="fm-pill" style={{ fontSize: 10, padding: '2px 8px' }}>
                  {alerts.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {alerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ color: 'var(--fg-4)', fontSize: 24, marginBottom: 8 }}>✓</div>
                    <div className="fm-muted" style={{ fontSize: 12 }}>No alerts today</div>
                  </div>
                ) : alerts.map((n, i) => {
                  const color = n.type === 'absent' ? 'var(--red)'
                              : n.type === 'late'   ? 'var(--amber)'
                              : n.type === 'ok'     ? 'var(--accent)'
                              : 'var(--fg-4)'
                  const softBg = n.type === 'absent' ? 'var(--red-soft)'
                                : n.type === 'late'   ? 'var(--amber-soft)'
                                : n.type === 'ok'     ? 'var(--accent-soft)'
                                : 'var(--line-2)'
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 10, padding: '10px 12px',
                      background: softBg, borderRadius: 'var(--r-sm)',
                      borderLeft: `3px solid ${color}`,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>
                          <b style={{ fontWeight: 600, color: 'var(--fg)' }}>{n.who}</b>{' '}
                          <span className="fm-muted">{n.text}</span>
                        </div>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 3 }}>
                          {n.ts ? new Date(n.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
