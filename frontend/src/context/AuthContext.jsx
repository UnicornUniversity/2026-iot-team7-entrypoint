import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // mock přihlášeného uživatele — později nahradíme reálným loginem
  const [user, setUser] = useState({
    id: '1',
    name: 'Test',
    role: 'admin', // 'user' nebo 'admin' pro testování uživatelského nebo admin pohledu
  })

  const login = (userData) => setUser(userData)
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// pomocný hook pro snadný přístup ke kontextu
export function useAuth() {
  return useContext(AuthContext)
}
