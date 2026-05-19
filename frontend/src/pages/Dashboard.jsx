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
    // Both return { data, total } now
    Promise.all([
      getUsers({ limit: 1000 }), // Fetch all users for mapping
      getAttendance({ limit: 6 }) 
    ])
      .then(([usersRes, recordsRes]) => {
        const users = usersRes.data
        const records = recordsRes.data

        const userMap = {}
        users.forEach(u => {
          userMap[u.id] = { fullName: `${u.firstName} ${u.lastName}`, id: u.id, cardID: u.cardID }
        })

        setRecentRecords(
          records.map(r => ({
            ...r,
            fullName: r.user ? (userMap[r.user.id]?.fullName || 'Systém') : 'Neznámá karta',
            displayCardID: r.user ? (userMap[r.user.id]?.cardID || '—') : (r.cardID || '—')
          }))
        )

        // For "currently in", we fetch all today's records
        const today = new Date().toISOString().slice(0, 10)
        return getAttendance({ dateFrom: `${today}T00:00:00Z`, limit: 1000 }).then(todayRes => {
            const todayRecords = todayRes.data
            const lastByUser = {}
            // records are sorted DESC by server
            todayRecords.forEach(r => {
                if (r.user && !lastByUser[r.user.id]) lastByUser[r.user.id] = r
            })

            setCurrentlyIn(
                Object.values(lastByUser)
                    .filter(r => r.type === 'arrival')
                    .map(r => ({
                        ...r,
                        fullName: userMap[r.user.id]?.fullName || 'Systém',
                    }))
            )
        })
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
                <tr key={r.user.id}
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
              {recentRecords.map(r => {
                const isInvalid = !r.user;
                return (
                  <tr key={r.id}>
                    <td>{new Date(r.timestamp).toLocaleString('cs-CZ')}</td>
                    <td style={{ color: isInvalid ? '#ef4444' : 'inherit', fontWeight: isInvalid ? '600' : 'normal' }}>
                      {r.fullName}
                    </td>
                    <td>{r.type === 'arrival' ? 'Příchod' : 'Odchod'}</td>
                    <td>{r.displayCardID}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default Dashboard
