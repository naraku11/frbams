// extras.jsx — Subjects/timetable + offline queue screens
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'


function Subjects() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.courses().then(setCourses).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className=”fm-screen” data-screen-label=”Subjects”>
      <Sidebar />
      <div className=”fm-main”>
        <TopBar />
        <div className=”fm-content”>
          <div style={{display:”flex”, justifyContent:”space-between”, alignItems:”flex-end”, marginBottom:24}}>
            <div>
              <div className=”fm-eyebrow” style={{marginBottom:8}}>Courses · Current term</div>
              <h1 className=”fm-h1”>Subjects & timetable</h1>
              <div className=”fm-muted” style={{marginTop:6}}>
                {loading ? 'Loading…' : `${courses.length} course${courses.length !== 1 ? 's' : ''} active`}
              </div>
            </div>
            <button className=”fm-btn primary” onClick={() => navigate('/courses')}><I.Plus size={14}/> Add subject</button>
          </div>

          {loading ? (
            <div className=”fm-card” style={{textAlign:'center', color:'var(--fg-3)', padding:48}}>Loading courses…</div>
          ) : courses.length === 0 ? (
            <div className=”fm-card” style={{textAlign:'center', color:'var(--fg-3)', padding:48}}>
              No courses yet. <span style={{cursor:'pointer', color:'var(--accent)'}} onClick={() => navigate('/courses')}>Add your first course →</span>
            </div>
          ) : (
            <div style={{display:”grid”, gridTemplateColumns:”repeat(3, 1fr)”, gap:12}}>
              {courses.map(c => {
                const hue = c.colorHue ?? 145
                return (
                  <div key={c.id} className=”fm-card” style={{padding:18}}>
                    <div style={{display:”flex”, justifyContent:”space-between”, alignItems:”flex-start”}}>
                      <div>
                        <div className=”mono” style={{fontSize:11, color:`oklch(0.50 0.14 ${hue})`, fontWeight:600}}>{c.code}</div>
                        <div style={{fontSize:15, fontWeight:600, marginTop:3}}>{c.name}</div>
                        <div className=”fm-muted” style={{fontSize:12, marginTop:2}}>{c.teacher ?? '—'}</div>
                      </div>
                      <div style={{
                        width:36, height:36, borderRadius:9,
                        background:`oklch(0.94 0.06 ${hue})`,
                        color:`oklch(0.45 0.14 ${hue})`,
                        display:”grid”, placeItems:”center”,
                        fontFamily:”var(--mono)”, fontSize:11, fontWeight:600,
                      }}>{c.enrolled ?? 0}</div>
                    </div>
                    <div style={{display:”flex”, justifyContent:”space-between”, marginTop:14, fontSize:11.5, color:”var(--fg-3)”}}>
                      <span className=”mono”>{c.enrolled ?? 0} enrolled</span>
                      <span className=”mono”>{c.room ?? '—'}</span>
                    </div>
                    {c.department && (
                      <div className=”fm-muted” style={{fontSize:11, marginTop:6}}>{c.department} · {c.term}</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Offline kiosk + offline queue
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function KioskOffline() {
  const queued = [
    { name:"Maya Park",      id:"S2400", time:"09:42:11", conf:99.6 },
    { name:"Liam Bennett",   id:"S2401", time:"09:42:48", conf:98.9 },
    { name:"Zara Singh",     id:"S2402", time:"09:43:02", conf:97.4 },
    { name:"Noah Hassan",    id:"S2403", time:"09:43:31", conf:99.1 },
    { name:"Aisha MÃ¼ller",   id:"S2404", time:"09:44:09", conf:98.0 },
  ];
  return (
    <div className="fm-screen" data-screen-label="Kiosk Â· Offline mode" style={{background:"#0A0B08"}}>
      <div style={{flex:1, position:"relative", overflow:"hidden"}}>
        {/* Faint feed */}
        <div style={{position:"absolute", inset:0, background:`radial-gradient(900px 600px at 50% 80%, #14160f, #0A0B08 70%)`}}/>
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style={{position:"absolute", inset:0, opacity:0.5}}>
          <ellipse cx="400" cy="280" rx="100" ry="125" fill="#2a2a25"/>
          <path d="M 260 600 Q 260 430 400 420 Q 540 430 540 600 Z" fill="#1a1c17"/>
        </svg>

        {/* Top status */}
        <div style={{position:"absolute", top:0, left:0, right:0, padding:"22px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", color:"rgba(255,255,255,0.85)", fontFamily:"var(--mono)", fontSize:12}}>
          <div style={{display:"flex", alignItems:"center", gap:10, color:"white"}}>
            <div className="fm-brand-mark" style={{background:"var(--accent)", color:"#000", fontSize:10, fontWeight:800}}>UV</div>
            <span style={{fontFamily:"var(--display)", fontSize:15, fontWeight:600, letterSpacing:"-0.02em"}}>FRBAMS Kiosk</span>
          </div>
          <div style={{display:"flex", gap:14, alignItems:"center"}}>
            <span>MAIN ENTRANCE Â· A1</span>
            <span>09:44:11</span>
            <span style={{
              display:"inline-flex", alignItems:"center", gap:6,
              padding:"4px 10px", borderRadius:99,
              border:"1px solid var(--amber)", color:"var(--amber)",
            }}>
              <span style={{width:6, height:6, background:"var(--amber)", borderRadius:"50%"}}/>
              OFFLINE Â· queue 47
            </span>
          </div>
        </div>

        {/* Center reticle */}
        <div style={{position:"absolute", left:"50%", top:"42%", transform:"translate(-50%, -50%)", width:280, height:280, borderRadius:"50%", boxShadow:"0 0 0 2px var(--accent), 0 0 0 12px rgba(0,0,0,0.6)"}}/>

        {/* Greeting */}
        <div style={{position:"absolute", left:"50%", top:"42%", transform:"translate(-50%, -50%)", textAlign:"center", color:"white", width:340}}>
          <div style={{fontFamily:"var(--display)", fontSize:42, fontWeight:600, letterSpacing:"-0.03em", marginTop:130}}>
            Hi Maya.
          </div>
          <div style={{fontFamily:"var(--mono)", fontSize:11, opacity:0.6, marginTop:6}}>
            Saved locally Â· will sync when network returns
          </div>
        </div>

        {/* Bottom queue panel */}
        <div style={{
          position:"absolute", bottom:24, left:24, right:24,
          background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:14, padding:"16px 18px", color:"white",
        }}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/></svg>
              <div>
                <div style={{fontSize:13, fontWeight:600}}>Network unavailable â€” running on local cache</div>
                <div style={{fontSize:11, opacity:0.5, marginTop:2, fontFamily:"var(--mono)"}}>Last sync 09:18 Â· 47 check-ins queued Â· all data encrypted on-device</div>
              </div>
            </div>
            <button className="fm-btn primary"><I.Wifi size={14}/> Retry sync</button>
          </div>
          <div style={{display:"flex", gap:6, overflow:"hidden"}}>
            {queued.map((q, i) => (
              <div key={i} style={{
                flex:1, padding:"8px 10px",
                background:"rgba(255,255,255,0.04)", borderRadius:8,
                border:"1px solid rgba(255,255,255,0.06)",
                display:"flex", alignItems:"center", gap:8, minWidth:0,
              }}>
                <div className="fm-avatar sm" style={{background:`oklch(0.86 0.14 ${(i*73)%360})`, color:"#000"}}>{q.name.split(" ").map(s=>s[0]).join("")}</div>
                <div style={{minWidth:0, flex:1}}>
                  <div style={{fontSize:11, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{q.name.split(" ")[0]}</div>
                  <div className="mono" style={{fontSize:10, opacity:0.5}}>{q.time.slice(0,5)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin: Sync queue / offline diagnostics
function OfflineSync() {
  const [queue, setQueue] = useState(null)
  const [toast, setToast] = useState(false)
  const [offlineToggles, setOfflineToggles] = useState(() => {
    try { return JSON.parse(localStorage.getItem(‘frbams_offline_toggles’) || ‘null’) || [true, true, true, true] }
    catch { return [true, true, true, true] }
  })

  const reload = () => {
    api.offlineQueue().then(setQueue).catch(() => setQueue({}))
  }
  useEffect(reload, [])

  const forceSync = () => {
    reload()
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  const toggleOffline = (i) => {
    const next = offlineToggles.map((v, idx) => idx === i ? !v : v)
    setOfflineToggles(next)
    localStorage.setItem(‘frbams_offline_toggles’, JSON.stringify(next))
  }

  const syncs = queue?.recentSyncs ?? []
  const devices = queue?.devices ?? []

  return (
    <div className=”fm-screen” data-screen-label=”Offline sync”>
      <Sidebar />
      <div className=”fm-main”>
        <TopBar />
        <div className=”fm-content”>
          {toast && (
            <div style={{
              position:’fixed’, top:20, right:20, zIndex:999,
              background:’var(--fg)’, color:’var(--bg)’,
              padding:’12px 18px’, borderRadius:10, fontSize:13,
              boxShadow:’0 4px 16px rgba(0,0,0,0.2)’,
            }}>
              Sync request acknowledged — devices will sync when online.
            </div>
          )}

          <div style={{display:”flex”, justifyContent:”space-between”, alignItems:”flex-end”, marginBottom:24}}>
            <div>
              <div className=”fm-eyebrow” style={{marginBottom:8}}>Settings · Reliability</div>
              <h1 className=”fm-h1”>Offline & sync</h1>
              <div className=”fm-muted” style={{marginTop:6}}>Devices keep working without internet. Queued check-ins sync when reconnected.</div>
            </div>
            <button className=”fm-btn primary” onClick={forceSync}><I.Wifi size={14}/> Force sync now</button>
          </div>

          <div style={{display:”grid”, gridTemplateColumns:”repeat(4, 1fr)”, gap:16, marginBottom:16}}>
            <div className=”fm-card”>
              <div className=”fm-eyebrow”>Devices online</div>
              <div className=”fm-stat-num” style={{marginTop:8}}>{queue?.devicesOnline ?? ‘—‘}</div>
              <div className=”mono fm-muted” style={{fontSize:11, marginTop:4}}>active in last 5 min</div>
            </div>
            <div className=”fm-card”>
              <div className=”fm-eyebrow”>Queued events</div>
              <div className=”fm-stat-num” style={{marginTop:8, color: (queue?.totalQueued ?? 0) > 0 ? “var(--amber)” : “var(--fg)”}}>
                {queue?.totalQueued ?? ‘—‘}
              </div>
              <div className=”mono fm-muted” style={{fontSize:11, marginTop:4}}>awaiting sync</div>
            </div>
            <div className=”fm-card”>
              <div className=”fm-eyebrow”>Devices tracked</div>
              <div className=”fm-stat-num” style={{marginTop:8}}>{devices.length || ‘—‘}</div>
              <div className=”mono fm-muted” style={{fontSize:11, marginTop:4}}>{devices.filter(d => d.queued > 0).length} with queue</div>
            </div>
            <div className=”fm-card”>
              <div className=”fm-eyebrow”>Recent syncs</div>
              <div className=”fm-stat-num” style={{marginTop:8, fontSize:30}}>{syncs.length}</div>
              <div className=”mono fm-muted” style={{fontSize:11, marginTop:4}}>in log</div>
            </div>
          </div>

          <div style={{display:”grid”, gridTemplateColumns:”1fr 1fr”, gap:16, marginBottom:16}}>
            <div className=”fm-card”>
              <h3 className=”fm-h3” style={{marginBottom:14}}>Offline behavior</h3>
              <div style={{display:”flex”, flexDirection:”column”, gap:14}}>
                {[
                  [“Keep recognizing offline”,”Cache last 4 weeks of templates on each device”],
                  [“Auto-retry sync”,”Every 30 seconds when network resumes”],
                  [“Local fallback PIN”,”Allow 4-digit PIN if face unrecognized”],
                  [“Conflict resolution”,”Prefer earliest timestamp on duplicate check-ins”],
                ].map((row, i) => (
                  <div key={i} style={{display:”flex”, justifyContent:”space-between”, alignItems:”center”, paddingBottom: i < 3 ? 14 : 0, borderBottom: i < 3 ? “1px solid var(--line-2)” : “none”}}
                    onClick={() => toggleOffline(i)}>
                    <div>
                      <div style={{fontSize:13, fontWeight:500}}>{row[0]}</div>
                      <div className=”fm-muted” style={{fontSize:11.5, marginTop:2}}>{row[1]}</div>
                    </div>
                    <div className={`fm-toggle ${offlineToggles[i] ? “on” : “”}`}/>
                  </div>
                ))}
              </div>
            </div>

            <div className=”fm-card”>
              <h3 className=”fm-h3” style={{marginBottom:14}}>Device queue status</h3>
              {devices.length === 0 ? (
                <div className=”fm-muted” style={{fontSize:13}}>No device data available.</div>
              ) : (
                <div style={{display:”flex”, flexDirection:”column”, gap:10}}>
                  {devices.map((d, i) => (
                    <div key={i} style={{display:”flex”, justifyContent:”space-between”, alignItems:”center”, padding:”10px 12px”, background:”var(--line-2)”, borderRadius:8}}>
                      <div>
                        <div style={{fontSize:13, fontWeight:500}}>{d.label}</div>
                        <div className=”mono fm-muted” style={{fontSize:11, marginTop:1}}>{d.type} · {d.queued} queued</div>
                      </div>
                      <div className=”mono fm-muted” style={{fontSize:11}}>
                        {d.lastSync ? new Date(d.lastSync).toLocaleTimeString([], {hour:’2-digit’, minute:’2-digit’}) : ‘—‘}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className=”fm-card” style={{padding:0}}>
            <div style={{padding:”18px 20px 12px”, display:”flex”, justifyContent:”space-between”, alignItems:”baseline”}}>
              <h2 className=”fm-h2”>Recent syncs</h2>
              <span className=”fm-muted mono” style={{fontSize:11.5}}>last {syncs.length}</span>
            </div>
            {syncs.length === 0 ? (
              <div style={{padding:32, textAlign:’center’, color:’var(--fg-3)’, fontSize:13}}>No sync history.</div>
            ) : (
              <table className=”fm-table”>
                <thead>
                  <tr>
                    <th style={{paddingLeft:20}}>Device</th>
                    <th>Started</th>
                    <th>Synced</th>
                    <th>Conflicts</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {syncs.map((s, i) => (
                    <tr key={i}>
                      <td style={{paddingLeft:20}}>
                        <div style={{fontWeight:500}}>{s.device}</div>
                        <div className=”mono fm-muted” style={{fontSize:11}}>{s.deviceType}</div>
                      </td>
                      <td className=”mono”>{s.startedAt ? new Date(s.startedAt).toLocaleTimeString([], {hour:’2-digit’, minute:’2-digit’}) : ‘—‘}</td>
                      <td className=”mono”>{s.synced ?? 0}</td>
                      <td className=”mono”>{s.conflicts ?? 0}</td>
                      <td>
                        <span className={`fm-pill ${s.status === ‘completed’ ? ‘ok’ : s.status === ‘failed’ ? ‘ab’ : ‘late’}`}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile offline indicator screen â€” what students see when they open the app offline
function MobileOffline() {
  return (
    <div className="phone-screen">
      <div style={{padding:"50px 22px 0", flexShrink:0}}>
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"10px 14px", borderRadius:99,
          background:"var(--amber-soft)", color:"oklch(0.4 0.10 70)",
        }}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M2 9a16 16 0 0 1 20 0M5 13a11 11 0 0 1 5 -3"/><path d="M21 4 L3 22"/></svg>
            <span style={{fontSize:12.5, fontWeight:600}}>You're offline</span>
          </div>
          <span className="mono" style={{fontSize:11}}>retry Â· 0:42</span>
        </div>
      </div>

      <div style={{padding:"22px", flex:1, overflow:"auto"}}>
        <div className="fm-eyebrow" style={{marginBottom:6}}>Mon, Apr 26</div>
        <h1 style={{fontFamily:"var(--display)", fontSize:30, fontWeight:600, letterSpacing:"-0.03em", margin:0}}>
          You can still<br/>check in.
        </h1>
        <div className="fm-muted" style={{fontSize:13, marginTop:8}}>
          Your face template is cached on this device. We'll save your check-in locally and sync it once you're back online.
        </div>

        <div style={{
          marginTop:20, padding:16, borderRadius:14,
          background:"var(--card)", border:"1px solid var(--line)",
        }}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
            <div className="fm-eyebrow">Pending on this device</div>
            <span className="fm-pill late">2 queued</span>
          </div>
          {[
            ["09:42", "Calculus II", "captured"],
            ["11:00", "World Literature", "captured"],
          ].map(([t, c, s], i) => (
            <div key={i} style={{
              padding:"10px 0", borderTop: i ? "1px solid var(--line-2)" : "none",
              display:"flex", alignItems:"center", gap:12,
            }}>
              <div style={{
                width:32, height:32, borderRadius:9,
                background:"var(--amber-soft)", color:"oklch(0.4 0.10 70)",
                display:"grid", placeItems:"center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5l3 2"/></svg>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13.5, fontWeight:500}}>{c}</div>
                <div className="mono fm-muted" style={{fontSize:11}}>{t} Â· {s} locally</div>
              </div>
              <I.Check size={14} stroke={2}/>
            </div>
          ))}
        </div>

        <button style={{
          width:"100%", marginTop:16, padding:"16px", borderRadius:14, border:"none",
          background:"var(--fg)", color:"var(--bg)",
          fontSize:15, fontWeight:600, fontFamily:"var(--display)",
          display:"flex", justifyContent:"center", alignItems:"center", gap:10,
          cursor:"pointer", letterSpacing:"-0.01em",
        }}>
          <I.Face size={18}/> Check in offline
        </button>
        <button style={{
          width:"100%", marginTop:8, padding:"12px", borderRadius:14,
          border:"1px solid var(--line)", background:"transparent", color:"var(--fg-2)",
          fontSize:13, cursor:"pointer",
        }}>Try again to connect</button>
      </div>
    </div>
  );
}




export { Subjects, KioskOffline, OfflineSync, MobileOffline };

// Course/subject management — add a new course
const TERMS = ['2024-2025 Term 1', '2024-2025 Term 2', '2024-2025 Full Year', 'Semester 1', 'Semester 2']

function CourseManager() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', code: '', term: TERMS[0], departmentId: '', teacherId: '', roomId: '' })
  const [teachers, setTeachers] = useState([])
  const [depts,    setDepts]    = useState([])
  const [rooms,    setRooms]    = useState([])
  const [saving,   setSaving]   = useState(false)
  const [done,     setDone]     = useState(null)
  const [error,    setError]    = useState('')

  useEffect(() => {
    Promise.all([api.teachers(), api.departments(), api.rooms()])
      .then(([t, d, r]) => { setTeachers(t); setDepts(d); setRooms(r) })
      .catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = () => {
    if (!form.name.trim() || !form.code.trim()) {
      setError('Course name and code are required.'); return
    }
    setSaving(true); setError('')
    api.createCourse({
      name:         form.name.trim(),
      code:         form.code.trim(),
      term:         form.term,
      departmentId: form.departmentId || undefined,
      teacherId:    form.teacherId    || undefined,
      roomId:       form.roomId       || undefined,
    })
      .then(res => setDone(res))
      .catch(e => setError(e.message))
      .finally(() => setSaving(false))
  }

  if (done) {
    return (
      <div className=”fm-screen” data-screen-label=”Course Manager”>
        <Sidebar />
        <div className=”fm-main”>
          <TopBar />
          <div className=”fm-content”>
            <div className=”fm-card” style={{maxWidth:480, textAlign:'center', padding:48}}>
              <div style={{fontSize:32, marginBottom:16}}>✓</div>
              <h2 className=”fm-h2” style={{marginBottom:8}}>Course created</h2>
              <div className=”fm-muted” style={{marginBottom:24}}><b>{done.name}</b> · <span className=”mono”>{done.code}</span></div>
              <div style={{display:'flex', gap:8, justifyContent:'center'}}>
                <button className=”fm-btn” onClick={() => { setDone(null); setForm({ name:'', code:'', term:TERMS[0], departmentId:'', teacherId:'', roomId:'' }) }}>Create another</button>
                <button className=”fm-btn primary” onClick={() => navigate('/subjects')}>View subjects →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className=”fm-screen” data-screen-label=”Course Manager”>
      <Sidebar />
      <div className=”fm-main”>
        <TopBar />
        <div className=”fm-content”>
          <div style={{display:”flex”, justifyContent:”space-between”, alignItems:”flex-end”, marginBottom:24}}>
            <div>
              <div className=”fm-eyebrow” style={{marginBottom:8}}>Courses · New</div>
              <h1 className=”fm-h1”>Add a course</h1>
              <div className=”fm-muted” style={{marginTop:6}}>Define the course, assign a teacher and room, then start tracking attendance.</div>
            </div>
            <div style={{display:”flex”, gap:8}}>
              <button className=”fm-btn” onClick={() => navigate('/subjects')}>Cancel</button>
              <button className=”fm-btn primary” disabled={saving} onClick={submit}>
                {saving ? 'Creating…' : <><I.Check size={14}/> Create course</>}
              </button>
            </div>
          </div>

          {error && (
            <div style={{marginBottom:16, padding:'10px 14px', borderRadius:8, background:'color-mix(in oklch, var(--red) 12%, var(--card))', color:'var(--red)', fontSize:12.5}}>
              {error}
            </div>
          )}

          <div style={{display:”grid”, gridTemplateColumns:”1.4fr 1fr”, gap:20}}>
            <div style={{display:”flex”, flexDirection:”column”, gap:16}}>
              <div className=”fm-card”>
                <h3 className=”fm-h3” style={{marginBottom:14}}>Course details</h3>
                <div style={{display:”grid”, gap:14}}>
                  <div style={{display:”grid”, gridTemplateColumns:”2fr 1fr”, gap:12}}>
                    <div>
                      <div style={{fontSize:11.5, color:”var(--fg-3)”, marginBottom:5}}>Course name <span style={{color:”var(--red)”}}>*</span></div>
                      <input className=”fm-input” value={form.name} onChange={e => set('name', e.target.value)} placeholder=”e.g. Advanced Biology” />
                    </div>
                    <div>
                      <div style={{fontSize:11.5, color:”var(--fg-3)”, marginBottom:5}}>Code <span style={{color:”var(--red)”}}>*</span></div>
                      <input className=”fm-input mono” value={form.code} onChange={e => set('code', e.target.value)} placeholder=”BIO 220” />
                    </div>
                  </div>
                  <div style={{display:”grid”, gridTemplateColumns:”1fr 1fr”, gap:12}}>
                    <div>
                      <div style={{fontSize:11.5, color:”var(--fg-3)”, marginBottom:5}}>Department</div>
                      <select className=”fm-input” value={form.departmentId} onChange={e => set('departmentId', e.target.value)}>
                        <option value=””>No department</option>
                        {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{fontSize:11.5, color:”var(--fg-3)”, marginBottom:5}}>Term</div>
                      <select className=”fm-input” value={form.term} onChange={e => set('term', e.target.value)}>
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{display:”flex”, flexDirection:”column”, gap:16}}>
              <div className=”fm-card”>
                <h3 className=”fm-h3” style={{marginBottom:14}}>Teacher</h3>
                <div style={{fontSize:11.5, color:”var(--fg-3)”, marginBottom:5}}>Assign teacher</div>
                <select className=”fm-input” value={form.teacherId} onChange={e => set('teacherId', e.target.value)}>
                  <option value=””>Unassigned</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className=”fm-card”>
                <h3 className=”fm-h3” style={{marginBottom:14}}>Room</h3>
                <div style={{fontSize:11.5, color:”var(--fg-3)”, marginBottom:5}}>Assign room</div>
                <select className=”fm-input” value={form.roomId} onChange={e => set('roomId', e.target.value)}>
                  <option value=””>No room</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}{r.building ? ` · ${r.building}` : ''}</option>)}
                </select>
              </div>

              <div className=”fm-card” style={{padding:14, background:”var(--line-2)”, borderStyle:”dashed”}}>
                <div className=”fm-eyebrow” style={{marginBottom:8}}>Preview · timetable card</div>
                <div style={{
                  padding:”10px 12px”, borderRadius:8,
                  background:`oklch(0.94 0.05 145)`,
                  borderLeft:`3px solid oklch(0.65 0.16 145)`,
                }}>
                  <div style={{fontSize:12.5, fontWeight:600, color:`oklch(0.30 0.12 145)`}}>{form.name || 'Course name'}</div>
                  <div className=”mono” style={{fontSize:10.5, color:`oklch(0.40 0.10 145)`, marginTop:2}}>
                    {form.code || 'CODE'} · {rooms.find(r => r.id == form.roomId)?.name ?? 'No room'} · {teachers.find(t => t.id == form.teacherId)?.name?.split(' ').slice(-1)[0] ?? 'Unassigned'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CourseManager };
