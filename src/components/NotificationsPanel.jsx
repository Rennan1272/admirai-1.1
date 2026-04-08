import s from './NotificationsPanel.module.css'

export default function NotificationsPanel({ notifications, onClose }) {
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.panel} onClick={e => e.stopPropagation()}>
        <div className={s.header}>
          <span className={s.title}>🔔 Notificações</span>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        {notifications.length === 0 ? (
          <div className={s.empty}>Nenhuma notificação no momento.</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={s.item}>
              <span className={s.icon}>{n.icon}</span>
              <div className={s.text}>{n.text}</div>
              <span className={s.time}>{n.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
