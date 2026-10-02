import { useEffect, useMemo, useState } from 'react'
import type { Page } from './types'
import {
  ApiError,
  forgotPassword,
  login,
  logout,
  refreshSession,
  registerUser,
  resetPassword,
} from '../features/auth/api/authApi'
import type { AuthSession, RegisterUserInput } from '../features/auth/api/authApi'
import {
  ForgotPasswordPage,
  LoginPage,
  RecoverySentPage,
  ResetPasswordPage,
  SessionLoading,
  SignupPage,
} from '../features/auth/AuthPages'
import { DashboardPage } from '../features/home/DashboardPage'
import { ReservationsPage } from '../features/reservations/ReservationsPage'
import { createInitialReservations } from '../features/reservations/model'
import type { Reservation } from '../features/reservations/model'
import { SettingsPage } from '../features/settings/SettingsPage'

function App() {
  const resetParameters = useMemo(() => new URLSearchParams(window.location.search), [])
  const isResetLink = window.location.pathname.replace(/\/$/, '') === '/reset-password'
  const [page, setPage] = useState<Page>(isResetLink ? 'reset-password' : 'login')
  const [session, setSession] = useState<AuthSession | null>(null)
  const [authReady, setAuthReady] = useState(isResetLink)
  const [dark, setDark] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>(createInitialReservations)
  const [toast, setToast] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const resetEmail = resetParameters.get('email') ?? ''
  const resetToken = resetParameters.get('token') ?? ''

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 4200); return () => window.clearTimeout(timer) }, [toast])

  useEffect(() => {
    if (isResetLink) return
    let active = true
    refreshSession()
      .then((restoredSession) => {
        if (!active) return
        setSession(restoredSession)
        setPage('home')
      })
      .catch((requestError) => {
        if (active && requestError instanceof ApiError && requestError.status === 0) setToast(requestError.message)
      })
      .finally(() => { if (active) setAuthReady(true) })
    return () => { active = false }
  }, [isResetLink])

  useEffect(() => {
    if (!session) return
    const refreshAt = Math.max(new Date(session.expiresAt).getTime() - Date.now() - 60_000, 1_000)
    const timer = window.setTimeout(() => {
      refreshSession().then(setSession).catch(() => {
        setSession(null)
        setPage('login')
        setToast('Sua sessão expirou. Entre novamente.')
      })
    }, refreshAt)
    return () => window.clearTimeout(timer)
  }, [session])

  const toggleTheme = () => setDark((current) => !current)
  const goToLogin = () => { window.history.replaceState({}, '', '/'); setPage('login') }

  const createReservations = (newReservations: Reservation[]) => {
    setReservations((current) => [...newReservations, ...current])
    setToast(`${newReservations.length} ${newReservations.length === 1 ? 'reserva confirmada' : 'reservas confirmadas'} com sucesso.`)
  }

  const cancelReservation = (id: string) => {
    setReservations((current) => current.map((reservation) => reservation.id === id ? { ...reservation, status: 'Cancelada' } : reservation))
    setToast('Reserva cancelada.')
  }

  const authenticate = async (email: string, password: string) => {
    const authenticatedSession = await login(email, password)
    setSession(authenticatedSession)
    setPage('home')
  }

  const completeSignup = async (input: RegisterUserInput) => {
    await registerUser(input)
    goToLogin()
    setToast('Cadastro concluído. Agora você já pode entrar.')
  }

  const submitRecovery = async (email: string) => {
    await forgotPassword(email)
    setRecoveryEmail(email)
    setPage('recovery-sent')
  }

  const completeReset = async (password: string) => {
    await resetPassword(resetEmail, resetToken, password)
    setSession(null)
    goToLogin()
    setToast('Senha redefinida com sucesso. Entre com a nova senha.')
  }

  const endSession = async () => {
    try {
      await logout()
    } finally {
      setSession(null)
      goToLogin()
      setToast('Você saiu da sua conta.')
    }
  }

  if (!authReady) return <SessionLoading dark={dark} onToggle={toggleTheme} />

  const isAppPage = page === 'home' || page === 'reservations' || page === 'settings'
  const visiblePage: Page = isAppPage && !session ? 'login' : page

  return <>
    {visiblePage === 'login' && <LoginPage dark={dark} onToggle={toggleTheme} onLogin={authenticate} onSignup={() => setPage('signup')} onForgotPassword={() => setPage('forgot-password')} />}
    {visiblePage === 'signup' && <SignupPage dark={dark} onToggle={toggleTheme} onBack={goToLogin} onComplete={completeSignup} />}
    {visiblePage === 'forgot-password' && <ForgotPasswordPage dark={dark} onToggle={toggleTheme} onBack={goToLogin} onSubmit={submitRecovery} />}
    {visiblePage === 'recovery-sent' && <RecoverySentPage dark={dark} onToggle={toggleTheme} email={recoveryEmail} onBack={goToLogin} />}
    {visiblePage === 'reset-password' && <ResetPasswordPage dark={dark} onToggle={toggleTheme} email={resetEmail} token={resetToken} onBack={goToLogin} onComplete={completeReset} />}
    {visiblePage === 'home' && session && <DashboardPage dark={dark} onToggle={toggleTheme} onNavigate={setPage} onLogout={endSession} user={session.user} reservations={reservations} onCreateReservations={createReservations} />}
    {visiblePage === 'reservations' && session && <ReservationsPage dark={dark} onToggle={toggleTheme} onNavigate={setPage} onLogout={endSession} user={session.user} reservations={reservations} onCancel={cancelReservation} />}
    {visiblePage === 'settings' && session && <SettingsPage dark={dark} onToggle={toggleTheme} onNavigate={setPage} onLogout={endSession} user={session.user} />}
    {toast && <div className="toast" role="status">{toast}</div>}
  </>
}

export default App
