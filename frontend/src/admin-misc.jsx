// admin-misc.jsx — Enrollment, Reports, Settings, Notifications, Leave
import React from 'react'
import { api } from './api'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'
import { THEMES, getSavedTheme, saveTheme } from './theme'


function Enrollment() {
  const [grades,  setGrades]  = React.useState([])
  const [form,    setForm]    = React.useState({ firstName: '', lastName: '', studentCode: '', gradeLabel: '', email: '' })
  const [saving,  setSaving]  = React.useState(false)
  const [done,    setDone]    = React.useState(null)
  const [error,   setError]   = React.useState('')
  const [copied,  setCopied]  = React.useState(false)

  React.useEffect(() => { api.grades().then(setGrades).catch(() => {}) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.firstName || !form.lastName || !form.studentCode || !form.gradeLabel) {
      setError('Please fill in all required fields.'); return
    }
    setSaving(true); setError('')
    try {
      const res = await api.enrollStudent(form)
      setDone(res)
      setForm({ firstName: '', lastName: '', studentCode: '', gradeLabel: '', email: '' })
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fm-screen" data-screen-label="Enrollment">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{marginBottom:24}}>
            <div className="fm-eyebrow" style={{marginBottom:8}}>Admin · Enrollment</div>
            <h1 className="fm-h1">Enroll a new student</h1>
            <div className="fm-muted" style={{marginTop:6}}>
              Fill in the student details below. A secure one-time password will be generated — share it with the student so they can log in.
            </div>
          </div>

          <div style={{maxWidth:520}}>
            {done && (
              <div style={{
                marginBottom:16, padding:'14px 18px', borderRadius:10,
                background:'var(--accent-soft)', border:'1px solid var(--accent)',
                fontSize:13, lineHeight:1.5,
              }}>
                <div><b style={{fontWeight:600}}>Enrolled:</b> {done.name} · <span className="mono">{done.studentCode}</span> · {done.grade}</div>
                {done.tempPassword && (
                  <div style={{marginTop:8, padding:'8px 12px', background:'var(--card)', borderRadius:7, display:'flex', alignItems:'center', gap:10}}>
                    <span className="fm-muted" style={{fontSize:12}}>One-time password:</span>
                    <span className="mono" style={{fontWeight:700, fontSize:14, flex:1}}>{done.tempPassword}</span>
                    <button className="fm-btn" style={{fontSize:11}} onClick={() => {
                      navigator.clipboard?.writeText(done.tempPassword)
                      setCopied(true); setTimeout(() => setCopied(false), 2000)
                    }}>{copied ? 'Copied!' : 'Copy'}</button>
                  </div>
                )}
                <div style={{marginTop:10, fontSize:11.5, color:'var(--fg-3)'}}>
                  Share this password with the student. It will not be shown again.
                </div>
                <button className="fm-btn" style={{marginTop:10, fontSize:11}} onClick={() => { setDone(null); setCopied(false) }}>Enroll another</button>
              </div>
            )}

            <div className="fm-card">
              <h3 className="fm-h3" style={{marginBottom:14}}>Student details</h3>
              <div style={{display:"grid", gap:12}}>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                  <div>
                    <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>First name <span style={{color:"var(--red)"}}>*</span></div>
                    <input className="fm-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="e.g. Juan" />
                  </div>
                  <div>
                    <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Last name <span style={{color:"var(--red)"}}>*</span></div>
                    <input className="fm-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="e.g. Dela Cruz" />
                  </div>
                </div>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                  <div>
                    <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Student ID <span style={{color:"var(--red)"}}>*</span></div>
                    <input className="fm-input mono" value={form.studentCode} onChange={e => set('studentCode', e.target.value)} placeholder="e.g. S2025-001" />
                  </div>
                  <div>
                    <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Grade <span style={{color:"var(--red)"}}>*</span></div>
                    <select className="fm-input" value={form.gradeLabel} onChange={e => set('gradeLabel', e.target.value)}>
                      <option value="">Select grade…</option>
                      {grades.map(g => <option key={g.id} value={g.label}>{g.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Guardian email <span className="fm-muted">(optional)</span></div>
                  <input className="fm-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="guardian@example.com" />
                </div>
              </div>
            </div>

            {error && (
              <div style={{marginTop:10, padding:'10px 14px', borderRadius:8, background:'color-mix(in oklch, var(--red) 12%, var(--card))', color:'var(--red)', fontSize:12.5}}>
                {error}
              </div>
            )}

            <div style={{display:"flex", gap:8, justifyContent:"flex-end", marginTop:14}}>
              <button className="fm-btn" onClick={() => { setForm({ firstName:'', lastName:'', studentCode:'', gradeLabel:'', email:'' }); setError('') }}>
                Clear
              </button>
              <button className="fm-btn primary" disabled={saving} onClick={submit}>
                {saving ? 'Enrolling…' : <><I.Check size={13}/> Enroll student</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Reports() {
  const [month,  setMonth]  = React.useState(() => new Date().toISOString().slice(0, 7))
  const [report, setReport] = React.useState(null)

  React.useEffect(() => {
    api.reports(month).then(setReport).catch(() => setReport(null))
  }, [month])

  const bars = (report?.daily ?? []).map(d => ({
    d: new Date(d.date + 'T00:00:00').getDate(),
    v: d.enrolled > 0 ? Math.round((d.present / d.enrolled) * 100) : 0,
  }))

  const courses = (report?.courses ?? []).map(c => ({
    name:     c.course,
    enrolled: c.enrolled,
    pct:      c.enrolled > 0 ? Math.round((c.attended / c.enrolled) * 100) : 0,
    late:     c.late,
    absent:   c.absent,
  }))

  return (
    <div className="fm-screen" data-screen-label="Reports">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>Reports · {month}</div>
              <h1 className="fm-h1">Monthly attendance</h1>
            </div>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <input
                type="month"
                className="fm-input"
                value={month}
                onChange={e => setMonth(e.target.value)}
                style={{width:160}}
              />
              <button className="fm-btn primary" onClick={() => window.print()}><I.Export size={14}/> Generate PDF</button>
            </div>
          </div>

          <div className="fm-card" style={{marginBottom:16}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:18}}>
              <h2 className="fm-h2">Daily trend</h2>
            </div>
            {bars.length === 0 ? (
              <div style={{height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fg-3)', fontSize:13}}>
                No data for this month.
              </div>
            ) : (
              <div style={{height:200, display:"flex", alignItems:"flex-end", gap:3}}>
                {bars.map((b, i) => (
                  <div key={i} style={{
                    flex:1,
                    height: (b.v || 2) + "%",
                    background: b.v < 80 ? "var(--amber)" : "var(--accent)",
                    borderRadius:"3px 3px 0 0",
                  }} title={`Day ${b.d}: ${b.v}%`}/>
                ))}
              </div>
            )}
            <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontFamily:"var(--mono)", fontSize:10.5, color:"var(--fg-3)"}}>
              <span>Day 1</span><span>Day 15</span><span>Day 30</span>
            </div>
          </div>

          <div className="fm-card" style={{padding:0}}>
            <div style={{padding:"18px 20px 12px"}}>
              <h2 className="fm-h2">By course</h2>
            </div>
            <table className="fm-table">
              <thead>
                <tr>
                  <th style={{paddingLeft:20}}>Course</th>
                  <th>Enrolled</th>
                  <th>Avg %</th>
                  <th>Late</th>
                  <th>Absent</th>
                  <th style={{width:140}}>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr><td colSpan={6} style={{padding:32, textAlign:'center', color:'var(--fg-3)'}}>No course data.</td></tr>
                ) : courses.map((c) => (
                  <tr key={c.name}>
                    <td style={{paddingLeft:20, fontWeight:500}}>{c.name}</td>
                    <td className="mono">{c.enrolled}</td>
                    <td className="mono">{c.pct}%</td>
                    <td className="mono">{c.late}</td>
                    <td className="mono">{c.absent}</td>
                    <td>
                      <div style={{height:6, background:"var(--line-2)", borderRadius:99, overflow:"hidden"}}>
                        <div style={{width:c.pct+"%", height:"100%", background: c.pct < 85 ? "var(--amber)" : "var(--accent)"}}/>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Theme Settings helpers ────────────────────────────────────────────────────

function ThemeCard({ id, theme, active, onSelect }) {
  const [p1, p2, p3] = theme.preview
  return (
    <button onClick={onSelect} style={{
      padding: 12, borderRadius: 10, cursor: 'pointer', textAlign: 'left',
      border: `2px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
      background: active ? 'var(--accent-soft)' : 'var(--card)',
      position: 'relative', transition: 'border-color 0.15s, background 0.15s',
      width: '100%',
    }}>
      {active && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--accent)', display: 'grid', placeItems: 'center',
        }}>
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div style={{ display: 'flex', gap: 5, marginBottom: 9 }}>
        {[p1, p2, p3].map((c, i) => (
          <div key={i} style={{
            width: 22, height: 22, borderRadius: 6,
            background: c, border: '1px solid rgba(0,0,0,0.08)',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', lineHeight: 1.2 }}>{theme.name}</div>
      <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 3, lineHeight: 1.4 }}>{theme.description}</div>
    </button>
  )
}

function ColorRow({ label, varName, value, onChange }) {
  const displayVal = value && value.startsWith('#') ? value : '#888888'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        type="color"
        value={displayVal}
        onChange={e => onChange(e.target.value)}
        style={{
          width: 34, height: 34, borderRadius: 7,
          border: '1px solid var(--line)', padding: 3,
          cursor: 'pointer', background: 'none', flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-3)', marginTop: 1 }}>
          {varName} · {value}
        </div>
      </div>
    </div>
  )
}

function PreviewStrip() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="fm-btn primary" style={{ fontSize: 13 }}>Primary action</button>
        <button className="fm-btn" style={{ fontSize: 13 }}>Secondary</button>
        <button className="fm-btn dark" style={{ fontSize: 13 }}>Dark</button>
        <span className="fm-pill ok">Present</span>
        <span className="fm-pill warn">Late</span>
        <span className="fm-pill danger">Absent</span>
        <span className="fm-pill">Pending</span>
      </div>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 10, padding: '14px 16px',
        display: 'flex', gap: 14, alignItems: 'center',
      }}>
        <div className="fm-avatar">DW</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Sample Student Name</div>
          <div className="fm-muted" style={{ fontSize: 11.5, marginTop: 2 }}>Grade 11-B · ID: S-2436 · Section Coral</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>96.2%</div>
          <div className="fm-muted" style={{ fontSize: 10.5, marginTop: 2 }}>attendance rate</div>
        </div>
      </div>
      <div style={{
        background: 'var(--accent)', color: 'var(--accent-ink)',
        borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 500,
      }}>
        Accent color strip · {new Date().toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric'})}
      </div>
    </div>
  )
}

function SettingsAppearance() {
  const saved = getSavedTheme()
  const [activeId, setActiveId] = React.useState(saved.id)
  const [custom, setCustom] = React.useState(saved.custom ?? {})

  const selectTheme = (id) => {
    setActiveId(id)
    setCustom({})
    saveTheme(id, {})
  }

  const getVal = (varName) => {
    if (custom[varName]) return custom[varName]
    return THEMES[activeId]?.vars?.[varName] ?? '#000000'
  }

  const setVar = (varName, val) => {
    const next = { ...custom, [varName]: val }
    setCustom(next)
    saveTheme(activeId, next)
  }

  const hasOverrides = Object.keys(custom).length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fm-card">
        <div style={{ marginBottom: 16 }}>
          <h3 className="fm-h3">Theme Presets</h3>
          <div className="fm-muted" style={{ fontSize: 12, marginTop: 4 }}>
            Choose a color scheme for the entire interface. Changes apply instantly.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {Object.entries(THEMES).map(([id, theme]) => (
            <ThemeCard key={id} id={id} theme={theme} active={activeId === id} onSelect={() => selectTheme(id)} />
          ))}
        </div>
      </div>

      <div className="fm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 className="fm-h3">Custom Color Overrides</h3>
            <div className="fm-muted" style={{ fontSize: 12, marginTop: 4 }}>
              Fine-tune individual interface colors on top of the selected preset.
            </div>
          </div>
          {hasOverrides && (
            <button className="fm-btn" style={{ fontSize: 12, flexShrink: 0 }}
              onClick={() => { setCustom({}); saveTheme(activeId, {}) }}>
              Reset to preset
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {[
            ['--accent',         'Accent / highlight'],
            ['--bg',             'Page background'],
            ['--card',           'Card surface'],
            ['--side-bg',        'Sidebar background'],
            ['--side-active-bg', 'Active nav color'],
            ['--fg',             'Primary text'],
          ].map(([varName, label]) => (
            <ColorRow key={varName} label={label} varName={varName}
              value={getVal(varName)} onChange={val => setVar(varName, val)} />
          ))}
        </div>
        {hasOverrides && (
          <div style={{
            marginTop: 14, padding: '10px 12px', borderRadius: 7,
            background: 'var(--accent-soft)', fontSize: 12, color: 'var(--fg-2)',
          }}>
            {Object.keys(custom).length} custom override{Object.keys(custom).length !== 1 ? 's' : ''} active
            on top of <strong>{THEMES[activeId]?.name}</strong>.
          </div>
        )}
      </div>

      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom: 14 }}>Live Preview</h3>
        <PreviewStrip />
      </div>
    </div>
  )
}

function SettingsRecognition() {
  const [cfg, setCfg] = React.useState(null)
  const saveTimer = React.useRef(null)

  React.useEffect(() => {
    api.recognitionSettings().then(setCfg).catch(() => {})
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [])

  const save = (patch) => {
    const next = { ...cfg, ...patch }
    setCfg(next)
    // Debounce API calls to avoid a request per slider pixel
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      api.saveRecognitionSettings(next).catch(() => {})
    }, 400)
  }

  const threshold = cfg?.confidenceThreshold ?? 96

  const toggleRows = [
    { key: 'livenessDetection',  label: 'Liveness detection',   desc: 'Detect printed photos and screen replays' },
    { key: 'maskTolerance',      label: 'Mask tolerance',        desc: 'Allow recognition with surgical/cloth masks' },
    { key: 'multiAngleTemplate', label: 'Multi-angle template',  desc: 'Use 5-angle template for outdoor cameras' },
    { key: 'autoRetrain',        label: 'Auto re-train',         desc: 'Refresh templates monthly from passing frames' },
    { key: 'anonymousMetrics',   label: 'Anonymous metrics',     desc: 'Send aggregate accuracy data to FRBAMS Cloud' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom: 4 }}>Match confidence threshold</h3>
        <div className="fm-muted" style={{ fontSize: 12, marginBottom: 18 }}>
          Below this confidence, the system asks for a PIN fallback.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <input
            type="range" min="80" max="99.9" step="0.1"
            value={threshold}
            onChange={e => save({ confidenceThreshold: parseFloat(e.target.value) })}
            style={{ flex: 1, accentColor: 'var(--accent)' }}
          />
          <div className="mono" style={{ fontSize: 18, fontWeight: 600, width: 60, textAlign: 'right' }}>
            {Number(threshold).toFixed(1)}%
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)' }}>
          <span>Permissive</span><span>Recommended</span><span>Strict</span>
        </div>
      </div>
      <div className="fm-card" style={{ padding: 0 }}>
        {toggleRows.map((row, i, arr) => (
          <div key={row.key} style={{
            padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: i < arr.length - 1 ? '1px solid var(--line-2)' : 'none',
            cursor: cfg ? 'pointer' : 'default',
          }} onClick={() => cfg && save({ [row.key]: !cfg[row.key] })}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13.5 }}>{row.label}</div>
              <div className="fm-muted" style={{ fontSize: 12, marginTop: 2 }}>{row.desc}</div>
            </div>
            <div className={`fm-toggle ${cfg?.[row.key] ? 'on' : ''}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsCameras() {
  const [cameras, setCameras] = React.useState(null)

  React.useEffect(() => {
    api.cameras().then(setCameras).catch(() => setCameras([]))
  }, [])

  return (
    <div className="fm-card">
      <h3 className="fm-h3" style={{ marginBottom: 14 }}>Camera network</h3>
      {cameras === null ? (
        <div className="fm-muted" style={{ fontSize: 13 }}>Loading…</div>
      ) : cameras.length === 0 ? (
        <div className="fm-muted" style={{ fontSize: 13 }}>No cameras configured.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {cameras.map(c => {
            const isOnline = c.status === 'online'
            const quality  = c.quality != null ? `${Math.round(c.quality * 100)}%` : '—'
            return (
              <div key={c.id} style={{
                padding: 12, border: '1px solid var(--line)', borderRadius: 8,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</div>
                  <div className="mono fm-muted" style={{ fontSize: 11, marginTop: 2 }}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    {c.room ? ` · ${c.room}` : ''}
                  </div>
                </div>
                <div className="mono" style={{
                  fontSize: 13,
                  color: isOnline ? 'oklch(0.5 0.16 145)' : 'var(--amber)',
                }}>{quality}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const EVENT_LABELS = {
  absent:            'Absent student',
  late:              'Late arrival',
  consecutive_absent:'Consecutive absences',
  leave:             'Leave request submitted',
  camera_offline:    'Camera offline',
  sync_complete:     'Sync completed',
}

function SettingsNotifications() {
  const [rules, setRules] = React.useState([])

  React.useEffect(() => {
    api.notificationRules().then(setRules).catch(() => {})
  }, [])

  const toggle = (rule, key) => {
    const patch = { [key]: !rule[key] }
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, ...patch } : r))
    api.updateNotificationRule(rule.id, patch)
      .catch(() => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, [key]: rule[key] } : r)))
  }

  return (
    <div className="fm-card" style={{ padding: 0 }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr repeat(4, 80px)',
        padding: '10px 20px', borderBottom: '1px solid var(--line-2)',
        fontSize: 11, color: 'var(--fg-3)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        <span>Event</span>
        <span style={{ textAlign: 'center' }}>Active</span>
        <span style={{ textAlign: 'center' }}>Admin</span>
        <span style={{ textAlign: 'center' }}>Teacher</span>
        <span style={{ textAlign: 'center' }}>Guardian</span>
      </div>
      {rules.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>Loading…</div>
      ) : rules.map((r, i) => (
        <div key={r.id} style={{
          display: 'grid', gridTemplateColumns: '1fr repeat(4, 80px)',
          padding: '14px 20px', alignItems: 'center',
          borderBottom: i < rules.length - 1 ? '1px solid var(--line-2)' : 'none',
        }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13.5 }}>{EVENT_LABELS[r.eventType] ?? r.eventType}</div>
            {r.threshold > 1 && <div className="fm-muted" style={{ fontSize: 11.5 }}>threshold: {r.threshold}</div>}
          </div>
          {['isActive', 'notifyAdmin', 'notifyTeacher', 'notifyGuardianEmail'].map(key => (
            <div key={key} style={{ display: 'grid', placeItems: 'center', cursor: 'pointer' }}
              onClick={() => toggle(r, key)}>
              <div className={`fm-toggle ${r[key] ? 'on' : ''}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function AssetUploadField({ label, value, onChange, onUpload, uploading }) {
  const ref = React.useRef()
  return (
    <div>
      <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        {value
          ? <img src={value} alt={label} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)' }} />
          : <div style={{ width: 48, height: 48, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--line-2)', display: 'grid', placeItems: 'center', fontSize: 11, color: 'var(--fg-3)' }}>none</div>
        }
        <div style={{ flex: 1 }}>
          <input
            className="fm-input"
            placeholder="https://…"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ marginBottom: 6 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="fm-btn" style={{ fontSize: 12 }}
              onClick={() => ref.current?.click()}
              disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload file'}
            </button>
            {value && (
              <button className="fm-btn" style={{ fontSize: 12 }} onClick={() => onChange('')}>Remove</button>
            )}
          </div>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) { onUpload(e.target.files[0]); e.target.value = '' } }} />
    </div>
  )
}

function SettingsBranding() {
  const [form,     setForm]     = React.useState({ name: '', shortName: '', logoUrl: '', faviconUrl: '', address: '', timezone: '' })
  const [uploading, setUploading] = React.useState(null)
  const [saving,   setSaving]   = React.useState(false)
  const [saved,    setSaved]    = React.useState(false)
  const [error,    setError]    = React.useState('')

  React.useEffect(() => {
    api.schoolInfo().then(d => setForm({
      name:       d.name       ?? '',
      shortName:  d.shortName  ?? '',
      logoUrl:    d.logoUrl    ?? '',
      faviconUrl: d.faviconUrl ?? '',
      address:    d.address    ?? '',
      timezone:   d.timezone   ?? '',
    })).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const upload = async (field, file) => {
    setUploading(field)
    try {
      const { url } = await api.uploadAsset(file)
      set(field, url)
    } catch (e) { setError(e.message) }
    setUploading(null)
  }

  const save = async () => {
    setSaving(true); setError('')
    try {
      await api.updateSchoolInfo(form)
      const branding = { schoolName: form.name, shortName: form.shortName, logoUrl: form.logoUrl, faviconUrl: form.faviconUrl }
      localStorage.setItem('frbams_branding', JSON.stringify(branding))
      window.dispatchEvent(new Event('frbams:branding'))
      if (form.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']")
        if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
        link.href = form.faviconUrl
      }
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom: 4 }}>School identity</h3>
        <div className="fm-muted" style={{ fontSize: 12, marginBottom: 18 }}>
          These details appear in the sidebar and browser tab across the whole admin panel.
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 5 }}>School name</div>
              <input className="fm-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="University of the Visayas" />
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 5 }}>Brand mark</div>
              <input className="fm-input" value={form.shortName} onChange={e => set('shortName', e.target.value.slice(0, 6))} placeholder="UV" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 5 }}>Address</div>
            <input className="fm-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Colon St., Cebu City" />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 5 }}>Timezone</div>
            <select className="fm-input" value={form.timezone} onChange={e => set('timezone', e.target.value)}>
              {['Asia/Manila','UTC','America/New_York','America/Los_Angeles','Europe/London','Asia/Singapore'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom: 4 }}>Logo &amp; icon</h3>
        <div className="fm-muted" style={{ fontSize: 12, marginBottom: 18 }}>
          PNG, JPG, SVG or WebP recommended. Max 2 MB. The logo replaces the brand mark in the sidebar when set.
        </div>
        <div style={{ display: 'grid', gap: 20 }}>
          <AssetUploadField
            label="School logo (sidebar)"
            value={form.logoUrl}
            onChange={v => set('logoUrl', v)}
            onUpload={f => upload('logoUrl', f)}
            uploading={uploading === 'logoUrl'}
          />
          <AssetUploadField
            label="Favicon / browser tab icon"
            value={form.faviconUrl}
            onChange={v => set('faviconUrl', v)}
            onUpload={f => upload('faviconUrl', f)}
            uploading={uploading === 'faviconUrl'}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'color-mix(in oklch, var(--red) 12%, var(--card))', color: 'var(--red)', fontSize: 12.5 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
        {saved && <span style={{ fontSize: 12.5, color: 'var(--accent)' }}>Saved successfully</span>}
        <button className="fm-btn primary" disabled={saving || uploading !== null} onClick={save}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

const SETTINGS_TABS = [
  { id: 'branding',      label: 'School Branding' },
  { id: 'appearance',    label: 'Appearance' },
  { id: 'recognition',   label: 'Recognition Engine' },
  { id: 'cameras',       label: 'Camera Network' },
  { id: 'notifications', label: 'Notification Rules' },
  { id: 'privacy',       label: 'Privacy & Retention' },
  { id: 'integrations',  label: 'Integrations' },
  { id: 'roles',         label: 'Roles & Access' },
]

function Settings() {
  const [tab, setTab] = React.useState('branding')

  return (
    <div className="fm-screen" data-screen-label="Settings">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{ marginBottom: 24 }}>
            <div className="fm-eyebrow" style={{ marginBottom: 8 }}>Administration</div>
            <h1 className="fm-h1">System Settings</h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SETTINGS_TABS.map(({ id, label }) => (
                <button key={id} onClick={() => setTab(id)} style={{
                  padding: '8px 12px', borderRadius: 7, cursor: 'pointer',
                  background: tab === id ? 'var(--accent-soft)' : 'transparent',
                  color: tab === id ? 'var(--accent)' : 'var(--fg-3)',
                  fontWeight: tab === id ? 600 : 400,
                  fontSize: 13, textAlign: 'left', border: 'none',
                  transition: 'background 0.12s, color 0.12s',
                }}>{label}</button>
              ))}
            </nav>

            <div>
              {tab === 'branding'     && <SettingsBranding />}
              {tab === 'appearance'   && <SettingsAppearance />}
              {tab === 'recognition'  && <SettingsRecognition />}
              {tab === 'cameras'      && <SettingsCameras />}
              {tab === 'notifications'&& <SettingsNotifications />}
              {(tab === 'privacy' || tab === 'integrations' || tab === 'roles') && (
                <div className="fm-card" style={{
                  color: 'var(--fg-3)', fontSize: 13,
                  textAlign: 'center', padding: '40px 20px',
                }}>
                  {SETTINGS_TABS.find(t => t.id === tab)?.label} settings — coming soon.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LeaveRequests() {
  const [tab,    setTab]    = React.useState('pending')
  const [leaves, setLeaves] = React.useState([])
  const [acting, setActing] = React.useState(null)

  React.useEffect(() => {
    api.leaveRequests(tab).then(setLeaves).catch(() => setLeaves([]))
  }, [tab])

  const act = async (id, action) => {
    setActing(id)
    try {
      await (action === 'approve' ? api.approveLeave(id) : api.declineLeave(id))
      setLeaves(prev => prev.filter(l => l.id !== id))
    } catch (_) {}
    setActing(null)
  }

  const items = leaves.map(l => ({
    ...l,
    name: l.studentName,
    date: l.dateFrom === l.dateTo ? l.dateFrom : `${l.dateFrom} – ${l.dateTo}`,
    hue:  (parseInt((l.studentCode ?? '').replace(/\D/g, '')) * 37) % 360,
  }))

  const tabDefs = [
    { value: 'pending',  label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
  ]

  return (
    <div className="fm-screen" data-screen-label="Leave Requests">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:24, alignItems:"flex-end"}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>Inbox</div>
              <h1 className="fm-h1">Leave requests</h1>
            </div>
            <div className="fm-tabs">
              {tabDefs.map(t => (
                <div
                  key={t.value}
                  className={`fm-tab${tab === t.value ? ' active' : ''}`}
                  onClick={() => setTab(t.value)}
                  style={{cursor:'pointer'}}
                >
                  {t.label}
                  {tab === t.value && <span className="mono" style={{marginLeft:6}}>{items.length}</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {items.length === 0 ? (
              <div className="fm-card" style={{textAlign:'center', color:'var(--fg-3)', padding:40}}>
                No {tab} leave requests.
              </div>
            ) : items.map((l) => (
              <div key={l.id} className="fm-card" style={{display:"grid", gridTemplateColumns:"1fr auto", gap:18, alignItems:"center"}}>
                <div style={{display:"flex", gap:14, alignItems:"center"}}>
                  <div className="fm-avatar lg" style={{background:`oklch(0.86 0.14 ${l.hue})`}}>
                    {(l.name ?? '').split(" ").map(s => s[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div style={{display:"flex", gap:10, alignItems:"baseline"}}>
                      <div style={{fontSize:15, fontWeight:600}}>{l.name}</div>
                      <span className="mono fm-muted" style={{fontSize:11.5}}>{l.grade}</span>
                      <span className={`fm-pill ${l.status === "approved" ? "ok" : ""}`}>{l.status}</span>
                    </div>
                    <div style={{fontSize:13, marginTop:4}}>{l.reason}</div>
                    <div className="mono fm-muted" style={{fontSize:11.5, marginTop:2}}>{l.date}</div>
                  </div>
                </div>
                {l.status === "pending" ? (
                  <div style={{display:"flex", gap:8}}>
                    <button
                      className="fm-btn"
                      disabled={acting === l.id}
                      onClick={() => act(l.id, 'decline')}
                    ><I.X size={13}/> Decline</button>
                    <button
                      className="fm-btn primary"
                      disabled={acting === l.id}
                      onClick={() => act(l.id, 'approve')}
                    ><I.Check size={13}/> Approve</button>
                  </div>
                ) : (
                  <span className="fm-muted" style={{fontSize:12}}>
                    {l.status === 'approved' ? 'Approved' : 'Declined'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


export { Enrollment, Reports, Settings, LeaveRequests }
