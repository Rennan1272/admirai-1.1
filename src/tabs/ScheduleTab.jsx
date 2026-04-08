import { useState } from 'react'
import { SCHED_TABS_BY_ROLE, TYPE_LABELS, INSTRUMENTS } from '../data/initialData.js'
import { canAccess, fmtDate, getMembersForTab } from '../utils/helpers.js'
import s from './ScheduleTab.module.css'

export default function ScheduleTab({ user, users, schedules, setSchedules }) {
  const tabs = SCHED_TABS_BY_ROLE[user.role] || []
  const [active, setActive]         = useState(tabs[0]?.[0] || 'musicos')
  const [showForm, setShowForm]      = useState(false)
  const [selectedNames, setSelectedNames] = useState([])
  const [dates, setDates]           = useState('')
  const [type, setType]             = useState('')
  const [instrument, setInstrument] = useState('')

  const canCreate = canAccess(user.role, 'create_schedule')

  if (!tabs.length) {
    return <div className={s.empty}><p>Sem escalas disponíveis.</p></div>
  }

  const entries  = schedules[active] || []
  const visible  = entries.filter(e => e.name === user.name || canCreate)
  const showType = active === 'obreiros' || active === 'circulo'
  const isMusico = active === 'musicos'

  const typeOpts = active === 'obreiros'
    ? [['portaria', 'Portaria'], ['santa_ceia', 'Santa Ceia']]
    : active === 'circulo'
    ? [['segunda', 'Segunda-Feira'], ['domingo', 'Domingo']]
    : []

  // Members available for this schedule tab (filtered by sector)
  const availableMembers = getMembersForTab(users, active)

  const toggleName = (name) => {
    setSelectedNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const handleAdd = () => {
    if (!selectedNames.length) return
    const parsedDates = dates.split(',').map(d => d.trim()).filter(Boolean)
    if (!parsedDates.length) return

    const newEntries = selectedNames.map(name => ({
      id: Date.now() + Math.random(),
      name,
      dates: parsedDates,
      ...(type ? { type } : {}),
      ...(isMusico && instrument ? { instrument } : {}),
    }))

    setSchedules(prev => ({ ...prev, [active]: [...(prev[active] || []), ...newEntries] }))
    setSelectedNames([])
    setDates('')
    setType('')
    setInstrument('')
    setShowForm(false)
  }

  const deleteEntry = (id) => {
    setSchedules(prev => ({ ...prev, [active]: prev[active].filter(e => e.id !== id) }))
  }

  return (
    <div className={s.wrap}>
      {/* Sub-tabs */}
      <div className={s.subTabs}>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            className={`${s.subTab} ${active === key ? s.active : ''}`}
            onClick={() => { setActive(key); setShowForm(false); setSelectedNames([]) }}
          >{label}</button>
        ))}
      </div>

      <div className={s.content}>
        <div className={s.contentHeader}>
          <h3 className={s.sectionLabel}>ESCALA DO MÊS</h3>
          {canCreate && (
            <button className={s.btnAdd} onClick={() => setShowForm(!showForm)}>+ ADICIONAR</button>
          )}
        </div>

        {/* Add form */}
        {showForm && canCreate && (
          <div className={s.form}>
            <h4 className={s.formTitle}>NOVA ESCALA</h4>

            {/* Member multi-select */}
            <label className={s.formLabel}>SELECIONAR MEMBROS ({active === 'musicos' ? 'Conjunto' : active === 'obreiros' ? 'Obreiros' : active === 'educadoras' ? 'Infantil' : 'Círculo'})</label>
            <div className={s.memberPicker}>
              {availableMembers.length === 0
                ? <p className={s.noMembers}>Nenhum membro neste setor cadastrado.</p>
                : availableMembers.map(m => (
                  <button
                    key={m.id}
                    className={`${s.memberChip} ${selectedNames.includes(m.name) ? s.chipSelected : ''}`}
                    onClick={() => toggleName(m.name)}
                  >
                    {selectedNames.includes(m.name) && <span className={s.chipCheck}>✓</span>}
                    {m.name}
                  </button>
                ))
              }
            </div>

            {/* Instrument — only for músicos */}
            {isMusico && (
              <>
                <label className={s.formLabel}>INSTRUMENTO</label>
                <select className={s.formInput} value={instrument} onChange={e => setInstrument(e.target.value)}>
                  <option value="">Selecione o instrumento...</option>
                  {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </>
            )}

            {/* Type — obreiros / circulo */}
            {showType && (
              <>
                <label className={s.formLabel}>TIPO</label>
                <select className={s.formInput} value={type} onChange={e => setType(e.target.value)}>
                  <option value="">Selecione...</option>
                  {typeOpts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </>
            )}

            <label className={s.formLabel}>DATAS (YYYY-MM-DD, separadas por vírgula)</label>
            <input className={s.formInput} value={dates} onChange={e => setDates(e.target.value)} placeholder="2025-04-06, 2025-04-13" />

            <div className={s.formActions}>
              <button className={s.btnSave} onClick={handleAdd}>
                Escalar {selectedNames.length > 0 ? `(${selectedNames.length})` : ''}
              </button>
              <button className={s.btnCancel} onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Schedule list */}
        {visible.length === 0
          ? <div className={s.emptyMsg}><p>Nenhuma escala cadastrada.</p></div>
          : visible.map((entry, i) => (
            <div key={entry.id || i} className={s.card}>
              <div className={s.cardHeader}>
                <span className={s.memberName}>{entry.name}</span>
                <div className={s.badges}>
                  {entry.type && <span className={s.badge}>{TYPE_LABELS[entry.type] || entry.type}</span>}
                  {entry.instrument && <span className={s.badge}>{entry.instrument}</span>}
                </div>
                {canCreate && (
                  <button className={s.btnDelEntry} onClick={() => deleteEntry(entry.id)}>✕</button>
                )}
              </div>
              <div className={s.dates}>
                {entry.dates.map(d => <span key={d} className={s.datePill}>📅 {fmtDate(d)}</span>)}
              </div>
              {entry.name === user.name && (
                <div className={s.myNote}>✓ Você está escalado nestas datas</div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  )
}
