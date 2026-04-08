import { useState } from 'react'
import { ROLE_LABELS } from '../data/initialData.js'
import { initials, formatBirthDate, isBirthdayToday } from '../utils/helpers.js'
import s from './AdminTab.module.css'

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).filter(([k]) => k !== 'pastor')

export default function AdminTab({ users, setUsers }) {
  const [tab, setTab]       = useState('membros')
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm]     = useState({
    name: '', age: '', role: 'membro', username: '',
    password: '', sector: '', birthDate: '',
  })

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  const register = () => {
    if (!form.name || !form.username || !form.password) return
    const newUser = { id: Date.now(), ...form, age: parseInt(form.age) || 0, photo: null }
    setUsers(prev => [...prev, newUser])
    setForm({ name: '', age: '', role: 'membro', username: '', password: '', sector: '', birthDate: '' })
    setSuccess(`Membro "${newUser.name}" cadastrado! Login: @${newUser.username}`)
    setTimeout(() => setSuccess(''), 4000)
    setTab('membros')
  }

  return (
    <div className={s.wrap}>
      <div className={s.tabBar}>
        {[['membros', '👥 Membros'], ['cadastrar', '➕ Cadastrar']].map(([k, l]) => (
          <button key={k} className={`${s.tabBtn} ${tab === k ? s.active : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div className={s.content}>

        {/* Members list */}
        {tab === 'membros' && (
          <>
            {success && <div className={s.successMsg}>✅ {success}</div>}
            <input className={s.search} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Buscar membro..." />
            {filtered.map(u => (
              <div key={u.id} className={s.memberRow}>
                <div className={s.avatarWrap}>
                  {u.photo
                    ? <img src={u.photo} className={s.avatarImg} alt="foto" />
                    : <div className={s.avatar}>{initials(u.name)}</div>
                  }
                  {isBirthdayToday(u.birthDate) && <span className={s.bdBadge}>🎂</span>}
                </div>
                <div className={s.memberInfo}>
                  <span className={s.memberName}>{u.name} {isBirthdayToday(u.birthDate) ? '🎉' : ''}</span>
                  <span className={s.memberMeta}>@{u.username} · {u.age} anos · {u.sector}</span>
                  {u.birthDate && <span className={s.memberBd}>Nasc: {formatBirthDate(u.birthDate)}</span>}
                </div>
                <span className={s.roleBadge}>{ROLE_LABELS[u.role]}</span>
              </div>
            ))}
          </>
        )}

        {/* Register form */}
        {tab === 'cadastrar' && (
          <>
            <h3 className={s.sectionLabel}>NOVO MEMBRO</h3>
            {[
              { label: 'NOME COMPLETO',      key: 'name',      placeholder: 'Nome do membro' },
              { label: 'IDADE',              key: 'age',       placeholder: 'Idade', type: 'number' },
              { label: 'DATA DE NASCIMENTO', key: 'birthDate', type: 'date' },
              { label: 'USUÁRIO (login)',    key: 'username',  placeholder: 'usuario123' },
              { label: 'SENHA',             key: 'password',  placeholder: 'Senha inicial', type: 'password' },
              { label: 'SETOR',             key: 'sector',    placeholder: 'Ex: Conjunto, Obreiros...' },
            ].map(f => (
              <div key={f.key} className={s.formField}>
                <label className={s.formLabel}>{f.label}</label>
                <input className={s.formInput} type={f.type || 'text'} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder || ''} />
              </div>
            ))}
            <div className={s.formField}>
              <label className={s.formLabel}>FUNÇÃO</label>
              <select className={s.formInput} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLE_OPTIONS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <button className={s.btnSubmit} onClick={register}>CADASTRAR MEMBRO</button>
          </>
        )}
      </div>
    </div>
  )
}
