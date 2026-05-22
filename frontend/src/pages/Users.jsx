import { useState, useEffect } from 'react'
import { getUsers } from '../api'
import Spinner from '../components/Spinner'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getUsers()
      .then(data => setUsers(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) return <p>Chyba: {error}</p>

  return (
    <section className="page-content">
      <div className="widget-card">
        <div className="block-header">
          <h2>U&#382;ivatel&#233;</h2>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Jm&#233;no</th>
                <th>P&#345;&#237;jmen&#237;</th>
                <th>Aktivn&#237;</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.surname}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-gray'}`}>
                      {u.is_active ? 'Ano' : 'Ne'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Users