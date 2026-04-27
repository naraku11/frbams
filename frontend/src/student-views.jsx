// student-views.jsx â€” Student self-view (web) + Mobile check-in app
import React from 'react'
import { makeMonth } from './data'
import { I } from './icons'
import { Sidebar } from './shell'


function StudentSelf() {
  
  const days = makeMonth(42);
  return (
    <div className="fm-screen" data-screen-label="Student Self-View">
      <div className="fm-main">
        <Sidebar layout="topnav" />
        <div className="fm-content" style={{maxWidth:980, margin:"0 auto", width:"100%"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>Hi, Maya Â· Grade 10A</div>
              <h1 className="fm-h1 xl">94<span style={{fontSize:32, color:"var(--fg-3)"}}>%</span></h1>
              <div className="fm-muted" style={{marginTop:6}}>Your attendance this term Â· 18 of 19 school days present</div>
            </div>
            <button className="fm-btn"><I.Leave size={14}/> Request leave</button>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:16, marginBottom:16}}>
            <div className="fm-card">
              <h2 className="fm-h2" style={{marginBottom:4}}>April</h2>
              <div className="fm-muted" style={{fontSize:12, marginBottom:18}}>Tap a day for details</div>
              <div className="cal-grid" style={{marginBottom:14}}>
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={i} style={{textAlign:"center", fontSize:11, color:"var(--fg-4)", fontFamily:"var(--mono)", paddingBottom:6}}>{d}</div>
                ))}
                {Array.from({length:3}, (_,i)=>(<div key={"e"+i} className="cal-cell" style={{background:"transparent"}}/>))}
                {days.map((s, i) => (
                  <div key={i} className={`cal-cell ${s}`}>{i+1}</div>
                ))}
              </div>
              <div style={{display:"flex", gap:14, fontSize:11.5, color:"var(--fg-3)"}}>
                <span style={{display:"inline-flex", alignItems:"center", gap:6}}><span style={{width:10, height:10, background:"var(--accent)", borderRadius:3}}/>Present</span>
                <span style={{display:"inline-flex", alignItems:"center", gap:6}}><span style={{width:10, height:10, background:"var(--amber-soft)", borderRadius:3}}/>Late</span>
                <span style={{display:"inline-flex", alignItems:"center", gap:6}}><span style={{width:10, height:10, background:"var(--red-soft)", borderRadius:3}}/>Absent</span>
              </div>
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:16}}>
              <div className="fm-card">
                <div className="fm-eyebrow">Streak</div>
                <div style={{display:"flex", alignItems:"baseline", gap:8, marginTop:8}}>
                  <div className="fm-stat-num">12</div>
                  <div className="fm-muted" style={{fontSize:13}}>days on time</div>
                </div>
                <div style={{display:"flex", gap:3, marginTop:14}}>
                  {Array.from({length:14}, (_,i) => (
                    <div key={i} style={{
                      flex:1, height:24, borderRadius:3,
                      background: i < 12 ? "var(--accent)" : "var(--line-2)",
                    }}/>
                  ))}
                </div>
              </div>
              <div className="fm-card">
                <div className="fm-eyebrow">Today</div>
                <div style={{marginTop:10, fontSize:14}}>
                  <div style={{display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--line-2)"}}>
                    <span>Calculus II</span><span className="mono fm-muted">09:30 âœ“</span>
                  </div>
                  <div style={{display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--line-2)"}}>
                    <span>World Lit</span><span className="mono fm-muted">11:00 âœ“</span>
                  </div>
                  <div style={{display:"flex", justifyContent:"space-between", padding:"8px 0"}}>
                    <span>French III</span><span className="mono" style={{color:"var(--fg-4)"}}>13:30 Â·</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fm-card" style={{padding:0}}>
            <div style={{padding:"18px 20px 12px"}}>
              <h2 className="fm-h2">By course</h2>
            </div>
            <table className="fm-table">
              <thead>
                <tr><th style={{paddingLeft:20}}>Course</th><th>Teacher</th><th>Attended</th><th>%</th><th></th></tr>
              </thead>
              <tbody>
                {[
                  ["Calculus II","Mr. Okafor","18/19", 94],
                  ["World Lit","Ms. Singh","19/19", 100],
                  ["French III","Mme. Romero","17/19", 89],
                  ["Org Chem","Dr. Tanaka","18/19", 94],
                ].map(r => (
                  <tr key={r[0]}>
                    <td style={{paddingLeft:20, fontWeight:500}}>{r[0]}</td>
                    <td className="fm-muted">{r[1]}</td>
                    <td className="mono">{r[2]}</td>
                    <td className="mono">{r[3]}%</td>
                    <td style={{width:160}}>
                      <div style={{height:6, background:"var(--line-2)", borderRadius:99, overflow:"hidden"}}>
                        <div style={{width:r[3]+"%", height:"100%", background: r[3] < 90 ? "var(--amber)" : "var(--accent)"}}/>
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
  );
}

// Mobile check-in (rendered inside iOS frame)
function MobileCheckIn() {
  return (
    <div className="phone-screen" style={{background:"#0A0B08", color:"white"}}>
      <div style={{flex:1, position:"relative", overflow:"hidden"}}>
        <div style={{
          position:"absolute", inset:0,
          background:`radial-gradient(280px 360px at 50% 50%, oklch(0.40 0.04 90), transparent 70%)`,
        }}/>
        <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{position:"absolute", inset:0}}>
          <ellipse cx="200" cy="320" rx="80" ry="100" fill="#3a3a32"/>
          <path d="M 100 700 Q 100 540 200 530 Q 300 540 300 700 Z" fill="#1f211b"/>
        </svg>

        <div style={{
          position:"absolute", top:60, left:0, right:0,
          textAlign:"center",
        }}>
          <div style={{fontFamily:"var(--mono)", fontSize:11, opacity:0.55, letterSpacing:"0.1em"}}>FACEMARK Â· CHECK IN</div>
          <div style={{fontFamily:"var(--display)", fontSize:24, fontWeight:600, marginTop:6, letterSpacing:"-0.02em"}}>
            Hello, Maya
          </div>
          <div style={{
            marginTop:14, display:"inline-flex", alignItems:"center", gap:8,
            padding:"6px 12px", borderRadius:99,
            background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.85)",
            fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.02em",
            border:"1px solid rgba(212, 244, 100, 0.35)",
          }}>
            <span style={{width:6, height:6, borderRadius:"50%", background:"var(--accent)", boxShadow:"0 0 8px var(--accent)"}}/>
            ON CAMPUS Â· 28 m from Main Building
          </div>
        </div>

        <div style={{
          position:"absolute", left:"50%", top:"48%", transform:"translate(-50%, -50%)",
          width:240, height:280, border:"2px solid var(--accent)",
          borderRadius:"50% / 45%",
        }}/>

        <div style={{
          position:"absolute", left:0, right:0, bottom:30, padding:"0 24px",
          display:"flex", flexDirection:"column", gap:14,
        }}>
          <div style={{
            padding:"14px 16px", borderRadius:14,
            background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)",
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <div>
              <div style={{fontSize:11, fontFamily:"var(--mono)", opacity:0.55, textTransform:"uppercase", letterSpacing:"0.08em"}}>Next class</div>
              <div style={{fontWeight:600, fontSize:15, marginTop:2}}>Calculus II Â· Room 204</div>
            </div>
            <div style={{textAlign:"right", fontFamily:"var(--mono)", fontSize:12, opacity:0.7}}>
              <div style={{fontSize:18, color:"var(--accent)"}}>09:30</div>
              <div>in 12 min</div>
            </div>
          </div>
          <button style={{
            padding:"16px", borderRadius:14, border:"none",
            background:"var(--accent)", color:"#000",
            fontSize:16, fontWeight:600, fontFamily:"var(--display)",
            display:"flex", justifyContent:"center", alignItems:"center", gap:10,
            cursor:"pointer", letterSpacing:"-0.01em",
          }}>
            <I.Face size={18}/> Check in with face
          </button>
          <button style={{
            padding:"12px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)",
            background:"transparent", color:"rgba(255,255,255,0.7)",
            fontSize:13, cursor:"pointer",
          }}>Use PIN instead</button>
        </div>
      </div>
    </div>
  );
}

// Mobile success state (after check-in)
function MobileSuccess() {
  return (
    <div className="phone-screen">
      <div style={{flex:1, padding:"60px 24px 30px", display:"flex", flexDirection:"column"}}>
        <div style={{
          width:72, height:72, borderRadius:"50%",
          background:"var(--accent)", color:"#000",
          display:"grid", placeItems:"center",
          marginBottom:28,
        }}>
          <I.Check size={36} stroke={2.4}/>
        </div>

        <div style={{fontFamily:"var(--display)", fontSize:36, fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.05}}>
          You're in.<br/>
          <span className="fm-muted">See you in<br/>Calculus II.</span>
        </div>

        <div style={{flex:1}}/>

        {/* Location verification card */}
        <div style={{
          padding:14, borderRadius:14, border:"1px solid var(--line)",
          marginBottom:12, display:"flex", gap:12, alignItems:"center",
          background:"var(--accent-soft)",
        }}>
          <div style={{
            width:44, height:44, borderRadius:12,
            background:"var(--accent)", color:"#000",
            display:"grid", placeItems:"center", flexShrink:0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:12, fontWeight:600, color:"oklch(0.35 0.10 125)"}}>Location verified</div>
            <div className="mono" style={{fontSize:11, color:"oklch(0.40 0.10 125)", marginTop:2}}>Main Building Â· 28 m Â· Â±5 m</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="oklch(0.35 0.10 125)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
        </div>

        <div style={{
          padding:16, borderRadius:14, border:"1px solid var(--line)",
          fontFamily:"var(--mono)", fontSize:12, color:"var(--fg-3)",
          display:"grid", gap:6,
        }}>
          <div style={{display:"flex", justifyContent:"space-between"}}><span>Time</span><span style={{color:"var(--fg)"}}>09:42:11</span></div>
          <div style={{display:"flex", justifyContent:"space-between"}}><span>Location</span><span style={{color:"var(--fg)"}}>Main Â· 40.7128, âˆ’74.0060</span></div>
          <div style={{display:"flex", justifyContent:"space-between"}}><span>Camera</span><span style={{color:"var(--fg)"}}>Main Â· A1</span></div>
          <div style={{display:"flex", justifyContent:"space-between"}}><span>Confidence</span><span style={{color:"var(--fg)"}}>99.6%</span></div>
          <div style={{display:"flex", justifyContent:"space-between"}}><span>Streak</span><span style={{color:"var(--accent-ink)", background:"var(--accent)", padding:"0 6px", borderRadius:4}}>13 days</span></div>
        </div>

        <button style={{
          marginTop:14, padding:"14px", borderRadius:14, border:"none",
          background:"var(--fg)", color:"var(--bg)",
          fontSize:14, fontWeight:600, cursor:"pointer",
        }}>View today's schedule</button>
      </div>
    </div>
  );
}

// Mobile home (overview)
function MobileHome() {
  return (
    <div className="phone-screen">
      <div style={{padding:"50px 22px 20px", flex:1, overflow:"auto"}}>
        <div className="fm-eyebrow" style={{marginBottom:6}}>Mon, Apr 26</div>
        <h1 style={{fontFamily:"var(--display)", fontSize:30, fontWeight:600, letterSpacing:"-0.03em", margin:0}}>
          Hi, Maya.
        </h1>

        <div style={{
          marginTop:20, padding:18, borderRadius:16,
          background:"var(--fg)", color:"var(--bg)",
        }}>
          <div style={{fontSize:11, opacity:0.6, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"var(--mono)"}}>This term</div>
          <div style={{display:"flex", alignItems:"baseline", gap:8, marginTop:6}}>
            <div style={{fontFamily:"var(--display)", fontSize:48, fontWeight:600, letterSpacing:"-0.03em", color:"var(--accent)"}}>94%</div>
            <div style={{fontSize:13, opacity:0.6}}>attendance</div>
          </div>
          <div style={{display:"flex", gap:3, marginTop:14}}>
            {Array.from({length:19}, (_,i) => (
              <div key={i} style={{
                flex:1, height:14, borderRadius:2,
                background: i === 7 ? "rgba(255,255,255,0.15)" : "var(--accent)",
              }}/>
            ))}
          </div>
        </div>

        <div className="fm-eyebrow" style={{marginTop:24, marginBottom:10}}>Today</div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {[
            ["09:30","Calculus II","Mr. Okafor","done"],
            ["11:00","World Lit","Ms. Singh","done"],
            ["13:30","French III","Mme. Romero","next"],
            ["15:00","Org Chem","Dr. Tanaka","upcoming"],
          ].map(([t, c, who, st], i) => (
            <div key={i} style={{
              padding:"12px 14px", borderRadius:12,
              border:"1px solid var(--line)",
              display:"flex", alignItems:"center", gap:14,
              background: st === "next" ? "var(--accent-soft)" : "var(--card)",
            }}>
              <div className="mono" style={{fontSize:13, fontWeight:600, width:48}}>{t}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14, fontWeight:500}}>{c}</div>
                <div className="fm-muted" style={{fontSize:11.5, marginTop:1}}>{who}</div>
              </div>
              {st === "done" && <I.Check size={16}/>}
              {st === "next" && <span className="fm-pill" style={{background:"var(--accent)", color:"#000"}}>NEXT</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        borderTop:"1px solid var(--line)",
        padding:"10px 20px 22px",
        display:"flex", justifyContent:"space-around", alignItems:"center",
      }}>
        {[
          ["Home", "Home", true],
          ["Calendar", "Cal", false],
          ["", "Face", false, true],
          ["Schedule", "Log", false],
          ["Profile", "Users", false],
        ].map(([label, icon, active, primary], i) => primary ? (
          <button key={i} style={{
            width:52, height:52, borderRadius:"50%", border:"none",
            background:"var(--accent)", color:"#000", cursor:"pointer",
            display:"grid", placeItems:"center",
            boxShadow:"0 6px 20px oklch(0.86 0.18 125 / 0.4)",
          }}>{React.createElement(I[icon], {size:22})}</button>
        ) : (
          <div key={i} style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:3,
            color: active ? "var(--fg)" : "var(--fg-4)",
            fontSize:10,
          }}>
            {React.createElement(I[icon], {size:18})}
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mobile geofence verification screen
function MobileGeofence() {
  return (
    <div className="phone-screen" style={{background:"#0E1A14", color:"white"}}>
      <div style={{flex:1, position:"relative", overflow:"hidden"}}>
        {/* Map background */}
        <div style={{position:"absolute", inset:0, background:"#0F1410"}}>
          <svg width="100%" height="100%" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" style={{position:"absolute", inset:0}}>
            <defs>
              <pattern id="streets" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect width="60" height="60" fill="#0F1410"/>
                <path d="M0 30 H60 M30 0 V60" stroke="#1A221C" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="400" height="700" fill="url(#streets)"/>
            {/* Major streets */}
            <path d="M-20 280 Q 200 240 420 320" stroke="#222B24" strokeWidth="24" fill="none"/>
            <path d="M-20 280 Q 200 240 420 320" stroke="#2D3830" strokeWidth="1" fill="none"/>
            <path d="M180 -20 Q 220 350 160 720" stroke="#222B24" strokeWidth="18" fill="none"/>
            <path d="M180 -20 Q 220 350 160 720" stroke="#2D3830" strokeWidth="1" fill="none"/>
            {/* Buildings */}
            <rect x="60" y="100" width="80" height="60" rx="3" fill="#1B2118"/>
            <rect x="260" y="130" width="60" height="40" rx="3" fill="#1B2118"/>
            <rect x="50" y="500" width="100" height="70" rx="3" fill="#1B2118"/>
            <rect x="260" y="480" width="70" height="50" rx="3" fill="#1B2118"/>
            {/* School campus highlighted */}
            <rect x="130" y="260" width="160" height="140" rx="4" fill="oklch(0.30 0.09 125)" opacity="0.4"/>
            <text x="210" y="335" textAnchor="middle" fill="oklch(0.85 0.12 125)" fontSize="10" fontFamily="ui-monospace" letterSpacing="1">RIDGEVIEW HIGH</text>
            {/* Geofence circle */}
            <circle cx="210" cy="330" r="100" fill="oklch(0.86 0.18 125)" opacity="0.08"/>
            <circle cx="210" cy="330" r="100" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4"/>
          </svg>
        </div>

        {/* Pulse */}
        <div style={{position:"absolute", left:"50%", top:"47%", transform:"translate(-50%, -50%)"}}>
          <div style={{position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:60, height:60, borderRadius:"50%", background:"var(--accent)", opacity:0.25}}/>
          <div style={{position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:34, height:34, borderRadius:"50%", background:"var(--accent)", opacity:0.5}}/>
          <div style={{position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:18, height:18, borderRadius:"50%", background:"var(--accent)", border:"3px solid #0E1A14", boxShadow:"0 0 12px var(--accent)"}}/>
        </div>

        <div style={{position:"absolute", top:60, left:24, right:24, display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
          <div>
            <div style={{fontFamily:"var(--mono)", fontSize:11, opacity:0.55, letterSpacing:"0.1em"}}>STEP 1 OF 2</div>
            <div style={{fontFamily:"var(--display)", fontSize:26, fontWeight:600, marginTop:4, letterSpacing:"-0.02em"}}>
              Verifying<br/>your locationâ€¦
            </div>
          </div>
          <button style={{
            width:36, height:36, borderRadius:"50%", border:"none",
            background:"rgba(0,0,0,0.5)", color:"white", fontSize:18, cursor:"pointer",
          }}>Ã—</button>
        </div>

        {/* Bottom card */}
        <div style={{
          position:"absolute", left:0, right:0, bottom:0, padding:"20px 22px 30px",
          background:"linear-gradient(180deg, transparent, #0E1A14 30%)",
        }}>
          <div style={{
            padding:18, borderRadius:18,
            background:"rgba(20,30,22,0.85)", backdropFilter:"blur(12px)",
            border:"1px solid rgba(212,244,100,0.25)",
          }}>
            <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:12}}>
              <span style={{width:8, height:8, borderRadius:"50%", background:"var(--accent)", boxShadow:"0 0 10px var(--accent)"}}/>
              <span style={{fontFamily:"var(--mono)", fontSize:11, color:"var(--accent)", letterSpacing:"0.1em"}}>INSIDE GEOFENCE</span>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, fontFamily:"var(--mono)", fontSize:11}}>
              <div>
                <div style={{opacity:0.5, fontSize:10, marginBottom:3}}>DISTANCE</div>
                <div style={{fontSize:18, fontFamily:"var(--display)", fontWeight:600, letterSpacing:"-0.02em"}}>28<span style={{fontSize:11, opacity:0.5, marginLeft:3}}>m</span></div>
              </div>
              <div>
                <div style={{opacity:0.5, fontSize:10, marginBottom:3}}>ACCURACY</div>
                <div style={{fontSize:18, fontFamily:"var(--display)", fontWeight:600, letterSpacing:"-0.02em"}}>Â±5<span style={{fontSize:11, opacity:0.5, marginLeft:3}}>m</span></div>
              </div>
              <div>
                <div style={{opacity:0.5, fontSize:10, marginBottom:3}}>BUILDING</div>
                <div style={{fontSize:13, color:"white"}}>Main Â· Gate A</div>
              </div>
              <div>
                <div style={{opacity:0.5, fontSize:10, marginBottom:3}}>COORDINATES</div>
                <div style={{fontSize:11, color:"white"}}>40.7128, âˆ’74.0060</div>
              </div>
            </div>
            <button style={{
              width:"100%", marginTop:16, padding:"14px", borderRadius:12, border:"none",
              background:"var(--accent)", color:"#000",
              fontSize:15, fontWeight:600, fontFamily:"var(--display)",
              cursor:"pointer", letterSpacing:"-0.01em",
            }}>Continue to face check-in â†’</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Clock-out screen
function MobileClockOut() {
  return (
    <div className="phone-screen">
      <div style={{padding:"50px 22px 20px", flex:1, overflow:"auto"}}>
        <div className="fm-eyebrow" style={{marginBottom:6}}>Mon, Apr 26 Â· 15:48</div>
        <h1 style={{fontFamily:"var(--display)", fontSize:30, fontWeight:600, letterSpacing:"-0.03em", margin:0}}>
          Heading out?
        </h1>
        <div className="fm-muted" style={{fontSize:13, marginTop:6}}>
          Confirm your face and we'll log your departure.
        </div>

        {/* Today's session card */}
        <div style={{
          marginTop:20, padding:18, borderRadius:16,
          background:"var(--card)", border:"1px solid var(--line)",
        }}>
          <div className="fm-eyebrow" style={{marginBottom:12}}>Today's session</div>
          <div style={{display:"flex", alignItems:"center", gap:14}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11, color:"var(--fg-4)", fontFamily:"var(--mono)"}}>CLOCKED IN</div>
              <div style={{fontSize:22, fontFamily:"var(--display)", fontWeight:600, marginTop:2}}>09:42</div>
              <div className="mono fm-muted" style={{fontSize:11, marginTop:2}}>Main Gate A</div>
            </div>
            <div style={{flex:0, padding:"4px 0"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-4)" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </div>
            <div style={{flex:1, textAlign:"right"}}>
              <div style={{fontSize:11, color:"var(--fg-4)", fontFamily:"var(--mono)"}}>NOW</div>
              <div style={{fontSize:22, fontFamily:"var(--display)", fontWeight:600, marginTop:2}}>15:48</div>
              <div className="mono" style={{fontSize:11, marginTop:2, color:"var(--accent-ink)", background:"var(--accent)", display:"inline-block", padding:"0 5px", borderRadius:3}}>6h 06m</div>
            </div>
          </div>
        </div>

        {/* Location verification */}
        <div style={{
          marginTop:14, padding:14, borderRadius:14,
          border:"1px solid var(--line)",
          display:"flex", gap:12, alignItems:"center",
        }}>
          <div style={{
            width:44, height:44, borderRadius:12,
            background:"var(--accent-soft)", color:"oklch(0.4 0.10 125)",
            display:"grid", placeItems:"center", flexShrink:0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, fontWeight:600}}>Main Gate A</div>
            <div className="mono fm-muted" style={{fontSize:11, marginTop:2}}>14 m Â· Â±4 m Â· inside campus</div>
          </div>
          <span className="fm-pill ok">verified</span>
        </div>

        {/* Mini map */}
        <div style={{
          marginTop:14, height:130, borderRadius:14, overflow:"hidden",
          border:"1px solid var(--line)", position:"relative",
        }}>
          <svg width="100%" height="100%" viewBox="0 0 400 130" preserveAspectRatio="xMidYMid slice">
            <rect width="400" height="130" fill="var(--line-2)"/>
            <path d="M0 70 H400" stroke="var(--line)" strokeWidth="16"/>
            <path d="M180 0 V130" stroke="var(--line)" strokeWidth="12"/>
            <rect x="40" y="30" width="80" height="30" fill="var(--line)" rx="3"/>
            <rect x="230" y="75" width="100" height="40" fill="var(--line)" rx="3"/>
            <circle cx="200" cy="65" r="45" fill="var(--accent)" opacity="0.15"/>
            <circle cx="200" cy="65" r="45" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3"/>
            <circle cx="200" cy="65" r="6" fill="var(--accent)" stroke="var(--card)" strokeWidth="2"/>
          </svg>
        </div>

        <div style={{flex:1, minHeight:14}}/>

        <button style={{
          width:"100%", marginTop:14, padding:"16px", borderRadius:14, border:"none",
          background:"var(--fg)", color:"var(--bg)",
          fontSize:15, fontWeight:600, fontFamily:"var(--display)",
          cursor:"pointer", letterSpacing:"-0.01em",
          display:"flex", justifyContent:"center", alignItems:"center", gap:10,
        }}>
          <I.Face size={18}/> Clock out with face
        </button>
      </div>
    </div>
  );
}






export { StudentSelf, MobileCheckIn, MobileSuccess, MobileHome, MobileGeofence, MobileClockOut };
