import Spinner from '../components/Spinner'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAttendance, getUsers, getAllCards, getDevices } from '../api'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentlyIn, setCurrentlyIn] = useState([])
  const [recentRecords, setRecentRecords] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getUsers(), getAttendance(), getAllCards(), getDevices()])
      .then(([users, records, cards, devicesData]) => {
        setDevices(devicesData)
        const userMap = {}
        users.forEach(u => {
          userMap[u.id] = { fullName: `${u.name} ${u.surname}`, id: u.id }
        })

        const cardMap = {}
        cards.forEach(c => { if (c.is_active && c.user_id) cardMap[c.user_id] = c.card_uid })

        const sorted = [...records].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )

        setRecentRecords(
          sorted.slice(0, 6).map(r => ({
            ...r,
            fullName: userMap[r.user_id]?.fullName || 'Neznámý',
            cardUid: cardMap[r.user_id] || '—',
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

  if (loading) return <Spinner />
  if (error) return <p>Chyba: {error}</p>

  return (
    <section className="page-content">
      {/* Blok 1 — kdo je aktuálně v práci */}
      <div className="widget-card">
        <div className="block-header">
          <h2>Aktuálně v práci</h2>
          <span className="dashboard-count">{currentlyIn.length}</span>
        </div>
        {currentlyIn.length === 0 ? (
          <p className="evidence-empty">Nikdo není aktuálně v práci.</p>
        ) : (
          <div className="table-scroll">
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
          </div>
        )}
      </div>

      {/* Blok 2 — poslední záznamy průchodů */}
      <div className="widget-card">
        <div className="block-header">
          <h2>Poslední záznamy</h2>
        </div>
        {recentRecords.length === 0 ? (
          <p className="evidence-empty">Žádné záznamy.</p>
        ) : (
          <div className="table-scroll">
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
                    <td><span className={`badge ${r.direction === 'in' ? 'badge-green' : 'badge-gray'}`}>{r.direction === 'in' ? 'Příchod' : 'Odchod'}</span></td>
                    <td>{r.cardUid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blok 3 — stav zařízení */}
      <div className="widget-card">
        <div className="block-header">
          <h2>Zařízení</h2>
          <span className="dashboard-count">
            {devices.filter(d => d.status === 'online').length}/{devices.length}
          </span>
        </div>
        {devices.length === 0 ? (
          <p className="evidence-empty">Žádná zařízení.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Název</th>
                  <th>Umístění</th>
                  <th>Stav</th>
                </tr>
              </thead>
              <tbody>
                {devices.map(d => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.location || '—'}</td>
                    <td>
                      <span style={{
                        color: d.status === 'online' ? '#16a34a' : d.status === 'error' ? '#dc2626' : '#6b7280',
                        fontWeight: 600,
                      }}>
                        {d.status === 'online' ? 'Online' : d.status === 'error' ? 'Chyba' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default Dashboard