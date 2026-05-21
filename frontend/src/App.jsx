import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Cards from './pages/Cards'
import { AuthProvider, useAuth } from './context/AuthContext'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/attendance" replace />
  return children
}

function AppHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="app-header">
      <div className="app-brand">Docházková aplikace</div>
      <nav className="app-nav">
        {user?.role === 'admin' && <NavLink to="/dashboard">Dashboard</NavLink>}
        {user?.role === 'admin' && <NavLink to="/employees">Zaměstnanci</NavLink>}
        <NavLink to="/attendance">Docházka</NavLink>
      </nav>
      <button className="btn-logout" onClick={handleLogout}>Odhlásit se</button>
    </header>
  )
}

function AppLayout() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppHeader />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute adminOnly><Employees /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
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
