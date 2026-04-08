import { useState } from 'react'
import { MONTHS, DAYS_SHORT, TYPE_ICONS } from '../data/initialData.js'
import { canAccess } from '../utils/helpers.js'
import s from './CalendarTab.module.css'

const TYPE_COLORS  = { culto: '#fff', oracao: '#aaa', infantil: '#ccc', cantina: '#FF8C00', evento: '#888' }
const TYPE_OPTIONS = ['culto', 'oracao', 'infantil', 'cantina', 'evento']

// FIX: parse date as local time to avoid UTC day-shift bug
const localDate = (dateStr) => new Date(dateStr + 'T00:00:00')

export default function CalendarTab({ events, setEvents, user }) {
  // FIX: default to real current month/year
  const now = new Date()
  const [month, setMonth]     = useState(now.getMonth())
  const [year, setYear]       = useState(now.getFullYear())
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]   = useState(null)
  const [form, setForm]       = useState({ title: '', date: '', time: '', type: 'culto' })
  const [saveMsg, setSaveMsg] = useState('')

  const canManage = canAccess(user.role, 'manage_calendar')

  const changeMonth = (dir) => {
    let m = month + dir, y = year
    if (m < 0)  { m = 11; y-- }
    if (m > 11) { m = 0;  y++ }
    setMonth(m); setYear(y)
  }

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthEvents = (events || []).filter(e => {
    const d = localDate(e.date)
    return d.getFullYear() === year && d.getMonth() === month
  }).sort((a, b) => a.date.localeCompare(b.date))

  const byDay = {}
  monthEvents.forEach(e => {
    const d = localDate(e.date).getDate()
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(e)
  })

  const openAdd = () => {
    setEditId(null)
    setForm({ title: '', date: '', time: '', type: 'culto' })
    setShowForm(true)
    setSaveMsg('')
  }

  const openEdit = (ev) => {
    setEditId(ev.id)
    setForm({ title: ev.title, date: ev.date, time: ev.time, type: ev.type })
    setShowForm(true)
    setSaveMsg('')
  }

  // FIX: clear form and show feedback after saving
  const saveEvent = () => {
    if (!form.title.trim() || !form.date || !form.time) {
      setSaveMsg('Preencha título, data e hora.')
      return
    }
    if (editId) {
      setEvents(prev => prev.map(e => e.id === editId ? { ...e, ...form } : e))
      setSaveMsg('Evento atualizado!')
    } else {
      setEvents(prev => [...prev, { id: Date.now(), ...form }])
      setSaveMsg('Evento criado!')
    }
    setEditId(null)
    setForm({ title: '', date: '', time: '', type: 'culto' })
    setShowForm(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const deleteEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id))

  return (
    <div className={s.wrap}>
      <div className={s.calHeader}>
        <div className={s.calNav}>
          <button className={s.arrow} onClick={() => changeMonth(-1)}>‹</button>
          <span className={s.monthLabel}>{MONTHS[month]} {year}</span>
          <button className={s.arrow} onClick={() => changeMonth(1)}>›</button>
        </div>

        <div className={s.grid}>
          {DAYS_SHORT.map(d => <div key={d} className={s.dayLabel}>{d}</div>)}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const evs = byDay[day]
            return (
              <div key={day} className={`${s.cell} ${evs ? s.hasEvents : ''}`}>
                <span className={`${s.dayNum} ${evs ? s.active : ''}`}>{day}</span>
                {evs && <span className={s.dots}>{evs.map(e => TYPE_ICONS[e.type] || '•').join('')}</span>}
              </div>
            )
          })}
        </div>
      </div>

      {canManage && (
        <div className={s.addRow}>
          {saveMsg && <span className={s.saveMsg}>{saveMsg}</span>}
          <button className={s.btnAdd} onClick={openAdd}>+ Adicionar Evento</button>
        </div>
      )}

      {showForm && canManage && (
        <div className={s.form}>
          <h4 className={s.formTitle}>{editId ? 'EDITAR EVENTO' : 'NOVO EVENTO'}</h4>
          <label className={s.formLabel}>TÍTULO</label>
          <input className={s.formInput} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Culto de Domingo" />
          <label className={s.formLabel}>DATA</label>
          <input className={s.formInput} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <label className={s.formLabel}>HORA</label>
          <input className={s.formInput} type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          <label className={s.formLabel}>TIPO</label>
          <select className={s.formInput} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className={s.formActions}>
            <button className={s.btnSave} onClick={saveEvent}>Salvar</button>
            <button className={s.btnCancel} onClick={() => { setShowForm(false); setSaveMsg('') }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className={s.evList}>
        <h3 className={s.sectionLabel}>PROGRAMAÇÃO — {MONTHS[month].toUpperCase()}</h3>
        {monthEvents.length === 0 && <p className={s.empty}>Nenhum evento neste mês.</p>}
        {monthEvents.map(ev => {
          // FIX: use local date to get correct day of week
          const d = localDate(ev.date)
          return (
            <div key={ev.id} className={s.eventRow}>
              <div className={s.dateBox}>
                <span className={s.evDay}>{d.getDate()}</span>
                <span className={s.evWd}>{DAYS_SHORT[d.getDay()]}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div className={s.evTitle}><span>{TYPE_ICONS[ev.type] || ''}</span> {ev.title}</div>
                <div className={s.evTime}>🕐 {ev.time}</div>
              </div>
              <span className={s.evBadge} style={{ color: TYPE_COLORS[ev.type] || '#888', borderColor: TYPE_COLORS[ev.type] || '#444' }}>{ev.type}</span>
              {canManage && (
                <div className={s.evActions}>
                  <button className={s.btnEdit} onClick={() => openEdit(ev)}>✏️</button>
                  <button className={s.btnDel} onClick={() => deleteEvent(ev.id)}>🗑</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
