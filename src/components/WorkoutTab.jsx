import { useState, useEffect } from 'react'
import { DAYS, SPLITS } from '../data/presets'
import { getTodayDay } from '../utils'
import { S } from '../styles/shared'
import { BoltIco, PlusIco, TrashIco, CheckIco, CloseIco } from './Icons'
import DayModal from './DayModal'
import { useAuth } from '../context/AuthContext'
import {
  loadWorkoutPlan,
  saveWorkoutPlan,
  saveWorkoutSession,
  loadAllSessions,
} from '../db/workoutDb'

export default function WorkoutTab() {
  const { user } = useAuth()

  const [plan,          setPlan]          = useState({})
  const [activeSplit,   setActiveSplit]   = useState(null)
  const [sessions,      setSessions]      = useState({})
  const [selectedDay,   setSelectedDay]   = useState(null)
  const [showSplitMenu, setShowSplitMenu] = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [dbLoading,     setDbLoading]     = useState(true)

  // ── Inline title editing state ────────────────────────────────────────────
  const [editingDay,   setEditingDay]   = useState(null)  // which day is being renamed
  const [editingTitle, setEditingTitle] = useState('')    // current input value

  const today = getTodayDay()

  // ── Load from Supabase on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    async function fetchData() {
      setDbLoading(true)
      try {
        const [planRow, allSessions] = await Promise.all([
          loadWorkoutPlan(user.id),
          loadAllSessions(user.id),
        ])
        if (planRow) {
          setPlan(planRow.plan_data || {})
          setActiveSplit(planRow.split_key || null)
        }
        const byDate = {}
        allSessions.forEach((s) => { byDate[s.date] = s })
        setSessions(byDate)
      } catch (err) {
        console.error('Failed to load workout data:', err)
      } finally {
        setDbLoading(false)
      }
    }
    fetchData()
  }, [user])

  // ── Persist plan helper ───────────────────────────────────────────────────
  async function persistPlan(newPlan, splitKey) {
    const keyToSave = splitKey !== undefined ? splitKey : activeSplit
    try { await saveWorkoutPlan(user.id, keyToSave, newPlan) }
    catch (err) { console.error('Failed to save plan:', err) }
  }

  // ── Apply a split preset ──────────────────────────────────────────────────
  async function applySplit(key) {
    const split = SPLITS[key]
    const newPlan = {}
    DAYS.forEach((d) => {
      newPlan[d] = {
        label:      split.schedule[d].label,
        splitColor: split.color,
        exercises:  split.schedule[d].exercises.map((name) => ({
          id: Date.now() + Math.random(), name, sets: [{ reps: '', weight: '' }],
        })),
      }
    })
    setPlan(newPlan)
    setActiveSplit(key)
    setShowSplitMenu(false)
    await persistPlan(newPlan, key)
  }

  // ── Reset entire plan to blank ────────────────────────────────────────────
  async function resetPlan() {
    const blank = {}
    DAYS.forEach((d) => {
      blank[d] = { label: '', splitColor: '#e63946', exercises: [] }
    })
    setPlan(blank)
    setActiveSplit(null)
    setShowSplitMenu(false)
    await persistPlan(blank, null)
  }

  // ── Start editing a day's title ───────────────────────────────────────────
  function startEditTitle(day, e) {
    e.stopPropagation() // don't open the day modal
    setEditingDay(day)
    setEditingTitle(plan[day]?.label || '')
  }

  // ── Save edited title ─────────────────────────────────────────────────────
  async function saveTitle(day) {
    const updatedPlan = {
      ...plan,
      [day]: { ...plan[day], label: editingTitle.trim() || '' },
    }
    setPlan(updatedPlan)
    setEditingDay(null)
    await persistPlan(updatedPlan, activeSplit)
  }

  // ── Get ISO date string for a day label this week ─────────────────────────
  function getDayDateString(dayLabel) {
    const now       = new Date()
    const todayDow  = now.getDay()
    const dayIdx    = DAYS.indexOf(dayLabel)
    const targetDow = dayIdx === 6 ? 0 : dayIdx + 1
    const diff      = targetDow - todayDow
    const target    = new Date(now)
    target.setDate(now.getDate() + diff)
    return target.toISOString().split('T')[0]
  }

  // ── Save a logged day to Supabase ─────────────────────────────────────────
  async function saveDay(day, exercises) {
    setSaving(true)
    try {
      const dayData = plan[day] || {}
      const dateStr = getDayDateString(day)
      const session = await saveWorkoutSession(
        user.id, dateStr,
        dayData.label || day,
        dayData.splitColor || '#e63946',
        exercises,
      )
      setSessions((prev) => ({ ...prev, [dateStr]: session }))
      const updatedPlan = { ...plan, [day]: { ...plan[day], exercises } }
      setPlan(updatedPlan)
      await persistPlan(updatedPlan, activeSplit)
    } catch (err) {
      console.error('Failed to save session:', err)
    } finally {
      setSaving(false)
      setSelectedDay(null)
    }
  }

  function getSetsDone(day) {
    return (plan[day]?.exercises || []).reduce(
      (a, ex) => a + (ex.sets || []).filter((s) => s.reps && s.weight).length, 0
    )
  }

  const splitInfo = activeSplit ? SPLITS[activeSplit] : null

  if (dbLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 0', color: '#333', fontSize: 13 }}>
        Loading your plan…
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Split Loader ── */}
      <div style={{ background: '#0c0c14', border: '1px solid #1c1c2c', borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase',
              letterSpacing: '0.12em', marginBottom: 3 }}>Active Split</div>
            {splitInfo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, background: splitInfo.color,
                  borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 19,
                  fontWeight: 800, color: '#fff', textTransform: 'uppercase',
                  letterSpacing: '0.04em' }}>{splitInfo.label}</span>
              </div>
            ) : (
              <div style={{ color: '#333', fontSize: 12, marginTop: 2 }}>
                Custom plan — no preset loaded
              </div>
            )}
          </div>
          <button onClick={() => setShowSplitMenu((p) => !p)}
            style={{ ...S.redBtn, background: showSplitMenu ? '#1a1a2a' : '#e63946',
              border: showSplitMenu ? '1px solid #2a2a3a' : 'none' }}>
            <BoltIco /> {showSplitMenu ? 'Close' : 'Load Split'}
          </button>
        </div>

        {showSplitMenu && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 12 }}>

            {/* Preset splits */}
            {Object.entries(SPLITS).map(([key, s]) => (
              <button key={key} onClick={() => applySplit(key)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: activeSplit === key ? s.color + '15' : '#0a0a12',
                border: `1px solid ${activeSplit === key ? s.color + '44' : '#1c1c2c'}`,
                borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}>
                <span style={{ width: 8, height: 8, background: s.color,
                  borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#ccc' }}>{s.label}</span>
                {activeSplit === key && (
                  <span style={{ fontSize: 9, color: s.color, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active</span>
                )}
              </button>
            ))}

            {/* Divider */}
            <div style={{ borderTop: '1px solid #1c1c2c', marginTop: 4, paddingTop: 8 }}>
              <button onClick={resetPlan} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: '#0a0a12', border: '1px solid #2a2a3a',
                borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                textAlign: 'left', width: '100%',
              }}>
                <span style={{ width: 8, height: 8, background: '#444',
                  borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#555' }}>
                  Clear plan — start from scratch
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Weekly Calendar Grid ── */}
      <div>
        <div style={{ fontSize: 9, color: '#3a3a4a', textTransform: 'uppercase',
          letterSpacing: '0.14em', marginBottom: 9 }}>
          Weekly Plan — tap title to rename · tap card to edit
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {DAYS.map((day) => {
            const isToday  = day === today
            const dp       = plan[day]
            const exCount  = (dp?.exercises || []).length
            const setsDone = getSetsDone(day)
            const isRest   = !dp?.label && exCount === 0
            const color    = dp?.splitColor || '#e63946'
            const hasLog   = !!sessions[getDayDateString(day)]
            const isEditing = editingDay === day

            return (
              <div key={day} style={{ position: 'relative' }}>
                <button
                  onClick={() => !isEditing && setSelectedDay(day)}
                  onMouseEnter={(e) => { if (!isEditing) e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { if (!isEditing) e.currentTarget.style.transform = 'translateY(0)' }}
                  style={{ width: '100%', background: isToday ? '#0f0f1c' : '#0a0a10',
                    border: `1px solid ${isToday ? color + '66' : '#181828'}`,
                    borderRadius: 9, padding: '9px 5px 10px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'transform 0.12s',
                    boxShadow: isToday ? `0 0 14px ${color}20` : 'none' }}>

                  {isToday && <span style={{ position: 'absolute', top: 5, right: 5,
                    width: 5, height: 5, background: color, borderRadius: '50%' }} />}
                  {hasLog && <span style={{ position: 'absolute', top: 5, left: 5,
                    width: 5, height: 5, background: '#2ec4b6', borderRadius: '50%' }} />}

                  {/* Day abbreviation */}
                  <span style={{ fontSize: 9, fontWeight: 800,
                    color: isToday ? '#fff' : '#444',
                    textTransform: 'uppercase', letterSpacing: '0.08em' }}>{day}</span>

                  {/* Editable title */}
                  {isEditing ? (
                    <div onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', flexDirection: 'column', gap: 4,
                        width: '100%', padding: '0 4px' }}>
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle(day)
                          if (e.key === 'Escape') setEditingDay(null)
                        }}
                        placeholder="Title…"
                        style={{ ...S.inputSm, fontSize: 9, padding: '4px 4px',
                          borderColor: color, textAlign: 'center' }}
                      />
                      <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                        <button onClick={() => saveTitle(day)}
                          style={{ ...S.iconBtn, padding: '3px', borderColor: '#2ec4b6',
                            color: '#2ec4b6', borderRadius: 4 }}>
                          <CheckIco />
                        </button>
                        <button onClick={() => setEditingDay(null)}
                          style={{ ...S.iconBtn, padding: '3px', borderRadius: 4 }}>
                          <CloseIco />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span
                      onClick={(e) => startEditTitle(day, e)}
                      title="Tap to rename"
                      style={{ fontSize: 7.5, fontWeight: 800,
                        color: dp?.label ? color : '#252535',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        textAlign: 'center', lineHeight: 1.3, padding: '0 2px',
                        cursor: 'text', borderBottom: dp?.label
                          ? `1px dashed ${color}44`
                          : '1px dashed #252535',
                        minWidth: 20, minHeight: 10,
                      }}>
                      {dp?.label || '—'}
                    </span>
                  )}

                  {/* Exercise count */}
                  {!isEditing && exCount > 0 ? (
                    <div style={{ background: color + '18', borderRadius: 5,
                      padding: '2px 5px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color,
                        fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{exCount}</div>
                      <div style={{ fontSize: 7, color: color + '88',
                        textTransform: 'uppercase', letterSpacing: '0.06em' }}>ex</div>
                    </div>
                  ) : !isEditing ? (
                    <div style={{ color: '#222233', marginTop: 2 }}><PlusIco /></div>
                  ) : null}

                  {setsDone > 0 && !isEditing && (
                    <div style={{ fontSize: 7.5, color: color + '66',
                      fontFamily: "'DM Mono', monospace" }}>{setsDone}s</div>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
          {[['#e63946', 'Today'], ['#2ec4b6', 'Logged to DB']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, background: c,
                borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontSize: 9, color: '#444' }}>{l}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 9, color: '#444' }}>· tap title to rename</span>
          </div>
        </div>
      </div>

      {/* ── Today's Workout Card ── */}
      {plan[today] && (plan[today].exercises || []).length > 0 && (
        <div style={{ background: '#0a0a10',
          border: `1px solid ${plan[today]?.splitColor || '#e63946'}33`,
          borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase',
            letterSpacing: '0.12em', marginBottom: 10 }}>
            Today{plan[today]?.label ? ` · ${plan[today].label}` : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(plan[today].exercises || []).slice(0, 5).map((ex, i) => {
              const done  = (ex.sets || []).filter((s) => s.reps && s.weight).length
              const total = (ex.sets || []).length
              const c     = plan[today]?.splitColor || '#e63946'
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '7px 11px',
                  background: '#0c0c14', borderRadius: 7 }}>
                  <span style={{ fontSize: 13, color: '#bbb' }}>{ex.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: Math.min(total, 6) }).map((_, idx) => (
                        <span key={idx} style={{ width: 6, height: 6, borderRadius: '50%',
                          background: idx < done ? c : '#1c1c2c' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 10, color: done > 0 ? c : '#333',
                      fontFamily: "'DM Mono', monospace" }}>{done}/{total}</span>
                  </div>
                </div>
              )
            })}
            {(plan[today].exercises || []).length > 5 && (
              <div style={{ fontSize: 11, color: '#333', textAlign: 'center', paddingTop: 2 }}>
                +{(plan[today].exercises || []).length - 5} more
              </div>
            )}
          </div>
          <button onClick={() => setSelectedDay(today)}
            style={{ ...S.redBtn, width: '100%', justifyContent: 'center',
              marginTop: 12, padding: '10px' }}>
            <BoltIco /> Log Today's Workout
          </button>
        </div>
      )}

      {(!plan[today] || (plan[today]?.exercises || []).length === 0) && (
        <button onClick={() => setSelectedDay(today)}
          style={{ ...S.redBtn, width: '100%', justifyContent: 'center',
            padding: '12px', borderRadius: 9 }}>
          <PlusIco /> Add Today's Workout
        </button>
      )}

      {saving && (
        <div style={{ textAlign: 'center', fontSize: 11, color: '#2ec4b6',
          letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Saving to database…
        </div>
      )}

      {selectedDay && (
        <DayModal
          day={selectedDay}
          dayData={plan[selectedDay]}
          onClose={() => setSelectedDay(null)}
          onSave={(exs) => saveDay(selectedDay, exs)}
        />
      )}
    </div>
  )
}