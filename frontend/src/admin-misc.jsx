// admin-misc.jsx — Enrollment, Reports, Settings, Notifications, Leave
import React from 'react'
import { api } from './api'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'
import { THEMES, getSavedTheme, saveTheme } from './theme'


// ── CSV helpers ──────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (!lines.length) return []
  const splitLine = (line) => {
    const result = []; let cur = ''; let inQ = false
    for (const ch of line) {
      if (ch === '"') inQ = !inQ
      else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = '' }
      else cur += ch
    }
    result.push(cur.trim()); return result
  }
  const raw0 = splitLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_-]/g, ''))
  const FIELD_MAP = {
    firstname: 'firstName', lastname: 'lastName',
    studentcode: 'studentCode', studentid: 'studentCode', id: 'studentCode',
    gradelabel: 'gradeLabel', grade: 'gradeLabel', section: 'gradeLabel',
    email: 'email', guardianemail: 'email',
  }
  const isHeader = raw0.some(h => FIELD_MAP[h])
  const dataLines = isHeader ? lines.slice(1) : lines
  const headers = isHeader ? raw0 : null
  return dataLines.map(line => {
    const cols = splitLine(line)
    if (headers) {
      const obj = { firstName: '', lastName: '', studentCode: '', gradeLabel: '', email: '' }
      headers.forEach((h, i) => { const f = FIELD_MAP[h]; if (f) obj[f] = cols[i] ?? '' })
      return obj
    }
    return { firstName: cols[0] ?? '', lastName: cols[1] ?? '', studentCode: cols[2] ?? '', gradeLabel: cols[3] ?? '', email: cols[4] ?? '' }
  }).filter(r => r.firstName || r.lastName || r.studentCode)
}

function rowError(r) {
  if (!r.firstName || !r.lastName || !r.studentCode || !r.gradeLabel) return 'Missing required field'
  if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) return 'Invalid email'
  return null
}

// ── EnrollDialog ─────────────────────────────────────────────────────────────

function EnrollDialog({ open, grades, onClose, onEnrolled }) {
  const EMPTY = { firstName: '', lastName: '', studentCode: '', gradeLabel: '', email: '' }
  const [form,   setForm]   = React.useState(EMPTY)
  const [saving, setSaving] = React.useState(false)
  const [done,   setDone]   = React.useState(null)
  const [error,  setError]  = React.useState('')
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (open) { setForm(EMPTY); setDone(null); setError(''); setCopied(false) }
  }, [open])

  if (!open) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.firstName || !form.lastName || !form.studentCode || !form.gradeLabel) {
      setError('Please fill in all required fields.'); return
    }
    setSaving(true); setError('')
    try {
      const res = await api.enrollStudent(form)
      setDone(res); setForm(EMPTY); onEnrolled?.()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(2px)' }} />
      <div style={{
        position:'relative', zIndex:1, background:'var(--bg)', borderRadius:14,
        width:520, maxWidth:'95vw', maxHeight:'90vh', display:'flex', flexDirection:'column',
        boxShadow:'0 8px 60px rgba(0,0,0,0.25)', border:'1px solid var(--line)',
      }}>
        <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--line-2)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:11.5, fontWeight:600, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>Enrollment</div>
            <div style={{ fontSize:16, fontWeight:700 }}>Enroll a new student</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', padding:4, display:'grid', placeItems:'center', borderRadius:6 }}>
            <I.X size={15} />
          </button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          {done && (
            <div style={{ padding:'14px 18px', borderRadius:10, background:'var(--accent-soft)', border:'1px solid var(--accent)', fontSize:13, lineHeight:1.5 }}>
              <div><b style={{ fontWeight:600 }}>Enrolled:</b> {done.name} · <span className="mono">{done.studentCode}</span> · {done.grade}</div>
              {done.tempPassword && (
                <div style={{ marginTop:8, padding:'8px 12px', background:'var(--card)', borderRadius:7, display:'flex', alignItems:'center', gap:10 }}>
                  <span className="fm-muted" style={{ fontSize:12 }}>One-time password:</span>
                  <span className="mono" style={{ fontWeight:700, fontSize:14, flex:1 }}>{done.tempPassword}</span>
                  <button className="fm-btn" style={{ fontSize:11 }} onClick={() => {
                    navigator.clipboard?.writeText(done.tempPassword)
                    setCopied(true); setTimeout(() => setCopied(false), 2000)
                  }}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>
              )}
              <div style={{ marginTop:10, fontSize:11.5, color:'var(--fg-3)' }}>Share this password with the student. It will not be shown again.</div>
              <button className="fm-btn" style={{ marginTop:10, fontSize:11 }} onClick={() => { setDone(null); setCopied(false) }}>Enroll another</button>
            </div>
          )}

          <div className="fm-card">
            <h3 className="fm-h3" style={{ marginBottom:14 }}>Student details</h3>
            <div style={{ display:'grid', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5 }}>First name <span style={{ color:'var(--red)' }}>*</span></div>
                  <input className="fm-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="e.g. Juan" />
                </div>
                <div>
                  <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5 }}>Last name <span style={{ color:'var(--red)' }}>*</span></div>
                  <input className="fm-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="e.g. Dela Cruz" />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5 }}>Student ID <span style={{ color:'var(--red)' }}>*</span></div>
                  <input className="fm-input mono" value={form.studentCode} onChange={e => set('studentCode', e.target.value)} placeholder="e.g. S2025-001" />
                </div>
                <div>
                  <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5 }}>Grade <span style={{ color:'var(--red)' }}>*</span></div>
                  <select className="fm-input" value={form.gradeLabel} onChange={e => set('gradeLabel', e.target.value)}>
                    <option value="">Select grade…</option>
                    {grades.map(g => <option key={g.id} value={g.label}>{g.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5 }}>Guardian email <span className="fm-muted">(optional)</span></div>
                <input className="fm-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="guardian@example.com" />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding:'10px 14px', borderRadius:8, background:'color-mix(in oklch, var(--red) 12%, var(--card))', color:'var(--red)', fontSize:12.5 }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ padding:'14px 20px', borderTop:'1px solid var(--line-2)', display:'flex', justifyContent:'flex-end', gap:8, flexShrink:0 }}>
          <button className="fm-btn" onClick={onClose}>Cancel</button>
          <button className="fm-btn primary" disabled={saving} onClick={submit}>
            {saving ? 'Enrolling…' : <><I.Check size={13} /> Enroll student</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ImportDialog ──────────────────────────────────────────────────────────────

function ImportDialog({ open, grades, onClose, onImported }) {
  const [step,       setStep]       = React.useState(1)
  const [rows,       setRows]       = React.useState([])
  const [importing,  setImporting]  = React.useState(false)
  const [results,    setResults]    = React.useState(null)
  const [copiedIdx,  setCopiedIdx]  = React.useState(null)
  const [dragging,   setDragging]   = React.useState(false)
  const [importErr,  setImportErr]  = React.useState('')
  const fileRef = React.useRef()

  React.useEffect(() => {
    if (open) { setStep(1); setRows([]); setResults(null); setCopiedIdx(null); setImportErr('') }
  }, [open])

  if (!open) return null

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => { setRows(parseCSV(e.target.result)); setStep(2) }
    reader.readAsText(file)
  }

  const removeRow = (i) => setRows(prev => prev.filter((_, idx) => idx !== i))

  const doImport = async () => {
    setImporting(true); setImportErr('')
    try {
      const res = await api.bulkEnrollStudents({ students: rows })
      setResults(res); setStep(3)
      if (res.enrolled > 0) onImported?.()
    } catch (e) { setImportErr(e.message) }
    finally { setImporting(false) }
  }

  const downloadTemplate = () => {
    const csv = 'firstName,lastName,studentCode,gradeLabel,email\nJuan,Dela Cruz,S2025-001,10A,guardian@example.com\nMaria,Santos,S2025-002,11B,'
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'frbams-import-template.csv'; a.click()
  }

  const invalidCount = rows.filter(r => rowError(r)).length

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={step === 3 ? null : onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(2px)' }} />
      <div style={{
        position:'relative', zIndex:1, background:'var(--bg)', borderRadius:14,
        width: step === 1 ? 520 : 720, maxWidth:'96vw', maxHeight:'90vh',
        display:'flex', flexDirection:'column',
        boxShadow:'0 8px 60px rgba(0,0,0,0.25)', border:'1px solid var(--line)',
      }}>
        {/* Header */}
        <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--line-2)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:11.5, fontWeight:600, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>
              {step < 3 ? `Step ${step} of 2` : 'Complete'}
            </div>
            <div style={{ fontSize:16, fontWeight:700 }}>
              {step === 1 ? 'Import students from CSV' : step === 2 ? `Review ${rows.length} student${rows.length !== 1 ? 's' : ''}` : 'Import complete'}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', padding:4, display:'grid', placeItems:'center', borderRadius:6 }}>
            <I.X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:14 }}>

          {/* ── Step 1: file picker ── */}
          {step === 1 && (
            <>
              <div className="fm-muted" style={{ fontSize:13, lineHeight:1.6 }}>
                Upload a CSV file to enroll multiple students at once. Each student gets a unique one-time password.
              </div>
              <div style={{ padding:'12px 16px', background:'var(--card)', borderRadius:8, border:'1px solid var(--line)', fontSize:12.5 }}>
                <div style={{ fontWeight:600, marginBottom:8 }}>Required columns</div>
                <div className="mono" style={{ fontSize:11.5, color:'var(--fg-2)', lineHeight:2 }}>
                  firstName · lastName · studentCode · gradeLabel<br />
                  <span style={{ color:'var(--fg-3)' }}>Optional: email (guardian)</span>
                </div>
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                onClick={() => fileRef.current?.click()}
                style={{
                  border:`2px dashed ${dragging ? 'var(--accent)' : 'var(--line)'}`,
                  borderRadius:10, padding:'40px 20px', textAlign:'center', cursor:'pointer',
                  background: dragging ? 'var(--accent-soft)' : 'var(--card)',
                  transition:'border-color 0.15s, background 0.15s',
                }}
              >
                <I.Upload size={28} style={{ margin:'0 auto 10px', color:'var(--fg-3)', display:'block' }} />
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Drop CSV file here</div>
                <div className="fm-muted" style={{ fontSize:12 }}>or click to browse</div>
              </div>
              <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display:'none' }}
                onChange={e => { if (e.target.files[0]) { handleFile(e.target.files[0]); e.target.value = '' } }} />
              <button className="fm-btn" style={{ alignSelf:'flex-start', fontSize:12 }} onClick={downloadTemplate}>
                <I.Export size={13} /> Download template
              </button>
            </>
          )}

          {/* ── Step 2: preview table ── */}
          {step === 2 && (
            <>
              {invalidCount > 0 && (
                <div style={{ padding:'10px 14px', borderRadius:8, background:'color-mix(in oklch, var(--amber) 14%, var(--card))', color:'var(--amber)', fontSize:12.5 }}>
                  {invalidCount} row{invalidCount !== 1 ? 's have' : ' has'} missing required fields and will be skipped. Remove them or they will be sent to the server for an error response.
                </div>
              )}
              {importErr && (
                <div style={{ padding:'10px 14px', borderRadius:8, background:'color-mix(in oklch, var(--red) 12%, var(--card))', color:'var(--red)', fontSize:12.5 }}>
                  {importErr}
                </div>
              )}
              <div className="fm-card" style={{ padding:0, overflow:'hidden' }}>
                <table className="fm-table" style={{ fontSize:12.5 }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft:16, width:36 }}>#</th>
                      <th>First name</th>
                      <th>Last name</th>
                      <th>Student ID</th>
                      <th>Grade</th>
                      <th>Email</th>
                      <th style={{ width:34 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const err = rowError(r)
                      return (
                        <tr key={i} style={{ background: err ? 'color-mix(in oklch, var(--red) 5%, var(--card))' : undefined }}>
                          <td style={{ paddingLeft:16, color:'var(--fg-3)' }} className="mono">{i + 1}</td>
                          <td>{r.firstName || <span style={{ color:'var(--red)', fontSize:11 }}>missing</span>}</td>
                          <td>{r.lastName  || <span style={{ color:'var(--red)', fontSize:11 }}>missing</span>}</td>
                          <td className="mono">{r.studentCode || <span style={{ color:'var(--red)', fontSize:11 }}>missing</span>}</td>
                          <td className="mono">{r.gradeLabel  || <span style={{ color:'var(--red)', fontSize:11 }}>missing</span>}</td>
                          <td className="mono" style={{ color:'var(--fg-3)' }}>{r.email || '—'}</td>
                          <td>
                            <button
                              onClick={() => removeRow(i)}
                              title="Remove row"
                              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', padding:'2px 6px', borderRadius:4, fontSize:15, lineHeight:1 }}
                            >×</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── Step 3: results ── */}
          {step === 3 && results && (
            <>
              <div style={{ display:'flex', gap:12 }}>
                <div style={{ flex:1, padding:'16px 20px', borderRadius:10, background:'var(--accent-soft)', border:'1px solid var(--accent)', textAlign:'center' }}>
                  <div className="mono" style={{ fontSize:30, fontWeight:700, color:'var(--accent)' }}>{results.enrolled}</div>
                  <div className="fm-muted" style={{ fontSize:12, marginTop:4 }}>enrolled</div>
                </div>
                {results.failed > 0 && (
                  <div style={{ flex:1, padding:'16px 20px', borderRadius:10, background:'color-mix(in oklch, var(--red) 12%, var(--card))', border:'1px solid color-mix(in oklch, var(--red) 40%, transparent)', textAlign:'center' }}>
                    <div className="mono" style={{ fontSize:30, fontWeight:700, color:'var(--red)' }}>{results.failed}</div>
                    <div className="fm-muted" style={{ fontSize:12, marginTop:4 }}>failed</div>
                  </div>
                )}
              </div>
              {results.enrolled > 0 && (
                <div className="fm-muted" style={{ fontSize:12 }}>Copy and save the passwords below — they will not be shown again.</div>
              )}
              <div className="fm-card" style={{ padding:0, overflow:'hidden' }}>
                <table className="fm-table" style={{ fontSize:12.5 }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft:16 }}>Student</th>
                      <th>Grade</th>
                      <th>One-time password</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((r, i) => (
                      <tr key={i}>
                        <td style={{ paddingLeft:16 }}>
                          <div style={{ fontWeight:500 }}>{r.name || r.studentCode}</div>
                          <div className="mono fm-muted" style={{ fontSize:11 }}>{r.studentCode}</div>
                        </td>
                        <td className="mono">{r.grade || '—'}</td>
                        <td>
                          {r.ok ? (
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <span className="mono" style={{ fontWeight:600 }}>{r.tempPassword}</span>
                              <button className="fm-btn" style={{ fontSize:10, padding:'2px 8px' }} onClick={() => {
                                navigator.clipboard?.writeText(r.tempPassword)
                                setCopiedIdx(i); setTimeout(() => setCopiedIdx(null), 2000)
                              }}>{copiedIdx === i ? 'Copied!' : 'Copy'}</button>
                            </div>
                          ) : <span className="fm-muted">—</span>}
                        </td>
                        <td>
                          {r.ok
                            ? <span className="fm-pill ok" style={{ fontSize:10 }}>Enrolled</span>
                            : <span style={{ color:'var(--red)', fontSize:11 }}>{r.error}</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid var(--line-2)', display:'flex', justifyContent: step === 2 ? 'space-between' : 'flex-end', gap:8, flexShrink:0 }}>
          {step === 1 && <button className="fm-btn" onClick={onClose}>Cancel</button>}
          {step === 2 && (
            <>
              <button className="fm-btn" onClick={() => setStep(1)}>← Back</button>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                {invalidCount > 0 && (
                  <span className="fm-muted" style={{ fontSize:12 }}>{invalidCount} invalid will be skipped</span>
                )}
                <button className="fm-btn" onClick={onClose}>Cancel</button>
                <button className="fm-btn primary" disabled={importing || rows.length === 0} onClick={doImport}>
                  {importing ? 'Importing…' : <><I.Check size={13} /> Import {rows.length} student{rows.length !== 1 ? 's' : ''}</>}
                </button>
              </div>
            </>
          )}
          {step === 3 && <button className="fm-btn primary" onClick={onClose}>Done</button>}
        </div>
      </div>
    </div>
  )
}

function Reports() {
  const [month,  setMonth]  = React.useState(() => new Date().toISOString().slice(0, 7))
  const [report, setReport] = React.useState(null)

  React.useEffect(() => {
    api.reports(month).then(setReport).catch(() => setReport(null))
  }, [month])

  const bars = (report?.daily ?? []).map(d => ({
    d: new Date(d.date + 'T00:00:00').getDate(),
    v: d.enrolled > 0 ? Math.round((d.present / d.enrolled) * 100) : 0,
  }))

  const courses = (report?.courses ?? []).map(c => ({
    name:     c.course,
    enrolled: c.enrolled,
    pct:      c.enrolled > 0 ? Math.round((c.attended / c.enrolled) * 100) : 0,
    late:     c.late,
    absent:   c.absent,
  }))

  return (
    <div className="fm-screen" data-screen-label="Reports">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24}}>
            <div>
              <div className="fm-eyebrow" style={{marginBottom:8}}>Reports · {month}</div>
              <h1 className="fm-h1">Monthly attendance</h1>
            </div>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <input
                type="month"
                className="fm-input"
                value={month}
                onChange={e => setMonth(e.target.value)}
                style={{width:160}}
              />
              <button className="fm-btn primary" onClick={() => window.print()}><I.Export size={14}/> Generate PDF</button>
            </div>
          </div>

          <div className="fm-card" style={{marginBottom:16}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:18}}>
              <h2 className="fm-h2">Daily trend</h2>
            </div>
            {bars.length === 0 ? (
              <div style={{height:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, color:'var(--fg-3)'}}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--line-2)',
                  display: 'grid', placeItems: 'center', color: 'var(--fg-4)',
                }}>
                  <I.Chart size={22} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>No data yet</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>No attendance records for {month}.</div>
              </div>
            ) : (
              <div style={{height:200, display:"flex", alignItems:"flex-end", gap:3, paddingTop: 16}}>
                {bars.map((b, i) => (
                  <div
                    key={i}
                    title={`Day ${b.d}: ${b.v}%`}
                    style={{
                      flex:1, minHeight: 3,
                      height: `${Math.max(b.v || 1, 1)}%`,
                      background: b.v < 80
                        ? 'var(--amber)'
                        : 'linear-gradient(180deg, #d9b230 0%, var(--accent) 100%)',
                      borderRadius:"4px 4px 0 0",
                      opacity: b.v > 0 ? 1 : 0.3,
                      transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'default',
                    }}
                  />
                ))}
              </div>
            )}
            <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontFamily:"var(--mono)", fontSize:10.5, color:"var(--fg-3)"}}>
              <span>Day 1</span><span>Day 15</span><span>Day 30</span>
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
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="fm-empty">
                        <div className="fm-empty-icon"><I.Chart size={20} /></div>
                        <div className="fm-empty-title">No course data</div>
                        <div className="fm-empty-sub">No course-level attendance data for this month.</div>
                      </div>
                    </td>
                  </tr>
                ) : courses.map((c) => (
                  <tr key={c.name}>
                    <td style={{paddingLeft:20, fontWeight:500}}>{c.name}</td>
                    <td className="mono">{c.enrolled}</td>
                    <td className="mono">{c.pct}%</td>
                    <td className="mono">{c.late}</td>
                    <td className="mono">{c.absent}</td>
                    <td>
                      <div style={{height:6, background:"var(--line-2)", borderRadius:99, overflow:"hidden"}}>
                        <div style={{width:c.pct+"%", height:"100%", background: c.pct < 85 ? "var(--amber)" : "var(--accent)"}}/>
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
  const [cfg, setCfg] = React.useState(null)
  const saveTimer = React.useRef(null)

  React.useEffect(() => {
    api.recognitionSettings().then(setCfg).catch(() => {})
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [])

  const save = (patch) => {
    const next = { ...cfg, ...patch }
    setCfg(next)
    // Debounce API calls to avoid a request per slider pixel
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      api.saveRecognitionSettings(next).catch(() => {})
    }, 400)
  }

  const threshold = cfg?.confidenceThreshold ?? 96

  const toggleRows = [
    { key: 'livenessDetection',  label: 'Liveness detection',   desc: 'Detect printed photos and screen replays' },
    { key: 'maskTolerance',      label: 'Mask tolerance',        desc: 'Allow recognition with surgical/cloth masks' },
    { key: 'multiAngleTemplate', label: 'Multi-angle template',  desc: 'Use 5-angle template for outdoor cameras' },
    { key: 'autoRetrain',        label: 'Auto re-train',         desc: 'Refresh templates monthly from passing frames' },
    { key: 'anonymousMetrics',   label: 'Anonymous metrics',     desc: 'Send aggregate accuracy data to FRBAMS Cloud' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom: 4 }}>Match confidence threshold</h3>
        <div className="fm-muted" style={{ fontSize: 12, marginBottom: 18 }}>
          Below this confidence, the system asks for a PIN fallback.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <input
            type="range" min="80" max="99.9" step="0.1"
            value={threshold}
            onChange={e => save({ confidenceThreshold: parseFloat(e.target.value) })}
            style={{ flex: 1, accentColor: 'var(--accent)' }}
          />
          <div className="mono" style={{ fontSize: 18, fontWeight: 600, width: 60, textAlign: 'right' }}>
            {Number(threshold).toFixed(1)}%
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)' }}>
          <span>Permissive</span><span>Recommended</span><span>Strict</span>
        </div>
      </div>
      <div className="fm-card" style={{ padding: 0 }}>
        {toggleRows.map((row, i, arr) => (
          <div key={row.key} style={{
            padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: i < arr.length - 1 ? '1px solid var(--line-2)' : 'none',
            cursor: cfg ? 'pointer' : 'default',
          }} onClick={() => cfg && save({ [row.key]: !cfg[row.key] })}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13.5 }}>{row.label}</div>
              <div className="fm-muted" style={{ fontSize: 12, marginTop: 2 }}>{row.desc}</div>
            </div>
            <div className={`fm-toggle ${cfg?.[row.key] ? 'on' : ''}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsCameras() {
  const [cameras, setCameras] = React.useState(null)

  React.useEffect(() => {
    api.cameras().then(setCameras).catch(() => setCameras([]))
  }, [])

  return (
    <div className="fm-card">
      <h3 className="fm-h3" style={{ marginBottom: 14 }}>Camera network</h3>
      {cameras === null ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', color: 'var(--fg-3)' }}>
          <div className="fm-spinner sm" />
          <span style={{ fontSize: 13 }}>Loading cameras…</span>
        </div>
      ) : cameras.length === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'var(--line-2)',
            display: 'grid', placeItems: 'center', color: 'var(--fg-4)', margin: '0 auto 10px',
          }}>
            <I.Camera size={20} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>No cameras configured</div>
          <div className="fm-muted" style={{ fontSize: 12 }}>Connect camera devices to start monitoring entry points.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {cameras.map(c => {
            const isOnline = c.status === 'online'
            const quality  = c.quality != null ? `${Math.round(c.quality * 100)}%` : '—'
            return (
              <div key={c.id} style={{
                padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: isOnline ? 'var(--card)' : 'color-mix(in srgb, var(--amber) 4%, var(--card))',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: isOnline ? 'var(--green)' : 'var(--amber)',
                    flexShrink: 0,
                    boxShadow: isOnline ? '0 0 0 3px color-mix(in srgb, var(--green) 22%, transparent)' : 'none',
                  }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
                    <div className="mono fm-muted" style={{ fontSize: 11, marginTop: 2 }}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      {c.room ? ` · ${c.room}` : ''}
                    </div>
                  </div>
                </div>
                <div className="mono" style={{
                  fontSize: 13, fontWeight: 600,
                  color: isOnline ? 'var(--green)' : 'var(--amber)',
                }}>{quality}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const EVENT_LABELS = {
  absent:            'Absent student',
  late:              'Late arrival',
  consecutive_absent:'Consecutive absences',
  leave_submitted:   'Leave request submitted',
  leave_reviewed:    'Leave request reviewed',
  camera_offline:    'Camera offline',
  sync_complete:     'Sync completed',
}

function SettingsNotifications() {
  const [rules, setRules] = React.useState([])

  React.useEffect(() => {
    api.notificationRules().then(setRules).catch(() => {})
  }, [])

  const toggle = (rule, key) => {
    const patch = { [key]: !rule[key] }
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, ...patch } : r))
    api.updateNotificationRule(rule.id, patch)
      .catch(() => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, [key]: rule[key] } : r)))
  }

  return (
    <div className="fm-card" style={{ padding: 0 }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr repeat(4, 80px)',
        padding: '10px 20px', borderBottom: '1px solid var(--line-2)',
        fontSize: 11, color: 'var(--fg-3)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        <span>Event</span>
        <span style={{ textAlign: 'center' }}>Active</span>
        <span style={{ textAlign: 'center' }}>Admin</span>
        <span style={{ textAlign: 'center' }}>Teacher</span>
        <span style={{ textAlign: 'center' }}>Guardian</span>
      </div>
      {rules.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>Loading…</div>
      ) : rules.map((r, i) => (
        <div key={r.id} style={{
          display: 'grid', gridTemplateColumns: '1fr repeat(4, 80px)',
          padding: '14px 20px', alignItems: 'center',
          borderBottom: i < rules.length - 1 ? '1px solid var(--line-2)' : 'none',
        }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13.5 }}>{EVENT_LABELS[r.eventType] ?? r.eventType}</div>
            {r.threshold > 1 && <div className="fm-muted" style={{ fontSize: 11.5 }}>threshold: {r.threshold}</div>}
          </div>
          {['isActive', 'notifyAdmin', 'notifyTeacher', 'notifyGuardianEmail'].map(key => (
            <div key={key} style={{ display: 'grid', placeItems: 'center', cursor: 'pointer' }}
              onClick={() => toggle(r, key)}>
              <div className={`fm-toggle ${r[key] ? 'on' : ''}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function AssetUploadField({ label, value, onChange, onUpload, uploading }) {
  const ref = React.useRef()
  return (
    <div>
      <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        {value
          ? <img src={value} alt={label} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)' }} />
          : <div style={{ width: 48, height: 48, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--line-2)', display: 'grid', placeItems: 'center', fontSize: 11, color: 'var(--fg-3)' }}>none</div>
        }
        <div style={{ flex: 1 }}>
          <input
            className="fm-input"
            placeholder="https://…"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ marginBottom: 6 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="fm-btn" style={{ fontSize: 12 }}
              onClick={() => ref.current?.click()}
              disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload file'}
            </button>
            {value && (
              <button className="fm-btn" style={{ fontSize: 12 }} onClick={() => onChange('')}>Remove</button>
            )}
          </div>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) { onUpload(e.target.files[0]); e.target.value = '' } }} />
    </div>
  )
}

function SettingsBranding() {
  const [form,     setForm]     = React.useState({ name: '', shortName: '', logoUrl: '', faviconUrl: '', address: '', timezone: '' })
  const [uploading, setUploading] = React.useState(null)
  const [saving,   setSaving]   = React.useState(false)
  const [saved,    setSaved]    = React.useState(false)
  const [error,    setError]    = React.useState('')

  React.useEffect(() => {
    api.schoolInfo().then(d => setForm({
      name:       d.name       ?? '',
      shortName:  d.shortName  ?? '',
      logoUrl:    d.logoUrl    ?? '',
      faviconUrl: d.faviconUrl ?? '',
      address:    d.address    ?? '',
      timezone:   d.timezone   ?? '',
    })).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const upload = async (field, file) => {
    setUploading(field)
    try {
      const { url } = await api.uploadAsset(file)
      set(field, url)
    } catch (e) { setError(e.message) }
    setUploading(null)
  }

  const save = async () => {
    setSaving(true); setError('')
    try {
      await api.updateSchoolInfo(form)
      const branding = { schoolName: form.name, shortName: form.shortName, logoUrl: form.logoUrl, faviconUrl: form.faviconUrl }
      localStorage.setItem('frbams_branding', JSON.stringify(branding))
      window.dispatchEvent(new Event('frbams:branding'))
      if (form.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']")
        if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
        link.href = form.faviconUrl
      }
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom: 4 }}>School identity</h3>
        <div className="fm-muted" style={{ fontSize: 12, marginBottom: 18 }}>
          These details appear in the sidebar and browser tab across the whole admin panel.
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 5 }}>School name</div>
              <input className="fm-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="University of the Visayas" />
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 5 }}>Brand mark</div>
              <input className="fm-input" value={form.shortName} onChange={e => set('shortName', e.target.value.slice(0, 6))} placeholder="UV" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 5 }}>Address</div>
            <input className="fm-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Colon St., Cebu City" />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 5 }}>Timezone</div>
            <select className="fm-input" value={form.timezone} onChange={e => set('timezone', e.target.value)}>
              {['Asia/Manila','UTC','America/New_York','America/Los_Angeles','Europe/London','Asia/Singapore'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom: 4 }}>Logo &amp; icon</h3>
        <div className="fm-muted" style={{ fontSize: 12, marginBottom: 18 }}>
          PNG, JPG, SVG or WebP recommended. Max 2 MB. The logo replaces the brand mark in the sidebar when set.
        </div>
        <div style={{ display: 'grid', gap: 20 }}>
          <AssetUploadField
            label="School logo (sidebar)"
            value={form.logoUrl}
            onChange={v => set('logoUrl', v)}
            onUpload={f => upload('logoUrl', f)}
            uploading={uploading === 'logoUrl'}
          />
          <AssetUploadField
            label="Favicon / browser tab icon"
            value={form.faviconUrl}
            onChange={v => set('faviconUrl', v)}
            onUpload={f => upload('faviconUrl', f)}
            uploading={uploading === 'faviconUrl'}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'color-mix(in oklch, var(--red) 12%, var(--card))', color: 'var(--red)', fontSize: 12.5 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
        {saved && <span style={{ fontSize: 12.5, color: 'var(--accent)' }}>Saved successfully</span>}
        <button className="fm-btn primary" disabled={saving || uploading !== null} onClick={save}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

// ── Privacy & Retention ───────────────────────────────────────────────────────

function SettingsPrivacy() {
  const [form, setForm] = React.useState({
    dataRetentionMonths: 24, biometricRetentionMonths: 12,
    requireBiometricConsent: true, anonymizeOnLeave: false,
    autoArchiveInactiveMonths: '',
  })
  const [saving, setSaving] = React.useState(false)
  const [saved,  setSaved]  = React.useState(false)
  const [error,  setError]  = React.useState('')

  React.useEffect(() => {
    api.privacySettings().then(d => setForm({
      dataRetentionMonths:       d.dataRetentionMonths      ?? 24,
      biometricRetentionMonths:  d.biometricRetentionMonths ?? 12,
      requireBiometricConsent:   Boolean(d.requireBiometricConsent   ?? true),
      anonymizeOnLeave:          Boolean(d.anonymizeOnLeave           ?? false),
      autoArchiveInactiveMonths: d.autoArchiveInactiveMonths != null ? d.autoArchiveInactiveMonths : '',
    })).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true); setError('')
    try {
      await api.savePrivacySettings({
        ...form,
        autoArchiveInactiveMonths: form.autoArchiveInactiveMonths !== '' ? parseInt(form.autoArchiveInactiveMonths) : null,
      })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  const toggleRows = [
    { key: 'requireBiometricConsent', label: 'Require biometric consent form', desc: 'Students must sign a consent form before face templates are enrolled' },
    { key: 'anonymizeOnLeave',        label: 'Anonymize data on student leave', desc: 'Replace name with an anonymous ID when a student is deactivated' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom:4 }}>Data retention</h3>
        <div className="fm-muted" style={{ fontSize:12, marginBottom:18 }}>
          Records older than the retention period are automatically purged. Affects storage and compliance.
        </div>
        <div style={{ display:'grid', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:6 }}>Attendance records</div>
              <select className="fm-input" value={form.dataRetentionMonths} onChange={e => set('dataRetentionMonths', parseInt(e.target.value))}>
                {[6, 12, 24, 36, 60].map(m => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:6 }}>Biometric templates</div>
              <select className="fm-input" value={form.biometricRetentionMonths} onChange={e => set('biometricRetentionMonths', parseInt(e.target.value))}>
                {[3, 6, 12, 24].map(m => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
          </div>
          <div>
            <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:6 }}>Auto-archive inactive students after (months)</div>
            <input
              className="fm-input" type="number" min="1" max="60"
              placeholder="Leave blank to disable"
              value={form.autoArchiveInactiveMonths}
              onChange={e => set('autoArchiveInactiveMonths', e.target.value)}
              style={{ maxWidth:220 }}
            />
          </div>
        </div>
      </div>

      <div className="fm-card" style={{ padding:0 }}>
        {toggleRows.map((row, i, arr) => (
          <div key={row.key} style={{
            padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center',
            borderBottom: i < arr.length - 1 ? '1px solid var(--line-2)' : 'none', cursor:'pointer',
          }} onClick={() => set(row.key, !form[row.key])}>
            <div>
              <div style={{ fontWeight:500, fontSize:13.5 }}>{row.label}</div>
              <div className="fm-muted" style={{ fontSize:12, marginTop:2 }}>{row.desc}</div>
            </div>
            <div className={`fm-toggle ${form[row.key] ? 'on' : ''}`} />
          </div>
        ))}
      </div>

      {error && <div style={{ padding:'10px 14px', borderRadius:8, background:'color-mix(in oklch, var(--red) 12%, var(--card))', color:'var(--red)', fontSize:12.5 }}>{error}</div>}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:10, alignItems:'center' }}>
        {saved && <span style={{ fontSize:12.5, color:'var(--accent)' }}>Saved successfully</span>}
        <button className="fm-btn primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </div>
  )
}

// ── Integrations ──────────────────────────────────────────────────────────────

function SettingsIntegrations() {
  const [form, setForm] = React.useState({ notificationEmail:'', webhookUrl:'', smsProvider:'', smsApiKey:'' })
  const [saving, setSaving] = React.useState(false)
  const [saved,  setSaved]  = React.useState(false)
  const [error,  setError]  = React.useState('')

  React.useEffect(() => {
    api.integrationSettings().then(d => setForm({
      notificationEmail: d.notificationEmail ?? '',
      webhookUrl:        d.webhookUrl        ?? '',
      smsProvider:       d.smsProvider       ?? '',
      smsApiKey:         d.smsApiKey         ?? '',
    })).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true); setError('')
    try {
      await api.saveIntegrationSettings(form)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom:4 }}>Notifications</h3>
        <div className="fm-muted" style={{ fontSize:12, marginBottom:18 }}>Alert emails will be sent from this address.</div>
        <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:6 }}>Sender email</div>
        <input className="fm-input" type="email" value={form.notificationEmail} onChange={e => set('notificationEmail', e.target.value)} placeholder="alerts@school.edu" style={{ maxWidth:360 }} />
      </div>

      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom:4 }}>Webhooks</h3>
        <div className="fm-muted" style={{ fontSize:12, marginBottom:18 }}>POST attendance events to an external URL in real time (JSON payload).</div>
        <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:6 }}>Webhook URL</div>
        <input className="fm-input" value={form.webhookUrl} onChange={e => set('webhookUrl', e.target.value)} placeholder="https://your-system.example.com/webhook" />
      </div>

      <div className="fm-card">
        <h3 className="fm-h3" style={{ marginBottom:4 }}>SMS gateway</h3>
        <div className="fm-muted" style={{ fontSize:12, marginBottom:18 }}>Send absence alerts to guardian phone numbers via SMS.</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:12 }}>
          <div>
            <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:6 }}>Provider</div>
            <select className="fm-input" value={form.smsProvider} onChange={e => set('smsProvider', e.target.value)}>
              <option value="">None (disabled)</option>
              <option value="semaphore">Semaphore (PH)</option>
              <option value="vonage">Vonage</option>
              <option value="twilio">Twilio</option>
              <option value="other">Other</option>
            </select>
          </div>
          {form.smsProvider && (
            <div>
              <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:6 }}>API key</div>
              <input className="fm-input mono" type="password" value={form.smsApiKey} onChange={e => set('smsApiKey', e.target.value)} placeholder="Your API key" />
            </div>
          )}
        </div>
      </div>

      {error && <div style={{ padding:'10px 14px', borderRadius:8, background:'color-mix(in oklch, var(--red) 12%, var(--card))', color:'var(--red)', fontSize:12.5 }}>{error}</div>}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:10, alignItems:'center' }}>
        {saved && <span style={{ fontSize:12.5, color:'var(--accent)' }}>Saved successfully</span>}
        <button className="fm-btn primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </div>
  )
}

// ── Roles & Access ────────────────────────────────────────────────────────────

const ROLE_LABELS = { admin:'Admin', vice_principal:'Vice Principal', teacher:'Teacher', staff:'Staff' }

function SettingsRoles() {
  const EMPTY_FORM = { firstName:'', lastName:'', email:'', role:'teacher', employeeCode:'', department:'' }
  const [staffList, setStaffList] = React.useState(null)
  const [adding,    setAdding]    = React.useState(false)
  const [form,      setForm]      = React.useState(EMPTY_FORM)
  const [saving,    setSaving]    = React.useState(false)
  const [done,      setDone]      = React.useState(null)
  const [error,     setError]     = React.useState('')
  const [actingId,  setActingId]  = React.useState(null)
  const [copiedPw,  setCopiedPw]  = React.useState(false)

  const load = () => api.staff().then(setStaffList).catch(() => setStaffList([]))
  React.useEffect(load, [])

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addStaff = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      setError('First name, last name, and email are required.'); return
    }
    setSaving(true); setError('')
    try {
      const res = await api.createStaff(form)
      setDone(res); setForm(EMPTY_FORM); setCopiedPw(false); load()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  const toggleActive = async (member) => {
    setActingId(member.id)
    try {
      await api.updateStaff(member.id, { isActive: member.isActive ? 0 : 1 })
      setStaffList(prev => prev.map(s => s.id === member.id ? { ...s, isActive: s.isActive ? 0 : 1 } : s))
    } catch (_) {}
    setActingId(null)
  }

  const changeRole = async (member, role) => {
    setActingId(member.id)
    try {
      await api.updateStaff(member.id, { role })
      setStaffList(prev => prev.map(s => s.id === member.id ? { ...s, role } : s))
    } catch (_) {}
    setActingId(null)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="fm-card" style={{ padding:0 }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--line-2)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 className="fm-h3">Staff accounts</h3>
          <button className="fm-btn primary" style={{ fontSize:12 }}
            onClick={() => { setAdding(a => !a); setDone(null); setError('') }}>
            {adding ? 'Cancel' : <><I.Plus size={13} /> Add staff</>}
          </button>
        </div>
        {staffList === null ? (
          <div style={{ padding:32, textAlign:'center', color:'var(--fg-3)', fontSize:13 }}>Loading…</div>
        ) : (
          <table className="fm-table">
            <thead>
              <tr>
                <th style={{ paddingLeft:20 }}>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Last login</th>
                <th>Status</th>
                <th style={{ width:110 }}></th>
              </tr>
            </thead>
            <tbody>
              {staffList.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:32, textAlign:'center', color:'var(--fg-3)' }}>No staff accounts.</td></tr>
              ) : staffList.map(s => (
                <tr key={s.id} style={{ opacity: s.isActive ? 1 : 0.5 }}>
                  <td style={{ paddingLeft:20 }}>
                    <div style={{ fontWeight:500 }}>{s.firstName} {s.lastName}</div>
                    <div className="mono fm-muted" style={{ fontSize:11 }}>{s.email}</div>
                  </td>
                  <td>
                    <select
                      className="fm-input"
                      style={{ fontSize:12, padding:'3px 8px' }}
                      value={s.role}
                      disabled={actingId === s.id}
                      onChange={e => changeRole(s, e.target.value)}
                    >
                      {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td className="fm-muted" style={{ fontSize:12.5 }}>{s.department || '—'}</td>
                  <td className="mono fm-muted" style={{ fontSize:11.5 }}>{s.lastLoginAt || 'Never'}</td>
                  <td><span className={`fm-pill ${s.isActive ? 'ok' : ''}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button className="fm-btn" style={{ fontSize:11 }} disabled={actingId === s.id}
                      onClick={() => toggleActive(s)}>
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {adding && (
        <div className="fm-card">
          <h3 className="fm-h3" style={{ marginBottom:14 }}>New staff member</h3>
          {done && (
            <div style={{ marginBottom:14, padding:'12px 16px', borderRadius:8, background:'var(--accent-soft)', border:'1px solid var(--accent)', fontSize:13 }}>
              <b>{done.name}</b> added as {ROLE_LABELS[done.role] ?? done.role}.
              <div style={{ marginTop:8, padding:'8px 12px', background:'var(--card)', borderRadius:6, display:'flex', alignItems:'center', gap:10 }}>
                <span className="fm-muted" style={{ fontSize:12 }}>One-time password:</span>
                <span className="mono" style={{ fontWeight:700, flex:1 }}>{done.tempPassword}</span>
                <button className="fm-btn" style={{ fontSize:11 }} onClick={() => {
                  navigator.clipboard?.writeText(done.tempPassword)
                  setCopiedPw(true); setTimeout(() => setCopiedPw(false), 2000)
                }}>{copiedPw ? 'Copied!' : 'Copy'}</button>
              </div>
              <div style={{ marginTop:8, fontSize:11.5, color:'var(--fg-3)' }}>Share this password — it will not be shown again.</div>
            </div>
          )}
          <div style={{ display:'grid', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5 }}>First name <span style={{ color:'var(--red)' }}>*</span></div>
                <input className="fm-input" value={form.firstName} onChange={e => sf('firstName', e.target.value)} placeholder="e.g. Maria" />
              </div>
              <div>
                <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5 }}>Last name <span style={{ color:'var(--red)' }}>*</span></div>
                <input className="fm-input" value={form.lastName} onChange={e => sf('lastName', e.target.value)} placeholder="e.g. Reyes" />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:10 }}>
              <div>
                <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5 }}>Email <span style={{ color:'var(--red)' }}>*</span></div>
                <input className="fm-input" type="email" value={form.email} onChange={e => sf('email', e.target.value)} placeholder="staff@school.edu" />
              </div>
              <div>
                <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5 }}>Role</div>
                <select className="fm-input" value={form.role} onChange={e => sf('role', e.target.value)}>
                  {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5 }}>Employee ID</div>
                <input className="fm-input mono" value={form.employeeCode} onChange={e => sf('employeeCode', e.target.value)} placeholder="EMP-001" />
              </div>
            </div>
            <div>
              <div style={{ fontSize:11.5, color:'var(--fg-3)', marginBottom:5 }}>Department <span className="fm-muted">(optional)</span></div>
              <input className="fm-input" value={form.department} onChange={e => sf('department', e.target.value)} placeholder="e.g. Science" />
            </div>
          </div>
          {error && <div style={{ marginTop:10, padding:'10px 14px', borderRadius:8, background:'color-mix(in oklch, var(--red) 12%, var(--card))', color:'var(--red)', fontSize:12.5 }}>{error}</div>}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:14 }}>
            <button className="fm-btn" onClick={() => { setAdding(false); setDone(null); setError('') }}>Cancel</button>
            <button className="fm-btn primary" disabled={saving} onClick={addStaff}>
              {saving ? 'Adding…' : <><I.Check size={13} /> Add staff member</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const SETTINGS_TABS = [
  { section: 'School',  tabs: [
    { id: 'branding',   label: 'School Branding',    icon: 'Sparkle' },
    { id: 'appearance', label: 'Appearance',          icon: 'Sun' },
  ]},
  { section: 'System',  tabs: [
    { id: 'recognition',   label: 'Recognition Engine', icon: 'Face' },
    { id: 'cameras',       label: 'Camera Network',     icon: 'Camera' },
    { id: 'notifications', label: 'Notification Rules', icon: 'Bell' },
  ]},
  { section: 'Admin',   tabs: [
    { id: 'privacy',       label: 'Privacy & Retention', icon: 'Lock' },
    { id: 'integrations',  label: 'Integrations',        icon: 'Wifi' },
    { id: 'roles',         label: 'Roles & Access',      icon: 'Users' },
  ]},
]

function Settings() {
  const [tab, setTab] = React.useState('branding')

  return (
    <div className="fm-screen" data-screen-label="Settings">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{ marginBottom: 28 }}>
            <div className="fm-eyebrow" style={{ marginBottom: 8 }}>Administration</div>
            <h1 className="fm-h1">System Settings</h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
            {/* Settings sidebar nav */}
            <div style={{
              background: 'var(--card)', border: '1px solid var(--line)',
              borderRadius: 'var(--r-md)', padding: '10px 8px',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky', top: 16,
            }}>
              {SETTINGS_TABS.map(({ section, tabs }) => (
                <div key={section}>
                  <p className="fm-settings-section-label">{section}</p>
                  <nav className="fm-settings-nav">
                    {tabs.map(({ id, label, icon }) => (
                      <button
                        key={id}
                        className={`fm-settings-nav-btn${tab === id ? ' active' : ''}`}
                        onClick={() => setTab(id)}
                      >
                        {I[icon] ? React.createElement(I[icon], { size: 14 }) : null}
                        {label}
                      </button>
                    ))}
                  </nav>
                </div>
              ))}
            </div>

            <div>
              {tab === 'branding'      && <SettingsBranding />}
              {tab === 'appearance'    && <SettingsAppearance />}
              {tab === 'recognition'   && <SettingsRecognition />}
              {tab === 'cameras'       && <SettingsCameras />}
              {tab === 'notifications' && <SettingsNotifications />}
              {tab === 'privacy'       && <SettingsPrivacy />}
              {tab === 'integrations'  && <SettingsIntegrations />}
              {tab === 'roles'         && <SettingsRoles />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LeaveRequests() {
  const [tab,    setTab]    = React.useState('pending')
  const [leaves, setLeaves] = React.useState([])
  const [acting, setActing] = React.useState(null)

  React.useEffect(() => {
    api.leaveRequests(tab).then(setLeaves).catch(() => setLeaves([]))
  }, [tab])

  const act = async (id, action) => {
    setActing(id)
    try {
      await (action === 'approve' ? api.approveLeave(id) : api.declineLeave(id))
      setLeaves(prev => prev.filter(l => l.id !== id))
    } catch (_) {}
    setActing(null)
  }

  const items = leaves.map(l => ({
    ...l,
    name: l.studentName,
    date: l.dateFrom === l.dateTo ? l.dateFrom : `${l.dateFrom} – ${l.dateTo}`,
    hue:  (parseInt((l.studentCode ?? '').replace(/\D/g, '')) * 37) % 360,
  }))

  const tabDefs = [
    { value: 'pending',  label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
  ]

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
              {tabDefs.map(t => (
                <div
                  key={t.value}
                  className={`fm-tab${tab === t.value ? ' active' : ''}`}
                  onClick={() => setTab(t.value)}
                  style={{cursor:'pointer'}}
                >
                  {t.label}
                  {tab === t.value && <span className="mono" style={{marginLeft:6}}>{items.length}</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {items.length === 0 ? (
              <div className="fm-card">
                <div className="fm-empty">
                  <div className="fm-empty-icon">
                    <I.Leave size={22} />
                  </div>
                  <div className="fm-empty-title">No {tab} requests</div>
                  <div className="fm-empty-sub">
                    {tab === 'pending'
                      ? 'All leave requests have been reviewed.'
                      : `No ${tab} leave requests to show.`}
                  </div>
                </div>
              </div>
            ) : items.map((l) => (
              <div key={l.id} className="fm-card" style={{
                display:"grid", gridTemplateColumns:"1fr auto", gap:18, alignItems:"center",
                transition: 'box-shadow 0.18s ease, transform 0.18s ease',
              }}>
                <div style={{display:"flex", gap:14, alignItems:"center"}}>
                  <div className="fm-avatar lg" style={{
                    background:`oklch(0.86 0.14 ${l.hue})`,
                    color: '#000', fontWeight: 700,
                  }}>
                    {(l.name ?? '').split(" ").map(s => s[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
                      <div style={{fontSize:15, fontWeight:700}}>{l.name}</div>
                      <span className="mono fm-muted" style={{fontSize:11.5, background:'var(--line-2)', padding:'2px 8px', borderRadius:999}}>{l.grade}</span>
                      <span className={`fm-pill dot ${l.status === "approved" ? "ok" : l.status === "declined" ? "ab" : "late"}`}>{l.status}</span>
                    </div>
                    <div style={{fontSize:13.5, marginTop:5, lineHeight:1.45, color:'var(--fg-2)'}}>{l.reason}</div>
                    <div className="mono fm-muted" style={{fontSize:11, marginTop:4, display:'flex', alignItems:'center', gap:6}}>
                      <I.Cal size={11} />
                      {l.date}
                    </div>
                  </div>
                </div>
                {l.status === "pending" ? (
                  <div style={{display:"flex", gap:8, flexShrink:0}}>
                    <button
                      className="fm-btn"
                      disabled={acting === l.id}
                      onClick={() => act(l.id, 'decline')}
                      style={{ color: 'var(--red)', borderColor: 'color-mix(in srgb, var(--red) 30%, transparent)' }}
                    ><I.X size={13}/> Decline</button>
                    <button
                      className="fm-btn primary"
                      disabled={acting === l.id}
                      onClick={() => act(l.id, 'approve')}
                    ><I.Check size={13}/> Approve</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: l.status === 'approved' ? 'var(--green)' : 'var(--red)',
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: l.status === 'approved' ? 'var(--green)' : 'var(--red)' }}>
                      {l.status === 'approved' ? 'Approved' : 'Declined'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


export { EnrollDialog, ImportDialog, Reports, Settings, LeaveRequests }
