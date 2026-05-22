import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateUser, deleteUser, createCard, updateCard, getAllCards, deleteCard } from '../api'
import Modal from './Modal'

async function generateCardUid() {
  const cards = await getAllCards()
  const numbers = cards
    .map(c => c.card_uid?.match(/^US(\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number)
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1234
  return `US${next}`
}

function EditEmployeeForm({ employee, cardUid: initialCardUid, onClose, onUpdated }) {
  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  const [name, setName] = useState(employee.name)
  const [surname, setSurname] = useState(employee.surname)
  const [email, setEmail] = useState(employee.email || '')
  const [isActive, setIsActive] = useState(employee.is_active)
  const [cardUid, setCardUid] = useState(initialCardUid || '')
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
      if (cardUid && !initialCardUid) {
        await createCard(cardUid, employee.id, true)
      } else if (cardUid && cardUid !== initialCardUid) {
        await updateCard(initialCardUid, { userId: employee.id, isActive: true })
      }
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
      if (initialCardUid) await deleteCard(initialCardUid)
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
    <Modal onClose={onClose}>
      <h2 style={{ marginTop: 0 }}>Upravit zam&#283;stnance</h2>
      <form className="create-form" onSubmit={handleSave}>
        <div className="form-row">
          <label>
            Jm&#233;no
            <input value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label>
            P&#345;&#237;jmen&#237;
            <input value={surname} onChange={e => setSurname(e.target.value)} />
          </label>
        </div>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          UID karty
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              placeholder={initialCardUid ? 'UID karty' : 'Bez karty'}
              value={cardUid}
              onChange={e => setCardUid(e.target.value.toUpperCase())}
              style={{ flex: 1 }}
            />
            {!initialCardUid && (
              <button type="button" className="btn-secondary" onClick={() => generateCardUid().then(setCardUid)}>
                Vygenerovat
              </button>
            )}
          </div>
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
          Aktivn&#237;
        </label>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <div className="edit-form-actions">
          <button type="submit" className="btn-save" disabled={loading}>Ulo&#382;it</button>
          <button type="button" className="btn-delete" onClick={handleDelete} disabled={loading}>Smazat</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Zru&#353;it</button>
        </div>
      </form>
    </Modal>
  )
}

function EmployeeItem({ employee, isSelected, onSelect, cardUid }) {
  const navigate = useNavigate()

  const handleAttendanceClick = (e) => {
    e.stopPropagation()
    const name = encodeURIComponent(`${employee.name} ${employee.surname}`)
    navigate(`/attendance?userId=${employee.id}&fromName=${name}`)
  }

  return (
    <tr style={{ cursor: 'pointer', background: isSelected ? '#e0e7ff' : '' }} onClick={onSelect}>
      <td>{employee.name}</td>
      <td>{employee.surname}</td>
      <td>{employee.email || '—'}</td>
      <td>{cardUid || '—'}</td>
      <td>
        <span className={`badge ${employee.is_active ? 'badge-green' : 'badge-gray'}`}>
          {employee.is_active ? 'Ano' : 'Ne'}
        </span>
      </td>
      <td>
        <button className="btn-link" title="Zobrazit doch&#225;zku" onClick={handleAttendanceClick}>
          &#8594;
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
    else if (sortKey === 'status') { valA = statusMap[a.id] || ''; valB = statusMap[b.id] || '' }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (sorted.length === 0) return <p>&#381;&#225;dn&#237; zam&#283;stnanci nenalezeni.</p>

  const selectedEmp = sorted.find(e => e.id === selectedId)

  return (
    <>
      <table>
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>Jm&#233;no{arrow('name')}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('surname')}>P&#345;&#237;jmen&#237;{arrow('surname')}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>Email{arrow('email')}</th>
              <th>Karta</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('is_active')}>Aktivn&#237;{arrow('is_active')}</th>
              <th>Doch&#225;zka</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(emp => (
              <EmployeeItem
                key={emp.id}
                employee={emp}
                status={statusMap[emp.id] || ''}
                isSelected={selectedId === emp.id}
                onSelect={() => setSelectedId(selectedId === emp.id ? null : emp.id)}
                cardUid={cardMap[emp.id]}
              />
            ))}
          </tbody>
        </table>
      {selectedEmp && (
        <EditEmployeeForm
          employee={selectedEmp}
          cardUid={cardMap[selectedEmp.id]}
          onClose={() => setSelectedId(null)}
          onUpdated={onUpdated}
        />
      )}
    </>
  )
}

export default EmployeesList