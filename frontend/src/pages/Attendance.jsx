import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getAttendance, getUserAttendance, getUsers, getDevices } from '../api'
import { useAuth } from '../context/AuthContext'
import AttendanceFilterCard from '../components/AttendanceFilterCard'
import AttendanceEvidence from '../components/AttendanceEvidence'
import AttendanceList from '../components/AttendanceList'
import AddAttendanceButton from '../components/AddAttendanceButton'
import Pagination from '../components/Pagination'

function Attendance() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Contextual view for a specific employee
  const contextualUserId = searchParams.get('userId')
  const contextualName = searchParams.get('fromName') || ''
  const isContextual = !!contextualUserId

  const [records, setRecords] = useState([])
  const [evidenceRecords, setEvidenceRecords] = useState([]) // For full evidence calculation
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 15

  const [employees, setEmployees] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10)

  const [filters, setFilters] = useState({
    dateFrom: firstDay,
    dateTo: lastDay,
    userId: contextualUserId || '',
    search: '',
    dateMode: 'month',
  })

  // Sync contextual ID if params change
  useEffect(() => {
    setFilters(prev => ({ ...prev, userId: contextualUserId || '' }))
  }, [contextualUserId])

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0)
  }, [filters.dateFrom, filters.dateTo, filters.userId, filters.search])

  // načte záznamy — server-side filtrování
  const fetchRecords = useCallback(() => {
    if (!user?.id) return Promise.resolve()
    
    const apiFilters = {
      dateFrom: filters.dateFrom ? `${filters.dateFrom}T00:00:00Z` : undefined,
      dateTo: filters.dateTo ? `${filters.dateTo}T23:59:59Z` : undefined,
      userId: isAdmin ? (filters.userId || undefined) : undefined, // User ID handled by /records/my on server
    }

    // 1. Fetch paginated data for the list
    const listPromise = getAttendance({ ...apiFilters, limit, offset }, isAdmin).then(res => {
        setRecords(res.data || [])
        setTotal(res.total || 0)
    })

    // 2. Fetch ALL data (within range/user) for the evidence component
    const evidencePromise = getAttendance({ ...apiFilters, limit: 1000 }, isAdmin).then(res => {
        setEvidenceRecords(res.data || [])
    })

    return Promise.all([listPromise, evidencePromise])
  }, [isAdmin, user, filters.dateFrom, filters.dateTo, filters.userId, offset])

  useEffect(() => {
    if (!user) return
    
    setLoading(true)
    
    const promises = [fetchRecords()]
    
    // Regular users cannot (and don't need to) fetch all devices/users
    if (isAdmin) {
        promises.push(getDevices({ limit: 1000 }).then(res => setDevices(res.data || [])))
        promises.push(getUsers({ limit: 1000 }).then(res => setEmployees(res.data || [])))
    }

    Promise.all(promises)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [fetchRecords, isAdmin, user])

  const userMap = {}
  employees.forEach(e => { userMap[e.id] = `${e.firstName} ${e.lastName}` })

  const deviceMap = {}
  devices.forEach(d => { deviceMap[d.id] = d.name })

  const cardMap = {}
  evidenceRecords.forEach(r => {
    if (r.user && !cardMap[r.user.id] && r.user.cardID) cardMap[r.user.id] = r.user.cardID
  })

  // Local filtering for matching users
  const matchingEmployees = employees.filter(emp => {
    if (!filters.search) return false;
    const s = filters.search.toLowerCase()
    return (
      (emp.firstName && emp.firstName.toLowerCase().includes(s)) ||
      (emp.lastName && emp.lastName.toLowerCase().includes(s)) ||
      (emp.username && emp.username.toLowerCase().includes(s)) ||
      (emp.cardID && emp.cardID.toLowerCase().includes(s))
    )
  })

  const applySearchToRecords = (data) => {
    if (!filters.search) return data
    const s = filters.search.toLowerCase()
    return data.filter(r => {
        const u = r.user;
        if (!u) return r.cardID?.toLowerCase().includes(s);
        return (
            (u.firstName && u.firstName.toLowerCase().includes(s)) ||
            (u.lastName && u.lastName.toLowerCase().includes(s)) ||
            (u.username && u.username.toLowerCase().includes(s)) ||
            (u.cardID && u.cardID.toLowerCase().includes(s)) ||
            (r.cardID && r.cardID.toLowerCase().includes(s))
        )
    })
  }

  const displayedRecords = applySearchToRecords(records)
  const displayedEvidence = applySearchToRecords(evidenceRecords)

  const handleUserSelect = (emp) => {
      const name = `${emp.firstName} ${emp.lastName}`
      navigate(`/attendance?userId=${emp.id}&fromName=${encodeURIComponent(name)}`)
      setFilters(prev => ({ ...prev, userId: emp.id, search: '' }))
  }

  if (error) return <section className="page-content"><p>Chyba: {error}</p></section>

  const activeUserId = filters.userId || (isAdmin ? null : user?.id)

  return (
    <section className="page-content">

      {/* Contextual Header */}
      {isContextual ? (
        <div style={{ marginBottom: '24px' }}>
            <button className="btn-back" onClick={() => navigate('/attendance')}>
                ← Zpět na obecný přehled
            </button>
            <h2 style={{ marginTop: '8px' }}>Docházka uživatele: {contextualName}</h2>
        </div>
      ) : null}

      {/* Blok 1 — filtry */}
      <AttendanceFilterCard
        filters={filters}
        onFilterChange={setFilters}
        isAdmin={isAdmin && !isContextual}
      />

      {loading && records.length === 0 ? (
          <p style={{ marginTop: '20px' }}>Načítám...</p>
      ) : (
          <>
            {/* Matching Users List */}
            {!activeUserId && filters.search && (
                <div className="attendance-block" style={{ marginBottom: '24px' }}>
                    <h2>Nalezení uživatelé</h2>
                    {matchingEmployees.length === 0 ? (
                        <p className="evidence-empty">Žádný uživatel neodpovídá hledání.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Jméno a příjmení</th>
                                    <th>Login</th>
                                    <th>Karta</th>
                                    <th style={{ textAlign: 'right' }}>Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matchingEmployees.map(emp => (
                                    <tr key={emp.id} style={{ cursor: 'pointer' }} onClick={() => handleUserSelect(emp)}>
                                        <td>{emp.firstName} {emp.lastName}</td>
                                        <td>{emp.username}</td>
                                        <td>{emp.cardID || '—'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-link">Vybrat →</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Blok 2 — evidence docházky */}
            {activeUserId && (
                <div className="attendance-block">
                <h2>Evidence docházky</h2>
                <AttendanceEvidence records={displayedEvidence} userId={activeUserId} />
                </div>
            )}

            {/* Blok 3 — průchody terminálem */}
            <div className="attendance-block">
                <div className="block-header">
                <h2>Průchody terminálem</h2>
                {isAdmin && <AddAttendanceButton onAdded={fetchRecords} devices={devices} employees={employees} cardMap={cardMap} initialUserId={filters.userId} />}
                </div>
                <AttendanceList records={displayedRecords.map(r => ({ ...r, fullName: r.user ? (userMap[r.user.id] || `${r.user.firstName} ${r.user.lastName}`) : null }))} isAdmin={isAdmin} deviceMap={deviceMap} onRefresh={fetchRecords} />
                
                <Pagination 
                total={total} 
                limit={limit} 
                offset={offset} 
                onPageChange={setOffset} 
                />
            </div>
          </>
      )}

    </section>
  )
}

export default Attendance
