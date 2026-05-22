import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api'
import { TOKEN_KEY } from '@/services/http'

const USER_KEY = 'tablo.user'

// Decodifica el payload de un JWT sin validarlo (solo para mostrar datos del
// usuario en la UI). La verificación real la hace el backend.
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Estado inicial rehidratado desde localStorage (persistencia entre recargas).
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => !!token.value)

  function setSession(newToken) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)

    const claims = decodeJwt(newToken)
    user.value = {
      email: claims?.email || claims?.sub || '',
      ...claims,
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
  }

  async function login(email) {
    loading.value = true
    error.value = ''
    try {
      const data = await authApi.login(email)
      // FastAPI suele devolver { access_token, token_type }; toleramos `token`.
      const jwt = data.access_token || data.token
      if (!jwt) throw new Error('La respuesta del servidor no incluyó un token.')
      setSession(jwt)
      return true
    } catch (e) {
      error.value =
        e.response?.data?.detail || e.message || 'No se pudo iniciar sesión.'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, user, loading, error, isAuthenticated, login, logout }
})
