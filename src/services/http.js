import axios from 'axios'

// Clave bajo la que persistimos el token en localStorage.
// Se mantiene aquí para evitar dependencias circulares con el store de Pinia.
export const TOKEN_KEY = 'tablo.token'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// --- Interceptor de petición -------------------------------------------------
// Inyecta el JWT en el header Authorization de CADA petición saliente.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Interceptor de respuesta ------------------------------------------------
// Si el backend responde 401 (token expirado/ inválido) limpiamos la sesión
// y mandamos al login. La importación dinámica del store evita el ciclo
// http -> store -> http en tiempo de carga.
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { useAuthStore } = await import('@/stores/auth')
      const auth = useAuthStore()
      auth.logout()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export default http
