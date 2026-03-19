import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthScreen from './components/AuthScreen'
import WorkoutTab from './components/WorkoutTab'
import MacrosTab from './components/MacrosTab'
import GuideTab from './components/GuideTab'
import { globalCss } from './styles/shared'

// ─── Icons ────────────────────────────────────────────────────────────────────
const CalIco   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const FlameIco = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0-5 4-5 9a5 5 0 0010 0c0-5-5-9-5-9zm0 13a2 2 0 110-4 2 2 0 010 4z"/></svg>
const BookIco  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>

const TABS = [
  { id: 'workout', label: 'Workout', Icon: CalIco   },
  { id: 'macros',  label: 'Macros',  Icon: FlameIco },
  { id: 'guide',   label: 'Guide',   Icon: BookIco  },
]

// ─── Inner app ────────────────────────────────────────────────────────────────
function TrackerApp() {
  const { user, signOut } = useAuth()
  const [tab,      setTab]      = useState('workout')
  const [showMenu, setShowMenu] = useState(false)

  const dateStr  = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div style={{ minHeight: '100vh', background: '#060608' }}>

      {/* Header */}
      <div style={{ background: '#08080f', borderBottom: '1px solid #0f0f1c',
        padding: '15px 16px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 25,
                fontWeight: 900, color: '#ffffff', letterSpacing: '0.05em',
                textTransform: 'uppercase' }}>FIT</span>
              <span style={{ background: '#e63946', color: '#fff', fontSize: 7.5,
                fontWeight: 800, padding: '2px 5px', borderRadius: 3,
                letterSpacing: '0.12em', textTransform: 'uppercase' }}>TRACK</span>
              <span style={{ fontSize: 11, color: '#2a2a3a', marginLeft: 2 }}>{dateStr}</span>
            </div>

            {/* Avatar / logout */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowMenu((p) => !p)} style={{
                width: 32, height: 32, background: '#e63946', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                color: '#fff', fontSize: 13, border: 'none', cursor: 'pointer',
              }}>{initials}</button>

              {showMenu && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: '#0c0c14', border: '1px solid #1c1c2c',
                  borderRadius: 9, overflow: 'hidden', minWidth: 180, zIndex: 200 }}>
                  <div style={{ padding: '10px 13px', borderBottom: '1px solid #141420' }}>
                    <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase',
                      letterSpacing: '0.1em', marginBottom: 2 }}>Signed in as</div>
                    <div style={{ fontSize: 12, color: '#ccc', wordBreak: 'break-all' }}>
                      {user?.email}
                    </div>
                  </div>
                  <button onClick={async () => { setShowMenu(false); await signOut(); }}
                    style={{ display: 'block', width: '100%', padding: '10px 13px',
                      background: 'transparent', border: 'none', color: '#e63946',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'inherit', textAlign: 'left',
                      letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab bar — 3 tabs now */}
          <div style={{ display: 'flex' }}>
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 5,
                padding: '10px 0', background: 'transparent', border: 'none',
                borderBottom: `2px solid ${tab === id ? '#e63946' : 'transparent'}`,
                color: tab === id ? '#fff' : '#3a3a4a',
                fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'color 0.15s',
              }}>
                <Icon /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '18px 13px 80px' }}>
        {tab === 'workout' && <WorkoutTab />}
        {tab === 'macros'  && <MacrosTab />}
        {tab === 'guide'   && <GuideTab />}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function Root() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060608', display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22,
          fontWeight: 900, color: '#e63946', letterSpacing: '0.1em',
          textTransform: 'uppercase', animation: 'pulse 1.4s ease-in-out infinite' }}>
          FORGE
        </span>
        <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
      </div>
    )
  }

  return user ? <TrackerApp /> : <AuthScreen />
}

// ─── App export ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{globalCss}</style>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </>
  )
}