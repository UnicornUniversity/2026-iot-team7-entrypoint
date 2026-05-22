import { createContext, useContext, useState, useEffect } from 'react'
import { getUserById, logout as logoutApi } from '../api'
import { ROLE_IDS } from '../constants'

const AuthContext = createContext(null)

const ROLE_NAMES = Object.fromEntries(Object.entries(ROLE_IDS).map(([name, id]) => [id, name]))

function decodeJwt(token) {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setInitializing(false); return }
    try {
      const { sub: userId } = decodeJwt(token)
      getUserById(userId)
        .then(userData => {
          const role = ROLE_NAMES[userData.role_id] || 'employee'
          setUser({ ...userData, role })
        })
        .catch(() => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        })
        .finally(() => setInitializing(false))
    } catch {
      setInitializing(false)
    }
  }, [])

  const login = async (tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    const { sub: userId } = decodeJwt(tokens.accessToken)
    const userData = await getUserById(userId)
    const role = ROLE_NAMES[userData.role_id] || 'employee'
    setUser({ ...userData, role })
  }

  const logout = async () => {
    await logoutApi()
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  if (initializing) return null

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}