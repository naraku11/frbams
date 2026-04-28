// notifications.jsx — Admin notifications screen
import React, { useState, useEffect } from 'react'
import { api } from './api'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'

const META = {
  absent: { color: 'var(--red)',    label: 'Absent',   icon: 'X' },
  late:   { color: 'var(--amber)',  label: 'Late',     icon: 'Cal' },
  leave:  { color: 'var(--blue)',   label: 'Leave',    icon: 'Leave' },
  system: { color: 'var(--fg-4)',   label: 'System',   icon: 'Settings' },
  ok:     { color: 'var(--accent)', label: 'All good', icon: 'Check' },
}

function relativeTime(ts) {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'absent',    label: 'Attendance' },
  { key: 'leave',     label: 'Leave' },
  { key: 'system',    label: 'System' },
]

function NotificationsScreen() {
  const [tab,   setTab]   = useState('all')
  const [items, setItems] = useState([])
  const [read,  setRead]  = useState(new Set())

  useEffect(() => {
    const params = {}
    if (tab === 'absent') params.type = 'absent'
    else if (tab === 'leave')  params.type = 'leave'
    else if (tab === 'system') params.type = 'system'
    api.notifications(params).then(setItems).catch(() => setItems([]))
  }, [tab])

  const markAllRead = () => setRead(new Set(items.map((_, i) => i)))

  return (
    <div className="fm-screen" data-screen-label="Notifications">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content" style={{ maxWidth: 920, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div className="fm-eyebrow" style={{ marginBottom: 8 }}>Inbox</div>
              <h1 className="fm-h1">Notifications</h1>
              <div className="fm-muted" style={{ marginTop: 6 }}>
                {items.length - read.size} unread · today
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="fm-btn" onClick={markAllRead}>Mark all read</button>
              <button className="fm-btn"><I.Settings size={13} /> Rules</button>
            </div>
          </div>

          <div className="fm-tabs" style={{ marginBottom: 14 }}>
            {TABS.map(t => (
              <div
                key={t.key}
                className={`fm-tab${tab === t.key ? ' active' : ''}`}
                onClick={() => setTab(t.key)}
                style={{ cursor: 'pointer' }}
              >
                {t.label}
                {tab === t.key && (
                  <span className="mono" style={{ marginLeft: 6 }}>{items.length}</span>
                )}
              </div>
            ))}
          </div>

          <div className="fm-card" style={{ padding: 0 }}>
            {items.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
                No notifications.
              </div>
            ) : items.map((n, i) => {
              const m   = META[n.type] ?? META.system
              const isRead = read.has(i)
              return (
                <div
                  key={i}
                  style={{
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14,
                    alignItems: 'center', padding: '16px 20px',
                    borderBottom: i < items.length - 1 ? '1px solid var(--line-2)' : 'none',
                    background: isRead ? 'transparent' : 'var(--card)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setRead(prev => new Set([...prev, i]))}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `color-mix(in oklch, ${m.color} 18%, var(--card))`,
                    color: m.color, display: 'grid', placeItems: 'center',
                  }}>
                    {I[m.icon] ? React.createElement(I[m.icon], { size: 16 }) : null}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>
                      <b style={{ fontWeight: 600 }}>{n.who}</b>
                      {n.studentCode && (
                        <span className="mono fm-muted" style={{ fontSize: 11, marginLeft: 8 }}>
                          {n.studentCode}
                        </span>
                      )}
                      <span className="fm-muted"> · {n.text}</span>
                    </div>
                    <div className="mono fm-muted" style={{ fontSize: 11, marginTop: 3 }}>
                      {relativeTime(n.ts)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {!isRead && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export { NotificationsScreen }
