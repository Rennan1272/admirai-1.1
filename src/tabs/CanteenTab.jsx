import { useState } from 'react'
import { MONTHS } from '../data/initialData.js'
import { canAccess, fmtDate } from '../utils/helpers.js'
import s from './CanteenTab.module.css'

export default function CanteenTab({ user, canteenItems, setCanteenItems }) {
  const canManage = canAccess(user.role, 'manage_canteen')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ name: '', date: '', price: '', desc: '' })

  const addItem = () => {
    if (!form.name || !form.date || !form.price) return
    setCanteenItems(prev => [...prev, {
      id: Date.now(),
      name: form.name,
      date: form.date,
      price: parseFloat(form.price),
      desc: form.desc,
      reservations: [],
    }])
    setForm({ name: '', date: '', price: '', desc: '' })
    setShowForm(false)
  }

  const toggleReservation = (itemId) => {
    setCanteenItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const already = item.reservations.includes(user.name)
      return {
        ...item,
        reservations: already
          ? item.reservations.filter(n => n !== user.name)
          : [...item.reservations, user.name],
      }
    }))
  }

  const deleteItem = (id) => setCanteenItems(prev => prev.filter(i => i.id !== id))

  return (
    <div className={s.wrap}>
      <div className={s.topRow}>
        <h3 className={s.sectionLabel}>CANTINA — PRÓXIMOS EVENTOS</h3>
        {canManage && (
          <button className={s.btnAdd} onClick={() => setShowForm(!showForm)}>+ CRIAR</button>
        )}
      </div>

      {/* Create form — lider_cantina / pastor */}
      {showForm && canManage && (
        <div className={s.form}>
          <h4 className={s.formTitle}>NOVO EVENTO DA CANTINA</h4>
          <label className={s.formLabel}>NOME DO ITEM</label>
          <input className={s.formInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Hambúrguer Artesanal" />
          <label className={s.formLabel}>DATA</label>
          <input className={s.formInput} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <label className={s.formLabel}>VALOR (R$)</label>
          <input className={s.formInput} type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Ex: 15.00" />
          <label className={s.formLabel}>DESCRIÇÃO</label>
          <input className={s.formInput} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Ex: Com fritas e refrigerante" />
          <div className={s.formActions}>
            <button className={s.btnSave} onClick={addItem}>Salvar</button>
            <button className={s.btnCancel} onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {canteenItems.length === 0 && (
        <p className={s.empty}>Nenhum evento na cantina por enquanto.</p>
      )}

      {canteenItems.map(item => {
        const d = new Date(item.date + 'T00:00:00')
        const mon = MONTHS[d.getMonth()].slice(0, 3).toUpperCase()
        const hasReserved = item.reservations?.includes(user.name)
        const total = item.reservations?.length || 0

        return (
          <div key={item.id} className={s.card}>
            <div className={s.cardTop}>
              <div className={s.dateBox}>
                <span className={s.day}>{d.getDate()}</span>
                <span className={s.month}>{mon}</span>
              </div>
              <div className={s.info}>
                <div className={s.nameRow}>
                  <span className={s.name}>{item.name}</span>
                  <span className={s.price}>R$ {Number(item.price).toFixed(2).replace('.', ',')}</span>
                </div>
                {item.desc && <p className={s.desc}>{item.desc}</p>}
                <span className={s.date}>📅 {fmtDate(item.date)}</span>
              </div>
              {canManage && (
                <button className={s.btnDel} onClick={() => deleteItem(item.id)}>🗑</button>
              )}
            </div>

            {/* Reservation count */}
            <div className={s.reserveRow}>
              <span className={s.reserveCount}>
                {total} {total === 1 ? 'reserva' : 'reservas'}
              </span>
              <button
                className={`${s.btnReserve} ${hasReserved ? s.reserved : ''}`}
                onClick={() => toggleReservation(item.id)}
              >
                {hasReserved ? '✓ Reservado' : 'Reservar meu lanche'}
              </button>
            </div>

            {hasReserved && (
              <div className={s.reserveNote}>
                ✅ Sua reserva está confirmada. Pague presencialmente no dia do evento.
              </div>
            )}

            {/* Leader sees who reserved */}
            {canManage && item.reservations?.length > 0 && (
              <div className={s.reserveList}>
                <span className={s.reserveListTitle}>Reservas:</span>
                {item.reservations.map(n => <span key={n} className={s.reserveName}>{n}</span>)}
              </div>
            )}
          </div>
        )
      })}

      <div className={s.notice}>
        🔔 Você receberá notificações sobre novos itens da cantina.
      </div>
    </div>
  )
}
