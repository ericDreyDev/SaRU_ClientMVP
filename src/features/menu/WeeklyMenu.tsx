import { useState } from 'react'
import menuSymbolsLegend from '../../assets/menu-symbols-legend.png'
import weeklyMenuImage from '../../assets/weekly-menu.png'
import { Icon } from '../../shared/ui/Icon'

export function WeeklyMenu() {
  const [view, setView] = useState<'menu' | 'legend'>('menu')
  const [imageOpen, setImageOpen] = useState(false)
  const isMenu = view === 'menu'
  return <article className="weekly-menu-card">
    <div className="menu-card-heading"><h2>Cardápio da semana</h2><div className="menu-view-switcher" role="group" aria-label="Conteúdo do cardápio"><button className={isMenu ? 'active' : ''} type="button" onClick={() => setView('menu')}>Cardápio</button><button className={!isMenu ? 'active' : ''} type="button" onClick={() => setView('legend')}>Legenda</button></div></div>
    <div className="menu-image-frame"><button className="menu-image-button" type="button" onClick={() => setImageOpen(true)} aria-label={`Ampliar ${isMenu ? 'cardápio semanal' : 'legenda dos símbolos'}`}><img src={isMenu ? weeklyMenuImage : menuSymbolsLegend} alt={isMenu ? 'Cardápio semanal do RU, de segunda a sexta-feira' : 'Legenda dos símbolos alimentares usados no cardápio do RU'} /><span>Ampliar imagem</span></button><p>{isMenu ? 'Cardápio vigente: 28/09 a 02/10.' : 'Consulte os símbolos para identificar restrições e características dos alimentos.'}</p></div>
    {imageOpen && <div className="menu-lightbox-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setImageOpen(false) }}><section className="menu-lightbox" role="dialog" aria-modal="true" aria-label={isMenu ? 'Cardápio semanal ampliado' : 'Legenda dos símbolos ampliada'}><header><h2>{isMenu ? 'Cardápio da semana' : 'Legenda dos símbolos'}</h2><button className="icon-button" type="button" onClick={() => setImageOpen(false)} aria-label="Fechar imagem ampliada"><Icon name="close" /></button></header><div className={`menu-lightbox__scroll ${isMenu ? '' : 'menu-lightbox__scroll--legend'}`}><img src={isMenu ? weeklyMenuImage : menuSymbolsLegend} alt={isMenu ? 'Cardápio semanal do RU ampliado' : 'Legenda dos símbolos alimentares ampliada'} /></div></section></div>}
  </article>
}
