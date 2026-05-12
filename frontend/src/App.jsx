import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Cards from './pages/Cards'
import { AuthProvider, useAuth } from './context/AuthContext'

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
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppHeader />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={user?.role === 'admin' ? <Dashboard /> : <Navigate to="/attendance" replace />} />
            <Route path="/employees" element={user?.role === 'admin' ? <Employees /> : <Navigate to="/attendance" replace />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/cards" element={<Cards />} />
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
