import { useState, useMemo } from 'react'
import { CHURCHES } from '../data/initialData.js'
import s from './FinancialTab.module.css'

/**
 * FinancialTab — Pastor Presidente only
 * Shows tithes + offerings aggregated by church and period.
 *
 * In production:
 *   GET /financial/summary?from=&to=&churchId=
 *   Backend: SELECT churchId, type, SUM(amount) FROM financial_entries
 *            WHERE date BETWEEN ? AND ? GROUP BY churchId, type
 *   Indexes: (date), (churchId, date), (type, date)
 */

const periodPresets = [
  { label: 'Hoje',    key: 'today' },
  { label: 'Semana',  key: 'week' },
  { label: 'Mês',     key: 'month' },
  { label: 'Custom',  key: 'custom' },
]

function getRange(key, customFrom, customTo) {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  const from = new Date()
  from.setHours(0, 0, 0, 0)

  if (key === 'today') {
    return { from, to: now }
  }
  if (key === 'week') {
    from.setDate(from.getDate() - 6)
    return { from, to: now }
  }
  if (key === 'month') {
    from.setDate(1)
    return { from, to: now }
  }
  if (key === 'custom' && customFrom && customTo) {
    return {
      from: new Date(customFrom + 'T00:00:00'),
      to:   new Date(customTo   + 'T23:59:59'),
    }
  }
  // fallback: full month
  from.setDate(1)
  return { from, to: now }
}

// Aggregate entries — simulates GROUP BY churchId, type, SUM(amount)
function aggregate(entries, from, to) {
  return entries.filter(e => {
    const d = new Date(e.date + 'T00:00:00')
    return d >= from && d <= to
  }).reduce((acc, e) => {
    if (!acc[e.churchId]) acc[e.churchId] = { dizimo: 0, oferta: 0 }
    acc[e.churchId][e.type] += e.amount
    return acc
  }, {})
}

const fmt = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function FinancialTab({ entries, setEntries }) {
  const [period, setPeriod]       = useState('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo]   = useState('')
  const [showAdd, setShowAdd]     = useState(false)
  const [form, setForm]           = useState({ churchId: 'rj', type: 'dizimo', amount: '', date: new Date().toISOString().split('T')[0], note: '' })
  const [selectedChurch, setSelectedChurch] = useState('all')

  const { from, to } = getRange(period, customFrom, customTo)
  const agg = useMemo(() => aggregate(entries, from, to), [entries, from, to])

  const churchRows = CHURCHES.map(c => ({
    ...c,
    dizimo: agg[c.id]?.dizimo || 0,
    oferta: agg[c.id]?.oferta || 0,
    total: (agg[c.id]?.dizimo || 0) + (agg[c.id]?.oferta || 0),
  }))

  const filtered = selectedChurch === 'all' ? churchRows : churchRows.filter(c => c.id === selectedChurch)

  const grandDizimo = filtered.reduce((s, c) => s + c.dizimo, 0)
  const grandOferta = filtered.reduce((s, c) => s + c.oferta, 0)
  const grandTotal  = grandDizimo + grandOferta

  const addEntry = () => {
    if (!form.amount || !form.date) return
    setEntries(prev => [...prev, { id: Date.now(), ...form, amount: parseFloat(form.amount) }])
    setForm(f => ({ ...f, amount: '', note: '' }))
    setShowAdd(false)
  }

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <span className={s.title}>FINANCEIRO</span>
        <button className={s.btnAdd} onClick={() => setShowAdd(!showAdd)}>+ Lançamento</button>
      </div>

      {/* Period selector */}
      <div className={s.periodBar}>
        {periodPresets.map(p => (
          <button key={p.key} className={`${s.periodBtn} ${period === p.key ? s.active : ''}`}
            onClick={() => setPeriod(p.key)}>{p.label}</button>
        ))}
      </div>

      {period === 'custom' && (
        <div className={s.customRange}>
          <input type="date" className={s.dateInput} value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
          <span className={s.rangeSep}>até</span>
          <input type="date" className={s.dateInput} value={customTo} onChange={e => setCustomTo(e.target.value)} />
        </div>
      )}

      {/* Church filter */}
      <div className={s.churchFilter}>
        <button className={`${s.churchBtn} ${selectedChurch === 'all' ? s.churchActive : ''}`}
          onClick={() => setSelectedChurch('all')}>Todas</button>
        {CHURCHES.map(c => (
          <button key={c.id} className={`${s.churchBtn} ${selectedChurch === c.id ? s.churchActive : ''}`}
            onClick={() => setSelectedChurch(c.id)}>{c.name}</button>
        ))}
      </div>

      {/* Summary cards */}
      <div className={s.summaryRow}>
        <div className={s.summaryCard}>
          <span className={s.summaryLabel}>Dízimos</span>
          <span className={s.summaryValue}>{fmt(grandDizimo)}</span>
        </div>
        <div className={s.summaryCard}>
          <span className={s.summaryLabel}>Ofertas</span>
          <span className={s.summaryValue}>{fmt(grandOferta)}</span>
        </div>
        <div className={`${s.summaryCard} ${s.summaryTotal}`}>
          <span className={s.summaryLabel}>Total Geral</span>
          <span className={s.summaryValueLg}>{fmt(grandTotal)}</span>
        </div>
      </div>

      {/* Per-church table */}
      <div className={s.section}>
        <h3 className={s.sectionLabel}>POR IGREJA</h3>
        {filtered.map(c => (
          <div key={c.id} className={s.churchRow}>
            <div className={s.churchName}>{c.name}</div>
            <div className={s.churchAmounts}>
              <div className={s.amountPill}>
                <span className={s.pillLabel}>Dízimo</span>
                <span className={s.pillValue}>{fmt(c.dizimo)}</span>
              </div>
              <div className={s.amountPill}>
                <span className={s.pillLabel}>Oferta</span>
                <span className={s.pillValue}>{fmt(c.oferta)}</span>
              </div>
              <div className={`${s.amountPill} ${s.pillTotal}`}>
                <span className={s.pillLabel}>Total</span>
                <span className={s.pillValue}>{fmt(c.total)}</span>
              </div>
            </div>
            {/* Progress bar relative to grand total */}
            {grandTotal > 0 && (
              <div className={s.churchBar}>
                <div className={s.churchBarFill} style={{ width: `${Math.round((c.total / grandTotal) * 100)}%` }} />
                <span className={s.churchBarPct}>{Math.round((c.total / grandTotal) * 100)}%</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add entry form */}
      {showAdd && (
        <div className={s.addForm}>
          <h4 className={s.formTitle}>NOVO LANÇAMENTO</h4>
          <label className={s.formLabel}>IGREJA</label>
          <select className={s.formInput} value={form.churchId} onChange={e => setForm(f => ({ ...f, churchId: e.target.value }))}>
            {CHURCHES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className={s.formLabel}>TIPO</label>
          <select className={s.formInput} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="dizimo">Dízimo</option>
            <option value="oferta">Oferta</option>
          </select>
          <label className={s.formLabel}>VALOR (R$)</label>
          <input className={s.formInput} type="number" value={form.amount} placeholder="Ex: 850.00"
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          <label className={s.formLabel}>DATA</label>
          <input className={s.formInput} type="date" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <label className={s.formLabel}>OBSERVAÇÃO</label>
          <input className={s.formInput} value={form.note} placeholder="Ex: Culto domingo"
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          <div className={s.formActions}>
            <button className={s.btnSave} onClick={addEntry}>Salvar</button>
            <button className={s.btnCancel} onClick={() => setShowAdd(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
