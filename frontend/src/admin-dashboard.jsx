// admin-dashboard.jsx â€” main analytics dashboard
import React from 'react'
import { STUDENTS, TODAY_LOG, WEEK_BARS, NOTIFICATIONS } from './data'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'

export function Dashboard({ layout = "sidebar" }) {
  const Stat = ({ eyebrow, num, sub, delta, dir = "up" }) => (
    <div className="fm-card" style={{flex:1, minWidth:0}}>
      <div className="fm-eyebrow">{eyebrow}</div>
      <div style={{display:"flex", alignItems:"baseline", gap:10, marginTop:8}}>
        <div className="fm-stat-num">{num}</div>
        {delta && <div className={`fm-delta ${dir}`}>{dir === "up" ? "â†—" : "â†˜"} {delta}</div>}
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
              <div className="fm-eyebrow" style={{marginBottom:8}}>Mon Â· April 26, 2026 Â· 09:42</div>
              <h1 className="fm-h1">Good morning, Dr. Wexler.</h1>
              <div className="fm-muted" style={{marginTop:6, fontSize:14}}>
                412 of 548 students checked in. 14 marked late. Camera network is healthy.
              </div>
            </div>
            <div style={{display:"flex", gap:8}}>
              <button className="fm-btn"><I.Export size={14}/> Export day</button>
              <button className="fm-btn primary"><I.Camera size={14}/> Open kiosk</button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:16}}>
            <Stat eyebrow="Present today" num="412" sub="75.2% of enrolled" delta="+3.1%" />
            <Stat eyebrow="Late arrivals" num="14" sub="avg 9 min" delta="âˆ’2" dir="dn" />
            <Stat eyebrow="Absent" num="22" sub="6 with leave" delta="âˆ’4" dir="dn" />
            <Stat eyebrow="Recognition rate" num="99.4%" sub="3 fallbacks today" delta="+0.2%" />
          </div>

          {/* Two-column charts */}
          <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16}}>
            <div className="fm-card">
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:18}}>
                <div>
                  <h2 className="fm-h2">This week</h2>
                  <div className="fm-muted" style={{fontSize:12, marginTop:4}}>Daily attendance Â· Apr 20 â€“ 26</div>
                </div>
                <div className="fm-tabs">
                  <div className="fm-tab">Day</div>
                  <div className="fm-tab active">Week</div>
                  <div className="fm-tab">Month</div>
                </div>
              </div>
              <div style={{height:180, display:"flex", alignItems:"flex-end", gap:14, paddingTop:10}}>
                {WEEK_BARS.map((b, i) => (
                  <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8}}>
                    <div style={{flex:1, width:"100%", display:"flex", alignItems:"flex-end"}}>
                      <div style={{
                        width:"100%",
                        height: b.off ? 6 : `${b.v}%`,
                        background: b.off ? "var(--line)" : (i === 4 ? "var(--accent)" : "var(--fg)"),
                        borderRadius:"6px 6px 0 0",
                        position:"relative",
                      }}>
                        {!b.off && i === 4 && (
                          <div className="mono" style={{
                            position:"absolute", top:-22, left:"50%", transform:"translateX(-50%)",
                            fontSize:11, color:"var(--fg)"
                          }}>{b.v}%</div>
                        )}
                      </div>
                    </div>
                    <div className="mono" style={{fontSize:11, color: i === 4 ? "var(--fg)" : "var(--fg-3)"}}>{b.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fm-card">
              <h2 className="fm-h2">By grade</h2>
              <div className="fm-muted" style={{fontSize:12, marginTop:4, marginBottom:18}}>Now</div>
              <div style={{display:"flex", flexDirection:"column", gap:14}}>
                {[
                  { g: "10A", n: 32, p: 30 },
                  { g: "10B", n: 30, p: 28 },
                  { g: "11A", n: 34, p: 27 },
                  { g: "11B", n: 31, p: 30 },
                  { g: "12A", n: 29, p: 26 },
                  { g: "12B", n: 30, p: 22 },
                ].map(r => {
                  const pct = r.p / r.n;
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
                  <div className="fm-muted" style={{fontSize:12, marginTop:4}}>Live Â· last 30 min</div>
                </div>
                <a className="mono" style={{fontSize:12, color:"var(--fg-3)", cursor:"pointer"}}>View all â†’</a>
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
                  {TODAY_LOG.slice(0, 7).map(r => (
                    <tr key={r.id}>
                      <td style={{paddingLeft:20}}>
                        <div style={{display:"flex", alignItems:"center", gap:10}}>
                          <div className="fm-avatar sm" style={{background: `oklch(0.86 0.14 ${(r.id.charCodeAt(2)*17)%360})`}}>
                            {r.name.split(" ").map(s => s[0]).join("")}
                          </div>
                          <div>
                            <div style={{fontWeight:500}}>{r.name}</div>
                            <div className="mono fm-muted" style={{fontSize:11}}>{r.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="fm-muted">{r.course}</td>
                      <td className="mono">{r.time}</td>
                      <td className="mono">{(r.conf*100).toFixed(1)}%</td>
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
                <span className="fm-pill" style={{background:"var(--red-soft)", color:"oklch(0.4 0.12 25)"}}>3 new</span>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:14}}>
                {NOTIFICATIONS.slice(0,4).map((n, i) => (
                  <div key={i} style={{display:"flex", gap:10}}>
                    <div style={{
                      width:8, height:8, borderRadius:"50%", marginTop:6, flexShrink:0,
                      background: n.type === "absent" ? "var(--red)" :
                                  n.type === "late" ? "var(--amber)" :
                                  n.type === "ok" ? "var(--accent)" : "var(--fg-4)",
                    }}/>
                    <div style={{fontSize:12.5, lineHeight:1.4}}>
                      <div><b style={{fontWeight:600}}>{n.who}</b> <span className="fm-muted">{n.text}</span></div>
                      <div className="mono fm-muted" style={{fontSize:10.5, marginTop:2}}>{n.time}</div>
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
