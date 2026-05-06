import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

const FEATURES = [
  {
    title: 'Real-time face recognition',
    desc: 'Contactless biometric attendance captured at entry points.',
  },
  {
    title: 'Live attendance analytics',
    desc: 'Track present, late, and absent counts as they happen.',
  },
  {
    title: 'Automated reporting',
    desc: 'Export daily logs and per-grade summaries in one click.',
  },
]

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!password) { setError('Enter your password.'); return }
    setLoading(true)
    try {
      const { token, user } = await api.auth.login(email, password)
      localStorage.setItem('frbams_token', token)
      localStorage.setItem('frbams_authed', '1')
      localStorage.setItem('frbams_user', JSON.stringify({
        name:     user.name,
        role:     user.role,
        initials: user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      }))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message ?? 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fm-login-wrap">
      {/* ── Left hero panel ── */}
      <div className="fm-login-hero">
        {/* Extra geometric decoration rings */}
        <div style={{
          position: 'absolute', top: 120, right: -120,
          width: 280, height: 280,
          border: '1px solid rgba(201,162,39,0.08)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: 40,
          width: 160, height: 160,
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        {/* Diagonal accent line */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 1,
          background: 'linear-gradient(180deg, transparent 0%, rgba(201,162,39,0.25) 30%, rgba(201,162,39,0.12) 70%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        <div className="fm-login-hero-inner">
          {/* Brand mark */}
          <div className="fm-login-hero-mark">UV</div>

          {/* Headline */}
          <h2>Face Recognition<br />Attendance System</h2>
          <p>
            University of the Visayas · Admin Portal. Secure access for
            administrators and academic staff.
          </p>

          <div className="fm-login-hero-rule" />

          {/* Feature bullets */}
          <div className="fm-login-hero-features">
            {FEATURES.map((f, i) => (
              <div className="fm-login-hero-feat" key={i}>
                <div className="fm-login-hero-feat-dot" />
                <div className="fm-login-hero-feat-text">
                  <strong>{f.title}</strong>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Footer stamp */}
          <div className="fm-login-hero-footer">
            FRBAMS v2 · University of the Visayas · {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="fm-login-form-panel">
        <div className="fm-login-form-inner">
          <div className="fm-login-form-card">
            <div className="fm-login-form-header">
              <h1>Sign in</h1>
              <p>Enter your administrator credentials to continue.</p>
            </div>

            <form onSubmit={submit}>
              <div className="fm-login-field">
                <label className="fm-login-label">Email address</label>
                <input
                  className="fm-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@uv.edu.ph"
                  autoComplete="email"
                />
              </div>

              <div className="fm-login-field">
                <label className="fm-login-label">Password</label>
                <input
                  className="fm-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  autoFocus
                />
              </div>

              {error && (
                <div style={{
                  fontSize: 12.5, color: 'var(--red)',
                  background: 'var(--red-soft)',
                  padding: '10px 14px', borderRadius: 'var(--r-sm)',
                  marginBottom: 12,
                  border: '1px solid color-mix(in srgb, var(--red) 20%, transparent)',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="fm-btn primary fm-login-submit"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>
          </div>

          <div className="fm-login-footer">
            Contact your system administrator<br />
            for login credentials or account issues.
          </div>
        </div>
      </div>
    </div>
  )
}
