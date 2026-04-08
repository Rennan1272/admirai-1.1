import { useState, useEffect } from 'react'
import { ROLE_LABELS } from '../data/initialData.js'
import Logo from './Logo.jsx'
import s from './LoginScreen.module.css'

const BIOMETRIC_KEY = 'admirai_biometric_user'

export default function LoginScreen({ users, onLogin }) {
  const [username, setUsername]       = useState('')
  const [password, setPassword]       = useState('')
  const [error, setError]             = useState('')
  const [showDemo, setShowDemo]       = useState(false)
  const [showBioPrompt, setShowBioPrompt] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)
  const [bioEnabled, setBioEnabled]   = useState(false)
  const [bioUser, setBioUser]         = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BIOMETRIC_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setBioEnabled(true)
        setBioUser(parsed)
      }
    } catch (_) {}
  }, [])

  const handleLogin = () => {
    // FIX: trim and lowercase, compare against live users list
    const found = users.find(
      u => u.username === username.toLowerCase().trim() && u.password === password.trim()
    )
    if (found) {
      setError('')
      // Offer biometric after first login
      setPendingUser(found)
      if (!bioEnabled) {
        setShowBioPrompt(true)
      } else {
        onLogin(found)
      }
    } else {
      setError('Usuário ou senha incorretos')
    }
  }

  const enableBiometric = () => {
    try {
      localStorage.setItem(BIOMETRIC_KEY, JSON.stringify({ username: pendingUser.username }))
    } catch (_) {}
    setBioEnabled(true)
    setBioUser({ username: pendingUser.username })
    setShowBioPrompt(false)
    onLogin(pendingUser)
  }

  const skipBiometric = () => {
    setShowBioPrompt(false)
    onLogin(pendingUser)
  }

  const handleBiometricLogin = () => {
    // Simulate Face ID — in a native app this calls LocalAuthentication/BiometricPrompt
    const found = users.find(u => u.username === bioUser.username)
    if (found) {
      // Simulate biometric dialog
      const ok = window.confirm('Face ID — Confirmar identidade?\n(Simulação: clique OK para autenticar)')
      if (ok) onLogin(found)
    } else {
      setBioEnabled(false)
      setBioUser(null)
      localStorage.removeItem(BIOMETRIC_KEY)
      setError('Sessão biométrica expirada. Faça login novamente.')
    }
  }

  const disableBiometric = () => {
    localStorage.removeItem(BIOMETRIC_KEY)
    setBioEnabled(false)
    setBioUser(null)
  }

  return (
    <div className={s.wrap}>
      <div className={s.logoBox}>
        <Logo size={80} />
        <h1 className={s.brand}>ADMIRAI</h1>
        <p className={s.brandSub}>SISTEMA DA IGREJA</p>
      </div>

      {/* Biometric prompt after login */}
      {showBioPrompt && (
        <div className={s.bioModal}>
          <div className={s.bioCard}>
            <div className={s.bioIcon}>🔐</div>
            <h3 className={s.bioTitle}>Ativar Face ID?</h3>
            <p className={s.bioDesc}>Use reconhecimento facial para entrar rapidamente nos próximos acessos.</p>
            <button className={s.btnBioEnable} onClick={enableBiometric}>Ativar Face ID</button>
            <button className={s.btnBioSkip} onClick={skipBiometric}>Agora não</button>
          </div>
        </div>
      )}

      <div className={s.card}>
        <h2 className={s.cardTitle}>Entrar</h2>

        {/* Biometric quick access */}
        {bioEnabled && bioUser && (
          <button className={s.btnBioLogin} onClick={handleBiometricLogin}>
            <span style={{ fontSize: 22 }}>🔐</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Entrar com Face ID</div>
              <div style={{ fontSize: 10, color: '#888' }}>@{bioUser.username}</div>
            </div>
          </button>
        )}

        <div className={s.field}>
          <label>USUÁRIO</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Digite seu usuário"
          />
        </div>

        <div className={s.field}>
          <label>SENHA</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Digite sua senha"
          />
        </div>

        {error && <p className={s.error}>{error}</p>}

        <button className={s.btnLogin} onClick={handleLogin}>ACESSAR</button>

        {bioEnabled && (
          <button className={s.btnDisableBio} onClick={disableBiometric}>
            Desativar Face ID
          </button>
        )}

        <button className={s.btnDemo} onClick={() => setShowDemo(!showDemo)}>
          {showDemo ? 'Ocultar usuários demo' : 'Ver usuários demo'}
        </button>
      </div>

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
