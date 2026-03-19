import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthScreen() {
  const { signIn, signUp } = useAuth()

  const [mode, setMode]         = useState('login')   // 'login' | 'signup'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit() {
    setError('')
    setSuccess('')

    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        // Auth state change in AuthContext will handle redirect
      } else {
        await signUp(email, password)
        setSuccess('Account created! Check your email to confirm, then log in.')
        setMode('login')
        setPassword('')
        setConfirm('')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060608',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Barlow', sans-serif",
    }}>

      {/* Background grid decoration */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(230,57,70,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(230,57,70,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }}/>

      {/* Glow blob */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 42, fontWeight: 900, color: '#fff',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              lineHeight: 1,
            }}>FIT</span>
            <span style={{
              background: '#e63946', color: '#fff', fontSize: 9,
              fontWeight: 800, padding: '3px 7px', borderRadius: 3,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              alignSelf: 'center', marginTop: 4,
            }}>TRACK</span>
          </div>
          <p style={{ color: '#444444', fontSize: 13, letterSpacing: '0.04em' }}>
            {mode === 'login' ? 'Welcome back. Time to work.' : 'Build your profile. Start your program.'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#0c0c14',
          border: '1px solid #1c1c2c',
          borderRadius: 14,
          padding: '28px 24px',
        }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: '#08080f', borderRadius: 8,
            padding: 3, marginBottom: 24, border: '1px solid #141420' }}>
            {[['login', 'Log In'], ['signup', 'Sign Up']].map(([m, l]) => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
                  background: mode === m ? '#e63946' : 'transparent',
                  color: mode === m ? '#fff' : '#444',
                  fontSize: 12, fontWeight: 800, letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                }}>{l}</button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, color: '#555',
                textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>
                Email
              </label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                style={fieldStyle}
                onFocus={(e) => e.target.style.borderColor = '#e63946'}
                onBlur={(e)  => e.target.style.borderColor = '#1c1c2c'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, color: '#555',
                textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>
                Password
              </label>
              <input
                type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                style={fieldStyle}
                onFocus={(e) => e.target.style.borderColor = '#e63946'}
                onBlur={(e)  => e.target.style.borderColor = '#1c1c2c'}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#555',
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>
                  Confirm Password
                </label>
                <input
                  type="password" value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  style={fieldStyle}
                  onFocus={(e) => e.target.style.borderColor = '#e63946'}
                  onBlur={(e)  => e.target.style.borderColor = '#1c1c2c'}
                />
              </div>
            )}
          </div>

          {/* Error / success messages */}
          {error && (
            <div style={{ marginTop: 14, padding: '10px 13px',
              background: '#e6394618', border: '1px solid #e6394644',
              borderRadius: 7, fontSize: 12, color: '#e63946' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginTop: 14, padding: '10px 13px',
              background: '#2ec4b618', border: '1px solid #2ec4b644',
              borderRadius: 7, fontSize: 12, color: '#2ec4b6' }}>
              {success}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            marginTop: 20, width: '100%', padding: '13px',
            background: loading ? '#7a1a20' : '#e63946',
            border: 'none', borderRadius: 8, color: '#fff',
            fontSize: 13, fontWeight: 800, letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'background 0.15s',
          }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>

          {/* Switch mode link */}
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#444' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: '#e63946',
                cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#2a2a3a' }}>
          Your data is private and tied to your account.
        </p>
      </div>
    </div>
  )
}

const fieldStyle = {
  width: '100%',
  background: '#08080f',
  border: '1px solid #1c1c2c',
  borderRadius: 8,
  padding: '11px 13px',
  color: '#ddd',
  fontSize: 13,
  fontFamily: "'Barlow', sans-serif",
  outline: 'none',
  transition: 'border-color 0.15s',
}
