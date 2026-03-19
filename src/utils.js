export function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export function getTodayDay() {
  const d = new Date().getDay();
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d === 0 ? 6 : d - 1];
}

export function makeExercise(name) {
  return { id: Date.now() + Math.random(), name, sets: [{ reps: "", weight: "" }] };
}
