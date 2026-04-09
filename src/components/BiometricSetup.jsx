import { useState } from 'react'
import { registerBiometric, detectBiometricType, BIOMETRIC_LABELS } from '../utils/biometric.js'
import s from './BiometricSetup.module.css'

/**
 * Shown after the user logs in for the first time (or with password after bio is off).
 * Asks if they want to enable biometric — mimics the pattern used by banking apps.
 */
export default function BiometricSetup({ username, onDone }) {
  const [step, setStep]       = useState('prompt')   // 'prompt' | 'consent' | 'registering' | 'success' | 'error' | 'unsupported'
  const [errorMsg, setErrorMsg] = useState('')

  const type   = detectBiometricType()
  const labels = BIOMETRIC_LABELS[type]

  const handleEnable = () => setStep('consent')

  const handleAcceptConsent = async () => {
    setStep('registering')
    const result = await registerBiometric(username)
    if (result.success) {
      setStep('success')
    } else {
      if (result.error?.includes('disponível') || result.error?.includes('suporta')) {
        setStep('unsupported')
      } else {
        setErrorMsg(result.error || 'Erro desconhecido.')
        setStep('error')
      }
    }
  }

  return (
    <div className={s.overlay}>
      <div className={s.sheet}>

        {/* ── INITIAL PROMPT ── */}
        {step === 'prompt' && (
          <>
            <div className={s.icon}>{labels.icon}</div>
            <h2 className={s.title}>Ativar {labels.name}?</h2>
            <p className={s.desc}>
              Entre no app de forma rápida e segura usando {labels.desc} do seu dispositivo.
              Seus dados biométricos <strong>não são armazenados</strong> pelo Admirai —
              a verificação é feita inteiramente pelo sistema do seu {type === 'faceid' ? 'iPhone' : 'dispositivo'}.
            </p>
            <button className={s.btnPrimary} onClick={handleEnable}>
              Ativar {labels.name}
            </button>
            <button className={s.btnSecondary} onClick={() => onDone(false)}>
              Agora não
            </button>
          </>
        )}

        {/* ── CONSENT ── */}
        {step === 'consent' && (
          <>
            <div className={s.icon}>📋</div>
            <h2 className={s.title}>Antes de ativar</h2>
            <div className={s.consentList}>
              {[
                { icon: '✅', text: `Seus dados biométricos não são coletados nem armazenados pelo Admirai` },
                { icon: '✅', text: `A autenticação é validada pelo ${type === 'faceid' ? 'Face ID da Apple' : 'sistema Android'}, não pelo app` },
                { icon: '✅', text: `Você pode desativar a qualquer momento nas configurações de perfil` },
                { icon: '✅', text: `Em caso de falha, o login por senha sempre estará disponível` },
              ].map((item, i) => (
                <div key={i} className={s.consentItem}>
                  <span className={s.consentIcon}>{item.icon}</span>
                  <span className={s.consentText}>{item.text}</span>
                </div>
              ))}
            </div>
            <button className={s.btnPrimary} onClick={handleAcceptConsent}>
              Entendi e aceito — Ativar {labels.name}
            </button>
            <button className={s.btnSecondary} onClick={() => setStep('prompt')}>
              Voltar
            </button>
          </>
        )}

        {/* ── REGISTERING ── */}
        {step === 'registering' && (
          <>
            <div className={s.icon}>{labels.icon}</div>
            <h2 className={s.title}>Aguardando {labels.name}…</h2>
            <p className={s.desc}>
              Siga as instruções do seu dispositivo para confirmar sua identidade.
            </p>
            <div className={s.spinner} />
          </>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <>
            <div className={s.icon}>✅</div>
            <h2 className={s.title}>{labels.name} ativado!</h2>
            <p className={s.desc}>
              No próximo acesso, você poderá entrar automaticamente usando {labels.desc}.
            </p>
            <button className={s.btnPrimary} onClick={() => onDone(true)}>
              Continuar
            </button>
          </>
        )}

        {/* ── ERROR ── */}
        {step === 'error' && (
          <>
            <div className={s.icon}>⚠️</div>
            <h2 className={s.title}>Não foi possível ativar</h2>
            <p className={s.desc}>{errorMsg}</p>
            <button className={s.btnPrimary} onClick={() => setStep('prompt')}>
              Tentar novamente
            </button>
            <button className={s.btnSecondary} onClick={() => onDone(false)}>
              Usar senha
            </button>
          </>
        )}

        {/* ── UNSUPPORTED ── */}
        {step === 'unsupported' && (
          <>
            <div className={s.icon}>ℹ️</div>
            <h2 className={s.title}>Não suportado</h2>
            <p className={s.desc}>
              Este dispositivo ou navegador não suporta autenticação biométrica.
              No iPhone, use Safari. No Android, use Chrome.
            </p>
            <button className={s.btnPrimary} onClick={() => onDone(false)}>
              Continuar com senha
            </button>
          </>
        )}

      </div>
    </div>
  )
}
