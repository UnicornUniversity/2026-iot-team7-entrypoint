import React, { useState } from 'react'
import { updateAttendanceRecord, deleteAttendanceRecord } from '../api'

// Helper to format Date to local YYYY-MM-DDTHH:mm:ss
const toLocalISO = (date) => {
    const d = new Date(date)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19)
}

function EditAttendanceForm({ record, onClose, onRefresh }) {
  const [type, setType] = useState(record.type)
  const [timestamp, setTimestamp] = useState(toLocalISO(record.timestamp))
  const [message, setMessage] = useState(null)

  const handleSave = (e) => {
    e.preventDefault()
    setMessage(null)
    updateAttendanceRecord(record.id, { type, timestamp: new Date(timestamp).toISOString() })
      .then(() => {
        setMessage('Záznam byl upraven.')
        setTimeout(() => {
          onRefresh()
          onClose()
        }, 1000)
      })
      .catch(err => setMessage(`Chyba: ${err.message}`))
  }

  const handleDelete = () => {
    if (window.confirm('Opravdu chcete tento záznam smazat?')) {
      setMessage(null)
      deleteAttendanceRecord(record.id)
        .then(() => {
          onRefresh()
          onClose()
        })
        .catch(err => setMessage(`Chyba: ${err.message}`))
    }
  }

  return (
    <tr className="edit-row">
      <td colSpan={5}>
        <form className="edit-form" onSubmit={handleSave}>
          <input type="datetime-local" value={timestamp} step="1"
            onChange={e => setTimestamp(e.target.value)} required />

          <select value={type} onChange={e => setType(e.target.value)} required>
            <option value="arrival">Příchod</option>
            <option value="departure">Odchod</option>
          </select>

          <div className="edit-form-actions">
            <button type="submit" className="btn-save">Uložit</button>
            <button type="button" className="btn-delete" onClick={handleDelete}>Smazat</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
          </div>
        </form>
        {message && <p className="edit-message">{message}</p>}
      </td>
    </tr>
  )
}

function AttendanceRecordItem({ record, isSelected, onSelect }) {
  const isInvalid = !record.user;
  
  const getStateLabel = (state) => {
    switch (state) {
        case 'online': return 'Online';
        case 'offline': return 'Offline (Sync)';
        case 'manual': return 'Manuální';
        default: return state;
    }
  }

  return (
    <tr style={{ cursor: 'pointer', background: isSelected ? '#f1f5f9' : '' }}
      onClick={onSelect}>
      <td>{new Date(record.timestamp).toLocaleString('cs-CZ')}</td>
      <td>{record.type === 'arrival' ? 'Příchod' : 'Odchod'}</td>
      <td style={{ color: isInvalid ? '#ef4444' : 'inherit', fontWeight: isInvalid ? '600' : 'normal' }}>
        {isInvalid ? `Neznámá karta (${record.cardID})` : (record.fullName || '—')}
      </td>
      <td>{record.device ? record.device.name : 'Manuální záznam'}</td>
      <td style={{ fontStyle: record.state === 'manual' ? 'italic' : 'normal' }}>
        {getStateLabel(record.state)}
      </td>
    </tr>
  )
}

function AttendanceList({ records, isAdmin, onRefresh }) {
  const [sortKey, setSortKey] = useState('timestamp')
  const [sortDir, setSortDir] = useState('desc')
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

  const sorted = [...records].sort((a, b) => {
    let valA, valB
    if (sortKey === 'timestamp') {
      valA = new Date(a.timestamp).getTime()
      valB = new Date(b.timestamp).getTime()
    } else if (sortKey === 'type') {
      valA = a.type
      valB = b.type
    } else if (sortKey === 'fullName') {
      valA = a.fullName || a.cardID || ''
      valB = b.fullName || b.cardID || ''
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (sorted.length === 0) return <p>Žádné záznamy.</p>

  return (
    <table>
      <thead>
        <tr>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('timestamp')}>
            Datum{arrow('timestamp')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('type')}>
            Směr{arrow('type')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('fullName')}>
            Zaměstnanec{arrow('fullName')}
          </th>
          <th>Zařízení</th>
          <th>Způsob</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(record => (
          <React.Fragment key={record.id}>
            <AttendanceRecordItem
              record={record}
              isSelected={selectedId === record.id}
              onSelect={() => setSelectedId(selectedId === record.id ? null : record.id)}
            />
            {isAdmin && selectedId === record.id && (
              <EditAttendanceForm
                record={record}
                onClose={() => setSelectedId(null)}
                onRefresh={onRefresh}
              />
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  )
}

export default AttendanceList
