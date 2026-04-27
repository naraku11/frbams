// admin-misc.jsx — Enrollment, Reports, Settings, Notifications, Leave
import React from 'react'
import { MONTH_BARS, LEAVE } from './data'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'
import { THEMES, getSavedTheme, saveTheme } from './theme'


function Enrollment() {
  return (
    <div className="fm-screen" data-screen-label="Enrollment">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{marginBottom:24}}>
            <div className="fm-eyebrow" style={{marginBottom:8}}>Step 2 of 3 · Capture</div>
            <h1 className="fm-h1">Enroll a new student</h1>
            <div className="fm-muted" style={{marginTop:6}}>
              We'll capture 5 angles to build a robust face template. Templates are encrypted at rest.
            </div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:20}}>
            <div className="fm-card" style={{padding:0, overflow:"hidden", aspectRatio:"4/3", position:"relative", background:"#0A0B08"}}>
              <div style={{
                position:"absolute", inset:0,
                background:`radial-gradient(400px 500px at 50% 60%, oklch(0.40 0.04 90), transparent 70%)`,
              }}/>
              <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{position:"absolute", inset:0}}>
                <ellipse cx="200" cy="135" rx="65" ry="80" fill="#3a3a32"/>
                <path d="M 110 300 Q 110 220 200 215 Q 290 220 290 300 Z" fill="#1f211b"/>
              </svg>

              <div style={{
                position:"absolute", left:"50%", top:"45%", transform:"translate(-50%, -50%)",
                width:240, height:300, border:"2px dashed var(--accent)",
                borderRadius:"50% / 45%",
              }}/>

              <div style={{
                position:"absolute", top:18, left:18,
                display:"inline-flex", gap:6, alignItems:"center",
                padding:"5px 11px", borderRadius:99,
                background:"rgba(0,0,0,0.6)", color:"white",
                fontFamily:"var(--mono)", fontSize:11,
              }}>
                <span style={{width:6, height:6, background:"var(--red)", borderRadius:"50%"}}/>
                REC · 00:04
              </div>

              <div style={{
                position:"absolute", bottom:20, left:20, right:20,
                display:"flex", gap:8,
              }}>
                {["Front","Left ¼","Right ¼","Up","Down"].map((a, i) => (
                  <div key={a} style={{
                    flex:1, padding:"10px 12px", borderRadius:8,
                    background: i < 2 ? "var(--accent)" : "rgba(255,255,255,0.08)",
                    color: i < 2 ? "#000" : "rgba(255,255,255,0.7)",
                    fontFamily:"var(--mono)", fontSize:11, fontWeight:600,
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                  }}>
                    <span>{a}</span>
                    {i < 2 ? <I.Check size={13} /> : i === 2 ? <span style={{width:6, height:6, background:"white", borderRadius:"50%"}}/> : null}
                  </div>
                ))}
              </div>
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:16}}>
              <div className="fm-card">
                <h3 className="fm-h3" style={{marginBottom:14}}>Student details</h3>
                <div style={{display:"grid", gap:12}}>
                  <div>
                    <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Full name</div>
                    <input className="fm-input" defaultValue="Sana Khoury" />
                  </div>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                    <div>
                      <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Student ID</div>
                      <input className="fm-input mono" defaultValue="S2436" />
                    </div>
                    <div>
                      <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Grade</div>
                      <select className="fm-input"><option>11B</option></select>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Guardian email</div>
                    <input className="fm-input" defaultValue="t.khoury@example.com" />
                  </div>
                </div>
              </div>

              <div className="fm-card">
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
                  <h3 className="fm-h3">Consent & privacy</h3>
                  <span className="fm-pill ok">Signed</span>
                </div>
                <div className="fm-muted" style={{fontSize:12, lineHeight:1.5}}>
                  Guardian has signed the biometric consent form (v3.2, Apr 2026). Template stored as encrypted vector — no raw image is retained after enrollment.
                </div>
              </div>

              <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
                <button className="fm-btn">Cancel</button>
                <button className="fm-btn primary">Capture next angle <I.Arrow size={13}/></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Reports() {
  const courses = ["Calculus II","Org Chem","World Lit","Linear Algebra","Macro Econ","Intro CS","French III"]
  return (
    <div className="fm-screen" data-screen-label="Reports">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>Reports · April 2026</div>
              <h1 className="fm-h1">Monthly attendance</h1>
            </div>
            <div style={{display:"flex", gap:8}}>
              <button className="fm-btn"><I.Cal size={14}/> April 2026</button>
              <button className="fm-btn primary"><I.Export size={14}/> Generate PDF</button>
            </div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16, marginBottom:16}}>
            <div className="fm-card">
              <div className="fm-eyebrow">Avg attendance</div>
              <div className="fm-stat-num xl" style={{marginTop:10}}>91.4<span style={{fontSize:28, color:"var(--fg-3)"}}>%</span></div>
              <div className="fm-muted mono" style={{fontSize:11.5, marginTop:4}}>+2.1% vs March</div>
            </div>
            <div className="fm-card">
              <div className="fm-eyebrow">Perfect attendance</div>
              <div className="fm-stat-num xl" style={{marginTop:10}}>184</div>
              <div className="fm-muted mono" style={{fontSize:11.5, marginTop:4}}>33.6% of students</div>
            </div>
            <div className="fm-card">
              <div className="fm-eyebrow">Total absences</div>
              <div className="fm-stat-num xl" style={{marginTop:10}}>438</div>
              <div className="fm-muted mono" style={{fontSize:11.5, marginTop:4}}>72 unexcused</div>
            </div>
          </div>

          <div className="fm-card" style={{marginBottom:16}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:18}}>
              <h2 className="fm-h2">Daily trend</h2>
              <div className="fm-tabs">
                <div className="fm-tab active">Attendance %</div>
                <div className="fm-tab">Absences</div>
              </div>
            </div>
            <div style={{height:200, display:"flex", alignItems:"flex-end", gap:3}}>
              {MONTH_BARS.map((b, i) => (
                <div key={i} style={{
                  flex:1,
                  height: b.v + "%",
                  background: b.v < 80 ? "var(--amber)" : "var(--accent)",
                  borderRadius:"3px 3px 0 0",
                }} title={`Apr ${b.d}: ${b.v}%`}/>
              ))}
            </div>
            <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontFamily:"var(--mono)", fontSize:10.5, color:"var(--fg-3)"}}>
              <span>Apr 1</span><span>Apr 15</span><span>Apr 30</span>
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
                {courses.map((c, i) => {
                  const pct = 78 + ((i*13)%18)
                  return (
                    <tr key={c}>
                      <td style={{paddingLeft:20, fontWeight:500}}>{c}</td>
                      <td className="mono">{28 + i*2}</td>
                      <td className="mono">{pct}%</td>
                      <td className="mono">{4 + (i%5)}</td>
                      <td className="mono">{2 + (i%4)}</td>
                      <td>
                        <div style={{height:6, background:"var(--line-2)", borderRadius:99, overflow:"hidden"}}>
                          <div style={{width:pct+"%", height:"100%", background: pct < 85 ? "var(--amber)" : "var(--accent)"}}/>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom: 4 }}>Match confidence threshold</h3>
        <div className="fm-muted" style={{ fontSize: 12, marginBottom: 18 }}>
          Below this confidence, the system asks for a PIN fallback.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <input type="range" min="80" max="99.9" step="0.1" defaultValue="96"
            style={{ flex: 1, accentColor: 'var(--accent)' }} />
          <div className="mono" style={{ fontSize: 18, fontWeight: 600, width: 60, textAlign: 'right' }}>96.0%</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)' }}>
          <span>Permissive</span><span>Recommended</span><span>Strict</span>
        </div>
      </div>
      <div className="fm-card" style={{ padding: 0 }}>
        {[
          ['Liveness detection',    'Detect printed photos and screen replays',           'on'],
          ['Mask tolerance',        'Allow recognition with surgical/cloth masks',        'on'],
          ['Multi-angle template',  'Use 5-angle template for outdoor cameras',           'on'],
          ['Auto re-train',         'Refresh templates monthly from passing frames',      'off'],
          ['Anonymous metrics',     'Send aggregate accuracy data to FRBAMS Cloud',      'off'],
        ].map((row, i, arr) => (
          <div key={i} style={{
            padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: i < arr.length - 1 ? '1px solid var(--line-2)' : 'none',
          }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13.5 }}>{row[0]}</div>
              <div className="fm-muted" style={{ fontSize: 12, marginTop: 2 }}>{row[1]}</div>
            </div>
            <div className={`fm-toggle ${row[2] === 'on' ? 'on' : ''}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsCameras() {
  return (
    <div className="fm-card">
      <h3 className="fm-h3" style={{ marginBottom: 14 }}>Camera network</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          ['Main · A1',    'Online',        '99%'],
          ['North · B2',   'Online',        '98%'],
          ['East · C1',    'Recalibrating', '—'],
          ['Library · D2', 'Online',        '97%'],
        ].map(([n, s, q]) => (
          <div key={n} style={{
            padding: 12, border: '1px solid var(--line)', borderRadius: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div>
              <div className="mono fm-muted" style={{ fontSize: 11, marginTop: 2 }}>{s}</div>
            </div>
            <div className="mono" style={{
              fontSize: 13,
              color: s === 'Online' ? 'oklch(0.5 0.16 145)' : 'var(--amber)',
            }}>{q}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const SETTINGS_TABS = [
  { id: 'appearance',   label: 'Appearance' },
  { id: 'recognition',  label: 'Recognition Engine' },
  { id: 'cameras',      label: 'Camera Network' },
  { id: 'privacy',      label: 'Privacy & Retention' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'roles',        label: 'Roles & Access' },
]

function Settings() {
  const [tab, setTab] = React.useState('appearance')

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
              {tab === 'appearance'  && <SettingsAppearance />}
              {tab === 'recognition' && <SettingsRecognition />}
              {tab === 'cameras'     && <SettingsCameras />}
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
              <div className="fm-tab active">Pending <span className="mono" style={{marginLeft:6}}>2</span></div>
              <div className="fm-tab">Approved</div>
              <div className="fm-tab">Declined</div>
            </div>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {LEAVE.map((l, i) => (
              <div key={i} className="fm-card" style={{display:"grid", gridTemplateColumns:"1fr auto", gap:18, alignItems:"center"}}>
                <div style={{display:"flex", gap:14, alignItems:"center"}}>
                  <div className="fm-avatar lg" style={{background:`oklch(0.86 0.14 ${(i*73)%360})`}}>
                    {l.name.split(" ").map(s=>s[0]).join("")}
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
                    <button className="fm-btn"><I.X size={13}/> Decline</button>
                    <button className="fm-btn primary"><I.Check size={13}/> Approve</button>
                  </div>
                ) : (
                  <span className="fm-muted" style={{fontSize:12}}>Reviewed by Dr. Wexler</span>
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
