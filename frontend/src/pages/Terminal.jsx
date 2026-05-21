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
      onUpdated()
      onClose()
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
      onUpdated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <tr className="edit-row">
      <td colSpan={5}>
        <form className="edit-form" onSubmit={handleSave}>
          <input placeholder="Název" value={name} onChange={e => setName(e.target.value)} required />
          <input placeholder="Umístění" value={location} onChange={e => setLocation(e.target.value)} />
          <input placeholder="UID zařízení" value={deviceUid} onChange={e => setDeviceUid(e.target.value)} required />
          <input placeholder="Popis" value={description} onChange={e => setDescription(e.target.value)} />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
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
      <h2 style={{ marginTop: 0 }}>Nové zařízení</h2>
      <form className="create-form" onSubmit={handleSubmit}>
        <label>
          Název
          <input placeholder="Název zařízení" value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          UID zařízení
          <input placeholder="reader-entrance-01" value={deviceUid} onChange={e => setDeviceUid(e.target.value)} required />
        </label>
        <label>
          Umístění
          <input placeholder="Hlavní vchod" value={location} onChange={e => setLocation(e.target.value)} />
        </label>
        <label>
          Popis
          <input placeholder="Volitelný popis" value={description} onChange={e => setDescription(e.target.value)} />
        </label>
        <label>
          Stav
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <div className="edit-form-actions">
          <button type="submit" className="btn-save" disabled={loading}>Uložit</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
        </div>
      </form>
      {error && <p className="edit-message" style={{ color: 'red' }}>{error}</p>}
    </Modal>
  )
}

function Terminal() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    setLoading(true)
    getDevices()
      .then(setDevices)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const refresh = () => setRefreshKey(k => k + 1)

  if (loading) return <p>Načítám...</p>
  if (error) return <p>Chyba: {error}</p>

  return (
    <section className="page-content">
      <div className="attendance-block">
        <div className="block-header">
          <h2>Správa zařízení</h2>
          <button className="btn-add" title="Přidat zařízení" onClick={() => setShowAdd(true)}>+</button>
        </div>
        {devices.length === 0 ? (
          <p className="evidence-empty">Žádná zařízení.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Název</th>
                <th>UID</th>
                <th>Umístění</th>
                <th>Popis</th>
                <th>Stav</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(device => (
                <>
                  <tr
                    key={device.id}
                    style={{ cursor: 'pointer', background: selectedId === device.id ? '#f1f5f9' : '' }}
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
                  {selectedId === device.id && (
                    <EditDeviceForm
                      key={`edit-${device.id}`}
                      device={device}
                      onClose={() => setSelectedId(null)}
                      onUpdated={refresh}
                    />
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <AddDeviceModal
          onClose={() => setShowAdd(false)}
          onAdded={refresh}
        />
      )}
    </section>
  )
}

export default Terminal