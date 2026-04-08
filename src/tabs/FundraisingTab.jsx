import { useState } from 'react'
import { canAccess, fmtDate } from '../utils/helpers.js'
import s from './FundraisingTab.module.css'

export default function FundraisingTab({ user, fundraising, setFundraising, pix, setPix }) {
  const [tab, setTab]         = useState('campanhas')
  const [copied, setCopied]   = useState({})
  const [form, setForm]       = useState({ theme: '', goal: '', pix: '', expires: '', objective: '' })
  const [editId, setEditId]   = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editPix, setEditPix] = useState(false)
  const [pixForm, setPixForm] = useState({ igreja: pix.igreja, missoes: pix.missoes })

  const canCreate  = canAccess(user.role, 'create_fundraising')
  const canManage  = canAccess(user.role, 'manage_fundraising')
  const canEditPix = canAccess(user.role, 'manage_pix')

  const handleCopy = (key, id) => {
    try { navigator.clipboard.writeText(key) } catch (_) {}
    setCopied(prev => ({ ...prev, [id]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 2000)
  }

  const createCampaign = () => {
    if (!form.theme || !form.goal || !form.pix) return
    setFundraising(prev => [...prev, {
      id: Date.now(), theme: form.theme, goal: parseFloat(form.goal),
      raised: 0, pix: form.pix, expires: form.expires,
      objective: form.objective, active: true,
    }])
    setForm({ theme: '', goal: '', pix: '', expires: '', objective: '' })
    setTab('campanhas')
  }

  const toggleActive = (id) =>
    setFundraising(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f))

  const startEdit = (f) => {
    setEditId(f.id)
    setEditForm({ theme: f.theme, goal: f.goal, pix: f.pix, expires: f.expires, objective: f.objective })
  }

  const saveEdit = () => {
    setFundraising(prev => prev.map(f => f.id === editId ? { ...f, ...editForm, goal: parseFloat(editForm.goal) } : f))
    setEditId(null)
  }

  const savePix = () => {
    setPix(pixForm)
    setEditPix(false)
  }

  const active   = fundraising.filter(f => f.active)
  const inactive = fundraising.filter(f => !f.active)

  return (
    <div className={s.wrap}>
      {/* Tab bar */}
      <div className={s.tabBar}>
        {[['campanhas', 'CAMPANHAS'], ['pix', 'PIX DA IGREJA']].map(([k, l]) => (
          <button key={k} className={`${s.tabBtn} ${tab === k ? s.active : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
        {canCreate && (
          <button className={`${s.tabBtn} ${tab === 'criar' ? s.activeOrange : s.orange}`} onClick={() => setTab('criar')} style={{ marginLeft: 'auto' }}>+ CRIAR</button>
        )}
      </div>

      <div className={s.content}>

        {/* ── CAMPANHAS ── */}
        {tab === 'campanhas' && (
          <>
            <h3 className={s.sectionLabel}>ARRECADAÇÕES ATIVAS</h3>
            {active.length === 0 && <p className={s.empty}>Nenhuma campanha ativa.</p>}
            {active.map(f => <CampaignCard key={f.id} f={f} canManage={canManage} editId={editId} editForm={editForm} setEditForm={setEditForm} startEdit={startEdit} saveEdit={saveEdit} setEditId={setEditId} toggleActive={toggleActive} handleCopy={handleCopy} copied={copied} />)}

            {inactive.length > 0 && (
              <>
                <h3 className={s.sectionLabel} style={{ marginTop: 20 }}>ENCERRADAS</h3>
                {inactive.map(f => <CampaignCard key={f.id} f={f} canManage={canManage} editId={editId} editForm={editForm} setEditForm={setEditForm} startEdit={startEdit} saveEdit={saveEdit} setEditId={setEditId} toggleActive={toggleActive} handleCopy={handleCopy} copied={copied} />)}
              </>
            )}
          </>
        )}

        {/* ── PIX ── */}
        {tab === 'pix' && (
          <>
            <div className={s.pixTopRow}>
              <h3 className={s.sectionLabel}>PIX PARA OFERTAS</h3>
              {canEditPix && (
                <button className={s.btnEditPix} onClick={() => setEditPix(!editPix)}>
                  {editPix ? 'Cancelar' : '✏️ Editar PIX'}
                </button>
              )}
            </div>

            {editPix && canEditPix ? (
              <div className={s.form}>
                <h4 className={s.formTitle}>EDITAR CHAVES PIX</h4>
                <label className={s.formLabel}>PIX DA IGREJA</label>
                <input className={s.formInput} value={pixForm.igreja} onChange={e => setPixForm({ ...pixForm, igreja: e.target.value })} />
                <label className={s.formLabel}>PIX DAS MISSÕES</label>
                <input className={s.formInput} value={pixForm.missoes} onChange={e => setPixForm({ ...pixForm, missoes: e.target.value })} />
                <div className={s.formActions}>
                  <button className={s.btnSave} onClick={savePix}>Salvar</button>
                  <button className={s.btnCancel} onClick={() => setEditPix(false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              [
                { label: 'PIX DA IGREJA',   key: pix.igreja,  desc: 'Para dízimos e ofertas gerais', id: 'ig' },
                { label: 'PIX DAS MISSÕES', key: pix.missoes, desc: 'Para arrecadações missionárias', id: 'ms' },
              ].map(p => (
                <div key={p.label} className={s.card}>
                  <p className={s.pixTitle}>{p.label}</p>
                  <p className={s.pixDesc}>{p.desc}</p>
                  <div className={s.pixValueRow}>
                    <code className={s.pixValLg}>{p.key}</code>
                    <button className={s.btnCopyLg} onClick={() => handleCopy(p.key, p.id)}>
                      📋 {copied[p.id] ? 'COPIADO!' : 'COPIAR'}
                    </button>
                  </div>
                  <p className={s.pixHint}>Toque em COPIAR e cole no seu banco</p>
                </div>
              ))
            )}
          </>
        )}

        {/* ── CRIAR ── */}
        {tab === 'criar' && canCreate && (
          <>
            <h3 className={s.sectionLabel}>NOVA CAMPANHA</h3>
            {[
              { label: 'TEMA DA CAMPANHA', key: 'theme', placeholder: 'Ex: Missão na África' },
              { label: 'VALOR DA META (R$)', key: 'goal', placeholder: '10000', type: 'number' },
              { label: 'PIX (chave)', key: 'pix', placeholder: 'Ex: missoes@igreja.com.br' },
              { label: 'DATA DE EXPIRAÇÃO', key: 'expires', type: 'date' },
            ].map(field => (
              <div key={field.key} className={s.formField}>
                <label className={s.formLabel}>{field.label}</label>
                <input className={s.formInput} type={field.type || 'text'} value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.placeholder || ''} />
              </div>
            ))}
            <div className={s.formField}>
              <label className={s.formLabel}>OBJETIVO</label>
              <textarea className={s.formTextarea} value={form.objective}
                onChange={e => setForm({ ...form, objective: e.target.value })} placeholder="Descreva o objetivo..." />
            </div>
            <button className={s.btnSubmit} onClick={createCampaign}>CRIAR CAMPANHA</button>
          </>
        )}
      </div>
    </div>
  )
}

function CampaignCard({ f, canManage, editId, editForm, setEditForm, startEdit, saveEdit, setEditId, toggleActive, handleCopy, copied }) {
  const pct = Math.min(100, Math.round((f.raised / f.goal) * 100))
  const isEditing = editId === f.id

  return (
    <div className={`${s.card} ${!f.active ? s.cardInactive : ''}`}>
      {isEditing ? (
        <div>
          <label className={s.formLabel}>TEMA</label>
          <input className={s.formInput} value={editForm.theme} onChange={e => setEditForm({ ...editForm, theme: e.target.value })} />
          <label className={s.formLabel}>META (R$)</label>
          <input className={s.formInput} type="number" value={editForm.goal} onChange={e => setEditForm({ ...editForm, goal: e.target.value })} />
          <label className={s.formLabel}>PIX</label>
          <input className={s.formInput} value={editForm.pix} onChange={e => setEditForm({ ...editForm, pix: e.target.value })} />
          <label className={s.formLabel}>EXPIRAÇÃO</label>
          <input className={s.formInput} type="date" value={editForm.expires} onChange={e => setEditForm({ ...editForm, expires: e.target.value })} />
          <label className={s.formLabel}>OBJETIVO</label>
          <textarea className={s.formTextarea} value={editForm.objective} onChange={e => setEditForm({ ...editForm, objective: e.target.value })} />
          <div className={s.formActions}>
            <button className={s.btnSave} onClick={saveEdit}>Salvar</button>
            <button className={s.btnCancel} onClick={() => setEditId(null)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <div className={s.cardTop}>
            <h4 className={s.cardTitle}>{f.theme}</h4>
            <span className={s.pct}>{pct}%</span>
          </div>
          {f.objective && <p className={s.objective}>{f.objective}</p>}
          <div className={s.progressTrack}><div className={s.progressFill} style={{ width: `${pct}%` }} /></div>
          <div className={s.statsRow}>
            <span className={s.stat}>Arrecadado: <b>R$ {f.raised.toLocaleString('pt-BR')}</b></span>
            <span className={s.stat}>Meta: <b>R$ {f.goal.toLocaleString('pt-BR')}</b></span>
          </div>
          {f.expires && <div className={s.expires}>⏱ Expira: {fmtDate(f.expires)}</div>}
          <div className={s.pixBox}>
            <p className={s.pixLabel}>PIX DESTA CAMPANHA</p>
            <div className={s.pixRow}>
              <code className={s.pixKey}>{f.pix}</code>
              <button className={s.btnCopy} onClick={() => handleCopy(f.pix, f.id)}>
                {copied[f.id] ? 'COPIADO!' : 'COPIAR'}
              </button>
            </div>
          </div>
          {canManage && (
            <div className={s.manageRow}>
              <button className={s.btnManage} onClick={() => startEdit(f)}>✏️ Editar</button>
              <button className={`${s.btnManage} ${f.active ? s.btnClose : s.btnReopen}`} onClick={() => toggleActive(f.id)}>
                {f.active ? '🔒 Encerrar' : '🔓 Reabrir'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
