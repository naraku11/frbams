import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

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
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: 'var(--body)',
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, justifyContent: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, background: 'var(--fg)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 800, color: 'var(--bg)',
            letterSpacing: '-0.02em',
          }}>UV</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fg)', lineHeight: 1.1 }}>FRBAMS</span>
            <span style={{ fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: '0.01em', lineHeight: 1 }}>University of the Visayas</span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--line)',
          borderRadius: 'var(--r-xl)', padding: 32,
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 4px', color: 'var(--fg)' }}>
            Sign in
          </h1>
          <p style={{ color: 'var(--fg-3)', fontSize: 13.5, margin: '0 0 28px' }}>
            University of the Visayas · Admin Portal
          </p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 6 }}>Email</label>
              <input
                className="fm-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%' }}
                autoComplete="email"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 6 }}>Password</label>
              <input
                className="fm-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%' }}
                autoComplete="current-password"
                autoFocus
              />
            </div>

            {error && (
              <div style={{
                fontSize: 12.5, color: 'oklch(0.4 0.12 25)', background: 'var(--red-soft)',
                padding: '9px 14px', borderRadius: 8,
              }}>{error}</div>
            )}

            <button
              type="submit"
              className="fm-btn primary"
              style={{ marginTop: 4, padding: '13px 20px', fontSize: 14, justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--fg-4)' }}>
          Contact your system administrator for login credentials.
        </p>
      </div>
    </div>
  )
}
