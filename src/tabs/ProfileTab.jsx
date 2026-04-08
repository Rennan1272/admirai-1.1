import { useRef, useState } from 'react'
import { ROLE_LABELS } from '../data/initialData.js'
import { initials, formatBirthDate } from '../utils/helpers.js'
import Logo from '../components/Logo.jsx'
import s from './ProfileTab.module.css'

const DELETE_REASONS = [
  'Não uso mais o aplicativo',
  'Prefiro outro meio de comunicação',
  'Problemas técnicos ou erros',
  'Dados pessoais ou privacidade',
  'Mudei de igreja',
  'Outro motivo',
]

export default function ProfileTab({ user, onUpdateUser, onBack, onDeleteAccount }) {
  const fileRef = useRef()
  const [showDeleteFlow, setShowDeleteFlow] = useState(false)
  const [deleteReason, setDeleteReason]     = useState('')
  const [deleteComment, setDeleteComment]   = useState('')
  const [deleteStep, setDeleteStep]         = useState(1)

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onUpdateUser({ ...user, photo: ev.target.result })
    reader.readAsDataURL(file)
  }

  const handleDeleteConfirm = () => {
    if (!deleteReason) return
    // In a real app: send feedback to backend, then anonymize/remove data per LGPD
    onDeleteAccount()
  }

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <button className={s.backBtn} onClick={onBack}>← Voltar</button>
        <span className={s.pageTitle}>MEU PERFIL</span>
      </div>

      {/* Delete account flow */}
      {showDeleteFlow && (
        <div className={s.deleteModal}>
          <div className={s.deleteCard}>
            {deleteStep === 1 && (
              <>
                <div className={s.deleteIcon}>⚠️</div>
                <h3 className={s.deleteTitle}>Excluir conta</h3>
                <p className={s.deleteDesc}>
                  Antes de prosseguir, nos conte o motivo. Seus dados serão removidos conforme a LGPD.
                </p>
                <div className={s.reasonList}>
                  {DELETE_REASONS.map(r => (
                    <button
                      key={r}
                      className={`${s.reasonBtn} ${deleteReason === r ? s.reasonSelected : ''}`}
                      onClick={() => setDeleteReason(r)}
                    >
                      {deleteReason === r && <span>✓ </span>}{r}
                    </button>
                  ))}
                </div>
                <textarea
                  className={s.deleteComment}
                  placeholder="Comentário adicional (opcional)..."
                  value={deleteComment}
                  onChange={e => setDeleteComment(e.target.value)}
                />
                <button
                  className={s.btnDeleteNext}
                  onClick={() => deleteReason && setDeleteStep(2)}
                  style={{ opacity: deleteReason ? 1 : 0.4 }}
                >
                  Continuar
                </button>
                <button className={s.btnDeleteCancel} onClick={() => setShowDeleteFlow(false)}>
                  Cancelar
                </button>
              </>
            )}
            {deleteStep === 2 && (
              <>
                <div className={s.deleteIcon}>🗑️</div>
                <h3 className={s.deleteTitle}>Tem certeza?</h3>
                <p className={s.deleteDesc}>
                  Esta ação é permanente. Sua conta e dados pessoais serão removidos do sistema.
                </p>
                <div className={s.reasonSummary}>
                  <strong>Motivo:</strong> {deleteReason}
                </div>
                <button className={s.btnDeleteConfirm} onClick={handleDeleteConfirm}>
                  Sim, excluir minha conta
                </button>
                <button className={s.btnDeleteCancel} onClick={() => setDeleteStep(1)}>
                  Voltar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Avatar */}
      <div className={s.avatarSection}>
        <div className={s.avatarWrap} onClick={() => fileRef.current.click()}>
          {user.photo
            ? <img src={user.photo} alt="foto" className={s.avatarImg} />
            : <div className={s.avatarPlaceholder}>{initials(user.name)}</div>
          }
          <div className={s.editOverlay}>📷</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        <p className={s.photoHint}>Toque para alterar a foto</p>
      </div>

      {/* Info */}
      <div className={s.card}>
        <h3 className={s.cardTitle}>INFORMAÇÕES</h3>
        <div className={s.row}><span className={s.label}>Nome</span><span className={s.value}>{user.name}</span></div>
        <div className={s.row}><span className={s.label}>Idade</span><span className={s.value}>{user.age} anos</span></div>
        <div className={s.row}><span className={s.label}>Nascimento</span><span className={s.value}>{formatBirthDate(user.birthDate)}</span></div>
        <div className={s.row}><span className={s.label}>Função</span><span className={s.value}>{ROLE_LABELS[user.role]}</span></div>
        <div className={s.row}><span className={s.label}>Setor</span><span className={s.value}>{user.sector}</span></div>
        <div className={s.row}><span className={s.label}>Usuário</span><span className={s.value}>@{user.username}</span></div>
      </div>

      {/* Member card */}
      <div className={s.memberCard}>
        <div className={s.memberCardHeader}>
          <Logo size={32} />
          <div>
            <div className={s.churchName}>ADMIRAI</div>
            <div className={s.churchSub}>CARTEIRINHA DE MEMBRO</div>
          </div>
        </div>
        <div className={s.memberCardBody}>
          <div className={s.memberCardAvatar}>
            {user.photo
              ? <img src={user.photo} alt="foto" className={s.memberCardAvatarImg} />
              : <div className={s.memberCardAvatarPlaceholder}>{initials(user.name)}</div>
            }
          </div>
          <div className={s.memberCardInfo}>
            <div className={s.memberCardName}>{user.name}</div>
            <div className={s.memberCardRole}>{ROLE_LABELS[user.role]}</div>
            <div className={s.memberCardDetail}>Setor: {user.sector}</div>
            {user.birthDate && <div className={s.memberCardDetail}>Nasc: {formatBirthDate(user.birthDate)}</div>}
          </div>
        </div>
        <div className={s.memberCardFooter}>
          <div className={s.barcode}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className={s.bar} style={{ height: i % 3 === 0 ? 28 : i % 2 === 0 ? 20 : 24 }} />
            ))}
          </div>
          <div className={s.memberId}>ID #{String(user.id).padStart(6, '0')}</div>
        </div>
      </div>

      {/* Danger zone */}
      <div className={s.dangerZone}>
        <h4 className={s.dangerTitle}>ZONA DE PERIGO</h4>
        <p className={s.dangerDesc}>A exclusão de conta remove todos os seus dados de forma permanente, conforme a LGPD.</p>
        <button className={s.btnDelete} onClick={() => { setDeleteStep(1); setShowDeleteFlow(true) }}>
          🗑️ Excluir minha conta
        </button>
      </div>
    </div>
  )
}
