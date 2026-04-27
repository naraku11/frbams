// extras.jsx â€” Subjects/timetable + offline queue screens
import React from 'react'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'


const SUBJECTS = [
  { code:"MATH 201", name:"Calculus II", teacher:"Mr. Okafor", room:"204", color:125, attended:18, total:19, days:[1,3,5], time:"09:30 â€“ 10:20" },
  { code:"LIT 110",  name:"World Literature", teacher:"Ms. Singh", room:"118", color:30, attended:19, total:19, days:[1,2,4], time:"11:00 â€“ 11:50" },
  { code:"FRA 301",  name:"French III", teacher:"Mme. Romero", room:"302", color:250, attended:17, total:19, days:[2,3,5], time:"13:30 â€“ 14:20" },
  { code:"CHEM 220", name:"Organic Chemistry", teacher:"Dr. Tanaka", room:"Lab 4", color:70, attended:18, total:19, days:[1,4], time:"15:00 â€“ 16:00" },
  { code:"CS 101",   name:"Intro to CS", teacher:"Mr. Patel", room:"Lab 2", color:200, attended:14, total:19, days:[2,5], time:"10:30 â€“ 11:20" },
  { code:"ART 150",  name:"Modern Art", teacher:"Ms. Vogel", room:"Studio A", color:340, attended:19, total:19, days:[3], time:"14:00 â€“ 15:30" },
];

function Subjects() {
  return (
    <div className="fm-screen" data-screen-label="Subjects">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>Class 10A Â· Spring term</div>
              <h1 className="fm-h1">Subjects & timetable</h1>
              <div className="fm-muted" style={{marginTop:6}}>6 subjects Â· 19 sessions per week Â· 91% avg attendance</div>
            </div>
            <button className="fm-btn primary"><I.Plus size={14}/> Add subject</button>
          </div>

          {/* Weekly grid */}
          <div className="fm-card" style={{padding:0, overflow:"hidden", marginBottom:16}}>
            <div style={{display:"grid", gridTemplateColumns:"60px repeat(5, 1fr)", borderBottom:"1px solid var(--line)"}}>
              <div style={{padding:"12px 10px"}}/>
              {["Mon","Tue","Wed","Thu","Fri"].map((d, i) => (
                <div key={d} style={{padding:"12px 14px", fontSize:11.5, fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"0.08em", color: i === 0 ? "var(--fg)" : "var(--fg-3)", fontWeight: i === 0 ? 600 : 400}}>
                  {d} {i === 0 && <span className="fm-pill ok" style={{marginLeft:6, fontSize:10}}>today</span>}
                </div>
              ))}
            </div>
            <div style={{display:"grid", gridTemplateColumns:"60px repeat(5, 1fr)", minHeight:380, position:"relative"}}>
              <div style={{borderRight:"1px solid var(--line-2)"}}>
                {[8,9,10,11,12,13,14,15].map(h => (
                  <div key={h} style={{height:46, padding:"4px 6px", fontFamily:"var(--mono)", fontSize:10.5, color:"var(--fg-4)", textAlign:"right"}}>
                    {String(h).padStart(2,"0")}:00
                  </div>
                ))}
              </div>
              {[1,2,3,4,5].map(day => (
                <div key={day} style={{borderRight:"1px solid var(--line-2)", position:"relative", height:46*8}}>
                  {SUBJECTS.filter(s => s.days.includes(day)).map((s, i) => {
                    // Synthetic placement
                    const startHour = parseInt(s.time.slice(0,2));
                    const startMin = parseInt(s.time.slice(3,5));
                    const top = ((startHour - 8) + startMin/60) * 46;
                    const dur = s.code === "ART 150" ? 1.5 : (s.code === "CHEM 220" ? 1 : 0.83);
                    return (
                      <div key={i} style={{
                        position:"absolute", left:6, right:6, top: top+2, height: dur*46-4,
                        borderRadius:8, padding:"7px 9px",
                        background:`oklch(0.94 0.05 ${s.color})`,
                        borderLeft:`3px solid oklch(0.65 0.16 ${s.color})`,
                        fontSize:11.5, lineHeight:1.25, overflow:"hidden",
                      }}>
                        <div style={{fontWeight:600, color:`oklch(0.30 0.12 ${s.color})`}}>{s.name}</div>
                        <div className="mono" style={{fontSize:10.5, color:`oklch(0.40 0.10 ${s.color})`, marginTop:2}}>{s.room} Â· {s.teacher.split(" ").slice(-1)}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Subject cards */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12}}>
            {SUBJECTS.map(s => {
              const pct = Math.round(s.attended/s.total*100);
              return (
                <div key={s.code} className="fm-card" style={{padding:18}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                    <div>
                      <div className="mono" style={{fontSize:11, color:`oklch(0.50 0.14 ${s.color})`, fontWeight:600}}>{s.code}</div>
                      <div style={{fontSize:15, fontWeight:600, marginTop:3}}>{s.name}</div>
                      <div className="fm-muted" style={{fontSize:12, marginTop:2}}>{s.teacher}</div>
                    </div>
                    <div style={{
                      width:36, height:36, borderRadius:9,
                      background:`oklch(0.94 0.06 ${s.color})`,
                      color:`oklch(0.45 0.14 ${s.color})`,
                      display:"grid", placeItems:"center",
                      fontFamily:"var(--mono)", fontSize:11, fontWeight:600,
                    }}>{pct}%</div>
                  </div>
                  <div style={{display:"flex", justifyContent:"space-between", marginTop:14, fontSize:11.5, color:"var(--fg-3)"}}>
                    <span className="mono">{s.attended}/{s.total} sessions</span>
                    <span className="mono">{s.room} Â· {s.time}</span>
                  </div>
                  <div style={{marginTop:8, display:"flex", gap:2}}>
                    {Array.from({length: s.total}, (_, i) => (
                      <div key={i} style={{
                        flex:1, height:6, borderRadius:2,
                        background: i < s.attended ? `oklch(0.65 0.16 ${s.color})` : "var(--line-2)",
                      }}/>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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
  const events = Array.from({length: 8}, (_, i) => {
    const names = ["Maya Park","Liam Bennett","Zara Singh","Noah Hassan","Aisha MÃ¼ller","Theo Lindqvist","Iris Vogel","Ravi Costa"];
    const status = i < 5 ? "synced" : i < 7 ? "queued" : "conflict";
    return {
      name: names[i],
      id: "S240" + i,
      time: `09:${String(40 + i).padStart(2,"0")}:${String((i*7)%60).padStart(2,"0")}`,
      device: i % 2 ? "Kiosk Â· A1" : "Mobile Â· iOS",
      status,
    };
  });
  return (
    <div className="fm-screen" data-screen-label="Offline sync">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>Settings Â· Reliability</div>
              <h1 className="fm-h1">Offline & sync</h1>
              <div className="fm-muted" style={{marginTop:6}}>Devices keep working without internet. Queued check-ins sync when reconnected.</div>
            </div>
            <button className="fm-btn primary"><I.Wifi size={14}/> Force sync now</button>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:16}}>
            <div className="fm-card">
              <div className="fm-eyebrow">Devices online</div>
              <div className="fm-stat-num" style={{marginTop:8}}>11<span style={{fontSize:18, color:"var(--fg-3)"}}>/12</span></div>
              <div className="mono fm-muted" style={{fontSize:11, marginTop:4}}>1 in offline mode</div>
            </div>
            <div className="fm-card">
              <div className="fm-eyebrow">Queued events</div>
              <div className="fm-stat-num" style={{marginTop:8, color:"var(--amber)"}}>47</div>
              <div className="mono fm-muted" style={{fontSize:11, marginTop:4}}>oldest 26 min</div>
            </div>
            <div className="fm-card">
              <div className="fm-eyebrow">Local storage used</div>
              <div className="fm-stat-num" style={{marginTop:8}}>112<span style={{fontSize:18, color:"var(--fg-3)"}}>MB</span></div>
              <div className="mono fm-muted" style={{fontSize:11, marginTop:4}}>cap 2 GB Â· safe</div>
            </div>
            <div className="fm-card">
              <div className="fm-eyebrow">Last full sync</div>
              <div className="fm-stat-num" style={{marginTop:8, fontSize:30}}>09:18</div>
              <div className="mono fm-muted" style={{fontSize:11, marginTop:4}}>26 min ago</div>
            </div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16}}>
            <div className="fm-card">
              <h3 className="fm-h3" style={{marginBottom:14}}>Offline behavior</h3>
              <div style={{display:"flex", flexDirection:"column", gap:14}}>
                {[
                  ["Keep recognizing offline","Cache last 4 weeks of templates on each device","on"],
                  ["Auto-retry sync","Every 30 seconds when network resumes","on"],
                  ["Local fallback PIN","Allow 4-digit PIN if face unrecognized","on"],
                  ["Conflict resolution","Prefer earliest timestamp on duplicate check-ins","on"],
                ].map((row, i) => (
                  <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom: i < 3 ? 14 : 0, borderBottom: i < 3 ? "1px solid var(--line-2)" : "none"}}>
                    <div>
                      <div style={{fontSize:13, fontWeight:500}}>{row[0]}</div>
                      <div className="fm-muted" style={{fontSize:11.5, marginTop:2}}>{row[1]}</div>
                    </div>
                    <div className={`fm-toggle ${row[2] === "on" ? "on" : ""}`}/>
                  </div>
                ))}
              </div>
            </div>

            <div className="fm-card">
              <h3 className="fm-h3" style={{marginBottom:14}}>Network timeline (last hour)</h3>
              <div style={{display:"flex", alignItems:"flex-end", gap:2, height:120}}>
                {Array.from({length:60}, (_, i) => {
                  const offline = i >= 32 && i < 58;
                  return (
                    <div key={i} style={{
                      flex:1, height: (offline ? 30 : 80 - (i*7)%30) + "%",
                      background: offline ? "var(--amber)" : "var(--accent)",
                      borderRadius:1,
                    }}/>
                  );
                })}
              </div>
              <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontFamily:"var(--mono)", fontSize:10.5, color:"var(--fg-4)"}}>
                <span>âˆ’60 min</span><span style={{color:"var(--amber)"}}>OFFLINE 09:12 â€“ 09:38</span><span>now</span>
              </div>
              <div style={{marginTop:14, padding:10, background:"var(--amber-soft)", borderRadius:8, fontSize:12, color:"oklch(0.4 0.10 70)"}}>
                <b style={{fontWeight:600}}>Kiosk A1 lost connection at 09:12</b> â€” recovered at 09:38. 47 events captured locally; 42 already replayed.
              </div>
            </div>
          </div>

          <div className="fm-card" style={{padding:0}}>
            <div style={{padding:"18px 20px 12px", display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
              <h2 className="fm-h2">Sync queue</h2>
              <span className="fm-muted mono" style={{fontSize:11.5}}>showing 8 of 47</span>
            </div>
            <table className="fm-table">
              <thead>
                <tr>
                  <th style={{paddingLeft:20}}>Captured</th>
                  <th>Student</th>
                  <th>Device</th>
                  <th>Recorded at</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={i}>
                    <td style={{paddingLeft:20}} className="mono">{e.time}</td>
                    <td>
                      <div style={{display:"flex", gap:10, alignItems:"center"}}>
                        <div className="fm-avatar sm" style={{background:`oklch(0.86 0.14 ${(i*73)%360})`}}>{e.name.split(" ").map(s=>s[0]).join("")}</div>
                        <div>
                          <div style={{fontWeight:500}}>{e.name}</div>
                          <div className="mono fm-muted" style={{fontSize:11}}>{e.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="fm-muted">{e.device}</td>
                    <td className="mono">{e.status === "queued" ? <span className="fm-muted">â€” pending</span> : `09:${(45 + i)%60}`}</td>
                    <td>
                      <span className={`fm-pill ${e.status === "synced" ? "ok" : e.status === "queued" ? "late" : "ab"}`}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

// Course/subject management â€” add a new course
function CourseManager() {
  const [name, setName] = React.useState("Advanced Biology");
  const [code, setCode] = React.useState("BIO 220");
  const [days, setDays] = React.useState([1, 3, 5]);
  const dayNames = ["Mon","Tue","Wed","Thu","Fri","Sat"];
  const toggleDay = (i) => setDays(d => d.includes(i) ? d.filter(x=>x!==i) : [...d, i].sort());

  return (
    <div className="fm-screen" data-screen-label="Course Manager">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>Courses Â· New</div>
              <h1 className="fm-h1">Add a course</h1>
              <div className="fm-muted" style={{marginTop:6}}>Define the schedule, assign a teacher, and link it to a class roster. Attendance starts the first session.</div>
            </div>
            <div style={{display:"flex", gap:8}}>
              <button className="fm-btn">Cancel</button>
              <button className="fm-btn primary"><I.Check size={14}/> Create course</button>
            </div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:20}}>
            <div style={{display:"flex", flexDirection:"column", gap:16}}>
              <div className="fm-card">
                <h3 className="fm-h3" style={{marginBottom:14}}>Course details</h3>
                <div style={{display:"grid", gap:14}}>
                  <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:12}}>
                    <div>
                      <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Course name</div>
                      <input className="fm-input" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                      <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Code</div>
                      <input className="fm-input mono" value={code} onChange={e => setCode(e.target.value)} />
                    </div>
                  </div>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                    <div>
                      <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Department</div>
                      <select className="fm-input" defaultValue="sci">
                        <option value="sci">Science</option>
                        <option>Mathematics</option>
                        <option>Humanities</option>
                        <option>Languages</option>
                      </select>
                    </div>
                    <div>
                      <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Term</div>
                      <select className="fm-input" defaultValue="spring">
                        <option value="spring">Spring 2026</option>
                        <option>Fall 2026</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Description</div>
                    <textarea className="fm-input" rows={3} style={{resize:"vertical", padding:"10px 12px"}}
                              defaultValue="Cellular processes, genetics, and ecology with weekly lab work."/>
                  </div>
                </div>
              </div>

              <div className="fm-card">
                <h3 className="fm-h3" style={{marginBottom:14}}>Schedule</h3>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14}}>
                  <div>
                    <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Start time</div>
                    <input className="fm-input mono" type="time" defaultValue="10:30" />
                  </div>
                  <div>
                    <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>End time</div>
                    <input className="fm-input mono" type="time" defaultValue="11:20" />
                  </div>
                </div>
                <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:8}}>Meeting days</div>
                <div style={{display:"flex", gap:6}}>
                  {dayNames.map((d, i) => (
                    <button key={d} onClick={() => toggleDay(i)} className="fm-btn" style={{
                      flex:1, justifyContent:"center",
                      background: days.includes(i) ? "var(--accent)" : "var(--card)",
                      color: days.includes(i) ? "var(--accent-ink)" : "var(--fg-2)",
                      borderColor: days.includes(i) ? "transparent" : "var(--line)",
                      fontWeight: days.includes(i) ? 600 : 400,
                    }}>{d}</button>
                  ))}
                </div>
                <div className="fm-muted mono" style={{fontSize:11, marginTop:10}}>
                  {days.length} Ã— 50 min Â· ~{days.length * 14} sessions over the term
                </div>
              </div>

              <div className="fm-card">
                <h3 className="fm-h3" style={{marginBottom:14}}>Roster</h3>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
                  <div className="fm-muted" style={{fontSize:13}}>Class 11A Â· 28 students</div>
                  <button className="fm-btn"><I.Plus size={13}/> Add students</button>
                </div>
                <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                  {["Maya P.","Liam B.","Zara S.","Noah B.","Aisha H.","Theo L.","Iris V.","Ravi C.","Hana I.","+19 more"].map((n, i) => (
                    <span key={i} style={{
                      padding:"5px 10px", borderRadius:99, fontSize:12,
                      background: i === 9 ? "var(--line-2)" : "var(--card)",
                      border:"1px solid var(--line)", color: i === 9 ? "var(--fg-3)" : "var(--fg)",
                    }}>{n}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{display:"flex", flexDirection:"column", gap:16}}>
              <div className="fm-card">
                <h3 className="fm-h3" style={{marginBottom:14}}>Teacher</h3>
                <div style={{display:"flex", alignItems:"center", gap:12, padding:"10px", border:"1px solid var(--line)", borderRadius:10, marginBottom:10}}>
                  <div className="fm-avatar" style={{background:"oklch(0.86 0.14 200)"}}>JT</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13.5, fontWeight:500}}>Dr. Jules Tanaka</div>
                    <div className="fm-muted mono" style={{fontSize:11, marginTop:2}}>Science Â· 12 years Â· Lab 4</div>
                  </div>
                  <button className="fm-btn">Change</button>
                </div>
                <div className="fm-muted" style={{fontSize:11.5}}>
                  Currently teaching Org Chem (28) and Genetics (24). Adding this course brings load to 3 classes.
                </div>
              </div>

              <div className="fm-card">
                <h3 className="fm-h3" style={{marginBottom:14}}>Room & equipment</h3>
                <div style={{display:"grid", gap:10}}>
                  <div>
                    <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Room</div>
                    <select className="fm-input" defaultValue="lab4">
                      <option value="lab4">Lab 4 Â· Science Wing</option>
                      <option>Lab 2 Â· Science Wing</option>
                      <option>Room 204</option>
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:11.5, color:"var(--fg-3)", marginBottom:5}}>Camera</div>
                    <div style={{padding:"10px 12px", border:"1px solid var(--line)", borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <span style={{fontSize:13}}>Lab 4 Â· Cam D2</span>
                      <span className="fm-pill ok">online Â· 98%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="fm-card">
                <h3 className="fm-h3" style={{marginBottom:14}}>Attendance rules</h3>
                <div style={{display:"flex", flexDirection:"column", gap:12}}>
                  {[
                    ["Late threshold","After 8 min","on"],
                    ["Auto-mark absent","After 30 min no scan","on"],
                    ["Notify guardian on absence","Email + SMS","on"],
                    ["Allow mobile check-in","Within campus geofence","on"],
                  ].map((row, i) => (
                    <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:13, fontWeight:500}}>{row[0]}</div>
                        <div className="fm-muted" style={{fontSize:11.5, marginTop:1}}>{row[1]}</div>
                      </div>
                      <div className={`fm-toggle ${row[2] === "on" ? "on" : ""}`}/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live preview card */}
              <div className="fm-card" style={{padding:14, background:"var(--line-2)", borderStyle:"dashed"}}>
                <div className="fm-eyebrow" style={{marginBottom:8}}>Preview Â· timetable card</div>
                <div style={{
                  padding:"10px 12px", borderRadius:8,
                  background:`oklch(0.94 0.05 145)`,
                  borderLeft:`3px solid oklch(0.65 0.16 145)`,
                }}>
                  <div style={{fontSize:12.5, fontWeight:600, color:`oklch(0.30 0.12 145)`}}>{name}</div>
                  <div className="mono" style={{fontSize:10.5, color:`oklch(0.40 0.10 145)`, marginTop:2}}>
                    {code} Â· Lab 4 Â· Tanaka
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
