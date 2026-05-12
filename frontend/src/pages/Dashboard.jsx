import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAttendance, getUsers } from '../api'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentlyIn, setCurrentlyIn] = useState([])
  const [recentRecords, setRecentRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getUsers(), getAttendance()])
      .then(([users, records]) => {
        const userMap = {}
        users.forEach(u => {
          userMap[u.id] = { fullName: `${u.name} ${u.surname}`, id: u.id }
        })

        const sorted = [...records].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )

        setRecentRecords(
          sorted.slice(0, 6).map(r => ({
            ...r,
            fullName: userMap[r.user_id]?.fullName || 'Neznámý',
          }))
        )

        const lastByUser = {}
        sorted.forEach(r => {
          if (!lastByUser[r.user_id]) lastByUser[r.user_id] = r
        })

        setCurrentlyIn(
          Object.values(lastByUser)
            .filter(r => r.direction === 'in' && r.success)
            .map(r => ({
              ...r,
              fullName: userMap[r.user_id]?.fullName || 'Neznámý',
            }))
        )
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Načítám...</p>
  if (error) return <p>Chyba: {error}</p>

  return (
    <section className="page-content">
      {/* Blok 1 — kdo je aktuálně v práci */}
      <div className="attendance-block">
        <div className="block-header">
          <h2>Aktuálně v práci</h2>
          <span className="dashboard-count">{currentlyIn.length}</span>
        </div>
        {currentlyIn.length === 0 ? (
          <p className="evidence-empty">Nikdo není aktuálně v práci.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Zaměstnanec</th>
                <th>Příchod od</th>
              </tr>
            </thead>
            <tbody>
              {currentlyIn.map(r => (
                <tr key={r.user_id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/employees?search=${encodeURIComponent(r.fullName)}`)}>
                  <td>{r.fullName}</td>
                  <td>{new Date(r.timestamp).toLocaleString('cs-CZ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Blok 2 — poslední záznamy průchodů */}
      <div className="attendance-block">
        <div className="block-header">
          <h2>Poslední záznamy</h2>
        </div>
        {recentRecords.length === 0 ? (
          <p className="evidence-empty">Žádné záznamy.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Datum a čas</th>
                <th>Zaměstnanec</th>
                <th>Směr</th>
                <th>Karta</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.timestamp).toLocaleString('cs-CZ')}</td>
                  <td>{r.fullName}</td>
                  <td>{r.direction === 'in' ? 'Příchod' : 'Odchod'}</td>
                  <td>{r.card_uid || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default Dashboard