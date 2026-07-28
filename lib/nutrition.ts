export type Unit = 'grams' | 'cups' | 'tbsp' | 'oz' | 'servings'

export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

export const MEAL_CATEGORIES: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

export const UNITS: { value: Unit; label: string }[] = [
  { value: 'grams', label: 'g' },
  { value: 'cups', label: 'cups' },
  { value: 'tbsp', label: 'tbsp' },
  { value: 'oz', label: 'oz' },
  { value: 'servings', label: 'servings' },
]

/** Nutrition values are stored per 100 grams. */
export interface Food {
  id: string
  name: string
  servingSizeG: number // grams in 1 serving
  calories: number
  protein: number
  carbs: number
  fats: number
  sugar: number
  fiber: number
  sodium: number // mg
  potassium: number // mg
  custom?: boolean
}

export interface LogEntry {
  id: string
  foodId: string
  foodName: string
  meal: MealCategory
  quantity: number
  unit: Unit
  grams: number
  calories: number
  protein: number
  carbs: number
  fats: number
  sugar: number
  fiber: number
  sodium: number
  potassium: number
  loggedAt: number
}

export interface Goals {
  calories: number
  protein: number
  carbs: number
  fats: number
  sugar: number
  fiber: number
  sodium: number
  potassium: number
  waterMl: number
}

export const DEFAULT_GOALS: Goals = {
  calories: 2200,
  protein: 140,
  carbs: 250,
  fats: 70,
  sugar: 50,
  fiber: 30,
  sodium: 2300,
  potassium: 3500,
  waterMl: 2500,
}

/** A user-customisable quick-add water button. */
export interface QuickAdd {
  id: 'glass' | 'bottle' | 'shaker'
  label: string
  ml: number
}

export const DEFAULT_QUICK_ADDS: QuickAdd[] = [
  { id: 'glass', label: 'Glass', ml: 250 },
  { id: 'bottle', label: 'Bottle', ml: 500 },
  { id: 'shaker', label: 'Shaker', ml: 750 },
]

export interface Totals {
  calories: number
  protein: number
  carbs: number
  fats: number
  sugar: number
  fiber: number
  sodium: number
  potassium: number
}

export const EMPTY_TOTALS: Totals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  sugar: 0,
  fiber: 0,
  sodium: 0,
  potassium: 0,
}

/** One day of logging, stored under a YYYY-MM-DD key. */
export interface DayLog {
  entries: LogEntry[]
  waterMl: number
}

export type DayStore = Record<string, DayLog>

export const EMPTY_DAY: DayLog = { entries: [], waterMl: 0 }

export function sumEntries(entries: LogEntry[]): Totals {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fats: acc.fats + e.fats,
      sugar: acc.sugar + e.sugar,
      fiber: acc.fiber + e.fiber,
      sodium: acc.sodium + e.sodium,
      potassium: acc.potassium + e.potassium,
    }),
    { ...EMPTY_TOTALS },
  )
}

/* ---------- date helpers (local-time safe) ---------- */

export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function shiftKey(key: string, days: number): string {
  const d = keyToDate(key)
  d.setDate(d.getDate() + days)
  return dateKey(d)
}

export function formatDayLabel(key: string, todayK: string): string {
  if (key === todayK) return 'Today'
  if (key === shiftKey(todayK, -1)) return 'Yesterday'
  if (key === shiftKey(todayK, 1)) return 'Tomorrow'
  return keyToDate(key).toLocaleDateString('en-US', { weekday: 'long' })
}

export function formatDayDate(key: string): string {
  return keyToDate(key).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

/** Consecutive days (ending today or yesterday) with at least one logged food or water. */
export function computeStreak(store: DayStore, todayK: string): number {
  const logged = (k: string) => {
    const day = store[k]
    if (!day) return false
    return day.entries.length > 0 || day.waterMl > 0
  }
  let cursor = logged(todayK) ? todayK : shiftKey(todayK, -1)
  if (!logged(cursor)) return 0
  let streak = 0
  while (logged(cursor)) {
    streak += 1
    cursor = shiftKey(cursor, -1)
  }
  return streak
}

/** Percentage split of calories coming from each macro. */
export function macroRatio(totals: Totals) {
  const p = totals.protein * 4
  const c = totals.carbs * 4
  const f = totals.fats * 9
  const sum = p + c + f
  if (sum <= 0) return { protein: 0, carbs: 0, fats: 0, hasData: false }
  return {
    protein: Math.round((p / sum) * 100),
    carbs: Math.round((c / sum) * 100),
    fats: Math.round((f / sum) * 100),
    hasData: true,
  }
}

/** Grams represented by 1 of each unit (cups/tbsp use water-like density approximations). */
const UNIT_TO_GRAMS: Record<Exclude<Unit, 'servings'>, number> = {
  grams: 1,
  cups: 240,
  tbsp: 15,
  oz: 28.35,
}

export function toGrams(quantity: number, unit: Unit, food: Food): number {
  if (unit === 'servings') return quantity * food.servingSizeG
  return quantity * UNIT_TO_GRAMS[unit]
}

export function scaleFood(food: Food, grams: number) {
  const f = grams / 100
  const round = (n: number) => Math.round(n * 10) / 10
  return {
    calories: Math.round(food.calories * f),
    protein: round(food.protein * f),
    carbs: round(food.carbs * f),
    fats: round(food.fats * f),
    sugar: round(food.sugar * f),
    fiber: round(food.fiber * f),
    sodium: Math.round(food.sodium * f),
    potassium: Math.round(food.potassium * f),
  }
}

/* Starter food database — values per 100g */
export const FOOD_DATABASE: Food[] = [
  { id: 'chicken-breast', name: 'Chicken Breast (grilled)', servingSizeG: 120, calories: 165, protein: 31, carbs: 0, fats: 3.6, sugar: 0, fiber: 0, sodium: 74, potassium: 256 },
  { id: 'greek-yogurt', name: 'Greek Yogurt (plain)', servingSizeG: 170, calories: 59, protein: 10, carbs: 3.6, fats: 0.4, sugar: 3.2, fiber: 0, sodium: 36, potassium: 141 },
  { id: 'oatmeal', name: 'Oatmeal (cooked)', servingSizeG: 234, calories: 71, protein: 2.5, carbs: 12, fats: 1.5, sugar: 0.3, fiber: 1.7, sodium: 4, potassium: 70 },
  { id: 'banana', name: 'Banana', servingSizeG: 118, calories: 89, protein: 1.1, carbs: 23, fats: 0.3, sugar: 12, fiber: 2.6, sodium: 1, potassium: 358 },
  { id: 'brown-rice', name: 'Brown Rice (cooked)', servingSizeG: 195, calories: 112, protein: 2.6, carbs: 24, fats: 0.9, sugar: 0.4, fiber: 1.8, sodium: 5, potassium: 43 },
  { id: 'salmon', name: 'Salmon (baked)', servingSizeG: 150, calories: 208, protein: 20, carbs: 0, fats: 13, sugar: 0, fiber: 0, sodium: 59, potassium: 363 },
  { id: 'avocado', name: 'Avocado', servingSizeG: 100, calories: 160, protein: 2, carbs: 8.5, fats: 15, sugar: 0.7, fiber: 6.7, sodium: 7, potassium: 485 },
  { id: 'eggs', name: 'Eggs (whole, cooked)', servingSizeG: 50, calories: 155, protein: 13, carbs: 1.1, fats: 11, sugar: 1.1, fiber: 0, sodium: 124, potassium: 126 },
  { id: 'broccoli', name: 'Broccoli (steamed)', servingSizeG: 91, calories: 35, protein: 2.4, carbs: 7.2, fats: 0.4, sugar: 1.4, fiber: 3.3, sodium: 41, potassium: 293 },
  { id: 'almonds', name: 'Almonds', servingSizeG: 28, calories: 579, protein: 21, carbs: 22, fats: 50, sugar: 4.4, fiber: 12.5, sodium: 1, potassium: 733 },
  { id: 'sweet-potato', name: 'Sweet Potato (baked)', servingSizeG: 114, calories: 90, protein: 2, carbs: 21, fats: 0.2, sugar: 6.5, fiber: 3.3, sodium: 36, potassium: 475 },
  { id: 'cottage-cheese', name: 'Cottage Cheese', servingSizeG: 113, calories: 98, protein: 11, carbs: 3.4, fats: 4.3, sugar: 2.7, fiber: 0, sodium: 364, potassium: 104 },
  { id: 'apple', name: 'Apple', servingSizeG: 182, calories: 52, protein: 0.3, carbs: 14, fats: 0.2, sugar: 10, fiber: 2.4, sodium: 1, potassium: 107 },
  { id: 'peanut-butter', name: 'Peanut Butter', servingSizeG: 32, calories: 588, protein: 25, carbs: 20, fats: 50, sugar: 9, fiber: 6, sodium: 476, potassium: 649 },
  { id: 'quinoa', name: 'Quinoa (cooked)', servingSizeG: 185, calories: 120, protein: 4.4, carbs: 21, fats: 1.9, sugar: 0.9, fiber: 2.8, sodium: 7, potassium: 172 },
  { id: 'protein-shake', name: 'Whey Protein Shake', servingSizeG: 35, calories: 380, protein: 76, carbs: 8, fats: 4, sugar: 3, fiber: 1, sodium: 300, potassium: 500 },
]

export function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
