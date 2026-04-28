import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'

function hue(code) { return (parseInt((code ?? '').replace(/\D/g, '')) * 37) % 360 }

function StudentDrawer({ studentDbId, onClose }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!studentDbId) return
    setData(null)
    api.studentDetail(studentDbId).then(setData).catch(() => setData({}))
  }, [studentDbId])

  if (!studentDbId) return null

  const s       = data?.student
  const records = data?.records ?? []
  const rate    = s ? Math.round(parseFloat(s.attendanceRate ?? 0)) : 0

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(1px)' }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, zIndex: 50,
        background: 'var(--bg)', borderLeft: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.14)',
      }}>
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--line-2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Student profile
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 4, display: 'grid', placeItems: 'center', borderRadius: 6 }}
          >
            <I.X size={15} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!data ? (
            <div className="fm-muted" style={{ textAlign: 'center', paddingTop: 60, fontSize: 13 }}>Loading…</div>
          ) : !s ? (
            <div className="fm-muted" style={{ textAlign: 'center', paddingTop: 60, fontSize: 13 }}>Student not found.</div>
          ) : (
            <>
              {/* Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: `oklch(0.86 0.14 ${hue(s.studentCode)})`,
                  display: 'grid', placeItems: 'center',
                  fontSize: 18, fontWeight: 700, color: '#000',
                }}>
                  {(s.firstName?.[0] ?? '')}{(s.lastName?.[0] ?? '')}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{s.name}</div>
                  <div style={{ display: 'flex', gap: 7, marginTop: 5, alignItems: 'center' }}>
                    <span className="mono fm-muted" style={{ fontSize: 11.5 }}>{s.studentCode}</span>
                    <span className="fm-pill" style={{ fontSize: 10, padding: '1px 7px' }}>{s.grade}</span>
                  </div>
                </div>
              </div>

              {/* Attendance rate */}
              <div className="fm-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                  <div className="mono" style={{
                    fontSize: 30, fontWeight: 700, lineHeight: 1,
                    color: rate < 75 ? 'var(--red)' : rate < 90 ? 'var(--amber)' : 'var(--accent)',
                  }}>{rate}%</div>
                  <div className="fm-muted" style={{ fontSize: 11, marginTop: 4 }}>Attendance rate</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 7, background: 'var(--line-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      width: Math.min(rate, 100) + '%', height: '100%', borderRadius: 99,
                      background: rate < 75 ? 'var(--red)' : rate < 90 ? 'var(--amber)' : 'var(--accent)',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--fg-4)', marginTop: 4, fontFamily: 'var(--mono)' }}>
                    <span>0%</span><span>100%</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="fm-card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {s.email && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                      <span className="fm-muted">Email</span>
                      <span className="mono" style={{ fontSize: 11.5 }}>{s.email}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                    <span className="fm-muted">Grade</span>
                    <span style={{ fontWeight: 500 }}>{s.grade}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                    <span className="fm-muted">Enrolled</span>
                    <span className="mono" style={{ fontSize: 11.5 }}>
                      {s.enrolledAt
                        ? new Date(s.enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance history */}
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  Attendance history
                </div>
                {records.length === 0 ? (
                  <div className="fm-muted" style={{ fontSize: 12.5 }}>No records yet.</div>
                ) : (
                  <div className="fm-card" style={{ padding: 0 }}>
                    {records.map((r, i) => (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center',
                        padding: '10px 14px',
                        borderBottom: i < records.length - 1 ? '1px solid var(--line-2)' : 'none',
                      }}>
                        <span className="mono" style={{ fontSize: 12 }}>{r.date}</span>
                        <span className="mono fm-muted" style={{ fontSize: 11.5 }}>{r.time ?? '—'}</span>
                        <span className={`fm-pill ${r.status === 'present' ? 'ok' : r.status === 'late' ? 'late' : 'ab'}`} style={{ fontSize: 10 }}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export function StudentList() {
  const navigate = useNavigate()

  const [search,       setSearch]       = useState('')
  const [gradeFilter,  setGradeFilter]  = useState('all')
  const [grades,       setGrades]       = useState([])
  const [students,     setStudents]     = useState([])
  const [total,        setTotal]        = useState(0)
  const [pages,        setPages]        = useState(1)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(false)
  const [selected,     setSelected]     = useState(new Set())
  const [drawerDbId,   setDrawerDbId]   = useState(null)

  useEffect(() => {
    api.grades().then(setGrades).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page }
    if (search)                              params.search = search
    if (gradeFilter && gradeFilter !== 'all') params.grade  = gradeFilter

    const timer = setTimeout(() => {
      api.students(params)
        .then(res => {
          setStudents(res.data ?? [])
          setTotal(res.total ?? 0)
          setPages(res.pages ?? 1)
        })
        .catch(() => { setStudents([]); setTotal(0); setPages(1) })
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [search, gradeFilter, page])

  const rows = students.map(s => ({
    dbId:  s.id,
    id:    s.studentCode,
    name:  s.name,
    first: s.firstName,
    last:  s.lastName,
    grade: s.grade,
    hue:   hue(s.studentCode),
    rate:  (s.attendanceRate ?? 0) / 100,
  }))

  const allSelected = rows.length > 0 && rows.every(r => selected.has(r.dbId))
  const toggleAll   = () => setSelected(allSelected ? new Set() : new Set(rows.map(r => r.dbId)))
  const toggleOne   = (dbId, e) => {
    e.stopPropagation()
    setSelected(prev => {
      const next = new Set(prev)
      next.has(dbId) ? next.delete(dbId) : next.add(dbId)
      return next
    })
  }

  const onSearchChange = (v) => { setSearch(v); setPage(1); setSelected(new Set()) }
  const onGradeChange  = (v) => { setGradeFilter(v); setPage(1); setSelected(new Set()) }

  const exportCSV = () => {
    const header = 'Name,ID,Grade,Attendance %'
    const lines  = rows.map(r => [`"${r.name ?? ''}"`, r.id ?? '', r.grade ?? '', Math.round(r.rate * 100) + '%'].join(','))
    const blob   = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' })
    const a      = document.createElement('a')
    a.href       = URL.createObjectURL(blob)
    a.download   = `students-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="fm-screen" data-screen-label="Students">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div className="fm-eyebrow" style={{ marginBottom: 8 }}>Roster</div>
              <h1 className="fm-h1">Students</h1>
              <div className="fm-muted" style={{ marginTop: 6, fontSize: 14 }}>{total} enrolled</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="fm-btn" onClick={exportCSV}><I.Export size={14} /> Export</button>
              <button className="fm-btn primary" onClick={() => navigate('/enroll')}><I.Plus size={14} /> Enroll student</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <div className="fm-search" style={{ flex: 1, maxWidth: 320 }}>
              <I.Search size={14} />
              <input
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--fg)', width: '100%' }}
                placeholder="Search students or IDs…"
                value={search}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>
            <select className="fm-input" style={{ width: 130 }} value={gradeFilter} onChange={e => onGradeChange(e.target.value)}>
              <option value="all">All grades</option>
              {grades.map(g => <option key={g.id} value={g.label}>{g.label}</option>)}
            </select>
            {selected.size > 0 && (
              <div className="fm-muted" style={{ fontSize: 12.5 }}>{selected.size} selected</div>
            )}
          </div>

          <div className="fm-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="fm-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20, width: 34 }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                  <th>Student</th>
                  <th>Grade</th>
                  <th>Attendance</th>
                  <th style={{ width: 140 }}>Rate</th>
                  <th>Status</th>
                  <th style={{ width: 30 }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>No students found.</td></tr>
                ) : rows.map(s => {
                  const pct        = Math.round(s.rate * 100)
                  const statusCls  = pct >= 90 ? 'ok' : pct >= 75 ? 'late' : 'ab'
                  const statusLbl  = pct >= 90 ? 'Good' : pct >= 75 ? 'At risk' : 'Critical'
                  const isSelected = selected.has(s.dbId)
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setDrawerDbId(s.dbId)}
                      style={{ cursor: 'pointer', background: isSelected ? 'var(--accent-soft)' : undefined }}
                    >
                      <td style={{ paddingLeft: 20 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => toggleOne(s.dbId, e)}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="fm-avatar sm" style={{ background: `oklch(0.86 0.14 ${s.hue})` }}>
                            {(s.first?.[0] ?? '')}{(s.last?.[0] ?? '')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{s.name}</div>
                            <div className="mono fm-muted" style={{ fontSize: 11 }}>{s.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="mono fm-muted">{s.grade}</td>
                      <td className="mono">{pct}%</td>
                      <td>
                        <div style={{ height: 6, background: 'var(--line-2)', borderRadius: 99, overflow: 'hidden', width: 120 }}>
                          <div style={{
                            width: pct + '%', height: '100%', borderRadius: 99,
                            background: pct < 75 ? 'var(--red)' : pct < 90 ? 'var(--amber)' : 'var(--accent)',
                          }} />
                        </div>
                      </td>
                      <td><span className={`fm-pill ${statusCls}`}>{statusLbl}</span></td>
                      <td>
                        <span
                          className="fm-muted"
                          style={{ cursor: 'pointer' }}
                          onClick={e => { e.stopPropagation(); setDrawerDbId(s.dbId) }}
                        >⋯</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 12 }}>
            <span className="fm-muted mono">Showing {rows.length} of {total}</span>
            {pages > 1 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  className="fm-btn"
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >← Prev</button>
                <span className="mono fm-muted" style={{ fontSize: 11.5 }}>Page {page} of {pages}</span>
                <button
                  className="fm-btn"
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  disabled={page >= pages}
                  onClick={() => setPage(p => p + 1)}
                >Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <StudentDrawer studentDbId={drawerDbId} onClose={() => setDrawerDbId(null)} />
    </div>
  )
}
