import { useState } from 'react'
import { EXERCISE_GUIDES, GUIDE_CATEGORIES, DIFFICULTY_COLOR } from '../data/exerciseGuides'

// ─── ICONS ────────────────────────────────────────────────────────────────────
const BackIco   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
const SearchIco = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>

// ─── EXERCISE CARD ────────────────────────────────────────────────────────────
function ExerciseCard({ name, guide, onClick }) {
  return (
    <button onClick={() => onClick(name)} style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 14px', background: '#0a0a10',
      border: '1px solid #161622', borderRadius: 9,
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      width: '100%', transition: 'border-color 0.15s, background 0.15s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#2a2a3a'
      e.currentTarget.style.background  = '#0c0c16'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#161622'
      e.currentTarget.style.background  = '#0a0a10'
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#ddd', marginBottom: 4 }}>{name}</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: '#555' }}>{guide.equipment}</span>
          <span style={{ fontSize: 10, color: '#333' }}>·</span>
          {guide.muscles.slice(0, 2).map((m) => (
            <span key={m} style={{ fontSize: 10, color: '#555' }}>{m}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <span style={{
          fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: DIFFICULTY_COLOR[guide.difficulty],
          background: DIFFICULTY_COLOR[guide.difficulty] + '18',
          border: `1px solid ${DIFFICULTY_COLOR[guide.difficulty]}33`,
        }}>{guide.difficulty}</span>
        <span style={{ fontSize: 9, color: '#444', textTransform: 'uppercase',
          letterSpacing: '0.08em' }}>{guide.category}</span>
      </div>
    </button>
  )
}

// ─── DETAIL VIEW ──────────────────────────────────────────────────────────────
function ExerciseDetail({ name, guide, onBack }) {
  const diffColor = DIFFICULTY_COLOR[guide.difficulty]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Back button + header */}
      <div>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'transparent', border: 'none',
          color: '#555', fontSize: 12, cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '0 0 12px 0',
        }}>
          <BackIco /> Back to Guides
        </button>

        <div style={{ background: '#0c0c14', border: `1px solid ${diffColor}33`,
          borderRadius: 10, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 26, fontWeight: 900, color: '#fff',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                lineHeight: 1 }}>{name}</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                {guide.equipment}
              </div>
            </div>
            <span style={{
              fontSize: 9, fontWeight: 800, padding: '3px 9px', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: diffColor, background: diffColor + '18',
              border: `1px solid ${diffColor}33`, flexShrink: 0,
            }}>{guide.difficulty}</span>
          </div>

          {/* Muscles */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {guide.muscles.map((m, i) => (
              <span key={m} style={{
                fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 4,
                background: i === 0 ? '#e6394620' : '#0a0a12',
                border: `1px solid ${i === 0 ? '#e6394644' : '#1c1c2c'}`,
                color: i === 0 ? '#e63946' : '#555',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Step-by-step instructions */}
      <div style={{ background: '#0a0a10', border: '1px solid #1c1c2c',
        borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase',
          letterSpacing: '0.14em', marginBottom: 14 }}>How To Do It</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {guide.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: '#e6394618', border: '1px solid #e6394644',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                fontWeight: 700, color: '#e63946',
              }}>{i + 1}</div>
              <p style={{ fontSize: 13, color: '#bbb', lineHeight: 1.6,
                margin: 0, paddingTop: 3 }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sets & reps recommendations */}
      <div style={{ background: '#0a0a10', border: '1px solid #1c1c2c',
        borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase',
          letterSpacing: '0.14em', marginBottom: 14 }}>Sets & Reps by Goal</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px',
            gap: 8, paddingBottom: 8, borderBottom: '1px solid #1c1c2c' }}>
            {['Goal', 'Sets', 'Reps', 'Rest'].map((h) => (
              <div key={h} style={{ fontSize: 9, color: '#444', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
            ))}
          </div>
          {/* Rows */}
          {guide.recs.map((r, i) => {
            const rowColor = r.goal === 'Strength' ? '#e63946'
              : r.goal === 'Muscle' ? '#f4a261' : '#2ec4b6'
            return (
              <div key={i} style={{ display: 'grid',
                gridTemplateColumns: '1fr 80px 80px 80px',
                gap: 8, padding: '8px 10px', borderRadius: 7,
                background: rowColor + '0a',
                border: `1px solid ${rowColor}22` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: rowColor,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {r.goal}
                </div>
                <div style={{ fontSize: 12, color: '#ccc',
                  fontFamily: "'DM Mono', monospace" }}>{r.sets}</div>
                <div style={{ fontSize: 12, color: '#ccc',
                  fontFamily: "'DM Mono', monospace" }}>{r.reps}</div>
                <div style={{ fontSize: 11, color: '#777',
                  fontFamily: "'DM Mono', monospace" }}>{r.rest}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pro tip */}
      {guide.tips && (
        <div style={{ background: '#0a0a10', border: '1px solid #f4a26133',
          borderRadius: 10, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>💡</span>
          <div>
            <div style={{ fontSize: 9, color: '#f4a261', textTransform: 'uppercase',
              letterSpacing: '0.14em', marginBottom: 5, fontWeight: 800 }}>Pro Tip</div>
            <p style={{ fontSize: 13, color: '#999', lineHeight: 1.6, margin: 0 }}>
              {guide.tips}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN GUIDE TAB ───────────────────────────────────────────────────────────
export default function GuideTab() {
  const [search,      setSearch]      = useState('')
  const [category,    setCategory]    = useState('All')
  const [selectedEx,  setSelectedEx]  = useState(null)

  // Filter exercises by search + category
  const allEntries = Object.entries(EXERCISE_GUIDES)
  const filtered = allEntries.filter(([name, guide]) => {
    const matchSearch   = name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || guide.category === category
    return matchSearch && matchCategory
  })

  // If an exercise is selected show detail view
  if (selectedEx) {
    return (
      <ExerciseDetail
        name={selectedEx}
        guide={EXERCISE_GUIDES[selectedEx]}
        onBack={() => setSelectedEx(null)}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div style={{ background: '#0c0c14', border: '1px solid #1c1c2c',
        borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22,
          fontWeight: 900, color: '#fff', textTransform: 'uppercase',
          letterSpacing: '0.04em', marginBottom: 2 }}>Exercise Guide</div>
        <div style={{ fontSize: 12, color: '#555' }}>
          {allEntries.length} exercises · step-by-step form + sets & reps
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none' }}>
          <SearchIco />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises…"
          style={{
            width: '100%', background: '#0c0c14', border: '1px solid #1c1c2c',
            borderRadius: 8, padding: '10px 12px 10px 34px',
            color: '#ddd', fontSize: 13, fontFamily: "'Barlow', sans-serif",
            outline: 'none',
          }}
        />
      </div>

      {/* Category filter pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {GUIDE_CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            border: `1px solid ${category === cat ? '#e63946' : '#1c1c2c'}`,
            background: category === cat ? '#e6394620' : 'transparent',
            color: category === cat ? '#e63946' : '#555',
            cursor: 'pointer', fontFamily: 'inherit',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            transition: 'all 0.15s',
          }}>{cat}</button>
        ))}
      </div>

      {/* Results count */}
      <div style={{ fontSize: 9, color: '#3a3a4a', textTransform: 'uppercase',
        letterSpacing: '0.14em' }}>
        {filtered.length} exercise{filtered.length !== 1 ? 's' : ''}
        {category !== 'All' ? ` · ${category}` : ''}
        {search ? ` · "${search}"` : ''}
      </div>

      {/* Exercise list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0',
          color: '#2a2a3a', fontSize: 13 }}>
          No exercises found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {filtered.map(([name, guide]) => (
            <ExerciseCard
              key={name}
              name={name}
              guide={guide}
              onClick={setSelectedEx}
            />
          ))}
        </div>
      )}
    </div>
  )
}
