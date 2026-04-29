// admin-academic.jsx - Course/Program, Curriculum, Section CRUD screens
import React, { useState, useEffect } from 'react'
import { api } from './api'
import { I } from './icons'
import { Sidebar, TopBar } from './shell'

function Drawer({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 30,
        background: 'rgba(0,0,0,0.18)',
      }} />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 31,
        width: 420, background: 'var(--card)',
        borderLeft: '1px solid var(--line)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 20px', borderBottom: '1px solid var(--line-2)',
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{title}</h2>
          <button className="fm-btn icon" onClick={onClose}><I.X size={14} /></button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>{children}</div>
      </div>
    </>
  )
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 5 }}>
        {label}{required && <span style={{ color: 'var(--red)' }}> *</span>}
      </div>
      {children}
    </div>
  )
}

function ErrBanner({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      marginBottom: 12, padding: '10px 14px', borderRadius: 8,
      background: 'color-mix(in oklch, var(--red) 12%, var(--card))',
      color: 'var(--red)', fontSize: 12.5,
    }}>{msg}</div>
  )
}

function ActionBtns({ onEdit, onDelete, confirming, onConfirm, onCancel }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="fm-btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={onEdit}>Edit</button>
      {confirming ? (
        <>
          <button className="fm-btn" style={{ fontSize: 12, padding: '4px 10px', color: 'var(--red)' }} onClick={onConfirm}>Confirm</button>
          <button className="fm-btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={onCancel}>Cancel</button>
        </>
      ) : (
        <button className="fm-btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={onDelete}><I.X size={12} /></button>
      )}
    </div>
  )
}

// ── Programs ──────────────────────────────────────────────────────────────────

export function Programs() {
  const [rows,   setRows]   = useState([])
  const [depts,  setDepts]  = useState([])
  const [loading, setLoading] = useState(false)
  const [drawer, setDrawer] = useState(null)
  const [form,   setForm]   = useState({ code: '', name: '', departmentId: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = () => {
    setLoading(true)
    api.programs().then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.departments().then(setDepts).catch(() => {})
  }, [])

  const openAdd = () => {
    setForm({ code: '', name: '', departmentId: '', description: '' })
    setError('')
    setDrawer({ mode: 'add' })
  }

  const openEdit = (r) => {
    setForm({ code: r.code ?? '', name: r.name, departmentId: r.departmentId ?? '', description: r.description ?? '' })
    setError('')
    setDrawer({ mode: 'edit', id: r.id })
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) { setError('Code and name are required.'); return }
    setSaving(true); setError('')
    const body = {
      code: form.code.trim(), name: form.name.trim(),
      departmentId: form.departmentId || undefined,
      description: form.description.trim() || undefined,
    }
    const req = drawer.mode === 'add' ? api.createProgram(body) : api.updateProgram(drawer.id, body)
    req.then(() => { load(); setDrawer(null) }).catch(e => setError(e.message)).finally(() => setSaving(false))
  }

  const del = (id) => api.deleteProgram(id).then(() => { load(); setConfirmDelete(null) }).catch(() => {})

  return (
    <div className="fm-screen" data-screen-label="Course / Program">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div className="fm-eyebrow" style={{ marginBottom: 8 }}>Academic</div>
              <h1 className="fm-h1">Course / Program</h1>
              <div className="fm-muted" style={{ marginTop: 6 }}>{rows.length} program{rows.length !== 1 ? 's' : ''} defined</div>
            </div>
            <button className="fm-btn primary" onClick={openAdd}><I.Plus size={14} /> Add program</button>
          </div>

          <div className="fm-card" style={{ padding: 0 }}>
            <table className="fm-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Code</th>
                  <th>Program name</th>
                  <th>Department</th>
                  <th>Description</th>
                  <th style={{ width: 140 }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>No programs yet. Add one above.</td></tr>
                ) : rows.map(r => (
                  <tr key={r.id}>
                    <td style={{ paddingLeft: 20 }}>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{r.code}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td className="fm-muted">{r.department ?? '—'}</td>
                    <td className="fm-muted" style={{ fontSize: 12 }}>{r.description ?? '—'}</td>
                    <td>
                      <ActionBtns
                        onEdit={() => openEdit(r)}
                        onDelete={() => setConfirmDelete(r.id)}
                        confirming={confirmDelete === r.id}
                        onConfirm={() => del(r.id)}
                        onCancel={() => setConfirmDelete(null)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)}
        title={drawer?.mode === 'add' ? 'Add program' : 'Edit program'}>
        <Field label="Code" required>
          <input className="fm-input mono" value={form.code} onChange={e => set('code', e.target.value)} placeholder="e.g. BSIT" />
        </Field>
        <Field label="Program name" required>
          <input className="fm-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Bachelor of Science in Information Technology" />
        </Field>
        <Field label="Department">
          <select className="fm-input" value={form.departmentId} onChange={e => set('departmentId', e.target.value)}>
            <option value="">No department</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Description">
          <textarea className="fm-input" rows={3} style={{ resize: 'vertical', padding: '10px 12px' }}
            value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description..." />
        </Field>
        <ErrBanner msg={error} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="fm-btn" onClick={() => setDrawer(null)}>Cancel</button>
          <button className="fm-btn primary" disabled={saving} onClick={save}>
            {saving ? 'Saving...' : <><I.Check size={13} /> Save</>}
          </button>
        </div>
      </Drawer>
    </div>
  )
}

// ── Curricula ─────────────────────────────────────────────────────────────────

export function Curricula() {
  const [rows,     setRows]     = useState([])
  const [programs, setPrograms] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [drawer,   setDrawer]   = useState(null)
  const [form,     setForm]     = useState({ code: '', name: '', programId: '', yearImplemented: '', description: '' })
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = () => {
    setLoading(true)
    api.curricula().then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.programs().then(setPrograms).catch(() => {})
  }, [])

  const openAdd = () => {
    setForm({ code: '', name: '', programId: '', yearImplemented: '', description: '' })
    setError('')
    setDrawer({ mode: 'add' })
  }

  const openEdit = (r) => {
    setForm({
      code: r.code ?? '', name: r.name, programId: r.programId ?? '',
      yearImplemented: r.yearImplemented ?? '', description: r.description ?? '',
    })
    setError('')
    setDrawer({ mode: 'edit', id: r.id })
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError('')
    const body = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      programId: form.programId || undefined,
      yearImplemented: form.yearImplemented || undefined,
      description: form.description.trim() || undefined,
    }
    const req = drawer.mode === 'add' ? api.createCurriculum(body) : api.updateCurriculum(drawer.id, body)
    req.then(() => { load(); setDrawer(null) }).catch(e => setError(e.message)).finally(() => setSaving(false))
  }

  const del = (id) => api.deleteCurriculum(id).then(() => { load(); setConfirmDelete(null) }).catch(() => {})

  return (
    <div className="fm-screen" data-screen-label="Curriculum">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div className="fm-eyebrow" style={{ marginBottom: 8 }}>Academic</div>
              <h1 className="fm-h1">Curriculum</h1>
              <div className="fm-muted" style={{ marginTop: 6 }}>{rows.length} curriculum{rows.length !== 1 ? 's' : ''} defined</div>
            </div>
            <button className="fm-btn primary" onClick={openAdd}><I.Plus size={14} /> Add curriculum</button>
          </div>

          <div className="fm-card" style={{ padding: 0 }}>
            <table className="fm-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Name</th>
                  <th>Program</th>
                  <th>Year</th>
                  <th>Description</th>
                  <th style={{ width: 140 }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>No curricula yet. Add one above.</td></tr>
                ) : rows.map(r => (
                  <tr key={r.id}>
                    <td style={{ paddingLeft: 20 }}>
                      <div style={{ fontWeight: 500 }}>{r.name}</div>
                      {r.code && <div className="mono fm-muted" style={{ fontSize: 11 }}>{r.code}</div>}
                    </td>
                    <td className="fm-muted">{r.program ?? '—'}</td>
                    <td className="mono">{r.yearImplemented ?? '—'}</td>
                    <td className="fm-muted" style={{ fontSize: 12 }}>{r.description ?? '—'}</td>
                    <td>
                      <ActionBtns
                        onEdit={() => openEdit(r)}
                        onDelete={() => setConfirmDelete(r.id)}
                        confirming={confirmDelete === r.id}
                        onConfirm={() => del(r.id)}
                        onCancel={() => setConfirmDelete(null)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)}
        title={drawer?.mode === 'add' ? 'Add curriculum' : 'Edit curriculum'}>
        <Field label="Name" required>
          <input className="fm-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. BSIT Curriculum 2023" />
        </Field>
        <Field label="Code">
          <input className="fm-input mono" value={form.code} onChange={e => set('code', e.target.value)} placeholder="e.g. BSIT-2023" />
        </Field>
        <Field label="Program">
          <select className="fm-input" value={form.programId} onChange={e => set('programId', e.target.value)}>
            <option value="">No program</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Year implemented">
          <input className="fm-input mono" value={form.yearImplemented} onChange={e => set('yearImplemented', e.target.value)} placeholder="e.g. 2023" />
        </Field>
        <Field label="Description">
          <textarea className="fm-input" rows={3} style={{ resize: 'vertical', padding: '10px 12px' }}
            value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description..." />
        </Field>
        <ErrBanner msg={error} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="fm-btn" onClick={() => setDrawer(null)}>Cancel</button>
          <button className="fm-btn primary" disabled={saving} onClick={save}>
            {saving ? 'Saving...' : <><I.Check size={13} /> Save</>}
          </button>
        </div>
      </Drawer>
    </div>
  )
}

// ── Sections ──────────────────────────────────────────────────────────────────

export function Sections() {
  const [rows,      setRows]      = useState([])
  const [curricula, setCurricula] = useState([])
  const [teachers,  setTeachers]  = useState([])
  const [rooms,     setRooms]     = useState([])
  const [loading,   setLoading]   = useState(false)
  const [drawer,    setDrawer]    = useState(null)
  const [form,      setForm]      = useState({ name: '', curriculumId: '', yearLevel: '', adviserId: '', roomId: '', maxStudents: '', academicYear: '' })
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = () => {
    setLoading(true)
    api.sections().then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    Promise.all([api.curricula(), api.teachers(), api.rooms()])
      .then(([c, t, r]) => { setCurricula(c); setTeachers(t); setRooms(r) })
      .catch(() => {})
  }, [])

  const openAdd = () => {
    setForm({ name: '', curriculumId: '', yearLevel: '', adviserId: '', roomId: '', maxStudents: '', academicYear: '' })
    setError('')
    setDrawer({ mode: 'add' })
  }

  const openEdit = (r) => {
    setForm({
      name: r.name, curriculumId: r.curriculumId ?? '',
      yearLevel: r.yearLevel ?? '', adviserId: r.adviserId ?? '',
      roomId: r.roomId ?? '', maxStudents: r.maxStudents ?? '',
      academicYear: r.academicYear ?? '',
    })
    setError('')
    setDrawer({ mode: 'edit', id: r.id })
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.name.trim()) { setError('Section name is required.'); return }
    setSaving(true); setError('')
    const body = {
      name: form.name.trim(),
      curriculumId: form.curriculumId || undefined,
      yearLevel: form.yearLevel || undefined,
      adviserId: form.adviserId || undefined,
      roomId: form.roomId || undefined,
      maxStudents: form.maxStudents ? parseInt(form.maxStudents) : undefined,
      academicYear: form.academicYear.trim() || undefined,
    }
    const req = drawer.mode === 'add' ? api.createSection(body) : api.updateSection(drawer.id, body)
    req.then(() => { load(); setDrawer(null) }).catch(e => setError(e.message)).finally(() => setSaving(false))
  }

  const del = (id) => api.deleteSection(id).then(() => { load(); setConfirmDelete(null) }).catch(() => {})

  return (
    <div className="fm-screen" data-screen-label="Sections">
      <Sidebar />
      <div className="fm-main">
        <TopBar />
        <div className="fm-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div className="fm-eyebrow" style={{ marginBottom: 8 }}>Academic</div>
              <h1 className="fm-h1">Sections</h1>
              <div className="fm-muted" style={{ marginTop: 6 }}>{rows.length} section{rows.length !== 1 ? 's' : ''} defined</div>
            </div>
            <button className="fm-btn primary" onClick={openAdd}><I.Plus size={14} /> Add section</button>
          </div>

          <div className="fm-card" style={{ padding: 0 }}>
            <table className="fm-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Section</th>
                  <th>Curriculum</th>
                  <th>Year level</th>
                  <th>Adviser</th>
                  <th>Room</th>
                  <th>Academic year</th>
                  <th style={{ width: 140 }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>No sections yet. Add one above.</td></tr>
                ) : rows.map(r => (
                  <tr key={r.id}>
                    <td style={{ paddingLeft: 20, fontWeight: 600 }}>{r.name}</td>
                    <td className="fm-muted">{r.curriculum ?? '—'}</td>
                    <td className="mono">{r.yearLevel ? `Year ${r.yearLevel}` : '—'}</td>
                    <td className="fm-muted">{r.adviser ?? '—'}</td>
                    <td className="fm-muted">{r.room ?? '—'}</td>
                    <td className="mono">{r.academicYear ?? '—'}</td>
                    <td>
                      <ActionBtns
                        onEdit={() => openEdit(r)}
                        onDelete={() => setConfirmDelete(r.id)}
                        confirming={confirmDelete === r.id}
                        onConfirm={() => del(r.id)}
                        onCancel={() => setConfirmDelete(null)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)}
        title={drawer?.mode === 'add' ? 'Add section' : 'Edit section'}>
        <Field label="Section name" required>
          <input className="fm-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. BSIT-1A" />
        </Field>
        <Field label="Academic year">
          <input className="fm-input mono" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} placeholder="e.g. 2024-2025" />
        </Field>
        <Field label="Year level">
          <select className="fm-input" value={form.yearLevel} onChange={e => set('yearLevel', e.target.value)}>
            <option value="">Not specified</option>
            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </Field>
        <Field label="Curriculum">
          <select className="fm-input" value={form.curriculumId} onChange={e => set('curriculumId', e.target.value)}>
            <option value="">No curriculum</option>
            {curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Adviser">
          <select className="fm-input" value={form.adviserId} onChange={e => set('adviserId', e.target.value)}>
            <option value="">No adviser</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Room">
          <select className="fm-input" value={form.roomId} onChange={e => set('roomId', e.target.value)}>
            <option value="">No room</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}{r.building ? ' - ' + r.building : ''}</option>)}
          </select>
        </Field>
        <Field label="Max students">
          <input className="fm-input mono" type="number" value={form.maxStudents} onChange={e => set('maxStudents', e.target.value)} placeholder="e.g. 40" />
        </Field>
        <ErrBanner msg={error} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="fm-btn" onClick={() => setDrawer(null)}>Cancel</button>
          <button className="fm-btn primary" disabled={saving} onClick={save}>
            {saving ? 'Saving...' : <><I.Check size={13} /> Save</>}
          </button>
        </div>
      </Drawer>
    </div>
  )
}
