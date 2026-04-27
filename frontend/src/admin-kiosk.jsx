// admin-kiosk.jsx — Live Capture (kiosk) — 3 variants
import React from 'react'
import { I } from './icons'


function KioskFrame({ children, dark = true, label }) {
  return (
    <div className="fm-screen" data-screen-label={label} style={{background: dark ? "#0A0B08" : undefined}}>
      <div style={{flex:1, position:"relative", overflow:"hidden"}}>
        {children}
      </div>
    </div>
  );
}

// Faux camera feed: grayscale gradient + scanlines + a soft silhouette
function CameraFeed({ recognized = true }) {
  return (
    <div style={{
      position:"absolute", inset:0,
      background: `
        radial-gradient(1200px 700px at 50% 110%, #1a1d18 0%, #0A0B08 70%),
        radial-gradient(500px 600px at 50% 55%, oklch(0.40 0.04 90) 0%, transparent 70%)
      `,
      overflow:"hidden",
    }}>
      {/* silhouette */}
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
           style={{position:"absolute", inset:0}}>
        <defs>
          <radialGradient id="head" cx="0.5" cy="0.4" r="0.5">
            <stop offset="0" stopColor="#3a3a32"/>
            <stop offset="1" stopColor="#1a1c17" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="400" cy="260" rx="115" ry="140" fill="url(#head)"/>
        <path d="M 240 600 Q 240 420 400 410 Q 560 420 560 600 Z" fill="#1f211b"/>
      </svg>
      {/* scanlines */}
      <div style={{
        position:"absolute", inset:0,
        background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 4px)",
        mixBlendMode: "overlay",
      }}/>
    </div>
  );
}

// VARIANT A — Welcoming hero
function KioskWelcoming() {
  return (
    <KioskFrame label="Kiosk · Welcoming">
      <CameraFeed />
      {/* Top brand strip */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, padding:"22px 32px",
        display:"flex", justifyContent:"space-between", alignItems:"center", color:"rgba(255,255,255,0.65)",
        fontFamily:"var(--mono)", fontSize:12,
      }}>
        <div style={{display:"flex", alignItems:"center", gap:10, color:"white"}}>
          <div className="fm-brand-mark" style={{background:"var(--accent)", color:"#000", fontSize:10, fontWeight:800}}>UV</div>
          <span style={{fontFamily:"var(--display)", fontSize:15, fontWeight:600, letterSpacing:"-0.02em"}}>FRBAMS Kiosk</span>
        </div>
        <div style={{display:"flex", gap:18}}>
          <span>MAIN ENTRANCE · A1</span>
          <span>09:42:11</span>
          <span style={{display:"inline-flex", alignItems:"center", gap:6, color:"oklch(0.86 0.18 125)"}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
            ON CAMPUS · 14m
          </span>
          <span style={{color:"oklch(0.86 0.18 125)"}}>● LIVE</span>
        </div>
      </div>

      {/* Soft circular reticle */}
      <div style={{
        position:"absolute", left:"50%", top:"42%", transform:"translate(-50%, -50%)",
        width:340, height:340, borderRadius:"50%",
        boxShadow:"0 0 0 2px var(--accent), 0 0 0 12px rgba(0,0,0,0.6), 0 0 80px rgba(212, 244, 100, 0.15) inset",
      }}/>

      {/* Welcome panel */}
      <div style={{
        position:"absolute", left:"50%", bottom:64, transform:"translateX(-50%)",
        textAlign:"center", color:"white", width:"min(720px, 90%)"
      }}>
        <div style={{
          fontFamily:"var(--mono)", fontSize:12, color:"var(--accent)",
          letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14,
          display:"inline-flex", alignItems:"center", gap:8,
          padding:"6px 12px", border:"1px solid var(--accent)", borderRadius:99,
        }}>
          <span style={{width:6, height:6, borderRadius:"50%", background:"var(--accent)"}}/>
          Recognized · 99.6%
        </div>
        <div style={{
          fontFamily:"var(--display)", fontSize:84, fontWeight:600, letterSpacing:"-0.04em",
          lineHeight:1.0, color:"white",
        }}>
          Good morning,<br/>
          <span style={{color:"var(--accent)"}}>Maya.</span>
        </div>
        <div style={{
          marginTop:18, fontSize:17, color:"rgba(255,255,255,0.65)",
        }}>
          Marked present · Calculus II starts in 12 min · Room 204
        </div>
        <div style={{
          marginTop:28, display:"inline-flex", alignItems:"center", gap:14,
          padding:"10px 16px 10px 14px", borderRadius:99,
          background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.7)",
          fontFamily:"var(--mono)", fontSize:12,
        }}>
          <span style={{color:"var(--accent)"}}>✓</span>
          ID S2400 · 09:42:11 · Camera A1
          <span style={{opacity:0.4}}>·</span>
          <span>Not you? <u>Tap here</u></span>
        </div>
      </div>
    </KioskFrame>
  );
}

// VARIANT B — Searching / detection
function KioskScanning() {
  return (
    <KioskFrame label="Kiosk · Scanning">
      <CameraFeed />

      {/* corner brackets */}
      {(() => {
        const cx = "50%", cy = "44%", size = 280, half = size/2;
        const cornerStyle = {
          position:"absolute", width:32, height:32, borderColor:"var(--accent)", borderStyle:"solid",
        };
        return (
          <>
            <div style={{...cornerStyle, top:`calc(${cy} - ${half}px)`, left:`calc(${cx} - ${half}px)`, borderWidth:"3px 0 0 3px"}}/>
            <div style={{...cornerStyle, top:`calc(${cy} - ${half}px)`, left:`calc(${cx} + ${half}px - 32px)`, borderWidth:"3px 3px 0 0"}}/>
            <div style={{...cornerStyle, top:`calc(${cy} + ${half}px - 32px)`, left:`calc(${cx} - ${half}px)`, borderWidth:"0 0 3px 3px"}}/>
            <div style={{...cornerStyle, top:`calc(${cy} + ${half}px - 32px)`, left:`calc(${cx} + ${half}px - 32px)`, borderWidth:"0 3px 3px 0"}}/>
          </>
        );
      })()}

      <div style={{position:"absolute", top:24, left:32, color:"white", fontFamily:"var(--mono)", fontSize:12, opacity:0.7}}>
        FACEMARK · MAIN ENTRANCE · A1 · 09:42:14
      </div>

      <div style={{
        position:"absolute", left:"50%", bottom:80, transform:"translateX(-50%)",
        textAlign:"center", color:"white",
      }}>
        <div style={{fontFamily:"var(--display)", fontSize:48, fontWeight:600, letterSpacing:"-0.03em"}}>
          Hold steady…
        </div>
        <div style={{
          marginTop:20, fontFamily:"var(--mono)", fontSize:11,
          color:"rgba(255,255,255,0.55)", display:"flex", gap:24, justifyContent:"center"
        }}>
          <span>LANDMARKS · 68/68</span>
          <span>QUALITY · 0.94</span>
          <span>MATCHING · 12% / 100%</span>
        </div>
        <div style={{
          marginTop:14, height:3, width:280, background:"rgba(255,255,255,0.1)",
          borderRadius:99, overflow:"hidden", margin:"14px auto 0",
        }}>
          <div style={{width:"38%", height:"100%", background:"var(--accent)", borderRadius:99}}/>
        </div>
      </div>
    </KioskFrame>
  );
}

// VARIANT C — Multi-person classroom
function KioskClassroom() {
  const people = [
    { name:"Maya", x:18, y:30, ok:true, conf:99 },
    { name:"Liam", x:42, y:24, ok:true, conf:97 },
    { name:"Zara", x:66, y:32, ok:true, conf:98 },
    { name:"?",    x:82, y:28, ok:false, conf:54 },
  ];
  return (
    <KioskFrame label="Kiosk · Classroom mode">
      <div style={{
        position:"absolute", inset:0,
        background:`
          linear-gradient(180deg, #15170f 0%, #0A0B08 100%)
        `,
      }}>
        {/* classroom rows */}
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
             style={{position:"absolute", inset:0}}>
          {[0,1,2].map(row => [0,1,2,3,4].map(col => (
            <ellipse key={`${row}-${col}`} cx={120 + col*140} cy={200 + row*120} rx="40" ry="50"
              fill={`oklch(0.${30 - row*4} 0.02 ${(col*40)%360})`} opacity={0.7}/>
          )))}
        </svg>
      </div>

      <div style={{position:"absolute", top:20, left:24, right:24, display:"flex", justifyContent:"space-between", color:"white"}}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <div className="fm-brand-mark" style={{background:"var(--accent)", color:"#000"}}>F</div>
          <div>
            <div style={{fontFamily:"var(--display)", fontSize:15, fontWeight:600}}>Class 11A · Calculus II</div>
            <div style={{fontFamily:"var(--mono)", fontSize:11, opacity:0.6}}>Room 204 · started 09:30</div>
          </div>
        </div>
        <div style={{textAlign:"right", fontFamily:"var(--mono)", fontSize:12}}>
          <div style={{fontSize:32, fontWeight:600, fontFamily:"var(--display)", letterSpacing:"-0.02em"}}>
            <span style={{color:"var(--accent)"}}>27</span><span style={{opacity:0.4}}>/30</span>
          </div>
          <div style={{opacity:0.6}}>RECOGNIZED</div>
        </div>
      </div>

      {/* recognition tags */}
      {people.map((p, i) => (
        <div key={i} style={{
          position:"absolute", left:p.x+"%", top:p.y+"%",
          display:"flex", flexDirection:"column", alignItems:"flex-start", gap:6,
        }}>
          <div style={{
            width:80, height:90, borderRadius:8,
            border: `2px solid ${p.ok ? "var(--accent)" : "var(--red)"}`,
          }}/>
          <div style={{
            padding:"3px 8px", borderRadius:5,
            background: p.ok ? "var(--accent)" : "var(--red)",
            color: p.ok ? "#000" : "#fff",
            fontFamily:"var(--mono)", fontSize:10.5, fontWeight:600,
            display:"flex", gap:8, alignItems:"center",
          }}>
            <span>{p.name}</span>
            <span style={{opacity:0.6}}>{p.conf}%</span>
          </div>
        </div>
      ))}

      {/* bottom strip — missing students */}
      <div style={{
        position:"absolute", bottom:24, left:24, right:24,
        background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:14, padding:"14px 18px",
        display:"flex", justifyContent:"space-between", alignItems:"center", color:"white",
      }}>
        <div>
          <div style={{fontFamily:"var(--mono)", fontSize:10.5, opacity:0.5, textTransform:"uppercase", letterSpacing:"0.1em"}}>Not yet detected</div>
          <div style={{display:"flex", gap:10, marginTop:8}}>
            {["Theo L.","Iris V.","Ravi C."].map((n,i)=>(
              <div key={i} style={{
                padding:"5px 10px", borderRadius:99,
                background:"rgba(255,255,255,0.05)", fontSize:12,
                border:"1px solid rgba(255,255,255,0.08)",
              }}>{n}</div>
            ))}
          </div>
        </div>
        <button className="fm-btn primary"><I.Check size={14}/> Lock attendance</button>
      </div>
    </KioskFrame>
  );
}

export { KioskWelcoming };
export { KioskScanning };
export { KioskClassroom };
