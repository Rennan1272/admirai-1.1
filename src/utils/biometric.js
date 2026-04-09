/**
 * Admirai — Biometric Authentication Utility
 * Uses Web Authentication API (WebAuthn — W3C standard)
 *
 * On iOS Safari  → activates Face ID / Touch ID via native prompt
 * On Android Chrome → activates fingerprint / face unlock via native prompt
 * Biometric data is NEVER stored by the app — fully delegated to the OS
 */

const STORAGE_KEY   = 'admirai_bio_pref'       // only stores enabled flag + username
const CREDENTIAL_KEY = 'admirai_bio_credential' // stores public key credential id (not biometric data)

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Check if the current browser supports WebAuthn biometric auth.
 */
export function isBiometricSupported() {
  return !!(
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  )
}

/**
 * Check if a platform authenticator (Face ID / fingerprint) is actually available on this device.
 */
export async function isBiometricAvailable() {
  if (!isBiometricSupported()) return false
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

/**
 * Check if the user has previously enabled biometric for this device.
 */
export function getBiometricPreference() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) // { enabled: boolean, username: string }
  } catch {
    return null
  }
}

/**
 * Register biometric for a user.
 * This triggers the native OS biometric enrollment prompt.
 * Stores only the credential ID (public key reference) — never biometric data.
 *
 * @param {string} username
 * @returns {{ success: boolean, error?: string }}
 */
export async function registerBiometric(username) {
  if (!await isBiometricAvailable()) {
    return { success: false, error: 'Biometria não disponível neste dispositivo.' }
  }

  try {
    // Generate a random challenge (in production this comes from server)
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    // User ID derived from username (not a real user id — for demo purposes)
    const userId = new TextEncoder().encode(username)

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Admirai Igreja',
          id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
        },
        user: {
          id: userId,
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { alg: -7,   type: 'public-key' }, // ES256 — preferred
          { alg: -257, type: 'public-key' }, // RS256 — fallback
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',      // must be on-device (Face ID / fingerprint)
          userVerification: 'required',             // biometric verification is mandatory
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none', // no attestation needed for client-side demo
      },
    })

    if (!credential) return { success: false, error: 'Autenticação cancelada.' }

    // Store only the credential ID (a public reference, not biometric data)
    const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: true, username }))
    localStorage.setItem(CREDENTIAL_KEY, credentialId)

    return { success: true }
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Autenticação cancelada pelo usuário.' }
    }
    if (err.name === 'InvalidStateError') {
      return { success: false, error: 'Biometria já cadastrada para este dispositivo.' }
    }
    if (err.name === 'NotSupportedError') {
      return { success: false, error: 'Seu dispositivo não suporta autenticação biométrica.' }
    }
    return { success: false, error: 'Erro ao configurar biometria. Tente novamente.' }
  }
}

/**
 * Authenticate using biometric (triggers native Face ID / fingerprint prompt).
 * @returns {{ success: boolean, error?: string }}
 */
export async function authenticateWithBiometric() {
  if (!await isBiometricAvailable()) {
    return { success: false, error: 'Biometria não disponível neste dispositivo.' }
  }

  const pref = getBiometricPreference()
  if (!pref?.enabled) {
    return { success: false, error: 'Biometria não está ativada.' }
  }

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32))

    // Build allowCredentials if we have the stored credential ID
    const allowCredentials = []
    const storedCredId = localStorage.getItem(CREDENTIAL_KEY)
    if (storedCredId) {
      const rawId = Uint8Array.from(atob(storedCredId), c => c.charCodeAt(0))
      allowCredentials.push({ id: rawId, type: 'public-key' })
    }

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        userVerification: 'required', // forces biometric check
        allowCredentials,
        timeout: 60000,
      },
    })

    if (!assertion) return { success: false, error: 'Autenticação cancelada.' }

    // In production: send assertion to server for signature verification
    // Here we trust the OS verification (platform authenticator guarantees user verified)
    return { success: true, username: pref.username }
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Autenticação cancelada ou Face ID negado.' }
    }
    if (err.name === 'SecurityError') {
      return { success: false, error: 'Erro de segurança. Verifique as configurações do dispositivo.' }
    }
    return { success: false, error: 'Falha na autenticação biométrica. Use sua senha.' }
  }
}

/**
 * Disable biometric — clears all stored preferences.
 * Called when: user disables manually, biometric removed from device, etc.
 */
export function disableBiometric() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(CREDENTIAL_KEY)
}

/**
 * Detect the biometric type available on the device for display purposes.
 * @returns {'faceid' | 'fingerprint' | 'biometric' | 'none'}
 */
export function detectBiometricType() {
  if (!isBiometricSupported()) return 'none'
  const ua = navigator.userAgent.toLowerCase()
  // iOS devices — Face ID on iPhone X+, Touch ID on older
  if (/iphone|ipad/.test(ua)) {
    // Rough detection: iPhone X and later have Face ID
    const match = ua.match(/iphone os (\d+)_/)
    const version = match ? parseInt(match[1]) : 0
    return version >= 11 ? 'faceid' : 'fingerprint'
  }
  // Android
  if (/android/.test(ua)) return 'fingerprint'
  // Mac with Touch ID
  if (/macintosh/.test(ua)) return 'fingerprint'
  return 'biometric'
}

export const BIOMETRIC_LABELS = {
  faceid:      { name: 'Face ID',           icon: '🔐', desc: 'Reconhecimento facial' },
  fingerprint: { name: 'Impressão Digital', icon: '👆', desc: 'Sensor biométrico' },
  biometric:   { name: 'Biometria',         icon: '🔒', desc: 'Autenticação biométrica' },
  none:        { name: 'Biometria',         icon: '🔒', desc: 'Não disponível' },
}
