import { useState, useRef } from 'react'
import LoginScreen    from './components/LoginScreen.jsx'
import TopBar         from './components/TopBar.jsx'
import BottomNav      from './components/BottomNav.jsx'
import FeedTab        from './tabs/FeedTab.jsx'
import CalendarTab    from './tabs/CalendarTab.jsx'
import FundraisingTab from './tabs/FundraisingTab.jsx'
import CanteenTab     from './tabs/CanteenTab.jsx'
import ScheduleTab    from './tabs/ScheduleTab.jsx'
import AdminTab       from './tabs/AdminTab.jsx'
import ProfileTab     from './tabs/ProfileTab.jsx'
import NotificationsPanel from './components/NotificationsPanel.jsx'
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_FUNDRAISING,
  INITIAL_SCHEDULES,
  INITIAL_CANTEEN_ITEMS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_PIX,
} from './data/initialData.js'
import { hasScheduleAccess, isBirthdayToday } from './utils/helpers.js'
import s from './App.module.css'

export default function App() {
  const [users, setUsers]                   = useState(INITIAL_USERS)
  const [user, setUser]                     = useState(null)
  const [tab, setTab]                       = useState('feed')
  const [posts, setPosts]                   = useState(INITIAL_POSTS)
  const [fundraising, setFundraising]       = useState(INITIAL_FUNDRAISING)
  const [schedules, setSchedules]           = useState(INITIAL_SCHEDULES)
  const [canteenItems, setCanteenItems]     = useState(INITIAL_CANTEEN_ITEMS)
  const [calendarEvents, setCalendarEvents] = useState(INITIAL_CALENDAR_EVENTS)
  const [pix, setPix]                       = useState(INITIAL_PIX)
  const [showNotifications, setShowNotifications] = useState(false)
  // Track which post ids have been notified already
  const notifiedPosts = useRef(new Set(INITIAL_POSTS.map(p => p.id)))

  const buildNotifications = (u) => {
    const notifs = []
    if (!u) return notifs

    // 1. Birthday — all roles see their own, pastor sees all members
    users.forEach(member => {
      if (!isBirthdayToday(member.birthDate)) return
      if (u.role === 'pastor' || member.id === u.id) {
        notifs.push({
          id: `bd-${member.id}`,
          icon: '🎂',
          text: member.id === u.id
            ? 'Hoje é seu aniversário! 🎉'
            : `Hoje é aniversário de ${member.name}!`,
          time: 'hoje',
        })
      }
    })

    // 2. New posts from others
    posts.forEach(p => {
      if (p.author !== u.name && !notifiedPosts.current.has(p.id)) {
        notifs.push({
          id: `post-${p.id}`,
          icon: '📝',
          text: `${p.author} fez uma nova publicação.`,
          time: p.time || 'agora',
        })
      }
    })

    // 3. Upcoming calendar events (next 7 days)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    calendarEvents.forEach(ev => {
      const evDate = new Date(ev.date + 'T00:00:00')
      const diffDays = Math.round((evDate - today) / (1000 * 60 * 60 * 24))
      if (diffDays >= 0 && diffDays <= 7) {
        notifs.push({
          id: `ev-${ev.id}`,
          icon: '📅',
          text: diffDays === 0
            ? `Hoje: ${ev.title} às ${ev.time}`
            : `Em ${diffDays} dia${diffDays > 1 ? 's' : ''}: ${ev.title}`,
          time: diffDays === 0 ? 'hoje' : `${diffDays}d`,
        })
      }
    })

    // 4. Schedule — if escalado today
    const todayStr = new Date().toISOString().split('T')[0]
    const schedMap = { musico: 'musicos', obreiro: 'obreiros', educadora: 'educadoras', circulo_oracao: 'circulo' }
    const key = schedMap[u.role]
    if (key) {
      const myEntries = (schedules[key] || []).filter(e => e.name === u.name && e.dates?.includes(todayStr))
      if (myEntries.length > 0) {
        notifs.push({ id: 'sched-today', icon: '📋', text: 'Você está escalado hoje!', time: 'hoje' })
      }
    }

    return notifs
  }

  // FIX: member login — always look up fresh user from latest users array
  const handleLogin = (u) => {
    const freshUser = users.find(x => x.username === u.username.toLowerCase().trim()) || u
    setUser(freshUser)
    setTab('feed')
    // Mark current posts as already known
    notifiedPosts.current = new Set(posts.map(p => p.id))
  }

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser)
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u))
  }

  // FIX: when new member is added, also mark posts so no false notifications
  const handleSetUsers = (updater) => {
    setUsers(updater)
  }

  // Delete account handler
  const handleDeleteAccount = () => {
    setUsers(prev => prev.filter(u => u.id !== user.id))
    setUser(null)
  }

  if (!user) return <LoginScreen users={users} onLogin={handleLogin} />

  const notifications = buildNotifications(user)

  return (
    <div className={s.app}>
      <TopBar
        user={user}
        onLogout={() => setUser(null)}
        notifCount={notifications.length}
        onBell={() => setShowNotifications(true)}
        onProfile={() => setTab('profile')}
      />

      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      <main className={s.main}>
        {tab === 'feed' && (
          <FeedTab user={user} posts={posts} setPosts={setPosts} users={users} />
        )}
        {tab === 'calendar' && (
          <CalendarTab events={calendarEvents} setEvents={setCalendarEvents} user={user} />
        )}
        {tab === 'fundraising' && (
          <FundraisingTab user={user} fundraising={fundraising} setFundraising={setFundraising} pix={pix} setPix={setPix} />
        )}
        {tab === 'canteen' && (
          <CanteenTab user={user} canteenItems={canteenItems} setCanteenItems={setCanteenItems} />
        )}
        {tab === 'schedule' && hasScheduleAccess(user.role) && (
          <ScheduleTab user={user} users={users} schedules={schedules} setSchedules={setSchedules} />
        )}
        {tab === 'admin' && user.role === 'pastor' && (
          <AdminTab users={users} setUsers={handleSetUsers} />
        )}
        {tab === 'profile' && (
          <ProfileTab
            user={user}
            onUpdateUser={handleUpdateUser}
            onBack={() => setTab('feed')}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>

      <BottomNav tab={tab} setTab={setTab} user={user} />
    </div>
  )
}
