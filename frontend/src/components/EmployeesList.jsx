import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateUser, deleteUser } from '../api'

function EditEmployeeForm({ employee, onClose }) {
  const [firstName, setFirstName] = useState(employee.firstName)
  const [lastName, setLastName] = useState(employee.lastName)
  const [username, setUsername] = useState(employee.username)
  const [cardID, setCardID] = useState(employee.cardID || '')
  const [isActive, setIsActive] = useState(employee.isActive)
  const [message, setMessage] = useState(null)

  const handleSave = (e) => {
    e.preventDefault()
    setMessage(null)
    updateUser(employee.id, { firstName, lastName, username, cardID, isActive })
      .then(() => {
        setMessage('Změny byly uloženy.')
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1000)
      })
      .catch(err => setMessage(`Chyba: ${err.message}`))
  }

  const handleResetPassword = () => {
    if (window.confirm(`Opravdu chcete resetovat heslo uživateli ${employee.firstName} ${employee.lastName}?`)) {
      setMessage(null)
      // Reset password to username
      updateUser(employee.id, { hashedPassword: employee.username })
        .then(() => {
          setMessage(`Heslo bylo úspěšně resetováno na: ${employee.username}`)
        })
        .catch(err => setMessage(`Chyba: ${err.message}`))
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Opravdu chcete smazat uživatele ${employee.firstName} ${employee.lastName}?`)) {
      deleteUser(employee.id)
        .then(() => {
          onClose()
          window.location.reload()
        })
        .catch(err => setMessage(`Chyba: ${err.message}`))
    }
  }

  return (
    <tr className="edit-row">
      <td colSpan={7}>
        <form className="edit-form" onSubmit={handleSave}>
          <input placeholder="Jméno" value={firstName}
            onChange={e => setFirstName(e.target.value)} required />
          <input placeholder="Příjmení" value={lastName}
            onChange={e => setLastName(e.target.value)} required />
          <input placeholder="Uživ. jméno" value={username}
            onChange={e => setUsername(e.target.value)} required />
          <input placeholder="Karta UID" value={cardID}
            onChange={e => setCardID(e.target.value)} />
          <label>
            <input type="checkbox" checked={isActive}
              onChange={e => setIsActive(e.target.checked)} />
            Aktivní
          </label>
          <div className="edit-form-actions">
            <button type="submit" className="btn-save">Uložit</button>
            <button type="button" className="btn-link" style={{ color: 'var(--text-h)', border: '1px solid var(--border)', padding: '6px 12px' }} onClick={handleResetPassword}>Resetovat heslo</button>
            <button type="button" className="btn-delete" onClick={handleDelete}>Smazat</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
          </div>
        </form>
        {message && <p className="edit-message" style={{ fontWeight: '600', color: message.includes('Resetováno') || message.includes('resetováno') ? 'var(--accent)' : 'inherit' }}>{message}</p>}
      </td>
    </tr>
  )
}

function EmployeeItem({ employee, status, isSelected, onSelect, cardUid }) {
  const navigate = useNavigate()

  const handleAttendanceClick = (e) => {
    e.stopPropagation()
    const name = encodeURIComponent(`${employee.firstName} ${employee.lastName}`)
    navigate(`/attendance?userId=${employee.id}&fromName=${name}`)
  }

  return (
    <tr style={{ cursor: 'pointer', background: isSelected ? '#f1f5f9' : '' }}
      onClick={onSelect}>
      <td>{employee.firstName}</td>
      <td>{employee.lastName}</td>
      <td>{employee.username}</td>
      <td>{cardUid || '—'}</td>
      <td>{employee.isActive ? 'Ano' : 'Ne'}</td>
      <td>
        <button className="btn-link" title="Zobrazit docházku" onClick={handleAttendanceClick}>
          →
        </button>
      </td>
    </tr>
  )
}

function EmployeesList({ employees, statusMap, cardMap = {} }) {
  const [sortKey, setSortKey] = useState('lastName')
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
    if (sortKey === 'firstName') { valA = a.firstName || ''; valB = b.firstName || '' }
    else if (sortKey === 'lastName') { valA = a.lastName || ''; valB = b.lastName || '' }
    else if (sortKey === 'username') { valA = a.username || ''; valB = b.username || '' }
    else if (sortKey === 'isActive') { valA = a.isActive ? 1 : 0; valB = b.isActive ? 1 : 0 }
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
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('firstName')}>
            Jméno{arrow('firstName')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('lastName')}>
            Příjmení{arrow('lastName')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('username')}>
            Uživ. jméno{arrow('username')}
          </th>
          <th>Karta</th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('isActive')}>
            Aktivní{arrow('isActive')}
          </th>
          <th>Docházka</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(emp => (
          <React.Fragment key={emp.id}>
            <EmployeeItem
              employee={emp}
              status={statusMap[emp.id] || '—'}
              isSelected={selectedId === emp.id}
              onSelect={() => setSelectedId(selectedId === emp.id ? null : emp.id)}
              cardUid={cardMap[emp.id]}
            />
            {selectedId === emp.id && (
              <EditEmployeeForm
                employee={emp}
                onClose={() => setSelectedId(null)}
              />
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  )
}

export default EmployeesList
