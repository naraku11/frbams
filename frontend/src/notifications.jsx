// notifications.jsx â€” Admin notifications screen
import React from 'react'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'


function NotificationsScreen() {
  const items = [
    { type:"absent", who:"Aisha Hassan", grade:"10A", text:"3rd consecutive absence â€” guardian auto-notified", time:"12 min ago" },
    { type:"late", who:"Noah Bennett", grade:"11A", text:"arrived 18 min late Â· Calculus II", time:"34 min ago" },
    { type:"leave", who:"Theo Lindqvist", grade:"11B", text:"submitted leave request Â· Apr 28 â€“ Apr 30", time:"1 hr ago" },
    { type:"system", who:"Camera 02 Â· North Wing", text:"lighting drop detected, recalibrating", time:"1 hr ago" },
    { type:"late", who:"Iris Vogel", grade:"10B", text:"arrived 9 min late Â· World Lit", time:"2 hr ago" },
    { type:"ok", who:"Class 11A", text:"100% on-time attendance today", time:"2 hr ago" },
    { type:"absent", who:"Ravi Costa", grade:"12B", text:"missed 1st period â€” no leave on file", time:"3 hr ago" },
    { type:"system", who:"Recognition engine", text:"weekly retraining completed Â· 0 false-positives", time:"5 hr ago" },
  ];
  const meta = {
    absent: { color:"var(--red)", label:"Absent",  icon:"X" },
    late:   { color:"var(--amber)", label:"Late",  icon:"Cal" },
    leave:  { color:"var(--blue)", label:"Leave",  icon:"Leave" },
    system: { color:"var(--fg-4)", label:"System", icon:"Settings" },
    ok:     { color:"var(--accent)", label:"All good", icon:"Check" },
  };
  return (
    <div className="fm-screen" data-screen-label="Notifications">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content" style={{maxWidth:920, margin:"0 auto", width:"100%"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>Inbox</div>
              <h1 className="fm-h1">Notifications</h1>
              <div className="fm-muted" style={{marginTop:6}}>3 unread Â· last 24 hours</div>
            </div>
            <div style={{display:"flex", gap:8}}>
              <button className="fm-btn">Mark all read</button>
              <button className="fm-btn"><I.Settings size={13}/> Rules</button>
            </div>
          </div>

          <div className="fm-tabs" style={{marginBottom:14}}>
            <div className="fm-tab active">All <span className="mono" style={{marginLeft:6}}>8</span></div>
            <div className="fm-tab">Attendance</div>
            <div className="fm-tab">Leave</div>
            <div className="fm-tab">System</div>
          </div>

          <div className="fm-card" style={{padding:0}}>
            {items.map((n, i) => {
              const m = meta[n.type];
              return (
                <div key={i} style={{
                  display:"grid", gridTemplateColumns:"auto 1fr auto", gap:14, alignItems:"center",
                  padding:"16px 20px",
                  borderBottom: i < items.length-1 ? "1px solid var(--line-2)" : "none",
                  background: i < 3 ? "var(--card)" : "transparent",
                }}>
                  <div style={{
                    width:36, height:36, borderRadius:10,
                    background:`color-mix(in oklch, ${m.color} 18%, var(--card))`,
                    color:m.color, display:"grid", placeItems:"center", flexShrink:0,
                  }}>
                    {React.createElement(I[m.icon], {size:16})}
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13.5, lineHeight:1.4}}>
                      <b style={{fontWeight:600}}>{n.who}</b>
                      {n.grade && <span className="mono fm-muted" style={{fontSize:11, marginLeft:8}}>{n.grade}</span>}
                      <span className="fm-muted"> Â· {n.text}</span>
                    </div>
                    <div className="mono fm-muted" style={{fontSize:11, marginTop:3}}>{n.time}</div>
                  </div>
                  <div style={{display:"flex", gap:6, alignItems:"center"}}>
                    {i < 3 && <span style={{width:6, height:6, borderRadius:"50%", background:m.color}}/>}
                    <button className="fm-btn">View</button>
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

export { NotificationsScreen };
