import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getUsers, getAttendance } from '../api'
import EmployeesList from '../components/EmployeesList'
import CreateEmployeeForm from '../components/CreateEmployeeForm'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'

function Employees() {
  const [searchParams] = useSearchParams()
  const [employees, setEmployees] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 10

  const [statusMap, setStatusMap] = useState({})
  const [cardMap, setCardMap] = useState({})
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [offset])

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      getUsers({ limit, offset }), 
      getAttendance({ limit: 100 }) // Fetch more for status mapping
    ])
      .then(([usersRes, recordsRes]) => {
        setEmployees(usersRes.data)
        setTotal(usersRes.total)

        const records = recordsRes.data
        const sorted = [...records].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        const lastByUser = {}
        sorted.forEach(r => {
          if (r.user && !lastByUser[r.user.id]) lastByUser[r.user.id] = r
        })

        const map = {}
        Object.entries(lastByUser).forEach(([userId, record]) => {
          map[userId] = record.type === 'arrival' ? 'IN' : 'OUT'
        })
        setStatusMap(map)

        const cards = {}
        usersRes.data.forEach(u => {
          if (u.cardID) cards[u.id] = u.cardID
        })
        setCardMap(cards)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  // Local filtering for current page
  const filtered = employees.filter(emp => {
    const s = search.toLowerCase()
    return (
      (emp.firstName && emp.firstName.toLowerCase().includes(s)) ||
      (emp.lastName && emp.lastName.toLowerCase().includes(s)) ||
      (emp.username && emp.username.toLowerCase().includes(s)) ||
      (emp.cardID && emp.cardID.toLowerCase().includes(s))
    )
  })

  if (loading && employees.length === 0) return <p>Načítám...</p>
  if (error) return <p>Chyba: {error}</p>

  return (
    <section className="page-content">

      {/* Blok 1 — vyhledávání */}
      <div className="filter-card">
        <label style={{ position: 'relative' }}>
          Zaměstnanec
          <div style={{ position: 'relative' }}>
            <input
              placeholder="Hledat"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingRight: '32px' }}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: 'var(--text)',
                  opacity: 0.6
                }}
              >
                ✕
              </button>
            )}
          </div>
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
        
        <Pagination 
          total={total} 
          limit={limit} 
          offset={offset} 
          onPageChange={setOffset} 
        />
      </div>

    </section>
  )
}

export default Employees
