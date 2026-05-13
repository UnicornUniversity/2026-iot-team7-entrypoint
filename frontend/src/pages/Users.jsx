import { useState, useEffect } from 'react'
import { getUsers } from '../api'

function Users() {
  const [users, setUsers] = useState([])       // seznam uživatelů
  const [loading, setLoading] = useState(true) // probíhá načítání?
  const [error, setError] = useState(null)     // chybová zpráva

  useEffect(() => {
    // spustí se při otevření stránky
    getUsers()
      .then(data => setUsers(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Načítám...</p>
  if (error) return <p>Chyba: {error}</p>

  return (
    <section className="page-content">
      <h1>Uživatelé</h1>
      <table>
        <thead>
          <tr>
            <th>Jméno</th>
            <th>Příjmení</th>
            <th>Aktivní</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.surname}</td>
              <td>{user.is_active ? 'Ano' : 'Ne'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default Users
