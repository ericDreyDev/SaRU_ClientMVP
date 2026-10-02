import { Logo } from '../ui/Logo'
import { ThemeButton } from '../ui/ThemeButton'

export function Hero() {
  return <div className="hero-copy"><h1>Sua refeição, <em>reservada</em><br />em <strong>segundos</strong></h1><p>Avisos, agendamentos e cardápio da semana<br className="desktop-only" /> em uma só plataforma</p></div>
}

export function PublicHeader({ dark, onToggle, onLogoClick }: { dark: boolean; onToggle: () => void; onLogoClick: () => void }) {
  return <header className="public-header"><Logo onClick={onLogoClick} destination="Ir para o login" /><ThemeButton dark={dark} onToggle={onToggle} /></header>
}

export function Footer() { return <footer>© 2026 Restaurante Universitário Universidade de Passo Fundo</footer> }
