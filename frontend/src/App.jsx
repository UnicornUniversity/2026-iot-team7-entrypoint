import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import AppLogo from './components/AppLogo'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Devices from './pages/Devices'
import { AuthProvider, useAuth } from './context/AuthContext'
import ChangePasswordModal from './components/ChangePasswordModal'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return null

  if (!user?.id) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/attendance" replace />
  }

  return children
}

function AppHeader() {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <header className="app-header">
      <div className="app-brand">
        <AppLogo />
        <span>Docházková aplikace</span>
      </div>
      {user?.id && (
        <nav className="app-nav">
          {user.role === 'admin' && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user.role === 'admin' && <NavLink to="/employees">Zaměstnanci</NavLink>}
          <NavLink to="/attendance">Docházka</NavLink>
          {user.role === 'admin' && <NavLink to="/devices">Zařízení</NavLink>}
        </nav>
      )}
    </header>
  )
}

function UserInfoBar() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  if (loading || !user?.id) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="user-info-bar">
      <span style={{ marginRight: 'auto' }}>
        Přihlášen: <strong>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</strong>
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn-secondary" onClick={() => setShowPasswordModal(true)}>
          Změnit heslo
        </button>
        <button className="btn-secondary" onClick={handleLogout} style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}>
          Odhlásit se
        </button>
      </div>
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  )
}

function AppLayout() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppHeader />
        <UserInfoBar />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/employees" element={
              <ProtectedRoute adminOnly>
                <Employees />
              </ProtectedRoute>
            } />
            
            <Route path="/attendance" element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            } />

            <Route path="/devices" element={
              <ProtectedRoute adminOnly>
                <Devices />
              </ProtectedRoute>
            } />

            <Route path="*" element={<div className="page-content"><h1>404</h1><p>Stránka nenalezena.</p></div>} />
          </Routes>
        </main>

        <footer className="app-footer">
          IoT tým 7
        </footer>
      </div>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  )
}

export default App
