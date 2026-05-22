import { useState } from 'react'
import { updateAttendance, deleteAttendance } from '../api'
import Modal from './Modal'

function EditAttendanceForm({ record, onClose, onUpdated, deviceMap }) {
  const [direction, setDirection] = useState(record.direction)
  const [deviceId, setDeviceId] = useState(record.device_id)
  const [timestamp, setTimestamp] = useState(
    new Date(record.timestamp).toISOString().slice(0, 16)
  )
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await updateAttendance(record.id, { direction, deviceId, timestamp: new Date(timestamp).toISOString() })
      onUpdated?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu smazat tento záznam?')) return
    setError(null)
    setLoading(true)
    try {
      await deleteAttendance(record.id)
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
      <h2 style={{ marginTop: 0 }}>Upravit z&#225;znam</h2>
      <form className="create-form" onSubmit={handleSave}>
        <div className="form-row">
          <label>
            Datum a &#269;as
            <input type="datetime-local" value={timestamp}
              onChange={e => setTimestamp(e.target.value)} />
          </label>
          <label>
            Sm&#283;r
            <select value={direction} onChange={e => setDirection(e.target.value)}>
              <option value="in">P&#345;&#237;chod</option>
              <option value="out">Odchod</option>
            </select>
          </label>
        </div>
        <label>
          Za&#345;&#237;zen&#237;
          <select value={deviceId} onChange={e => setDeviceId(e.target.value)}>
            {Object.entries(deviceMap).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
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

function AttendanceRecordItem({ record, isSelected, onSelect, deviceMap }) {
  return (
    <tr style={{ cursor: 'pointer', background: isSelected ? '#e0e7ff' : '' }}
      onClick={onSelect}>
      <td>{new Date(record.timestamp).toLocaleString('cs-CZ')}</td>
      <td>
        <span className={`badge ${record.direction === 'in' ? 'badge-green' : 'badge-gray'}`}>
          {record.direction === 'in' ? 'Příchod' : 'Odchod'}
        </span>
      </td>
      <td>{record.fullName || '—'}</td>
      <td>{deviceMap[record.device_id] || record.device_id}</td>
    </tr>
  )
}

function AttendanceList({ records, isAdmin, deviceMap = {}, onUpdated }) {
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

  if (sorted.length === 0) return <p>&#381;&#225;dn&#233; z&#225;znamy.</p>

  const selectedRecord = isAdmin ? sorted.find(r => r.id === selectedId) : null

  return (
    <>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('timestamp')}>
                Datum{arrow('timestamp')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('direction')}>
                Sm&#283;r{arrow('direction')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('fullName')}>
                Zam&#283;stnanec{arrow('fullName')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('device')}>
                Za&#345;&#237;zen&#237;{arrow('device')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(record => (
              <AttendanceRecordItem
                key={record.id}
                record={record}
                isSelected={selectedId === record.id}
                onSelect={() => isAdmin && setSelectedId(selectedId === record.id ? null : record.id)}
                deviceMap={deviceMap}
              />
            ))}
          </tbody>
        </table>
      </div>
      {selectedRecord && (
        <EditAttendanceForm
          record={selectedRecord}
          onClose={() => setSelectedId(null)}
          onUpdated={onUpdated}
          deviceMap={deviceMap}
        />
      )}
    </>
  )
}

export default AttendanceList