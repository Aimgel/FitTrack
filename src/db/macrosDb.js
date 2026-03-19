import { supabase } from '../supabaseClient'

// ── Load food log for a specific date ─────────────────────────────────────────
export async function loadFoodLog(userId, date) {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// ── Add a single food item ────────────────────────────────────────────────────
export async function addFoodItem(userId, date, item) {
  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      user_id:  userId,
      date,
      name:     item.name,
      calories: item.cal,
      protein:  item.p,
      carbs:    item.c,
      fats:     item.f,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Delete a food item by its row id ─────────────────────────────────────────
export async function deleteFoodItem(id) {
  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── Load food history across all dates (for future history view) ──────────────
export async function loadFoodHistory(userId, limit = 30) {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// ── Convert DB food row → local item format ───────────────────────────────────
export function dbRowToFoodItem(row) {
  return {
    id:  row.id,
    name: row.name,
    cal:  row.calories,
    p:    row.protein,
    c:    row.carbs,
    f:    row.fats,
  }
}
