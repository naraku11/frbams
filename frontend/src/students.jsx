import React, { useState } from 'react'
import { STUDENTS, GRADES, COURSES } from './data'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'

export function StudentList() {
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')

  const filtered = STUDENTS.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)
    const matchGrade  = gradeFilter === 'all' || s.grade === gradeFilter
    return matchSearch && matchGrade
  })

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
              <div className="fm-muted" style={{ marginTop: 6, fontSize: 14 }}>{STUDENTS.length} enrolled · Spring 2026</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="fm-btn"><I.Export size={14} /> Export</button>
              <button className="fm-btn primary"><I.Plus size={14} /> Enroll student</button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <div className="fm-search" style={{ flex: 1, maxWidth: 320 }}>
              <I.Search size={14} />
              <input
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--fg)', width: '100%' }}
                placeholder="Search students or IDs…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="fm-input" style={{ width: 130 }} value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
              <option value="all">All grades</option>
              {GRADES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="fm-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="fm-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20, width: 34 }}><input type="checkbox" /></th>
                  <th>Student</th>
                  <th>Grade</th>
                  <th>Attendance</th>
                  <th style={{ width: 140 }}>Rate</th>
                  <th>Status</th>
                  <th style={{ width: 30 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const pct = Math.round(s.rate * 100)
                  const status = pct >= 90 ? 'ok' : pct >= 75 ? 'late' : 'ab'
                  const label  = pct >= 90 ? 'Good' : pct >= 75 ? 'At risk' : 'Critical'
                  return (
                    <tr key={s.id} style={{ cursor: 'pointer' }}>
                      <td style={{ paddingLeft: 20 }}><input type="checkbox" /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="fm-avatar sm" style={{ background: `oklch(0.86 0.14 ${s.hue})` }}>
                            {s.first[0]}{s.last[0]}
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
                      <td><span className={`fm-pill ${status}`}>{label}</span></td>
                      <td><span className="fm-muted" style={{ cursor: 'pointer' }}>⋯</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 12 }}>
            <span className="fm-muted mono">Showing {filtered.length} of {STUDENTS.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
