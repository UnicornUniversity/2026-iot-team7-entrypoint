import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi } from '../api'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await loginApi(email, password)
      await login({ accessToken: data.accessToken, refreshToken: data.refreshToken })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: 'min(420px, calc(100% - 32px))' }}>
      <div className="login-card" style={{ width: '100%' }}>
        <h1 style={{ marginBottom: '28px' }}>P&#345;&#237;hl&#225;&#353;en&#237;</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.cz"
              autoFocus
            />
          </label>
          <label>
            Heslo
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Zadej heslo"
            />
          </label>
          {error && <p style={{ color: '#dc2626', margin: 0, fontSize: '0.9rem' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ alignSelf: 'flex-end' }}>
            {loading ? 'Přihlašuji...' : 'Přihlásit se'}
          </button>
        </form>
      </div>
      <p style={{ color: '#94a3b8', fontSize: '0.83rem', textAlign: 'center', margin: 0 }}>
        V případě problémů s přihlášením kontaktujte svého administrátora.
      </p>
      </div>
    </div>
  )
}

export default Login