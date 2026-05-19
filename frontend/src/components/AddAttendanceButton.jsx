import { useState } from 'react'
import { logAttendance } from '../api'
import Modal from './Modal'

function AddAttendanceButton({ onAdded, devices = [], employees = [], cardMap = {}, initialUserId = '' }) {
  const [showForm, setShowForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [cardUid, setCardUid] = useState('')
  const [cardMissing, setCardMissing] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [type, setType] = useState('arrival')
  const [timestamp, setTimestamp] = useState('')
  const [message, setMessage] = useState(null)

  const nowISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 19)

  const handleOpen = () => {
      setShowForm(true)
      setTimestamp(nowISO())
      if (initialUserId) {
          setSelectedUserId(initialUserId)
          const card = cardMap[initialUserId] || ''
          setCardUid(card)
          setCardMissing(!card)
      }
  }

  const handleEmployeeChange = (e) => {
    const userId = e.target.value
    setSelectedUserId(userId)
    const card = cardMap[userId] || ''
    setCardUid(card)
    setCardMissing(!!userId && !card)
  }

  const handleClose = () => {
    setShowForm(false)
    setSelectedUserId('')
    setCardUid('')
    setCardMissing(false)
    setDeviceId('')
    setType('arrival')
    setTimestamp('')
    setMessage(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)
    logAttendance(selectedUserId, type, timestamp, deviceId)
      .then(() => {
        onAdded()
        handleClose()
      })
      .catch((err) => setMessage(`Chyba: ${err.message}`))
  }

  return (
    <div>
      <button className="btn-add" title="Přidat záznam" onClick={handleOpen}>
        +
      </button>

      {message && <p>{message}</p>}

      {showForm && (
        <Modal onClose={handleClose}>
          <h2 style={{ marginTop: 0 }}>Nový záznam</h2>
          <form className="create-form" onSubmit={handleSubmit}>
            <label>
              Zaměstnanec
              <select value={selectedUserId} onChange={handleEmployeeChange} required>
                <option value="">Vyberte zaměstnance</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </label>
            
            {/* Displaying Card ID as read-only or info if it exists on user */}
            {selectedUserId && (
              <p className="edit-message" style={{ marginBottom: '10px' }}>
                Karta: {cardUid || 'Nepřiřazena'}
              </p>
            )}

            <label>
              Zařízení (volitelné pro manuální zadání)
              <select value={deviceId} onChange={e => setDeviceId(e.target.value)}>
                <option value="">Manuální záznam</option>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
            <div className="form-row">
              <label>
                Směr
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="arrival">Příchod</option>
                  <option value="departure">Odchod</option>
                </select>
              </label>
              <label>
                Datum a čas
                <input type="datetime-local" value={timestamp} step="1"
                  onChange={e => setTimestamp(e.target.value)} required />
              </label>
            </div>
            <div className="edit-form-actions">
              <button type="submit" className="btn-save">Uložit</button>
              <button type="button" className="btn-cancel" onClick={handleClose}>Zrušit</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default AddAttendanceButton
