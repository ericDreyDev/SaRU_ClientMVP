import { useState } from 'react'
import type { FormEvent } from 'react'
import type { AuthUser } from '../auth/api/authApi'
import { ApiError } from '../auth/api/authApi'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import {
  dateKey,
  formatCurrency,
  fromDateKey,
  mealAvailability,
  mealLabel,
  mealPriceFor,
  reservationRules,
} from './model'
import type { MealType, Reservation, ReservationDraft } from './model'

export function EditReservationFlow({ reservation, user, onClose, onSave }: {
  reservation: Reservation
  user: AuthUser
  onClose: () => void
  onSave: (draft: ReservationDraft) => Promise<void>
}) {
  const [date, setDate] = useState(reservation.date)
  const [meal, setMeal] = useState<MealType>(reservation.meal)
  const [juice, setJuice] = useState(reservation.juice)
  const [marmita, setMarmita] = useState(reservation.marmita)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const availability = mealAvailability(fromDateKey(date), meal)
  const price = mealPriceFor(user)
    + (juice ? reservationRules.juicePrice : 0)
    + (marmita ? reservationRules.marmitaPrice : 0)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!availability.available) {
      setError(availability.reason)
      return
    }

    setSubmitting(true)
    try {
      await onSave({ date, meal, juice, marmita })
      onClose()
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Não foi possível atualizar a reserva.')
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose() }}>
    <section className="reservation-modal edit-reservation-modal" role="dialog" aria-modal="true" aria-labelledby="edit-reservation-title">
      <header className="modal-header"><div><p>Editar reserva</p><h2 id="edit-reservation-title">Atualize sua refeição</h2><span>As regras de prazo também são verificadas ao salvar.</span></div><button className="icon-button" type="button" disabled={submitting} onClick={onClose} aria-label="Fechar"><Icon name="close" /></button></header>
      <form className="edit-reservation-form" onSubmit={submit}>
        <label>Data<input type="date" min={dateKey(new Date())} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        <fieldset><legend>Refeição</legend><div className="meal-options"><button className={meal === 'lunch' ? 'selected' : ''} type="button" onClick={() => setMeal('lunch')}><span>{mealLabel('lunch')}</span><small>11h15 às 13h30</small></button><button className={meal === 'dinner' ? 'selected' : ''} type="button" onClick={() => setMeal('dinner')}><span>{mealLabel('dinner')}</span><small>17h30 às 20h</small></button></div></fieldset>
        <fieldset><legend>Adicionais</legend><div className="extra-options"><label><input type="checkbox" checked={juice} onChange={(event) => setJuice(event.target.checked)} /><span>Suco <small>+ {formatCurrency(reservationRules.juicePrice)}</small></span></label><label><input type="checkbox" checked={marmita} onChange={(event) => setMarmita(event.target.checked)} /><span>Marmita <small>+ {formatCurrency(reservationRules.marmitaPrice)}</small></span></label></div></fieldset>
        {!availability.available && <p className="availability-warning">{availability.reason}</p>}
        <FormError message={error} />
        <div className="edit-reservation-total"><span>Novo valor</span><strong>{formatCurrency(price)}</strong></div>
        <footer className="modal-footer modal-footer--review"><button className="secondary-button" type="button" disabled={submitting} onClick={onClose}>Voltar</button><button className="gradient-button gradient-button--green" type="submit" disabled={submitting || !availability.available}>{submitting ? 'Salvando…' : 'Salvar alterações'}</button></footer>
      </form>
    </section>
  </div>
}
