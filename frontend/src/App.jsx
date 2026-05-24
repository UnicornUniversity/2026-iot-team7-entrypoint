import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Cards from './pages/Cards'
import Terminal from './pages/Terminal'
import { AuthProvider, useAuth } from './context/AuthContext'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/attendance" replace />
  return children
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to={user.role === 'admin' ? '/dashboard' : '/attendance'} replace />
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
      <div className="app-brand">Doch&#225;zkov&#225; aplikace</div>
      <nav className="app-nav">
        {user?.role === 'admin' && <NavLink to="/dashboard">Dashboard</NavLink>}
        {user?.role === 'admin' && <NavLink to="/employees">Zam&#283;stnanci</NavLink>}
        {user && <NavLink to="/attendance">Doch&#225;zka</NavLink>}
        {user?.role === 'admin' && <NavLink to="/cards">Karty</NavLink>}
        {user?.role === 'admin' && <NavLink to="/terminal">Termin&#225;l</NavLink>}
      </nav>
      {user && (
        <div className="user-chip">
          <div className="user-avatar">
            {user.name?.[0]?.toUpperCase()}{user.surname?.[0]?.toUpperCase()}
          </div>
<button className="btn-logout" onClick={handleLogout} title="Odhl&#225;sit se">&#8594;</button>
        </div>
      )}
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
            <Route path="/" element={<PublicRoute><Navigate to="/login" replace /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute adminOnly><Employees /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/cards" element={<ProtectedRoute adminOnly><Cards /></ProtectedRoute>} />
            <Route path="/terminal" element={<ProtectedRoute adminOnly><Terminal /></ProtectedRoute>} />
            <Route path="*" element={
              <div className="page-content">
                <h1>404</h1>
                <p>Str&#225;nka nenalezena.</p>
                <a href="/dashboard">&#8592; Zp&#283;t na hlavn&#237; str&#225;nku</a>
              </div>
            } />
          </Routes>
        </main>

        <footer className="app-footer">
          IoT t&#253;m 7
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