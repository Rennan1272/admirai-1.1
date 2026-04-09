import { useState, useEffect } from 'react'
import { ROLE_LABELS } from '../data/initialData.js'
import Logo from './Logo.jsx'
import BiometricSetup from './BiometricSetup.jsx'
import {
  isBiometricAvailable,
  getBiometricPreference,
  authenticateWithBiometric,
  disableBiometric,
  detectBiometricType,
  BIOMETRIC_LABELS,
} from '../utils/biometric.js'
import s from './LoginScreen.module.css'

export default function LoginScreen({ users, onLogin }) {
  const [username, setUsername]           = useState('')
  const [password, setPassword]           = useState('')
  const [error, setError]                 = useState('')
  const [showDemo, setShowDemo]           = useState(false)

  // Biometric state
  const [bioAvailable, setBioAvailable]   = useState(false)
  const [bioPreference, setBioPref]       = useState(null)
  const [bioLoading, setBioLoading]       = useState(false)
  const [bioError, setBioError]           = useState('')
  const [showBioSetup, setShowBioSetup]   = useState(false)
  const [pendingUser, setPendingUser]     = useState(null)

  const bioType   = detectBiometricType()
  const bioLabels = BIOMETRIC_LABELS[bioType]

  // On mount: check device biometric support + user preference
  useEffect(() => {
    isBiometricAvailable().then(available => {
      setBioAvailable(available)
      if (available) setBioPref(getBiometricPreference())
    })
  }, [])

  // ── Password login ──────────────────────────────────────────────────────────
  const handlePasswordLogin = () => {
    setError('')
    setBioError('')

    const found = users.find(
      u => u.username === username.toLowerCase().trim() && u.password === password.trim()
    )

    if (!found) {
      setError('Usuário ou senha incorretos.')
      return
    }

    // Check if we should offer biometric setup
    const pref = getBiometricPreference()
    if (bioAvailable && !pref?.enabled) {
      // Offer biometric setup before proceeding
      setPendingUser(found)
      setShowBioSetup(true)
    } else {
      onLogin(found)
    }
  }

  // ── Biometric login ─────────────────────────────────────────────────────────
  const handleBiometricLogin = async () => {
    setBioError('')
    setBioLoading(true)

    const result = await authenticateWithBiometric()
    setBioLoading(false)

    if (result.success) {
      // Find user from stored username
      const found = users.find(u => u.username === result.username)
      if (found) {
        onLogin(found)
      } else {
        // User was deleted or doesn't exist anymore
        disableBiometric()
        setBioPref(null)
        setBioError('Sessão expirada. Faça login com sua senha.')
      }
    } else {
      setBioError(result.error || 'Falha na autenticação. Use sua senha.')
    }
  }

  // ── After biometric setup resolves ─────────────────────────────────────────
  const handleBioSetupDone = (enabled) => {
    setShowBioSetup(false)
    if (enabled) setBioPref(getBiometricPreference())
    onLogin(pendingUser)
    setPendingUser(null)
  }

  const hasBioSession = bioAvailable && bioPreference?.enabled

  return (
    <div className={s.wrap}>
      {/* Biometric setup sheet */}
      {showBioSetup && pendingUser && (
        <BiometricSetup
          username={pendingUser.username}
          onDone={handleBioSetupDone}
        />
      )}

      {/* Logo */}
      <div className={s.logoBox}>
        <Logo size={80} />
        <h1 className={s.brand}>ADMIRAI</h1>
        <p className={s.brandSub}>SISTEMA DA IGREJA</p>
      </div>

      <div className={s.card}>
        <h2 className={s.cardTitle}>Entrar</h2>

        {/* ── Biometric quick entry (shown when user has it enabled) ── */}
        {hasBioSession && (
          <div className={s.bioSection}>
            <button
              className={s.btnBiometric}
              onClick={handleBiometricLogin}
              disabled={bioLoading}
            >
              {bioLoading
                ? <span className={s.bioSpinner} />
                : <span className={s.bioIcon}>{bioLabels.icon}</span>
              }
              <div className={s.bioText}>
                <span className={s.bioLabel}>
                  {bioLoading ? 'Aguardando…' : `Entrar com ${bioLabels.name}`}
                </span>
                <span className={s.bioSub}>
                  @{bioPreference.username}
                </span>
              </div>
            </button>

            {bioError && <p className={s.bioError}>{bioError}</p>}

            <div className={s.divider}>
              <span className={s.dividerLine} />
              <span className={s.dividerText}>ou entre com senha</span>
              <span className={s.dividerLine} />
            </div>
          </div>
        )}

        {/* ── Password form ── */}
        <div className={s.field}>
          <label>USUÁRIO</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
            placeholder="Digite seu usuário"
            autoComplete="username"
          />
        </div>

        <div className={s.field}>
          <label>SENHA</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
            placeholder="Digite sua senha"
            autoComplete="current-password"
          />
        </div>

        {error && <p className={s.error}>{error}</p>}

        <button className={s.btnLogin} onClick={handlePasswordLogin}>ACESSAR</button>

        {/* Disable biometric link */}
        {hasBioSession && (
          <button
            className={s.btnDisableBio}
            onClick={() => { disableBiometric(); setBioPref(null); setBioError('') }}
          >
            Desativar {bioLabels.name}
          </button>
        )}

        <button className={s.btnDemo} onClick={() => setShowDemo(!showDemo)}>
          {showDemo ? 'Ocultar usuários demo' : 'Ver usuários demo'}
        </button>
      </div>

      {/* Demo users */}
      {showDemo && (
        <div className={s.demoPanel}>
          <p className={s.demoHeader}>USUÁRIOS DE DEMONSTRAÇÃO (senha: 123)</p>
          {users.map(u => (
            <button
              key={u.id}
              className={s.demoItem}
              onClick={() => { setUsername(u.username); setPassword('123') }}
            >
              <span className={s.demoName}>{u.name}</span>
              <span className={s.demoRole}>{ROLE_LABELS[u.role]}</span>
              <span className={s.demoUser}>@{u.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
