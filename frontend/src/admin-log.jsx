// admin-log.jsx â€” Daily attendance log (table view)
import React from 'react'
import { STUDENTS, COURSES } from './data'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'


function AttendanceLog() {
  
  const rows = STUDENTS.slice(0, 18).map((s, i) => {
    const r = (s.id.charCodeAt(2) * 7 + i) % 100;
    const status = r < 75 ? "present" : r < 90 ? "late" : "absent";
    const hour = 7 + (i % 3);
    const min = (i * 11) % 60;
    return {
      ...s,
      time: status === "absent" ? "â€”" : `${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}`,
      status,
      method: status === "absent" ? "â€”" : (i % 5 === 0 ? "PIN" : "Face"),
      conf: status === "absent" ? null : 0.94 + (i % 6) * 0.01,
      camera: ["Main Â· A1","North Â· B2","East Â· C1","Library Â· D2"][i % 4],
    };
  });

  return (
    <div className="fm-screen" data-screen-label="Attendance Log">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>Attendance log</div>
              <h1 className="fm-h1">Today, April 26</h1>
            </div>
            <div style={{display:"flex", gap:8}}>
              <button className="fm-btn"><I.Cal size={14}/> Apr 26, 2026 <I.Down size={12}/></button>
              <button className="fm-btn"><I.Filter size={14}/> Filter</button>
              <button className="fm-btn"><I.Export size={14}/> Export CSV</button>
            </div>
          </div>

          <div style={{display:"flex", gap:8, marginBottom:16, alignItems:"center"}}>
            <div className="fm-tabs">
              <div className="fm-tab active">All <span className="mono fm-muted" style={{marginLeft:6, fontSize:11}}>548</span></div>
              <div className="fm-tab">Present <span className="mono" style={{marginLeft:6, fontSize:11}}>412</span></div>
              <div className="fm-tab">Late <span className="mono" style={{marginLeft:6, fontSize:11}}>14</span></div>
              <div className="fm-tab">Absent <span className="mono" style={{marginLeft:6, fontSize:11}}>22</span></div>
            </div>
            <div style={{flex:1}}/>
            <select className="fm-input" style={{width:140}} defaultValue="all">
              <option value="all">All grades</option>
              <option>10A</option><option>11B</option>
            </select>
          </div>

          <div className="fm-card" style={{padding:0, overflow:"hidden"}}>
            <table className="fm-table">
              <thead>
                <tr>
                  <th style={{paddingLeft:20, width:34}}><input type="checkbox" /></th>
                  <th>Student</th>
                  <th>Grade</th>
                  <th>Time</th>
                  <th>Method</th>
                  <th>Location</th>
                  <th>Camera</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th style={{width:30}}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td style={{paddingLeft:20}}><input type="checkbox" /></td>
                    <td>
                      <div style={{display:"flex", alignItems:"center", gap:10}}>
                        <div className="fm-avatar sm" style={{background: `oklch(0.86 0.14 ${r.hue})`}}>
                          {r.first[0]+r.last[0]}
                        </div>
                        <div>
                          <div style={{fontWeight:500}}>{r.name}</div>
                          <div className="mono fm-muted" style={{fontSize:11}}>{r.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mono fm-muted">{r.grade}</td>
                    <td className="mono">{r.time}</td>
                    <td>{r.method !== "â€”" ? (
                      <span style={{display:"inline-flex", alignItems:"center", gap:6, fontSize:12}}>
                        {r.method === "Face" ? <I.Face size={13}/> : <I.Lock size={13}/>}
                        {r.method}
                      </span>
                    ) : <span className="fm-muted">â€”</span>}</td>
                    <td>
                      {r.status === "absent" ? <span className="fm-muted">â€”</span> : (
                        <span style={{display:"inline-flex", alignItems:"center", gap:5, fontSize:12}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="oklch(0.5 0.16 145)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
                          <span>{["Main Gate A","North Gate","East Court","Library"][i % 4]}</span>
                          <span className="mono fm-muted" style={{fontSize:10.5}}>{8 + (i*3)%30}m</span>
                        </span>
                      )}
                    </td>
                    <td className="fm-muted" style={{fontSize:12}}>{r.camera}</td>
                    <td className="mono">{r.conf ? (r.conf*100).toFixed(1)+"%" : <span className="fm-muted">â€”</span>}</td>
                    <td>
                      <span className={`fm-pill ${r.status === "present" ? "ok" : r.status === "late" ? "late" : "ab"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td><span className="fm-muted" style={{cursor:"pointer"}}>â‹¯</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14, fontSize:12}}>
            <span className="fm-muted mono">Showing 1â€“18 of 548</span>
            <div style={{display:"flex", gap:6}}>
              <button className="fm-btn">â€¹</button>
              <button className="fm-btn dark">1</button>
              <button className="fm-btn">2</button>
              <button className="fm-btn">3</button>
              <button className="fm-btn">â€º</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AttendanceLog };
