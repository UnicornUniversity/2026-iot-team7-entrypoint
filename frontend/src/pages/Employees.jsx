import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getUsers, getAttendance } from '../api'
import EmployeesList from '../components/EmployeesList'
import CreateEmployeeForm from '../components/CreateEmployeeForm'
import Modal from '../components/Modal'

function Employees() {
  const [searchParams] = useSearchParams()
  const [employees, setEmployees] = useState([])
  const [statusMap, setStatusMap] = useState({})
  const [cardMap, setCardMap] = useState({})
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showForm, setShowForm] = useState(false)   // viditelnost formuláře
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getUsers(), getAttendance()])
      .then(([users, records]) => {
        setEmployees(users)

        // seřadíme záznamy od nejnovějšího a vezmeme poslední na uživatele
        const sorted = [...records].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )
        const lastByUser = {}
        sorted.forEach(r => {
          if (!lastByUser[r.user_id]) lastByUser[r.user_id] = r
        })

        // sestavíme mapu userId → 'IN' nebo 'OUT'
        const map = {}
        Object.entries(lastByUser).forEach(([userId, record]) => {
          map[userId] = record.direction === 'in' && record.success ? 'IN' : 'OUT'
        })
        setStatusMap(map)

        // sestavíme mapu userId → card_uid z prvního nalezeného záznamu
        const cards = {}
        records.forEach(r => {
          if (!cards[r.user_id] && r.card_uid) cards[r.user_id] = r.card_uid
        })
        setCardMap(cards)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // filtrujeme zaměstnance podle vyhledávacího textu
  const filtered = employees.filter(emp =>
    `${emp.name} ${emp.surname}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p>Načítám...</p>
  if (error) return <p>Chyba: {error}</p>

  return (
    <section className="page-content">

      {/* Blok 1 — vyhledávání */}
      <h2>Vyhledávání</h2>
      <div className="filter-card">
        <label>
          Zaměstnanec
          <input
            placeholder="Hledat podle jména..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
      </div>

      {/* Blok 2 — seznam zaměstnanců */}
      <div className="attendance-block">
        <div className="block-header">
          <h2>Seznam zaměstnanců</h2>
          <button className="btn-add" title="Nový zaměstnanec"
            onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕' : '+'}
          </button>
        </div>
        {showForm && (
          <Modal onClose={() => setShowForm(false)}>
            <CreateEmployeeForm onClose={() => setShowForm(false)} />
          </Modal>
        )}
        <EmployeesList employees={filtered} statusMap={statusMap} cardMap={cardMap} />
      </div>

    </section>
  )
}

export default Employees