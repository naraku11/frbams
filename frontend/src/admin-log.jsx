// admin-log.jsx — Daily attendance log (table view)
import React, { useState, useEffect } from 'react'
import { api } from './api'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'

function hue(code) { return (parseInt((code ?? '').replace(/\D/g, '')) * 37) % 360 }

function today() {
  return new Date().toISOString().slice(0, 10)
}

function AttendanceLog() {
  const [date,   setDate]   = useState(today())
  const [status, setStatus] = useState('')
  const [grade,  setGrade]  = useState('')
  const [rows,   setRows]   = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = { date }
    if (status) params.status = status
    if (grade)  params.grade  = grade
    api.attendance(params)
      .then(raw => setRows(raw.map(r => ({
        ...r,
        id:     r.studentCode,
        hue:    hue(r.studentCode),
        first:  r.firstName,
        last:   r.lastName,
        method: r.method === 'face' ? 'Face' : r.method === 'pin' ? 'PIN' : '—',
        conf:   r.conf != null ? parseFloat(r.conf) : null,
      }))))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [date, status, grade])

  const statusTabs = [
    { label: 'All',     value: '' },
    { label: 'Present', value: 'present' },
    { label: 'Late',    value: 'late' },
    { label: 'Absent',  value: 'absent' },
  ]

  const grades = ['10A', '10B', '11A', '11B', '12A', '12B']

  const exportCSV = () => {
    const header = 'Student,ID,Grade,Time,Method,Status,Location,Camera,Confidence'
    const lines = rows.map(r => [
      `"${r.name ?? ''}"`, r.id ?? '', r.grade ?? '', r.time ?? '',
      r.method ?? '', r.status ?? '', r.location ?? '', r.camera ?? '',
      r.conf != null ? (r.conf * 100).toFixed(1) + '%' : '',
    ].join(','))
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `attendance-${date}.csv`
    a.click()
  }

  return (
    <div className="fm-screen" data-screen-label="Attendance Log">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>Attendance log</div>
              <h1 className="fm-h1">{date}</h1>
            </div>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <input
                type="date"
                className="fm-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{width:160}}
              />
              <button className="fm-btn" onClick={exportCSV}><I.Export size={14}/> Export CSV</button>
            </div>
          </div>

          <div style={{display:"flex", gap:8, marginBottom:16, alignItems:"center"}}>
            <div className="fm-tabs">
              {statusTabs.map(t => (
                <div
                  key={t.value}
                  className={`fm-tab${status === t.value ? ' active' : ''}`}
                  onClick={() => setStatus(t.value)}
                  style={{cursor:'pointer'}}
                >
                  {t.label}
                  {t.value === '' && <span className="mono fm-muted" style={{marginLeft:6, fontSize:11}}>{rows.length}</span>}
                </div>
              ))}
            </div>
            <div style={{flex:1}}/>
            <select
              className="fm-input"
              style={{width:140}}
              value={grade}
              onChange={e => setGrade(e.target.value)}
            >
              <option value="">All grades</option>
              {grades.map(g => <option key={g}>{g}</option>)}
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
                {loading ? (
                  <tr><td colSpan={10} style={{padding:32, textAlign:'center', color:'var(--fg-3)'}}>Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={10} style={{padding:32, textAlign:'center', color:'var(--fg-3)'}}>No records for this date.</td></tr>
                ) : rows.map((r) => (
                  <tr key={r.id + r.time}>
                    <td style={{paddingLeft:20}}><input type="checkbox" /></td>
                    <td>
                      <div style={{display:"flex", alignItems:"center", gap:10}}>
                        <div className="fm-avatar sm" style={{background: `oklch(0.86 0.14 ${r.hue})`}}>
                          {(r.first?.[0] ?? '') + (r.last?.[0] ?? '')}
                        </div>
                        <div>
                          <div style={{fontWeight:500}}>{r.name}</div>
                          <div className="mono fm-muted" style={{fontSize:11}}>{r.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mono fm-muted">{r.grade}</td>
                    <td className="mono">{r.time ?? '—'}</td>
                    <td>{r.method !== '—' ? (
                      <span style={{display:"inline-flex", alignItems:"center", gap:6, fontSize:12}}>
                        {r.method === "Face" ? <I.Face size={13}/> : <I.Lock size={13}/>}
                        {r.method}
                      </span>
                    ) : <span className="fm-muted">—</span>}</td>
                    <td>
                      {r.status === "absent" || !r.location ? (
                        <span className="fm-muted">—</span>
                      ) : (
                        <span style={{display:"inline-flex", alignItems:"center", gap:5, fontSize:12}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="oklch(0.5 0.16 145)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
                          <span>{r.location}</span>
                        </span>
                      )}
                    </td>
                    <td className="fm-muted" style={{fontSize:12}}>{r.camera ?? '—'}</td>
                    <td className="mono">{r.conf != null ? (r.conf * 100).toFixed(1) + '%' : <span className="fm-muted">—</span>}</td>
                    <td>
                      <span className={`fm-pill ${r.status === "present" ? "ok" : r.status === "late" ? "late" : "ab"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td><span className="fm-muted" style={{cursor:"pointer"}}>⋯</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14, fontSize:12}}>
            <span className="fm-muted mono">Showing {rows.length} record{rows.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AttendanceLog };
