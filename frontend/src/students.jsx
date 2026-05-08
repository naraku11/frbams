import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from './api'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'
import { EnrollDialog, ImportDialog } from './admin-misc'

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
                  <div style={{ display: 'flex', gap: 7, marginTop: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="mono fm-muted" style={{ fontSize: 11.5 }}>{s.studentCode}</span>
                    {s.grade && <span className="fm-pill" style={{ fontSize: 10, padding: '1px 7px' }}>{s.grade}</span>}
                    {s.program && <span className="fm-pill" style={{ fontSize: 10, padding: '1px 7px', background: 'var(--line-2)', color: 'var(--fg-2)' }}>{s.program}</span>}
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
                    <span className="fm-muted">Year level</span>
                    <span style={{ fontWeight: 500 }}>{s.grade ?? '—'}</span>
                  </div>
                  {s.program && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                      <span className="fm-muted">Program</span>
                      <span className="mono" style={{ fontSize: 11.5 }}>{s.program}</span>
                    </div>
                  )}
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
  const [urlParams]   = useSearchParams()

  const [search,         setSearch]         = useState(() => urlParams.get('q') ?? '')
  const [yearFilter,     setYearFilter]     = useState('all')
  const [programFilter,  setProgramFilter]  = useState('all')
  const [grades,         setGrades]         = useState([])
  const [programs,       setPrograms]       = useState([])
  const [students,       setStudents]       = useState([])
  const [total,          setTotal]          = useState(0)
  const [pages,          setPages]          = useState(1)
  const [page,           setPage]           = useState(1)
  const [loading,        setLoading]        = useState(false)
  const [selected,       setSelected]       = useState(new Set())
  const [drawerDbId,     setDrawerDbId]     = useState(null)
  const [enrollOpen,     setEnrollOpen]     = useState(false)
  const [importOpen,     setImportOpen]     = useState(false)
  const [refreshKey,     setRefreshKey]     = useState(0)

  useEffect(() => {
    api.grades().then(setGrades).catch(() => {})
    api.programs().then(res => setPrograms(res.data ?? res ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page }
    if (search)                                params.search   = search
    if (yearFilter    && yearFilter    !== 'all') params.grade  = yearFilter
    if (programFilter && programFilter !== 'all') params.program = programFilter

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
  }, [search, yearFilter, programFilter, page, refreshKey])

  const rows = students.map(s => ({
    dbId:      s.id,
    id:        s.studentCode,
    name:      s.name,
    first:     s.firstName,
    last:      s.lastName,
    yearLevel: s.grade,
    program:   s.programCode ?? s.program ?? '',
    hue:       hue(s.studentCode),
    rate:      (s.attendanceRate ?? 0) / 100,
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

  const onSearchChange  = (v) => { setSearch(v);  setPage(1); setSelected(new Set()) }
  const onYearChange    = (v) => { setYearFilter(v);    setPage(1); setSelected(new Set()) }
  const onProgramChange = (v) => { setProgramFilter(v); setPage(1); setSelected(new Set()) }

  const exportCSV = () => {
    const header = 'Name,ID,Year Level,Program,Attendance %'
    const lines  = rows.map(r => [`"${r.name ?? ''}"`, r.id ?? '', r.yearLevel ?? '', r.program ?? '', Math.round(r.rate * 100) + '%'].join(','))
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
              <div className="fm-eyebrow" style={{ marginBottom: 8 }}>College Registry</div>
              <h1 className="fm-h1">Students</h1>
              <div className="fm-muted" style={{ marginTop: 6, fontSize: 14 }}>{total} enrolled</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="fm-btn" onClick={exportCSV}><I.Export size={14} /> Export</button>
              <button className="fm-btn" onClick={() => setImportOpen(true)}><I.Upload size={14} /> Import CSV</button>
              <button className="fm-btn primary" onClick={() => setEnrollOpen(true)}><I.Plus size={14} /> Enroll student</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="fm-search" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
              <I.Search size={14} />
              <input
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--fg)', width: '100%' }}
                placeholder="Search students or IDs…"
                value={search}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>
            <select className="fm-input" style={{ width: 140 }} value={yearFilter} onChange={e => onYearChange(e.target.value)}>
              <option value="all">All year levels</option>
              {grades.map(g => <option key={g.id} value={g.label}>{g.label}</option>)}
            </select>
            <select className="fm-input" style={{ width: 160 }} value={programFilter} onChange={e => onProgramChange(e.target.value)}>
              <option value="all">All programs</option>
              {programs.map(p => <option key={p.id} value={p.code ?? p.label}>{p.code ?? p.label}</option>)}
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
                  <th>Year Level</th>
                  <th>Program</th>
                  <th>Attendance</th>
                  <th style={{ width: 140 }}>Rate</th>
                  <th>Status</th>
                  <th style={{ width: 30 }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '36px 0', color: 'var(--fg-3)' }}>
                        <div className="fm-spinner sm" />
                        <span style={{ fontSize: 13 }}>Loading students…</span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="fm-empty">
                        <div className="fm-empty-icon">
                          <I.Users size={22} />
                        </div>
                        <div className="fm-empty-title">
                          {search ? 'No students found' : 'No students enrolled yet'}
                        </div>
                        <div className="fm-empty-sub">
                          {search
                            ? `No results for "${search}". Try a different name or ID.`
                            : 'Enroll your first student using the button above, or import from a CSV file.'}
                        </div>
                      </div>
                    </td>
                  </tr>
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
                      <td>
                        {s.yearLevel
                          ? <span className="fm-pill" style={{ fontSize: 10, padding: '2px 8px' }}>{s.yearLevel}</span>
                          : <span className="fm-muted">—</span>}
                      </td>
                      <td className="mono" style={{ fontSize: 12 }}>{s.program || <span className="fm-muted">—</span>}</td>
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
            <span className="fm-muted mono">
              {total > 0
                ? `Showing ${rows.length} of ${total} student${total !== 1 ? 's' : ''}`
                : 'No students'}
            </span>
            {pages > 1 && (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button
                  className="fm-btn"
                  style={{ padding: '5px 10px', fontSize: 12 }}
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <I.Arrow size={12} style={{ transform: 'rotate(180deg)' }} />
                  Prev
                </button>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  padding: '5px 10px',
                  background: 'var(--line-2)', borderRadius: 'var(--r-sm)',
                }}>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          width: 24, height: 24,
                          borderRadius: 6,
                          border: 'none',
                          background: page === p ? 'var(--accent)' : 'transparent',
                          color: page === p ? 'var(--accent-ink)' : 'var(--fg-3)',
                          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: page === p ? 700 : 400,
                          cursor: 'pointer',
                        }}
                      >{p}</button>
                    )
                  })}
                  {pages > 7 && <span className="fm-muted" style={{ fontSize: 11, padding: '0 4px' }}>…{pages}</span>}
                </div>
                <button
                  className="fm-btn"
                  style={{ padding: '5px 10px', fontSize: 12 }}
                  disabled={page >= pages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                  <I.Arrow size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <StudentDrawer studentDbId={drawerDbId} onClose={() => setDrawerDbId(null)} />

      <EnrollDialog
        open={enrollOpen}
        grades={grades}
        programs={programs}
        onClose={() => setEnrollOpen(false)}
        onEnrolled={() => setRefreshKey(k => k + 1)}
      />
      <ImportDialog
        open={importOpen}
        grades={grades}
        programs={programs}
        onClose={() => setImportOpen(false)}
        onImported={() => setRefreshKey(k => k + 1)}
      />
    </div>
  )
}
