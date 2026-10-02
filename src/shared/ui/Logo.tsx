import logoMark from '../../assets/logo-mark.svg'
import logoWordmark from '../../assets/logo-wordmark.svg'

export function Logo({ compact = false, markOnly = false, onClick, destination }: { compact?: boolean; markOnly?: boolean; onClick: () => void; destination: string }) {
  return <button className={`brand ${compact ? 'brand--compact' : ''} ${markOnly ? 'brand--mark-only' : ''}`} type="button" onClick={onClick} aria-label={`Restaurante Universitário UPF — ${destination}`} title={destination}><img src={logoMark} alt="" /><img src={logoWordmark} alt="Restaurante Universitário UPF" /></button>
}
