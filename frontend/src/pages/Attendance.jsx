import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getAttendance, getUserAttendance, getUsers, getDevices, getAllCards } from '../api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import AttendanceFilterCard from '../components/AttendanceFilterCard'
import AttendanceEvidence from '../components/AttendanceEvidence'
import AttendanceList from '../components/AttendanceList'
import AddAttendanceButton from '../components/AddAttendanceButton'

function Attendance() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const fromEmployee = searchParams.get('userId')
  const fromName = searchParams.get('fromName') || ''

  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [devices, setDevices] = useState([])
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10)

  const [filters, setFilters] = useState({
    dateFrom: firstDay,
    dateTo: lastDay,
    userId: searchParams.get('userId') || (isAdmin ? '' : user.id),
    direction: '',
  })

  // načte záznamy — admin všechny, user jen své
  const fetchRecords = useCallback(() => {
    const fetchData = isAdmin ? getAttendance() : getUserAttendance(user.id)
    return fetchData.then(data => setRecords(data))
  }, [isAdmin, user])

  useEffect(() => {
    const promises = isAdmin
      ? [fetchRecords(), getUsers().then(setEmployees), getDevices().then(setDevices), getAllCards().then(setCards)]
      : [fetchRecords(), getDevices().then(setDevices)]

    Promise.all(promises)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [fetchRecords, isAdmin])

  const userMap = {}
  employees.forEach(e => { userMap[e.id] = `${e.name} ${e.surname}` })

  const deviceMap = {}
  devices.forEach(d => { deviceMap[d.id] = d.name })

  // cardMap sestavujeme z karet, ne ze záznamů
  const cardMap = {}
  cards.forEach(c => {
    if (c.is_active && c.user_id) cardMap[c.user_id] = c.card_uid
  })

  // aplikujeme filtry na záznamy
  const filtered = records
    .filter(r => !filters.dateFrom || new Date(r.timestamp) >= new Date(filters.dateFrom))
    .filter(r => !filters.dateTo || new Date(r.timestamp) <= new Date(filters.dateTo + 'T23:59:59'))
    .filter(r => !filters.userId || r.user_id === filters.userId)
    .map(r => ({ ...r, fullName: userMap[r.user_id] || '—' }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  if (loading) return <Spinner />
  if (error) return <p>Chyba: {error}</p>

  return (
    <section className="page-content">

      {/* tlačítko zpět — zobrazí se jen při prokliku ze zaměstnanců */}
      {fromEmployee && (
        <button className="btn-back" onClick={() => navigate(`/employees${fromName ? `?search=${encodeURIComponent(fromName)}` : ''}`)}>
          ← Zpět na zaměstnance
        </button>
      )}

      {/* Blok 1 — filtry */}
      <h2>{isAdmin ? 'Výběr zaměstnance' : 'Výběr období'}</h2>
      <AttendanceFilterCard
        filters={filters}
        onFilterChange={setFilters}
        employees={employees}
        isAdmin={isAdmin}
      />

      {/* Blok 2 — evidence docházky */}
      <div className="widget-card">
        <div className="block-header">
          <h2>Evidence docházky</h2>
        </div>
        <AttendanceEvidence records={filtered} userId={filters.userId} />
      </div>

      {/* Blok 3 — průchody terminálem */}
      <div className="widget-card">
        <div className="block-header">
          <h2>Průchody terminálem</h2>
          {isAdmin && <AddAttendanceButton onAdded={fetchRecords} devices={devices} employees={employees} cardMap={cardMap} defaultUserId={filters.userId} />}
        </div>
        <AttendanceList records={filtered} isAdmin={isAdmin} deviceMap={deviceMap} onUpdated={fetchRecords} />
      </div>

    </section>
  )
}

export default Attendance