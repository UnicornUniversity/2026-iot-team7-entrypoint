import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    // Tento login je zatím jen ukázkový.
    navigate('/dashboard')
  }

  return (
    <section className="page-content">
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Uživatelské jméno
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Zadej uživatelské jméno"
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
        <button type="submit">Přihlásit</button>
      </form>
    </section>
  )
}

export default Login
