import Spinner from '../components/Spinner'
import { useState, useEffect } from 'react'
import { getDevices, createDevice, updateDevice, deleteDevice } from '../api'
import Modal from '../components/Modal'

const STATUS_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'error', label: 'Chyba' },
]

function statusColor(status) {
  if (status === 'online') return '#16a34a'
  if (status === 'error') return '#dc2626'
  return '#6b7280'
}

function statusLabel(status) {
  if (status === 'online') return 'Online'
  if (status === 'error') return 'Chyba'
  return 'Offline'
}

function EditDeviceForm({ device, onClose, onUpdated }) {
  const [name, setName] = useState(device.name || '')
  const [location, setLocation] = useState(device.location || '')
  const [status, setStatus] = useState(device.status || 'offline')
  const [deviceUid, setDeviceUid] = useState(device.device_uid || '')
  const [description, setDescription] = useState(device.description || '')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await updateDevice(device.id, { name, location, status, deviceUid, description, lastSeen: device.last_seen })
      onUpdated('Za&#345;&#237;zen&#237; bylo &#250;sp&#283;&#353;n&#283; ulo&#382;eno.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Opravdu smazat zařízení "${device.name}"?`)) return
    setError(null)
    setLoading(true)
    try {
      await deleteDevice(device.id)
      onUpdated('Za&#345;&#237;zen&#237; bylo &#250;sp&#283;&#353;n&#283; smaz&#225;no.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 style={{ marginTop: 0 }}>Upravit za&#345;&#237;zen&#237;</h2>
      <form className="create-form" onSubmit={handleSave}>
        <label>
          N&#225;zev
          <input placeholder="N&#225;zev za&#345;&#237;zen&#237;" value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          UID za&#345;&#237;zen&#237;
          <input placeholder="reader-entrance-01" value={deviceUid} onChange={e => setDeviceUid(e.target.value)} required />
        </label>
        <label>
          Um&#237;st&#283;n&#237;
          <input placeholder="Hlavn&#237; vchod" value={location} onChange={e => setLocation(e.target.value)} />
        </label>
        <label>
          Popis
          <input placeholder="Voliteln&#253; popis" value={description} onChange={e => setDescription(e.target.value)} />
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

function AddDeviceModal({ onClose, onAdded }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('offline')
  const [deviceUid, setDeviceUid] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await createDevice({ name, location, status, deviceUid, description, lastSeen: null })
      onAdded()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 style={{ marginTop: 0 }}>Nov&#233; za&#345;&#237;zen&#237;</h2>
      <form className="create-form" onSubmit={handleSubmit}>
        <label>
          N&#225;zev
          <input placeholder="N&#225;zev za&#345;&#237;zen&#237;" value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          UID za&#345;&#237;zen&#237;
          <input placeholder="reader-entrance-01" value={deviceUid} onChange={e => setDeviceUid(e.target.value)} required />
        </label>
        <label>
          Um&#237;st&#283;n&#237;
          <input placeholder="Hlavn&#237; vchod" value={location} onChange={e => setLocation(e.target.value)} />
        </label>
        <label>
          Popis
          <input placeholder="Voliteln&#253; popis" value={description} onChange={e => setDescription(e.target.value)} />
        </label>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <div className="edit-form-actions">
          <button type="submit" className="btn-save" disabled={loading}>Ulo&#382;it</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Zru&#353;it</button>
        </div>
      </form>
    </Modal>
  )
}

const STATUS_ORDER = { error: 0, offline: 1, online: 2 }

function Terminal() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [sortKey, setSortKey] = useState('status')
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    setLoading(true)
    getDevices()
      .then(setDevices)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const refresh = (msg) => {
    setSelectedId(null)
    setRefreshKey(k => k + 1)
    if (msg) {
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(null), 3000)
    }
  }

  if (loading) return <Spinner />
  if (error) return <p>Chyba: {error}</p>

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
    let valA, valB
    if (sortKey === 'status') {
      valA = STATUS_ORDER[a.status] ?? 1
      valB = STATUS_ORDER[b.status] ?? 1
    } else if (sortKey === 'name') {
      valA = a.name || ''; valB = b.name || ''
    } else if (sortKey === 'location') {
      valA = a.location || ''; valB = b.location || ''
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const selectedDevice = sorted.find(d => d.id === selectedId)

  return (
    <section className="page-content">
      {successMsg && (
        <p className="edit-message" style={{ color: '#16a34a' }}>{successMsg}</p>
      )}
      <div className="widget-card">
        <div className="block-header">
          <h2>Spr&#225;va za&#345;&#237;zen&#237;</h2>
          <button className="btn-add" title="P&#345;idat za&#345;&#237;zen&#237;" onClick={() => setShowAdd(true)}>+</button>
        </div>
        {devices.length === 0 ? (
          <p className="evidence-empty">&#381;&#225;dn&#225; za&#345;&#237;zen&#237;.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>N&#225;zev{arrow('name')}</th>
                <th>UID</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('location')}>Um&#237;st&#283;n&#237;{arrow('location')}</th>
                <th>Popis</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>Stav{arrow('status')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(device => (
                <tr
                  key={device.id}
                  style={{ cursor: 'pointer', background: selectedId === device.id ? '#e0e7ff' : '' }}
                  onClick={() => setSelectedId(selectedId === device.id ? null : device.id)}
                >
                  <td>{device.name}</td>
                  <td>{device.device_uid}</td>
                  <td>{device.location || '—'}</td>
                  <td>{device.description || '—'}</td>
                  <td>
                    <span style={{ color: statusColor(device.status), fontWeight: 600 }}>
                      {statusLabel(device.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedDevice && (
        <EditDeviceForm
          device={selectedDevice}
          onClose={() => setSelectedId(null)}
          onUpdated={refresh}
        />
      )}

      {showAdd && (
        <AddDeviceModal
          onClose={() => setShowAdd(false)}
          onAdded={() => refresh('Za&#345;&#237;zen&#237; bylo &#250;sp&#283;&#353;n&#283; p&#345;id&#225;no.')}
        />
      )}
    </section>
  )
}

export default Terminal