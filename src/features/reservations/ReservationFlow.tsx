import { useMemo, useState } from 'react'
import type { AuthUser } from '../auth/api/authApi'
import { Icon } from '../../shared/ui/Icon'
import {
  currentWeekDays,
  dateKey,
  formatCurrency,
  mealAvailability,
  mealLabel,
  mealPriceFor,
  reservationRules,
} from './model'
import type { DaySelection, MealType, Reservation } from './model'

export function ReservationFlow({ user, onClose, onConfirm }: { user: AuthUser; onClose: () => void; onConfirm: (reservations: Reservation[]) => void }) {
  const days = useMemo(() => currentWeekDays(), [])
  const [step, setStep] = useState<'customize' | 'review'>('customize')
  const [infoOpen, setInfoOpen] = useState(false)
  const [selections, setSelections] = useState<Record<string, DaySelection>>(() => Object.fromEntries(days.map((day) => [dateKey(day), { lunch: false, dinner: false, juice: false, marmita: false }])))
  const mealPrice = mealPriceFor(user)
  const availableDays = days.filter((day) => mealAvailability(day, 'lunch').available || mealAvailability(day, 'dinner').available)
  const entries = days.flatMap((day) => {
    const key = dateKey(day)
    const selection = selections[key]
    return (['lunch', 'dinner'] as MealType[]).filter((meal) => selection[meal]).map((meal) => ({ date: day, key, meal, selection, price: mealPrice + (selection.juice ? reservationRules.juicePrice : 0) + (selection.marmita ? reservationRules.marmitaPrice : 0) }))
  })
  const total = entries.reduce((sum, entry) => sum + entry.price, 0)

  const changeSelection = (key: string, changes: Partial<DaySelection>) => setSelections((current) => ({ ...current, [key]: { ...current[key], ...changes } }))
  const toggleMeal = (key: string, meal: MealType) => changeSelection(key, { [meal]: !selections[key][meal] })
  const applyShortcut = (shortcut: 'lunch' | 'dinner' | 'all' | 'clear') => setSelections((current) => Object.fromEntries(days.map((day) => {
    const key = dateKey(day)
    const lunchAvailable = mealAvailability(day, 'lunch').available
    const dinnerAvailable = mealAvailability(day, 'dinner').available
    if (shortcut === 'clear') return [key, { lunch: false, dinner: false, juice: false, marmita: false }]
    return [key, {
      ...current[key],
      lunch: lunchAvailable && (shortcut === 'lunch' || shortcut === 'all'),
      dinner: dinnerAvailable && (shortcut === 'dinner' || shortcut === 'all'),
    }]
  })))
  const confirm = () => onConfirm(entries.map((entry, index) => ({ id: `local-${Date.now()}-${index}`, date: entry.key, meal: entry.meal, juice: entry.selection.juice, marmita: entry.selection.marmita, status: 'Em aberto', price: entry.price })))

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="reservation-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-modal-title">
    <header className="modal-header"><div><p>{step === 'customize' ? 'Nova reserva' : 'Confirmação'}</p><h2 id="reservation-modal-title">{step === 'customize' ? 'Escolha suas refeições' : 'Revise suas reservas'}</h2></div><div className="modal-header__actions"><button className="icon-button" type="button" onClick={() => setInfoOpen(true)} aria-label="Ver regras e valores" title="Regras e valores"><Icon name="info" /></button><button className="icon-button" type="button" onClick={onClose} aria-label="Fechar"><Icon name="close" /></button></div></header>
    {step === 'customize' ? <>
      {availableDays.length > 0 && <section className="reservation-shortcuts" aria-label="Atalhos de reserva"><span>Atalhos</span><div><button type="button" onClick={() => applyShortcut('lunch')}>Só almoços</button><button type="button" onClick={() => applyShortcut('dinner')}>Só jantares</button><button type="button" onClick={() => applyShortcut('all')}>Semana completa</button>{entries.length > 0 && <button className="clear" type="button" onClick={() => applyShortcut('clear')}>Limpar</button>}</div></section>}
      {availableDays.length > 0 ? <div className="reservation-days">{availableDays.map((day) => {
        const key = dateKey(day)
        const selection = selections[key]
        const lunch = mealAvailability(day, 'lunch')
        const dinner = mealAvailability(day, 'dinner')
        const hasMeal = selection.lunch || selection.dinner
        return <article className={`reservation-day ${hasMeal ? 'selected' : ''}`} key={key}><div className="reservation-day__heading"><span><b>{day.toLocaleDateString('pt-BR', { weekday: 'long' })}</b><small>{day.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</small></span>{hasMeal && <span className="selected-mark"><Icon name="check" /></span>}</div><div className="meal-options">{([{ meal: 'lunch' as MealType, availability: lunch }, { meal: 'dinner' as MealType, availability: dinner }]).map(({ meal, availability }) => <button className={selection[meal] ? 'selected' : ''} type="button" key={meal} disabled={!availability.available} onClick={() => toggleMeal(key, meal)} aria-pressed={selection[meal]}><span>{mealLabel(meal)}</span>{!availability.available && <small>Indisponível</small>}</button>)}</div><div className="extra-options"><label className={!hasMeal ? 'disabled' : ''}><input type="checkbox" checked={selection.juice} disabled={!hasMeal} onChange={(event) => changeSelection(key, { juice: event.target.checked })} /><span>Suco <small>+ {formatCurrency(reservationRules.juicePrice)}</small></span></label><label className={!hasMeal ? 'disabled' : ''}><input type="checkbox" checked={selection.marmita} disabled={!hasMeal} onChange={(event) => changeSelection(key, { marmita: event.target.checked })} /><span>Marmita <small>+ {formatCurrency(reservationRules.marmitaPrice)}</small></span></label></div></article>
      })}</div> : <div className="no-available-days"><span><Icon name="calendar" /></span><p>Não há horários disponíveis nesta semana.</p></div>}
      <footer className="modal-footer"><span><small>{entries.length} {entries.length === 1 ? 'refeição selecionada' : 'refeições selecionadas'}</small><strong>{formatCurrency(total)}</strong></span><button className="secondary-button" type="button" onClick={onClose}>Cancelar</button><button className="gradient-button" type="button" disabled={!entries.length} onClick={() => setStep('review')}>Revisar reservas<Icon name="chevron" /></button></footer>
    </> : <>
      <div className="review-list">{entries.map((entry) => <article key={`${entry.key}-${entry.meal}`}><span className="review-calendar"><Icon name="calendar" /></span><div><b>{entry.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</b><p>{mealLabel(entry.meal)}{entry.selection.juice ? ' · Suco' : ''}{entry.selection.marmita ? ' · Marmita' : ''}</p></div><strong>{formatCurrency(entry.price)}</strong></article>)}</div>
      <div className="review-total"><span>Valor final<small>{entries.length} {entries.length === 1 ? 'reserva' : 'reservas'}</small></span><strong>{formatCurrency(total)}</strong></div>
      <footer className="modal-footer modal-footer--review"><button className="secondary-button" type="button" onClick={() => setStep('customize')}>Voltar e editar</button><button className="gradient-button gradient-button--green" type="button" onClick={confirm}>Confirmar {entries.length === 1 ? 'reserva' : 'reservas'}</button></footer>
    </>}
    {infoOpen && <div className="reservation-info-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setInfoOpen(false) }}><aside className="reservation-info" role="dialog" aria-modal="true" aria-labelledby="reservation-info-title"><header><h2 id="reservation-info-title">Regras e valores</h2><button className="icon-button" type="button" onClick={() => setInfoOpen(false)} aria-label="Fechar informações"><Icon name="close" /></button></header><div className="reservation-info__content"><section><h3>Atendimento</h3><p>Segunda a sexta-feira</p><ul><li>Almoço: 11h15 às 13h30</li><li>Jantar: 17h30 às 20h</li></ul></section><section><h3>Prazo de reserva</h3><ul><li>Almoço: até {reservationRules.lunchCutoffHour}h</li><li>Jantar: até {reservationRules.dinnerCutoffHour}h</li></ul></section><section><h3>Valores</h3><ul><li>Acadêmicos UPF: {formatCurrency(10)}</li><li>Funcionários: {formatCurrency(15)}</li><li>Professores e visitantes: {formatCurrency(20)}</li><li>Suco: + {formatCurrency(reservationRules.juicePrice)}</li><li>Marmita: + {formatCurrency(reservationRules.marmitaPrice)}</li></ul></section><div className="profile-price"><span>Seu valor por refeição</span><strong>{formatCurrency(mealPrice)}</strong></div><p className="document-note">Apresente a carteirinha estudantil ou o crachá de funcionário, quando aplicável.</p></div></aside></div>}
  </section></div>
}
