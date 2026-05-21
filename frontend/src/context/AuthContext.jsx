import { createContext, useContext, useState } from 'react'
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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}