import React, { useState } from 'react'
import { updateDevice, deleteDevice } from '../api'

function EditDeviceForm({ device, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: device.name,
    location: device.location,
    description: device.description || '',
    key: device.key,
  })
  const [message, setMessage] = useState(null)

  const handleSave = (e) => {
    e.preventDefault()
    setMessage(null)
    updateDevice(device.id, formData)
      .then(() => {
        setMessage('Změny byly uloženy.')
        setTimeout(() => {
          onUpdated()
          onClose()
        }, 1000)
      })
      .catch(err => setMessage(`Chyba: ${err.message}`))
  }

  const handleDelete = () => {
    if (window.confirm(`Opravdu chcete smazat zařízení ${device.name}?`)) {
      deleteDevice(device.id)
        .then(() => {
          onUpdated()
          onClose()
        })
        .catch(err => setMessage(`Chyba: ${err.message}`))
    }
  }

  return (
    <tr className="edit-row">
      <td colSpan={4}>
        <form className="edit-form" onSubmit={handleSave}>
          <input 
            placeholder="Název" 
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            required 
          />
          <input 
            placeholder="Lokalita" 
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })} 
            required 
          />
          <input 
            placeholder="Klíč" 
            value={formData.key}
            onChange={e => setFormData({ ...formData, key: e.target.value })} 
            required 
          />
          <input 
            placeholder="Popis" 
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
          />
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

function DeviceItem({ device, isSelected, onSelect }) {
  return (
    <tr style={{ cursor: 'pointer', background: isSelected ? '#f1f5f9' : '' }}
      onClick={onSelect}>
      <td>{device.name}</td>
      <td>{device.location}</td>
      <td><code>{device.key}</code></td>
      <td>{device.description || '—'}</td>
    </tr>
  )
}

function DevicesList({ devices, onRefresh }) {
  const [sortKey, setSortKey] = useState('name')
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

  const sorted = [...devices].sort((a, b) => {
    let valA = a[sortKey] || ''
    let valB = b[sortKey] || ''
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (sorted.length === 0) return <p>Žádná zařízení nebyla nalezena.</p>

  return (
    <table>
      <thead>
        <tr>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
            Název{arrow('name')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('location')}>
            Lokalita{arrow('location')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('key')}>
            Klíč{arrow('key')}
          </th>
          <th>Popis</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(device => (
          <React.Fragment key={device.id}>
            <DeviceItem
              device={device}
              isSelected={selectedId === device.id}
              onSelect={() => setSelectedId(selectedId === device.id ? null : device.id)}
            />
            {selectedId === device.id && (
              <EditDeviceForm
                device={device}
                onClose={() => setSelectedId(null)}
                onUpdated={onRefresh}
              />
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  )
}

export default DevicesList
