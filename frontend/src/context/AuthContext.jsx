import { createContext, useContext, useState } from 'react'
import { getUserById, logout as logoutApi } from '../api'

const AuthContext = createContext(null)

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
    setUser({ ...userData, role: 'admin' })
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