import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Přihlášení se nezdařilo')
    }
  }

  return (
    <div className="login-page">
      <section className="page-content">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Přihlášení</h2>
          {error && <p style={{ color: '#ef4444', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
          <label>
            Uživatelské jméno
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Zadej jméno"
              required
            />
          </label>
          <label>
            Heslo
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Zadej heslo"
              required
            />
          </label>
          <button type="submit" style={{ marginTop: '12px' }}>Přihlásit se</button>
        </form>
      </section>
    </div>
  )
}

export default Login
