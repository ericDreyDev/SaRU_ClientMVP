import { useState } from 'react'
import type { FormEvent } from 'react'
import arrowLeftIcon from '../../assets/arrow-left.svg'
import teacherIcon from '../../assets/teacher.svg'
import userIcon from '../../assets/user.svg'
import { Footer, Hero, PublicHeader } from '../../shared/layout/PublicChrome'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { ApiError } from './api/authApi'
import type { RegisterUserInput } from './api/authApi'

const studentSubprofiles = [
  ['graduation', 'Aluno de graduação'],
  ['postgraduate', 'Aluno de pós-graduação'],
  ['creati', 'Aluno CREATI'],
  ['integrated', 'Aluno integrado'],
] as const

const visitorSubprofiles = [
  ['external-community', 'Comunidade externa'],
  ['public-school', 'Estudante da rede municipal / estadual'],
] as const

const subprofileValues: Record<string, number> = {
  graduation: 0,
  postgraduate: 1,
  creati: 2,
  integrated: 3,
  'external-community': 4,
  'public-school': 5,
}

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Ocorreu um erro inesperado. Tente novamente.'
}

type Profile = 'upf' | 'visitor'
type UpfProfile = 'student' | 'professor' | 'employee'

export function SignupPage({ dark, onToggle, onBack, onComplete }: { dark: boolean; onToggle: () => void; onBack: () => void; onComplete: (input: RegisterUserInput) => Promise<void> }) {
  const [audience, setAudience] = useState<Profile>('upf')
  const [upfProfile, setUpfProfile] = useState<UpfProfile>('student')
  const [subprofile, setSubprofile] = useState('graduation')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const showStudentId = audience === 'upf' && upfProfile === 'student'
  const showBadge = audience === 'upf' && upfProfile !== 'student'
  const showSubprofile = audience === 'visitor' || showStudentId

  const changeAudience = (nextAudience: Profile) => {
    setAudience(nextAudience)
    setSubprofile(nextAudience === 'upf' ? 'graduation' : 'external-community')
  }

  const changeUpfProfile = (nextProfile: UpfProfile) => {
    setUpfProfile(nextProfile)
    setSubprofile(nextProfile === 'student' ? 'graduation' : '')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    const value = (name: string) => String(form.get(name) ?? '').trim()
    const role = audience === 'visitor'
      ? 'Visitor'
      : ({ student: 'Student', professor: 'Professor', employee: 'Employee' } as const)[upfProfile]

    try {
      await onComplete({
        firstName: value('firstName'),
        lastName: value('lastName'),
        cpf: value('cpf'),
        email: value('email'),
        password: value('password'),
        phoneNumber: value('phone') || null,
        registration: showStudentId ? value('registration') : null,
        badgeNumber: showBadge ? value('badge') : null,
        role,
        subProfile: showSubprofile ? subprofileValues[subprofile] : null,
      })
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="public-page signup-page">
    <PublicHeader dark={dark} onToggle={onToggle} onLogoClick={onBack} />
    <section className="signup-shell">
      <div className="signup-heading"><button className="back-button" type="button" onClick={onBack} aria-label="Voltar"><img src={arrowLeftIcon} alt="" /></button><div><p>Cadastro</p><h1>Crie sua conta</h1><span>Preencha seus dados para acessar o agendamento do RU.</span></div></div>
      <form className="signup-form" onSubmit={submit}>
        <fieldset className="audience-picker"><legend>Como você faz parte do RU?</legend><div><button className={audience === 'upf' ? 'selected' : ''} type="button" onClick={() => changeAudience('upf')}><span className="icon-box icon-box--green"><img src={teacherIcon} alt="" /></span><span><b>Comunidade UPF</b><small>Aluno, professor ou funcionário</small></span></button><button className={audience === 'visitor' ? 'selected' : ''} type="button" onClick={() => changeAudience('visitor')}><span className="icon-box icon-box--orange"><img src={userIcon} alt="" /></span><span><b>Visitante</b><small>Comunidade externa à universidade</small></span></button></div></fieldset>
        <div className="form-grid">
          {audience === 'upf' ? <label>Perfil UPF<select value={upfProfile} onChange={(event) => changeUpfProfile(event.target.value as UpfProfile)}><option value="student">Estudante</option><option value="professor">Professor</option><option value="employee">Funcionário</option></select></label> : <label>Perfil<select value="visitor" disabled><option value="visitor">Visitante</option></select></label>}
          {showSubprofile && <label>Subperfil<select value={subprofile} onChange={(event) => setSubprofile(event.target.value)}>{(audience === 'upf' ? studentSubprofiles : visitorSubprofiles).map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}</select></label>}
          <label>Nome<input name="firstName" type="text" autoComplete="given-name" placeholder="Seu nome" required /></label>
          <label>Sobrenome<input name="lastName" type="text" autoComplete="family-name" placeholder="Seu sobrenome" required /></label>
          <label>CPF<input name="cpf" type="text" inputMode="numeric" maxLength={14} placeholder="000.000.000-00" required /></label>
          <label>{audience === 'upf' ? 'E-mail UPF' : 'E-mail'}<input name="email" type="email" autoComplete="email" placeholder={audience === 'upf' ? 'seu.email@upf.br' : 'seu@email.com'} required /></label>
          <label>Senha<input name="password" type="password" autoComplete="new-password" minLength={8} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}" title="Use pelo menos 8 caracteres, com maiúscula, minúscula, número e caractere especial." placeholder="Mínimo de 8 caracteres" required /></label>
          <label>Telefone <small>(opcional)</small><input name="phone" type="tel" autoComplete="tel" placeholder="(54) 99999-9999" /></label>
          {showStudentId && <label>Matrícula<input name="registration" type="text" inputMode="numeric" placeholder="Número da matrícula" required /></label>}
          {showBadge && <label>Crachá<input name="badge" type="text" placeholder="Número do crachá" required /></label>}
        </div>
        <FormError message={error} />
        <p className="form-disclaimer">Ao criar sua conta, você confirma que os dados informados são verdadeiros.</p>
        <button className="primary-button signup-submit" type="submit" disabled={submitting}>{submitting ? 'Criando conta…' : 'Criar conta'}</button>
      </form>
    </section>
    <Footer />
  </main>
}

export function LoginPage({ dark, onToggle, onLogin, onSignup, onForgotPassword }: { dark: boolean; onToggle: () => void; onLogin: (email: string, password: string) => Promise<void>; onSignup: () => void; onForgotPassword: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await onLogin(email, password)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="public-page login-page">
    <PublicHeader dark={dark} onToggle={onToggle} onLogoClick={() => undefined} />
    <Hero />
    <form className="login-card auth-card" onSubmit={submit}>
      <div className="auth-heading"><p>Acesse sua conta</p><h2>Entrar no RU</h2></div>
      <label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" autoComplete="email" required /></label>
      <label>Senha<span className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite sua senha" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}><Icon name={showPassword ? 'eyeOff' : 'eye'} /></button></span></label>
      <button className="forgot-link" type="button" onClick={onForgotPassword}>Esqueci minha senha</button>
      <FormError message={error} />
      <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Entrando…' : 'Entrar'}</button>
      <div className="auth-divider"><span>ou</span></div>
      <button className="secondary-button" type="button" onClick={onSignup}>Criar uma conta</button>
    </form>
    <Footer />
  </main>
}

export function ForgotPasswordPage({ dark, onToggle, onBack, onSubmit }: { dark: boolean; onToggle: () => void; onBack: () => void; onSubmit: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(email)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="public-page auth-page"><PublicHeader dark={dark} onToggle={onToggle} onLogoClick={onBack} /><section className="standalone-auth"><div className="signup-heading"><button className="back-button" type="button" onClick={onBack} aria-label="Voltar"><img src={arrowLeftIcon} alt="" /></button><div><p>Recuperação de acesso</p><h1>Esqueceu sua senha?</h1><span>Informe seu e-mail e enviaremos as instruções para criar uma nova senha.</span></div></div><form className="login-card auth-card" onSubmit={submit}><label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" autoComplete="email" required /></label><FormError message={error} /><button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Enviando…' : 'Enviar link de recuperação'}</button><button className="text-button" type="button" onClick={onBack}>Voltar para o login</button></form></section><Footer /></main>
}

export function RecoverySentPage({ dark, onToggle, email, onBack }: { dark: boolean; onToggle: () => void; email: string; onBack: () => void }) {
  return <main className="public-page auth-page"><PublicHeader dark={dark} onToggle={onToggle} onLogoClick={onBack} /><section className="standalone-auth"><div className="feedback-card" role="status"><span className="feedback-mark" aria-hidden="true">✓</span><p>Confira sua caixa de entrada</p><h1>Link enviado</h1><span>As instruções de recuperação foram enviadas para <strong>{email}</strong>, caso o endereço esteja cadastrado.</span><small>Verifique também as pastas de spam e lixo eletrônico.</small><button className="primary-button" type="button" onClick={onBack}>Voltar para o login</button></div></section><Footer /></main>
}

export function ResetPasswordPage({ dark, onToggle, email, token, onBack, onComplete }: { dark: boolean; onToggle: () => void; email: string; token: string; onBack: () => void; onComplete: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const requirements = [
    { label: 'No mínimo 8 caracteres', valid: password.length >= 8 },
    { label: 'Uma letra maiúscula', valid: /[A-Z]/.test(password) },
    { label: 'Uma letra minúscula', valid: /[a-z]/.test(password) },
    { label: 'Um número', valid: /\d/.test(password) },
    { label: 'Um caractere especial', valid: /[^A-Za-z0-9]/.test(password) },
  ]
  const passwordIsValid = requirements.every((item) => item.valid)
  const passwordsMatch = confirmation.length > 0 && password === confirmation
  const linkIsValid = Boolean(email && token)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!passwordIsValid || !passwordsMatch || !linkIsValid) return
    setSubmitting(true)
    setError('')
    try {
      await onComplete(password)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="public-page auth-page"><PublicHeader dark={dark} onToggle={onToggle} onLogoClick={onBack} /><section className="standalone-auth"><div className="signup-heading signup-heading--center"><div><p>Nova senha</p><h1>Redefina sua senha</h1><span>Escolha uma senha forte para proteger sua conta.</span></div></div><form className="login-card auth-card reset-card" onSubmit={submit}>{!linkIsValid && <FormError message="O link de recuperação está incompleto ou inválido. Solicite um novo link." />}<label>Nova senha<span className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite a nova senha" autoComplete="new-password" minLength={8} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}><Icon name={showPassword ? 'eyeOff' : 'eye'} /></button></span></label><ul className="password-requirements" aria-label="Requisitos da senha">{requirements.map((item) => <li className={item.valid ? 'valid' : ''} key={item.label}><span aria-hidden="true">{item.valid ? '✓' : '•'}</span>{item.label}</li>)}</ul><label>Confirme a nova senha<input type={showPassword ? 'text' : 'password'} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Digite novamente" autoComplete="new-password" required /></label>{confirmation && !passwordsMatch && <p className="field-error" role="alert">As senhas não coincidem.</p>}<FormError message={error} /><button className="primary-button" type="submit" disabled={!passwordIsValid || !passwordsMatch || !linkIsValid || submitting}>{submitting ? 'Redefinindo…' : 'Redefinir senha'}</button><button className="text-button" type="button" onClick={onBack}>Voltar para o login</button></form></section><Footer /></main>
}

export function SessionLoading({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return <main className="public-page auth-page"><PublicHeader dark={dark} onToggle={onToggle} onLogoClick={() => undefined} /><section className="session-loading" role="status"><span className="loading-spinner" aria-hidden="true" /><p>Verificando sua sessão…</p></section></main>
}
