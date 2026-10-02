import { Icon } from './Icon'

export function ThemeButton({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return <button className="theme-button" type="button" onClick={onToggle} aria-pressed={dark} aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}><Icon name={dark ? 'sun' : 'moon'} /><span>{dark ? 'Modo claro' : 'Modo escuro'}</span></button>
}
