import { useState } from 'react'

function EditAttendanceForm({ record, onClose, deviceMap }) {
  const [direction, setDirection] = useState(record.direction)
  const [deviceId, setDeviceId] = useState(record.device_id)
  const [timestamp, setTimestamp] = useState(
    new Date(record.timestamp).toISOString().slice(0, 16)
  )
  const [message, setMessage] = useState(null)

  const handleSave = (e) => {
    e.preventDefault()
    // TODO: nahradit až BE dodá PATCH /api/v1/attendance/:id
    setMessage('Úprava záznamu zatím není dostupná.')
  }

  const handleDelete = () => {
    // TODO: nahradit až BE dodá DELETE /api/v1/attendance/:id
    setMessage('Smazání záznamu zatím není dostupné.')
  }

  return (
    <tr className="edit-row">
      <td colSpan={4}>
        <form className="edit-form" onSubmit={handleSave}>
          <input type="datetime-local" value={timestamp}
            onChange={e => setTimestamp(e.target.value)} />

          <select value={direction} onChange={e => setDirection(e.target.value)}>
            <option value="in">Příchod</option>
            <option value="out">Odchod</option>
          </select>

          <select value={deviceId} onChange={e => setDeviceId(e.target.value)}>
            {Object.entries(deviceMap).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
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

function AttendanceRecordItem({ record, isSelected, onSelect, deviceMap }) {
  return (
    <tr style={{ cursor: 'pointer', background: isSelected ? '#f1f5f9' : '' }}
      onClick={onSelect}>
      <td>{new Date(record.timestamp).toLocaleString('cs-CZ')}</td>
      <td>{record.direction === 'in' ? 'Příchod' : 'Odchod'}</td>
      <td>{record.fullName || '—'}</td>
      <td>{deviceMap[record.device_id] || record.device_id}</td>
    </tr>
  )
}

function AttendanceList({ records, isAdmin, deviceMap = {} }) {
  const [sortKey, setSortKey] = useState('timestamp')
  const [sortDir, setSortDir] = useState('desc')
  const [selectedId, setSelectedId] = useState(null) // id vybraného záznamu

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
      valA = new Date(a.timestamp)
      valB = new Date(b.timestamp)
    } else if (sortKey === 'direction') {
      valA = a.direction
      valB = b.direction
    } else if (sortKey === 'fullName') {
      valA = a.fullName || ''
      valB = b.fullName || ''
    } else if (sortKey === 'device') {
      valA = deviceMap[a.device_id] || a.device_id
      valB = deviceMap[b.device_id] || b.device_id
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
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('direction')}>
            Směr{arrow('direction')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('fullName')}>
            Zaměstnanec{arrow('fullName')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('device')}>
            Zařízení{arrow('device')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(record => (
          <>
            <AttendanceRecordItem
              key={record.id}
              record={record}
              isSelected={selectedId === record.id}
              onSelect={() => setSelectedId(selectedId === record.id ? null : record.id)}
              deviceMap={deviceMap}
            />
            {isAdmin && selectedId === record.id && (
              <EditAttendanceForm
                key={`edit-${record.id}`}
                record={record}
                onClose={() => setSelectedId(null)}
                deviceMap={deviceMap}
              />
            )}
          </>
        ))}
      </tbody>
    </table>
  )
}

export default AttendanceList
