import { useState } from 'react'
import { logAttendance } from '../api'
import Modal from './Modal'

function AddAttendanceButton({ onAdded, devices = [], employees = [], cardMap = {} }) {
  const [showForm, setShowForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [cardUid, setCardUid] = useState('')
  const [cardMissing, setCardMissing] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [direction, setDirection] = useState('in')
  const [timestamp, setTimestamp] = useState('')
  const [message, setMessage] = useState(null)

  const nowISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16)

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
    setDirection('in')
    setTimestamp('')
    setMessage(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)
    logAttendance(cardUid, deviceId, direction, timestamp)
      .then(() => {
        onAdded()
        handleClose()
      })
      .catch(() => setMessage('Karta nebyla nalezena nebo není aktivní. Zkontroluj UID karty.'))
  }

  return (
    <div>
      <button className="btn-add" title="Přidat záznam" onClick={() => { setShowForm(true); setTimestamp(nowISO()) }}>
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
                    {emp.name} {emp.surname}
                  </option>
                ))}
              </select>
            </label>
            <label>
              UID karty
              <input
                placeholder="Doplní se automaticky"
                value={cardUid}
                onChange={e => { setCardUid(e.target.value); setCardMissing(false) }}
                required
              />
            </label>
            {cardMissing && (
              <p className="edit-message" style={{ color: '#f59e0b', marginTop: 0 }}>
                Zaměstnanec nemá žádný záznam průchodu — zadej UID karty ručně.
              </p>
            )}
            <label>
              Zařízení
              <select value={deviceId} onChange={e => setDeviceId(e.target.value)} required>
                <option value="">Vyberte zařízení</option>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
            <div className="form-row">
              <label>
                Směr
                <select value={direction} onChange={e => setDirection(e.target.value)}>
                  <option value="in">Příchod</option>
                  <option value="out">Odchod</option>
                </select>
              </label>
              <label>
                Datum a čas
                <input type="datetime-local" value={timestamp}
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