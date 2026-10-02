import type { AuthUser } from '../auth/api/authApi'

export type MealType = 'lunch' | 'dinner'
export type ReservationStatus = 'Em aberto' | 'Consumida' | 'Falta' | 'Cancelada'

export type Reservation = {
  id: string
  date: string
  meal: MealType
  juice: boolean
  marmita: boolean
  status: ReservationStatus
  price: number
}

export type DaySelection = {
  lunch: boolean
  dinner: boolean
  juice: boolean
  marmita: boolean
}

export const reservationRules = {
  lunchCutoffHour: 10,
  dinnerCutoffHour: 16,
  mealPrices: {
    Student: 10,
    Employee: 15,
    Professor: 20,
    Visitor: 20,
    Administrator: 20,
  } as Record<string, number>,
  juicePrice: 3,
  marmitaPrice: 2.5,
} as const

export function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(date: Date, amount: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function startOfCurrentWeek(now = new Date()) {
  const result = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = result.getDay()
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1))
  return result
}

export function currentWeekDays(now = new Date()) {
  const monday = startOfCurrentWeek(now)
  return Array.from({ length: 5 }, (_, index) => addDays(monday, index))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function createInitialReservations(): Reservation[] {
  const monday = startOfCurrentWeek()
  const previousMonday = addDays(monday, -7)
  return [
    { id: 'sample-1', date: dateKey(addDays(previousMonday, 0)), meal: 'dinner', juice: true, marmita: false, status: 'Consumida', price: 13 },
    { id: 'sample-2', date: dateKey(addDays(previousMonday, 1)), meal: 'dinner', juice: false, marmita: false, status: 'Cancelada', price: 10 },
    { id: 'sample-3', date: dateKey(addDays(previousMonday, 4)), meal: 'lunch', juice: false, marmita: true, status: 'Falta', price: 10 },
    { id: 'sample-4', date: dateKey(addDays(monday, 4)), meal: 'lunch', juice: true, marmita: false, status: 'Em aberto', price: 13 },
  ]
}

export function mealLabel(meal: MealType) { return meal === 'lunch' ? 'Almoço' : 'Jantar' }

export function mealAvailability(date: Date, meal: MealType, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (target < today) return { available: false, reason: 'Dia encerrado' }
  if (target > today) return { available: true, reason: 'Disponível' }
  const cutoff = meal === 'lunch' ? reservationRules.lunchCutoffHour : reservationRules.dinnerCutoffHour
  const available = now.getHours() < cutoff
  return { available, reason: available ? `Até ${cutoff}h` : `Prazo de ${cutoff}h encerrado` }
}

export function mealPriceFor(user: AuthUser) {
  return reservationRules.mealPrices[user.roles[0] ?? 'Visitor'] ?? 20
}
