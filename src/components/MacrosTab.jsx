import { useState, useEffect } from 'react'
import { FOOD_PRESETS } from '../data/presets'
import { getTodayKey } from '../utils'
import { S } from '../styles/shared'
import { PlusIco, TrashIco } from './Icons'
import MacroRing from './MacroRing'
import { useAuth } from '../context/AuthContext'
import { loadFoodLog, addFoodItem, deleteFoodItem, dbRowToFoodItem } from '../db/macrosDb'
import { supabase } from '../supabaseClient'

// ─── TDEE / Calorie Calculator ────────────────────────────────────────────────
// Uses Mifflin-St Jeor formula
function calculateCalories(profile) {
  const { weight, height, age, gender, goal, units } = profile

  // Convert to metric if needed
  const weightKg = units === 'imperial' ? weight * 0.453592 : parseFloat(weight)
  const heightCm = units === 'imperial'
    ? parseFloat(profile.heightFt) * 30.48 + parseFloat(profile.heightIn || 0) * 2.54
    : parseFloat(height)

  if (!weightKg || !heightCm || !age) return null

  // Mifflin-St Jeor BMR
  let bmr
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }

  // Moderate activity multiplier (3-5 days/week gym = 1.55)
  const tdee = Math.round(bmr * 1.55)

  // Adjust for goal
  const goalCalories = {
    cut:      Math.round(tdee - 500),   // ~0.5kg/week loss
    maintain: tdee,
    bulk:     Math.round(tdee + 300),   // lean bulk
  }

  // Macro split (protein: 2g/kg, fat: 0.9g/kg, rest carbs)
  const protein = Math.round(weightKg * 2)
  const fat     = Math.round(weightKg * 0.9)
  const carbs   = Math.round((goalCalories[goal] - protein * 4 - fat * 9) / 4)

  return {
    tdee,
    calories: goalCalories[goal],
    protein,
    fat,
    carbs: Math.max(carbs, 50), // minimum 50g carbs
  }
}

const GOAL_INFO = {
  cut:      { label: 'Cut',      desc: 'Lose fat, preserve muscle', delta: '-500 kcal',  color: '#e63946' },
  maintain: { label: 'Maintain', desc: 'Stay at current weight',    delta: 'TDEE',       color: '#f4a261' },
  bulk:     { label: 'Bulk',     desc: 'Build muscle, lean gains',  delta: '+300 kcal',  color: '#2ec4b6' },
}

// ─── PROFILE SETUP SCREEN ─────────────────────────────────────────────────────
function ProfileSetup({ onSave, existing }) {
  const [units,    setUnits]    = useState(existing?.units    || 'imperial')
  const [gender,   setGender]   = useState(existing?.gender   || 'male')
  const [age,      setAge]      = useState(existing?.age      || '')
  const [weight,   setWeight]   = useState(existing?.weight   || '')
  const [height,   setHeight]   = useState(existing?.height   || '')
  const [heightFt, setHeightFt] = useState(existing?.heightFt || '')
  const [heightIn, setHeightIn] = useState(existing?.heightIn || '')
  const [goal,     setGoal]     = useState(existing?.goal     || 'maintain')
  const [error,    setError]    = useState('')

  function validate() {
    if (!age || age < 10 || age > 100) return 'Please enter a valid age.'
    if (!weight || weight <= 0)        return 'Please enter your weight.'
    if (units === 'metric' && (!height || height <= 0)) return 'Please enter your height.'
    if (units === 'imperial' && !heightFt)              return 'Please enter your height.'
    return null
  }

  function handleSave() {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    const profile = { units, gender, age: parseInt(age), weight: parseFloat(weight),
      height: parseFloat(height), heightFt: parseFloat(heightFt),
      heightIn: parseFloat(heightIn || 0), goal }
    const result = calculateCalories(profile)
    onSave({ ...profile, ...result })
  }

  const labelStyle = { display: 'block', fontSize: 9, color: '#555',
    textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }
  const rowStyle   = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ background: '#0c0c14', border: '1px solid #1c1c2c', borderRadius: 10, padding: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22,
          fontWeight: 900, color: '#fff', textTransform: 'uppercase',
          letterSpacing: '0.04em', marginBottom: 4 }}>
          Set Up Your Goals
        </div>
        <div style={{ fontSize: 12, color: '#555' }}>
          We'll calculate your daily calorie target using the Mifflin-St Jeor formula based on your stats.
        </div>
      </div>

      {/* Units toggle */}
      <div>
        <label style={labelStyle}>Units</label>
        <div style={{ display: 'flex', background: '#08080f', borderRadius: 8,
          padding: 3, border: '1px solid #141420' }}>
          {[['imperial', 'Imperial (lbs / ft)'], ['metric', 'Metric (kg / cm)']].map(([u, l]) => (
            <button key={u} onClick={() => setUnits(u)} style={{
              flex: 1, padding: '7px 0', borderRadius: 6, border: 'none',
              background: units === u ? '#e63946' : 'transparent',
              color: units === u ? '#fff' : '#444',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', letterSpacing: '0.04em', transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <label style={labelStyle}>Biological Sex</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['male', '♂ Male'], ['female', '♀ Female']].map(([g, l]) => (
            <button key={g} onClick={() => setGender(g)} style={{
              flex: 1, padding: '10px', borderRadius: 8,
              border: `1px solid ${gender === g ? '#e63946' : '#1c1c2c'}`,
              background: gender === g ? '#e6394618' : '#0a0a10',
              color: gender === g ? '#e63946' : '#555',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Age + Weight */}
      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>Age</label>
          <input value={age} onChange={e => setAge(e.target.value)}
            type="number" placeholder="25" style={S.input} />
        </div>
        <div>
          <label style={labelStyle}>Weight ({units === 'imperial' ? 'lbs' : 'kg'})</label>
          <input value={weight} onChange={e => setWeight(e.target.value)}
            type="number" placeholder={units === 'imperial' ? '180' : '82'}
            style={S.input} />
        </div>
      </div>

      {/* Height */}
      <div>
        <label style={labelStyle}>Height</label>
        {units === 'imperial' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input value={heightFt} onChange={e => setHeightFt(e.target.value)}
              type="number" placeholder="5 ft" style={S.input} />
            <input value={heightIn} onChange={e => setHeightIn(e.target.value)}
              type="number" placeholder="10 in" style={S.input} />
          </div>
        ) : (
          <input value={height} onChange={e => setHeight(e.target.value)}
            type="number" placeholder="178 cm" style={S.input} />
        )}
      </div>

      {/* Goal */}
      <div>
        <label style={labelStyle}>Goal</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {Object.entries(GOAL_INFO).map(([key, info]) => (
            <button key={key} onClick={() => setGoal(key)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', borderRadius: 9,
              border: `1px solid ${goal === key ? info.color + '66' : '#1c1c2c'}`,
              background: goal === key ? info.color + '12' : '#0a0a10',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              boxShadow: goal === key ? `0 0 12px ${info.color}15` : 'none',
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 800,
                  color: goal === key ? info.color : '#ccc',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {info.label}
                </div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{info.desc}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700,
                color: goal === key ? info.color : '#333',
                fontFamily: "'DM Mono', monospace" }}>
                {info.delta}
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 13px', background: '#e6394618',
          border: '1px solid #e6394644', borderRadius: 7,
          fontSize: 12, color: '#e63946' }}>{error}</div>
      )}

      <button onClick={handleSave} style={{
        ...S.redBtn, width: '100%', justifyContent: 'center',
        padding: '13px', borderRadius: 9, fontSize: 13,
      }}>
        Calculate My Calories →
      </button>
    </div>
  )
}

// ─── CALORIE RESULT BANNER ────────────────────────────────────────────────────
function GoalBanner({ profile, onEdit }) {
  const goalInfo = GOAL_INFO[profile.goal]
  return (
    <div style={{ background: '#0c0c14', border: `1px solid ${goalInfo.color}33`,
      borderRadius: 10, padding: 14,
      boxShadow: `0 0 20px ${goalInfo.color}10` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase',
            letterSpacing: '0.12em', marginBottom: 4 }}>Daily Goal · {goalInfo.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 42, fontWeight: 900, color: goalInfo.color,
              lineHeight: 1, letterSpacing: '0.02em' }}>
              {profile.calories.toLocaleString()}
            </span>
            <span style={{ fontSize: 13, color: '#555' }}>kcal / day</span>
          </div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>
            TDEE: {profile.tdee?.toLocaleString()} kcal · {goalInfo.desc}
          </div>
        </div>
        <button onClick={onEdit} style={{ ...S.ghostBtn, fontSize: 11, padding: '6px 10px' }}>
          Edit
        </button>
      </div>

      {/* Macro targets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8, marginTop: 14 }}>
        {[
          { label: 'Protein', val: profile.protein, unit: 'g', color: '#e63946' },
          { label: 'Carbs',   val: profile.carbs,   unit: 'g', color: '#f4a261' },
          { label: 'Fats',    val: profile.fat,      unit: 'g', color: '#2ec4b6' },
        ].map((m) => (
          <div key={m.label} style={{ background: '#0a0a10', borderRadius: 8,
            padding: '10px 12px', border: `1px solid ${m.color}22` }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18,
              fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.val}{m.unit}</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 3,
              textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN MACROS TAB ──────────────────────────────────────────────────────────
export default function MacrosTab() {
  const { user } = useAuth()

  const [profile,   setProfile]   = useState(null)   // user's stats + calculated goals
  const [showSetup, setShowSetup] = useState(false)   // show profile setup form
  const [log,       setLog]       = useState([])
  const [search,    setSearch]    = useState('')
  const [showSug,   setShowSug]   = useState(false)
  const [custom,    setCustom]    = useState({ name: '', cal: '', p: '', c: '', f: '' })
  const [mode,      setMode]      = useState('search')
  const [dbLoading, setDbLoading] = useState(true)
  const [saving,    setSaving]    = useState(false)

  const todayDate = getTodayKey()

  // ── Load profile + food log ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    async function fetchAll() {
      setDbLoading(true)
      try {
        // Load saved profile from Supabase user metadata
        const { data: { user: u } } = await supabase.auth.getUser()
        const savedProfile = u?.user_metadata?.fitness_profile || null
        if (savedProfile) setProfile(savedProfile)
        else setShowSetup(true)

        // Load today's food log
        const rows = await loadFoodLog(user.id, todayDate)
        setLog(rows.map(dbRowToFoodItem))
      } catch (err) {
        console.error('Failed to load macros data:', err)
        setShowSetup(true)
      } finally {
        setDbLoading(false)
      }
    }
    fetchAll()
  }, [user, todayDate])

  // ── Save profile to Supabase user metadata ────────────────────────────────
  async function handleSaveProfile(newProfile) {
    try {
      await supabase.auth.updateUser({
        data: { fitness_profile: newProfile }
      })
      setProfile(newProfile)
      setShowSetup(false)
    } catch (err) {
      console.error('Failed to save profile:', err)
    }
  }

  // ── Food log actions ──────────────────────────────────────────────────────
  async function addFood(item) {
    setSaving(true)
    try {
      const row = await addFoodItem(user.id, todayDate, item)
      setLog((prev) => [...prev, dbRowToFoodItem(row)])
    } catch (err) {
      console.error('Failed to add food:', err)
    } finally {
      setSaving(false)
      setSearch('')
      setShowSug(false)
    }
  }

  async function addCustomFood() {
    if (!custom.name || !custom.cal) return
    await addFood({ name: custom.name, cal: +custom.cal||0, p: +custom.p||0, c: +custom.c||0, f: +custom.f||0 })
    setCustom({ name: '', cal: '', p: '', c: '', f: '' })
  }

  async function removeFood(id) {
    setLog((prev) => prev.filter((i) => i.id !== id))
    try { await deleteFoodItem(id) }
    catch (err) { console.error('Failed to delete food:', err) }
  }

  const filtered = FOOD_PRESETS.filter(
    (f) => f.name.toLowerCase().includes(search.toLowerCase()) && search.length > 0
  ).slice(0, 6)

  const totals = log.reduce(
    (a, i) => ({ cal: a.cal + i.cal, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f }),
    { cal: 0, p: 0, c: 0, f: 0 }
  )

  const goalCal     = profile?.calories || 2000
  const goalProtein = profile?.protein  || 150
  const goalCarbs   = profile?.carbs    || 200
  const goalFat     = profile?.fat      || 65
  const calPct      = Math.min((totals.cal / goalCal) * 100, 100)

  // ── Loading state ─────────────────────────────────────────────────────────
  if (dbLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 0', color: '#333', fontSize: 13 }}>
        Loading…
      </div>
    )
  }

  // ── Profile setup screen ──────────────────────────────────────────────────
  if (showSetup) {
    return (
      <ProfileSetup
        onSave={handleSaveProfile}
        existing={profile}
      />
    )
  }

  // ── Main macros view ──────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Goal Banner */}
      <GoalBanner profile={profile} onEdit={() => setShowSetup(true)} />

      {/* Calorie progress */}
      <div style={{ background: '#0c0c14', border: '1px solid #1c1c2c', borderRadius: 10, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Calories Today
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
            <span style={{ color: calPct > 100 ? '#ff6b35' : '#e63946', fontWeight: 700 }}>
              {Math.round(totals.cal)}
            </span>
            <span style={{ color: '#333' }}> / {goalCal.toLocaleString()}</span>
          </span>
        </div>
        <div style={{ height: 7, background: '#141420', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${calPct}%`, borderRadius: 4,
            background: calPct > 100 ? '#ff6b35' : 'linear-gradient(90deg, #e63946, #ff8c42)',
            transition: 'width 0.5s' }} />
        </div>

        {/* Remaining callout */}
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          {totals.cal > goalCal ? (
            <span style={{ fontSize: 11, color: '#ff6b35', fontWeight: 700 }}>
              {Math.round(totals.cal - goalCal)} kcal over goal
            </span>
          ) : (
            <span style={{ fontSize: 11, color: '#555' }}>
              <span style={{ color: '#ccc', fontWeight: 700 }}>{Math.round(goalCal - totals.cal)}</span> kcal remaining
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14 }}>
          <MacroRing label="Protein" value={totals.p} max={goalProtein} color="#e63946" />
          <MacroRing label="Carbs"   value={totals.c} max={goalCarbs}   color="#f4a261" />
          <MacroRing label="Fats"    value={totals.f} max={goalFat}     color="#2ec4b6" />
        </div>
      </div>

      {/* Add Food */}
      <div style={{ background: '#0a0a10', border: '1px solid #1c1c2c', borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[['search', 'Presets'], ['custom', 'Custom']].map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '4px 11px', borderRadius: 5, fontSize: 10, fontWeight: 800,
              border: `1px solid ${mode === m ? '#e63946' : '#1c1c2c'}`,
              background: mode === m ? '#e6394620' : 'transparent',
              color: mode === m ? '#e63946' : '#444', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'inherit',
            }}>{l}</button>
          ))}
          {saving && (
            <span style={{ marginLeft: 'auto', fontSize: 9, color: '#2ec4b6',
              textTransform: 'uppercase', letterSpacing: '0.1em', alignSelf: 'center' }}>
              Saving…
            </span>
          )}
        </div>

        {mode === 'search' ? (
          <div style={{ position: 'relative' }}>
            <input value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSug(true) }}
              onFocus={() => setShowSug(true)}
              placeholder="Search food presets…"
              style={S.input} />
            {showSug && filtered.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                background: '#0c0c14', border: '1px solid #1c1c2c',
                borderRadius: 8, zIndex: 50, overflow: 'hidden' }}>
                {filtered.map((f) => (
                  <button key={f.name} onMouseDown={() => addFood(f)}
                    style={{ display: 'flex', justifyContent: 'space-between', width: '100%',
                      padding: '8px 12px', background: 'transparent', border: 'none',
                      color: '#ccc', fontSize: 12, cursor: 'pointer',
                      borderBottom: '1px solid #111120', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#111120')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <span>{f.name}</span>
                    <span style={{ color: '#555', fontSize: 11 }}>{f.cal} kcal · {f.p}g P</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <input value={custom.name}
              onChange={(e) => setCustom((p) => ({ ...p, name: e.target.value }))}
              placeholder="Food name" style={S.input} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[['cal', 'Kcal'], ['p', 'Protein'], ['c', 'Carbs'], ['f', 'Fats']].map(([k, ph]) => (
                <input key={k} value={custom[k]} type="number"
                  onChange={(e) => setCustom((p) => ({ ...p, [k]: e.target.value }))}
                  placeholder={ph} style={{ ...S.inputSm, padding: '8px 4px' }} />
              ))}
            </div>
            <button onClick={addCustomFood}
              style={{ ...S.redBtn, justifyContent: 'center', width: '100%' }}>
              <PlusIco /> Add Food
            </button>
          </div>
        )}
      </div>

      {/* Food Log */}
      <div>
        <div style={{ fontSize: 9, color: '#3a3a4a', textTransform: 'uppercase',
          letterSpacing: '0.14em', marginBottom: 8 }}>
          Today's Log — {log.length} items
        </div>
        {log.length === 0 && (
          <div style={{ textAlign: 'center', padding: '28px 0', color: '#1c1c2c', fontSize: 13 }}>
            Nothing logged yet
          </div>
        )}
        {log.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '9px 12px', background: '#0a0a10',
            border: '1px solid #141420', borderRadius: 8, marginBottom: 5 }}>
            <div>
              <div style={{ fontSize: 13, color: '#ccc', fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: 10, color: '#444', marginTop: 1 }}>
                {Math.round(item.p)}g P · {Math.round(item.c)}g C · {Math.round(item.f)}g F
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", color: '#e63946',
                fontSize: 12, fontWeight: 700 }}>{Math.round(item.cal)}</span>
              <button onClick={() => removeFood(item.id)} style={S.iconBtn}><TrashIco /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}