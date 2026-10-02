import { useState } from 'react'
import type { AppPage } from '../../app/types'
import type { AuthUser } from '../auth/api/authApi'
import { AppLayout } from '../../shared/layout/AppLayout'
import { Icon } from '../../shared/ui/Icon'
import { ReservationCard } from './ReservationCard'
import type { Reservation, ReservationStatus } from './model'

export function ReservationsPage({ dark, onToggle, onNavigate, onLogout, user, reservations, onCancel }: { dark: boolean; onToggle: () => void; onNavigate: (page: AppPage) => void; onLogout: () => void; user: AuthUser; reservations: Reservation[]; onCancel: (id: string) => void }) {
  const [filter, setFilter] = useState<'Todas' | ReservationStatus>('Todas')
  const filters: ('Todas' | ReservationStatus)[] = ['Todas', 'Em aberto', 'Consumida', 'Falta', 'Cancelada']
  const filtered = reservations.filter((reservation) => filter === 'Todas' || reservation.status === filter).sort((a, b) => b.date.localeCompare(a.date))
  return <AppLayout page="reservations" title="Minhas reservas" subtitle="Acompanhe refeições futuras e consulte seu histórico." dark={dark} onToggle={onToggle} onNavigate={onNavigate} onLogout={onLogout} user={user}>
    <section className="history-panel"><div className="history-heading"><div><p>Histórico</p><h2>Suas refeições</h2></div><span>{filtered.length} {filtered.length === 1 ? 'reserva' : 'reservas'}</span></div><div className="filter-chips" aria-label="Filtrar reservas">{filters.map((item) => <button className={filter === item ? 'active' : ''} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>{filtered.length ? <div className="reservation-list">{filtered.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} onCancel={reservation.status === 'Em aberto' ? () => onCancel(reservation.id) : undefined} />)}</div> : <div className="empty-state"><span><Icon name="calendar" /></span><h3>Nenhuma reserva encontrada</h3><p>Não há registros com o status selecionado.</p></div>}</section>
  </AppLayout>
}
