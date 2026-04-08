import { hasScheduleAccess } from '../utils/helpers.js'
import s from './BottomNav.module.css'

const NAV_ITEMS = [
  { key: 'feed',        icon: '🏠', label: 'INÍCIO' },
  { key: 'calendar',   icon: '📅', label: 'AGENDA' },
  { key: 'fundraising',icon: '💰', label: 'ARRECAD.' },
  { key: 'canteen',    icon: '🍽️', label: 'CANTINA' },
]

export default function BottomNav({ tab, setTab, user }) {
  const items = [...NAV_ITEMS]
  if (hasScheduleAccess(user.role)) items.push({ key: 'schedule', icon: '📋', label: 'ESCALA' })
  if (user.role === 'pastor')        items.push({ key: 'admin',    icon: '⚙️', label: 'ADMIN' })

  return (
    <nav className={s.nav}>
      {items.map((item) => (
        <button
          key={item.key}
          className={s.btn}
          onClick={() => setTab(item.key)}
        >
          <span className={s.icon}>{item.icon}</span>
          <span className={`${s.label} ${tab === item.key ? s.active : ''}`}>
            {item.label}
          </span>
          {tab === item.key && <span className={s.dot} />}
        </button>
      ))}
    </nav>
  )
}
