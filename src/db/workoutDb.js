import { supabase } from '../supabaseClient'

// ── Workout Plan (the weekly split layout) ────────────────────────────────────

export async function loadWorkoutPlan(userId) {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows, that's fine
  return data || null
}

export async function saveWorkoutPlan(userId, splitKey, planData) {
  const { data: existing } = await supabase
    .from('workout_plans')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Update existing plan
    const { error } = await supabase
      .from('workout_plans')
      .update({ split_key: splitKey, plan_data: planData, updated_at: new Date() })
      .eq('user_id', userId)
    if (error) throw error
  } else {
    // Insert new plan
    const { error } = await supabase
      .from('workout_plans')
      .insert({ user_id: userId, split_key: splitKey, plan_data: planData })
    if (error) throw error
  }
}

// ── Workout Sessions (a logged day) ──────────────────────────────────────────

export async function loadSessionForDate(userId, date) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      session_exercises (
        *,
        sets ( * )
      )
    `)
    .eq('user_id', userId)
    .eq('date', date)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function loadAllSessions(userId) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      session_exercises (
        *,
        sets ( * )
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function saveWorkoutSession(userId, date, dayLabel, splitColor, exercises) {
  // 1. Delete any existing session for this date (clean overwrite)
  const { data: existing } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('date', date)
    .single()

  if (existing) {
    await supabase.from('workout_sessions').delete().eq('id', existing.id)
  }

  // 2. Insert the session
  const { data: session, error: sessionErr } = await supabase
    .from('workout_sessions')
    .insert({ user_id: userId, date, day_label: dayLabel, split_color: splitColor })
    .select()
    .single()

  if (sessionErr) throw sessionErr

  // 3. Insert exercises + sets
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i]

    const { data: dbEx, error: exErr } = await supabase
      .from('session_exercises')
      .insert({ session_id: session.id, name: ex.name, order_index: i })
      .select()
      .single()

    if (exErr) throw exErr

    const setsToInsert = (ex.sets || []).map((s, si) => ({
      exercise_id: dbEx.id,
      set_number:  si + 1,
      reps:        parseInt(s.reps)    || null,
      weight:      parseFloat(s.weight) || null,
    }))

    if (setsToInsert.length > 0) {
      const { error: setsErr } = await supabase.from('sets').insert(setsToInsert)
      if (setsErr) throw setsErr
    }
  }

  return session
}

// ── Convert DB session → local exercise format ────────────────────────────────
export function sessionToExercises(session) {
  if (!session?.session_exercises) return []

  return [...session.session_exercises]
    .sort((a, b) => a.order_index - b.order_index)
    .map((ex) => ({
      id:   ex.id,
      name: ex.name,
      sets: [...(ex.sets || [])]
        .sort((a, b) => a.set_number - b.set_number)
        .map((s) => ({
          reps:   s.reps?.toString()   || '',
          weight: s.weight?.toString() || '',
        })),
    }))
}
