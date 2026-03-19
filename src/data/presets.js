export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const SPLITS = {
  ppl: {
    name: "PPL",
    label: "Push / Pull / Legs",
    color: "#e63946",
    schedule: {
      Mon: { label: "Push", exercises: ["Bench Press","Overhead Press","Incline Bench","Lateral Raise","Tricep Pushdown","Cable Fly"] },
      Tue: { label: "Pull", exercises: ["Barbell Row","Pull-Up","Face Pull","Bicep Curl","Shrug","Seated Row"] },
      Wed: { label: "Legs", exercises: ["Squat","Romanian Deadlift","Leg Press","Bulgarian Split Squat","Calf Raise","Leg Curl"] },
      Thu: { label: "Push", exercises: ["Bench Press","Overhead Press","Incline Bench","Lateral Raise","Tricep Pushdown","Cable Fly"] },
      Fri: { label: "Pull", exercises: ["Deadlift","Pull-Up","Barbell Row","Face Pull","Bicep Curl","Shrug"] },
      Sat: { label: "Legs", exercises: ["Squat","Hip Thrust","Leg Press","Bulgarian Split Squat","Calf Raise","Leg Extension"] },
      Sun: { label: "Rest", exercises: [] },
    },
  },
  arnold: {
    name: "Arnold",
    label: "Arnold Split",
    color: "#f4a261",
    schedule: {
      Mon: { label: "Chest & Back",     exercises: ["Bench Press","Barbell Row","Incline Bench","Pull-Up","Cable Fly","Seated Row"] },
      Tue: { label: "Shoulders & Arms", exercises: ["Overhead Press","Bicep Curl","Lateral Raise","Tricep Pushdown","Arnold Press","Hammer Curl"] },
      Wed: { label: "Legs",             exercises: ["Squat","Romanian Deadlift","Leg Press","Calf Raise","Leg Curl","Leg Extension"] },
      Thu: { label: "Chest & Back",     exercises: ["Bench Press","Deadlift","Incline Bench","Pull-Up","Cable Fly","Barbell Row"] },
      Fri: { label: "Shoulders & Arms", exercises: ["Overhead Press","Bicep Curl","Lateral Raise","Tricep Pushdown","Face Pull","Hammer Curl"] },
      Sat: { label: "Legs",             exercises: ["Squat","Hip Thrust","Leg Press","Calf Raise","Bulgarian Split Squat","Leg Extension"] },
      Sun: { label: "Rest",             exercises: [] },
    },
  },
  bro: {
    name: "Bro",
    label: "Bro Split (5-day)",
    color: "#2ec4b6",
    schedule: {
      Mon: { label: "Chest",     exercises: ["Bench Press","Incline Bench","Cable Fly","Dip","Decline Bench","Push-Up"] },
      Tue: { label: "Back",      exercises: ["Deadlift","Barbell Row","Pull-Up","Seated Row","Lat Pulldown","Shrug"] },
      Wed: { label: "Shoulders", exercises: ["Overhead Press","Lateral Raise","Face Pull","Arnold Press","Rear Delt Fly","Shrug"] },
      Thu: { label: "Arms",      exercises: ["Bicep Curl","Tricep Pushdown","Hammer Curl","Skull Crusher","Preacher Curl","Dip"] },
      Fri: { label: "Legs",      exercises: ["Squat","Romanian Deadlift","Leg Press","Hip Thrust","Calf Raise","Leg Curl"] },
      Sat: { label: "Rest",      exercises: [] },
      Sun: { label: "Rest",      exercises: [] },
    },
  },
  ul: {
    name: "U/L",
    label: "Upper / Lower",
    color: "#a8dadc",
    schedule: {
      Mon: { label: "Upper", exercises: ["Bench Press","Barbell Row","Overhead Press","Pull-Up","Bicep Curl","Tricep Pushdown"] },
      Tue: { label: "Lower", exercises: ["Squat","Romanian Deadlift","Leg Press","Hip Thrust","Calf Raise","Leg Curl"] },
      Wed: { label: "Rest",  exercises: [] },
      Thu: { label: "Upper", exercises: ["Incline Bench","Seated Row","Lateral Raise","Face Pull","Hammer Curl","Skull Crusher"] },
      Fri: { label: "Lower", exercises: ["Deadlift","Bulgarian Split Squat","Leg Press","Hip Thrust","Calf Raise","Leg Extension"] },
      Sat: { label: "Rest",  exercises: [] },
      Sun: { label: "Rest",  exercises: [] },
    },
  },
  fb: {
    name: "Full Body",
    label: "Full Body 3×/week",
    color: "#b7e4c7",
    schedule: {
      Mon: { label: "Full Body A", exercises: ["Squat","Bench Press","Barbell Row","Overhead Press","Romanian Deadlift","Pull-Up"] },
      Tue: { label: "Rest",        exercises: [] },
      Wed: { label: "Full Body B", exercises: ["Deadlift","Incline Bench","Seated Row","Overhead Press","Leg Press","Bicep Curl"] },
      Thu: { label: "Rest",        exercises: [] },
      Fri: { label: "Full Body A", exercises: ["Squat","Bench Press","Barbell Row","Overhead Press","Romanian Deadlift","Pull-Up"] },
      Sat: { label: "Rest",        exercises: [] },
      Sun: { label: "Rest",        exercises: [] },
    },
  },
};

export const EXERCISE_PRESETS = [
  "Bench Press","Squat","Deadlift","Overhead Press","Barbell Row",
  "Pull-Up","Dip","Incline Bench","Leg Press","Romanian Deadlift",
  "Lateral Raise","Bicep Curl","Tricep Pushdown","Cable Fly","Hip Thrust",
  "Bulgarian Split Squat","Calf Raise","Face Pull","Shrug","Plank",
  "Arnold Press","Hammer Curl","Leg Curl","Leg Extension","Seated Row",
  "Lat Pulldown","Skull Crusher","Preacher Curl","Rear Delt Fly","Decline Bench",
];

export const FOOD_PRESETS = [
  { name: "Chicken Breast (100g)",  cal: 165, p: 31,  c: 0,   f: 3.6 },
  { name: "Brown Rice (100g)",      cal: 216, p: 5,   c: 45,  f: 1.8 },
  { name: "Whole Egg",              cal: 78,  p: 6,   c: 0.6, f: 5   },
  { name: "Greek Yogurt (170g)",    cal: 100, p: 17,  c: 6,   f: 0.7 },
  { name: "Oats (100g)",            cal: 389, p: 17,  c: 66,  f: 7   },
  { name: "Salmon (100g)",          cal: 208, p: 20,  c: 0,   f: 13  },
  { name: "Sweet Potato (100g)",    cal: 86,  p: 1.6, c: 20,  f: 0.1 },
  { name: "Whey Protein (1 scoop)", cal: 120, p: 24,  c: 3,   f: 1.5 },
  { name: "Banana",                 cal: 89,  p: 1.1, c: 23,  f: 0.3 },
  { name: "Almonds (28g)",          cal: 164, p: 6,   c: 6,   f: 14  },
  { name: "Ground Beef 90% (100g)", cal: 176, p: 20,  c: 0,   f: 10  },
  { name: "Tuna (100g)",            cal: 116, p: 26,  c: 0,   f: 1   },
];
