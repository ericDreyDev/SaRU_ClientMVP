import type { AppPage } from '../../app/types'
import type { AuthUser } from '../auth/api/authApi'
import { AppLayout } from '../../shared/layout/AppLayout'
import { Icon } from '../../shared/ui/Icon'
import { initials, roleLabel } from '../../shared/user/userPresentation'

export function SettingsPage({ dark, onToggle, onNavigate, onLogout, user }: { dark: boolean; onToggle: () => void; onNavigate: (page: AppPage) => void; onLogout: () => void; user: AuthUser }) {
  return <AppLayout page="settings" title="Configurações" subtitle="Consulte seus dados e ajuste a aparência da plataforma." dark={dark} onToggle={onToggle} onNavigate={onNavigate} onLogout={onLogout} user={user}>
    <section className="settings-grid"><article className="settings-card profile-settings"><div className="settings-card__heading"><span className="settings-avatar">{initials(user.fullName)}</span><div><p>Perfil</p><h2>{user.fullName}</h2><span>{roleLabel(user)}</span></div></div><div className="profile-details"><label>Nome completo<input type="text" value={user.fullName} readOnly /></label><label>E-mail<input type="email" value={user.email ?? 'Não informado'} readOnly /></label><label>Tipo de perfil<input type="text" value={roleLabel(user)} readOnly /></label></div><p className="settings-note">A edição dos dados cadastrais será habilitada quando o endpoint de atualização de perfil estiver disponível.</p></article><article className="settings-card preferences-card"><div><p>Preferências</p><h2>Aparência</h2></div><button className="preference-row" type="button" onClick={onToggle}><span><Icon name={dark ? 'sun' : 'moon'} /></span><span><b>{dark ? 'Usar modo claro' : 'Usar modo escuro'}</b><small>Ajuste as cores para sua preferência.</small></span><span className={`switch ${dark ? 'active' : ''}`} aria-hidden="true" /></button><button className="preference-row preference-row--danger" type="button" onClick={onLogout}><span><Icon name="logout" /></span><span><b>Sair da conta</b><small>Encerra a sessão neste dispositivo.</small></span><Icon name="chevron" /></button></article></section>
  </AppLayout>
}
