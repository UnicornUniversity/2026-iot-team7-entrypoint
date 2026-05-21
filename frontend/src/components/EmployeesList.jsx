import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateUser, deleteUser } from '../api'

function EditEmployeeForm({ employee, onClose, onUpdated }) {
  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  const [name, setName] = useState(employee.name)
  const [surname, setSurname] = useState(employee.surname)
  const [email, setEmail] = useState(employee.email || '')
  const [isActive, setIsActive] = useState(employee.is_active)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await updateUser(employee.id, {
        name: capitalize(name),
        surname: capitalize(surname),
        email,
        isActive,
      })
      onUpdated?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Opravdu smazat ${employee.name} ${employee.surname}?`)) return
    setError(null)
    setLoading(true)
    try {
      await deleteUser(employee.id)
      onUpdated?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <tr className="edit-row">
      <td colSpan={7}>
        <form className="edit-form" onSubmit={handleSave}>
          <input placeholder="Jméno" value={name}
            onChange={e => setName(e.target.value)} />
          <input placeholder="Příjmení" value={surname}
            onChange={e => setSurname(e.target.value)} />
          <input placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} />
          <label>
            <input type="checkbox" checked={isActive}
              onChange={e => setIsActive(e.target.checked)} />
            Aktivní
          </label>
          <div className="edit-form-actions">
            <button type="submit" className="btn-save" disabled={loading}>Uložit</button>
            <button type="button" className="btn-delete" onClick={handleDelete} disabled={loading}>Smazat</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
          </div>
        </form>
        {error && <p className="edit-message" style={{ color: 'red' }}>{error}</p>}
      </td>
    </tr>
  )
}

function EmployeeItem({ employee, status, isSelected, onSelect, cardUid }) {
  const navigate = useNavigate()

  const handleAttendanceClick = (e) => {
    e.stopPropagation()
    const name = encodeURIComponent(`${employee.name} ${employee.surname}`)
    navigate(`/attendance?userId=${employee.id}&fromName=${name}`)
  }

  return (
    <tr style={{ cursor: 'pointer', background: isSelected ? '#f1f5f9' : '' }}
      onClick={onSelect}>
      <td>{employee.name}</td>
      <td>{employee.surname}</td>
      <td>{employee.email || '—'}</td>
      <td>{cardUid || '—'}</td>
      <td>{employee.is_active ? 'Ano' : 'Ne'}</td>
      <td>
        <button className="btn-link" title="Zobrazit docházku" onClick={handleAttendanceClick}>
          →
        </button>
      </td>
    </tr>
  )
}

function EmployeesList({ employees, statusMap, cardMap = {}, onUpdated }) {
  const [sortKey, setSortKey] = useState('surname')
  const [sortDir, setSortDir] = useState('asc')
  const [selectedId, setSelectedId] = useState(null)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const arrow = (key) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const sorted = [...employees].sort((a, b) => {
    let valA, valB
    if (sortKey === 'name') { valA = a.name || ''; valB = b.name || '' }
    else if (sortKey === 'surname') { valA = a.surname || ''; valB = b.surname || '' }
    else if (sortKey === 'email') { valA = a.email || ''; valB = b.email || '' }
    else if (sortKey === 'is_active') { valA = a.is_active ? 1 : 0; valB = b.is_active ? 1 : 0 }
    else if (sortKey === 'status') { valA = statusMap[a.id] || '—'; valB = statusMap[b.id] || '—' }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (sorted.length === 0) return <p>Žádní zaměstnanci nenalezeni.</p>

  return (
    <table>
      <thead>
        <tr>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
            Jméno{arrow('name')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('surname')}>
            Příjmení{arrow('surname')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>
            Email{arrow('email')}
          </th>
          <th>Karta</th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('is_active')}>
            Aktivní{arrow('is_active')}
          </th>
          <th>Docházka</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(emp => (
          <>
            <EmployeeItem
              key={emp.id}
              employee={emp}
              status={statusMap[emp.id] || '—'}
              isSelected={selectedId === emp.id}
              onSelect={() => setSelectedId(selectedId === emp.id ? null : emp.id)}
              cardUid={cardMap[emp.id]}
            />
            {selectedId === emp.id && (
              <EditEmployeeForm
                key={`edit-${emp.id}`}
                employee={emp}
                onClose={() => setSelectedId(null)}
                onUpdated={onUpdated}
              />
            )}
          </>
        ))}
      </tbody>
    </table>
  )
}

export default EmployeesList