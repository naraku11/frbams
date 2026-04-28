// admin-dashboard.jsx — main analytics dashboard
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'

export function Dashboard({ layout = "sidebar" }) {
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

  const Stat = ({ eyebrow, num, sub, delta, dir = "up" }) => (
    <div className="fm-card" style={{flex:1, minWidth:0}}>
      <div className="fm-eyebrow">{eyebrow}</div>
      <div style={{display:"flex", alignItems:"baseline", gap:10, marginTop:8}}>
        <div className="fm-stat-num">{num}</div>
        {delta && <div className={`fm-delta ${dir}`}>{dir === "up" ? "↗" : "↘"} {delta}</div>}
      </div>
      <div className="fm-muted mono" style={{fontSize:11.5, marginTop:6}}>{sub}</div>
    </div>
  );

  return (
    <div className="fm-screen" data-screen-label="Admin Dashboard">
      {layout === "sidebar" ? <Sidebar /> : null}
      <div className="fm-main">
        {layout === "topnav" ? <Sidebar layout="topnav" /> : <TopBar />}
        <div className="fm-content">
          <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:24}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>{data?.date ?? '—'}</div>
              <h1 className="fm-h1">Attendance overview</h1>
              <div className="fm-muted" style={{marginTop:6, fontSize:14}}>
                {stats.present ?? '—'} of {stats.total ?? '—'} students checked in.{stats.late ? ` ${stats.late} marked late.` : ''}
              </div>
            </div>
            <div style={{display:"flex", gap:8}}>
              <button className="fm-btn" onClick={exportDay}><I.Export size={14}/> Export day</button>
              <button className="fm-btn primary" onClick={() => navigate('/kiosk')}><I.Camera size={14}/> Open kiosk</button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:16}}>
            <Stat eyebrow="Present today" num={stats.present ?? '—'} sub={stats.total ? `${stats.rate ?? 0}% of enrolled` : 'Loading…'} />
            <Stat eyebrow="Late arrivals" num={stats.late ?? '—'} sub="marked late" dir="dn" />
            <Stat eyebrow="Absent" num={stats.absent ?? '—'} sub="not checked in" dir="dn" />
            <Stat eyebrow="Total enrolled" num={stats.total ?? '—'} sub="active students" />
          </div>

          {/* Two-column charts */}
          <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16}}>
            <div className="fm-card">
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:18}}>
                <div>
                  <h2 className="fm-h2">This week</h2>
                  <div className="fm-muted" style={{fontSize:12, marginTop:4}}>Daily attendance · last 7 days</div>
                </div>
              </div>
              <div style={{height:180, display:"flex", alignItems:"flex-end", gap:14, paddingTop:10}}>
                {bars.map((b, i) => (
                  <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8}}>
                    <div style={{flex:1, width:"100%", display:"flex", alignItems:"flex-end"}}>
                      <div style={{
                        width:"100%",
                        height: b.off ? 6 : `${b.v || 2}%`,
                        background: b.off ? "var(--line)" : (i === bars.length - 1 ? "var(--accent)" : "var(--fg)"),
                        borderRadius:"6px 6px 0 0",
                        position:"relative",
                      }}>
                        {!b.off && i === bars.length - 1 && (
                          <div className="mono" style={{
                            position:"absolute", top:-22, left:"50%", transform:"translateX(-50%)",
                            fontSize:11, color:"var(--fg)"
                          }}>{b.v}%</div>
                        )}
                      </div>
                    </div>
                    <div className="mono" style={{fontSize:11, color: i === bars.length - 1 ? "var(--fg)" : "var(--fg-3)"}}>{b.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fm-card">
              <h2 className="fm-h2">By grade</h2>
              <div className="fm-muted" style={{fontSize:12, marginTop:4, marginBottom:18}}>Now</div>
              <div style={{display:"flex", flexDirection:"column", gap:14}}>
                {byGrade.map(r => {
                  const pct = r.n > 0 ? r.p / r.n : 0;
                  return (
                    <div key={r.g}>
                      <div style={{display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:6}}>
                        <span style={{fontWeight:500}}>{r.g}</span>
                        <span className="mono fm-muted">{r.p}/{r.n}</span>
                      </div>
                      <div style={{height:6, background:"var(--line-2)", borderRadius:99, overflow:"hidden"}}>
                        <div style={{
                          width: (pct*100)+"%", height:"100%",
                          background: pct < 0.8 ? "var(--amber)" : "var(--accent)",
                          borderRadius:99,
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent + alerts */}
          <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:16}}>
            <div className="fm-card" style={{padding:0}}>
              <div style={{padding:"18px 20px 12px", display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
                <div>
                  <h2 className="fm-h2">Recent check-ins</h2>
                  <div className="fm-muted" style={{fontSize:12, marginTop:4}}>Live · today</div>
                </div>
                <a className="mono" style={{fontSize:12, color:"var(--fg-3)", cursor:"pointer"}} onClick={() => navigate('/log')}>View all →</a>
              </div>
              <table className="fm-table">
                <thead>
                  <tr>
                    <th style={{paddingLeft:20}}>Student</th>
                    <th>Class</th>
                    <th>Time</th>
                    <th>Confidence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.slice(0, 7).map(r => (
                    <tr key={r.id}>
                      <td style={{paddingLeft:20}}>
                        <div style={{display:"flex", alignItems:"center", gap:10}}>
                          <div className="fm-avatar sm" style={{background: `oklch(0.86 0.14 ${(parseInt((r.studentCode ?? '').replace(/\D/g,'')) * 37) % 360})`}}>
                            {(r.name ?? '').split(" ").map(s => s[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div style={{fontWeight:500}}>{r.name}</div>
                            <div className="mono fm-muted" style={{fontSize:11}}>{r.studentCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="fm-muted">{r.course ?? r.grade}</td>
                      <td className="mono">{r.time}</td>
                      <td className="mono">{r.conf != null ? (r.conf * 100).toFixed(1) + '%' : '—'}</td>
                      <td>
                        <span className={`fm-pill ${r.status === "present" ? "ok" : r.status === "late" ? "late" : "ab"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="fm-card">
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
                <h2 className="fm-h2">Alerts</h2>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:14}}>
                {alerts.length === 0 ? (
                  <div className="fm-muted" style={{fontSize:12.5}}>No alerts today.</div>
                ) : alerts.map((n, i) => (
                  <div key={i} style={{display:"flex", gap:10}}>
                    <div style={{
                      width:8, height:8, borderRadius:"50%", marginTop:6, flexShrink:0,
                      background: n.type === "absent" ? "var(--red)" :
                                  n.type === "late"   ? "var(--amber)" :
                                  n.type === "ok"     ? "var(--accent)" : "var(--fg-4)",
                    }}/>
                    <div style={{fontSize:12.5, lineHeight:1.4}}>
                      <div><b style={{fontWeight:600}}>{n.who}</b> <span className="fm-muted">{n.text}</span></div>
                      <div className="mono fm-muted" style={{fontSize:10.5, marginTop:2}}>
                        {n.ts ? new Date(n.ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
