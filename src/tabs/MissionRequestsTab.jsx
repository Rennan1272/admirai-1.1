import { useState } from 'react'
import s from './MissionRequestsTab.module.css'

/**
 * MissionRequestsTab
 * lider_missoes: creates requests
 * pastor: approves / rejects
 *
 * In production:
 *   POST   /mission-request        (lider_missoes)
 *   PATCH  /mission-request/:id/status  (pastor only — validate role server-side)
 *   GET    /mission-request?status=all  (pastor)
 *   GET    /mission-request?requestedBy=me  (lider)
 */

const STATUS_LABELS = {
  pendente: { label: 'Pendente',  color: '#FF8C00', bg: '#1a0a00' },
  aprovado: { label: 'Aprovado',  color: '#4caf50', bg: '#0a1a0a' },
  rejeitado: { label: 'Rejeitado', color: '#FF4500', bg: '#1a0505' },
}

const fmt = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function MissionRequestsTab({ user, requests, setRequests }) {
  const isLeader  = user.role === 'lider_missoes'
  const isPastor  = user.role === 'pastor'

  const [showForm, setShowForm]     = useState(false)
  const [reviewId, setReviewId]     = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [form, setForm]             = useState({ item: '', quantity: '', estimatedValue: '', description: '' })
  const [filter, setFilter]         = useState('todos')

  const visible = requests.filter(r => {
    if (filter === 'todos') return true
    return r.status === filter
  })

  const submitRequest = () => {
    if (!form.item || !form.quantity || !form.estimatedValue) return
    setRequests(prev => [...prev, {
      id: Date.now(),
      item: form.item,
      quantity: parseInt(form.quantity),
      estimatedValue: parseFloat(form.estimatedValue),
      description: form.description,
      requestedBy: user.name,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    }])
    setForm({ item: '', quantity: '', estimatedValue: '', description: '' })
    setShowForm(false)
  }

  const handleReview = (id, status) => {
    setRequests(prev => prev.map(r => r.id === id
      ? { ...r, status, reviewedAt: new Date().toISOString(), reviewNote }
      : r
    ))
    setReviewId(null)
    setReviewNote('')
  }

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <span className={s.title}>PEDIDOS DE MISSÕES</span>
        {isLeader && (
          <button className={s.btnAdd} onClick={() => setShowForm(!showForm)}>+ Pedido</button>
        )}
      </div>

      {/* Status filter */}
      <div className={s.filterBar}>
        {['todos', 'pendente', 'aprovado', 'rejeitado'].map(f => (
          <button key={f} className={`${s.filterBtn} ${filter === f ? s.filterActive : ''}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* New request form */}
      {showForm && isLeader && (
        <div className={s.form}>
          <h4 className={s.formTitle}>NOVO PEDIDO</h4>
          <label className={s.formLabel}>ITEM</label>
          <input className={s.formInput} value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} placeholder="Ex: Bíblias para distribuição" />
          <label className={s.formLabel}>QUANTIDADE</label>
          <input className={s.formInput} type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="Ex: 50" />
          <label className={s.formLabel}>VALOR ESTIMADO (R$)</label>
          <input className={s.formInput} type="number" value={form.estimatedValue} onChange={e => setForm(f => ({ ...f, estimatedValue: e.target.value }))} placeholder="Ex: 1500.00" />
          <label className={s.formLabel}>DESCRIÇÃO</label>
          <textarea className={s.formTextarea} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descreva o uso e justificativa do pedido..." />
          <div className={s.formActions}>
            <button className={s.btnSave} onClick={submitRequest}>Enviar ao Pastor</button>
            <button className={s.btnCancel} onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewId && isPastor && (
        <div className={s.reviewModal}>
          <div className={s.reviewCard}>
            <h4 className={s.reviewTitle}>Resposta ao Pedido</h4>
            <label className={s.formLabel}>OBSERVAÇÃO (opcional)</label>
            <textarea className={s.formTextarea} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Ex: Aprovado. Use a verba da campanha." />
            <div className={s.reviewActions}>
              <button className={s.btnApprove} onClick={() => handleReview(reviewId, 'aprovado')}>✅ Aprovar</button>
              <button className={s.btnReject}  onClick={() => handleReview(reviewId, 'rejeitado')}>❌ Rejeitar</button>
              <button className={s.btnCancel}  onClick={() => { setReviewId(null); setReviewNote('') }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Requests list */}
      {visible.length === 0 && (
        <div className={s.empty}>Nenhum pedido encontrado.</div>
      )}

      {visible.map(r => {
        const st = STATUS_LABELS[r.status]
        const isPending = r.status === 'pendente'
        return (
          <div key={r.id} className={s.card} style={{ borderColor: st.color + '33' }}>
            <div className={s.cardTop}>
              <div className={s.cardItem}>{r.item}</div>
              <span className={s.statusBadge} style={{ color: st.color, background: st.bg, border: `1px solid ${st.color}44` }}>
                {st.label}
              </span>
            </div>

            <div className={s.cardMeta}>
              <span>Qtd: <b>{r.quantity}</b></span>
              <span>Valor: <b>{fmt(r.estimatedValue)}</b></span>
              <span>Por: <b>{r.requestedBy}</b></span>
            </div>

            {r.description && <p className={s.cardDesc}>{r.description}</p>}

            <div className={s.cardDate}>
              📅 {new Date(r.createdAt).toLocaleDateString('pt-BR')}
              {r.reviewedAt && <span> · Resp: {new Date(r.reviewedAt).toLocaleDateString('pt-BR')}</span>}
            </div>

            {r.reviewNote && (
              <div className={s.reviewNote}>
                💬 <em>{r.reviewNote}</em>
              </div>
            )}

            {isPastor && isPending && (
              <button className={s.btnReview} onClick={() => setReviewId(r.id)}>
                Responder pedido
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
