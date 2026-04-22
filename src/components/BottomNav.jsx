import { useState } from 'react'
import { hasScheduleAccess } from '../utils/helpers.js'
import s from './BottomNav.module.css'

/**
 * BottomNav with overflow "Mais" menu.
 * Primary nav: 4 fixed + "Mais" button
 * "Mais" drawer: all extra tabs
 */
export default function BottomNav({ tab, setTab, user, missionRequests }) {
  const [showMore, setShowMore] = useState(false)

  const primaryItems = [
    { key: 'feed',    icon: '🏠', label: 'INÍCIO' },
    { key: 'stories', icon: '▶', label: 'STORIES' },
    { key: 'chat',    icon: '💬', label: 'CHAT' },
    { key: 'calendar',icon: '📅', label: 'AGENDA' },
  ]

  const moreItems = [
    { key: 'fundraising', icon: '💰', label: 'Arrecadação' },
    { key: 'canteen',     icon: '🍽️', label: 'Cantina' },
  ]

  if (hasScheduleAccess(user.role))
    moreItems.push({ key: 'schedule', icon: '📋', label: 'Escala' })

  if (['lider_missoes', 'pastor'].includes(user.role)) {
    const pending = (missionRequests || []).filter(r => r.status === 'pendente').length
    moreItems.push({ key: 'missions', icon: '✈️', label: 'Pedidos', badge: pending || 0 })
  }

  if (user.role === 'pastor') {
    moreItems.push({ key: 'financial', icon: '📊', label: 'Financeiro' })
    moreItems.push({ key: 'admin',     icon: '⚙️', label: 'Admin' })
  }

  const goTab = (key) => { setTab(key); setShowMore(false) }
  const isMoreActive = moreItems.some(i => i.key === tab)

  return (
    <>
      {/* More drawer */}
      {showMore && (
        <div className={s.moreOverlay} onClick={() => setShowMore(false)}>
          <div className={s.moreSheet} onClick={e => e.stopPropagation()}>
            <div className={s.moreHandle} />
            <div className={s.moreGrid}>
              {moreItems.map(item => (
                <button key={item.key} className={`${s.moreBtn} ${tab === item.key ? s.moreBtnActive : ''}`}
                  onClick={() => goTab(item.key)}>
                  <div className={s.moreBtnIconWrap}>
                    <span className={s.moreBtnIcon}>{item.icon}</span>
                    {item.badge > 0 && <span className={s.moreBadge}>{item.badge}</span>}
                  </div>
                  <span className={s.moreBtnLabel}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className={s.nav}>
        {primaryItems.map(item => (
          <button key={item.key} className={s.btn} onClick={() => goTab(item.key)}>
            <span className={s.icon}>{item.icon}</span>
            <span className={`${s.label} ${tab === item.key ? s.active : ''}`}>{item.label}</span>
            {tab === item.key && <span className={s.dot} />}
          </button>
        ))}

        {/* Mais button */}
        <button className={s.btn} onClick={() => setShowMore(!showMore)}>
          <span className={s.icon}>⋯</span>
          <span className={`${s.label} ${isMoreActive ? s.active : ''}`}>MAIS</span>
          {isMoreActive && <span className={s.dot} />}
        </button>
      </nav>
    </>
  )
}
