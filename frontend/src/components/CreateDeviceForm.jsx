import { useState } from 'react'
import { createDevice } from '../api'

function CreateDeviceForm({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
  })
  const [message, setMessage] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)
    // Key is generated automatically on the server
    createDevice(formData)
      .then((newDevice) => {
        setMessage(`Zařízení úspěšně vytvořeno. Klíč: ${newDevice.key}`)
        setTimeout(() => {
          onAdded()
          onClose()
        }, 3000) // Longer timeout to let admin copy the key
      })
      .catch(err => setMessage(`Chyba: ${err.message}`))
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Nové zařízení</h2>
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Název
            <input
              placeholder="Např. Hlavní vchod"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </label>
          <label>
            Lokalita
            <input
              placeholder="Např. Budova A"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </label>
        </div>
        <label>
          Popis
          <input
            placeholder="Nepovinný popis"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </label>
        <p className="edit-message" style={{ color: '#6b7280', fontSize: '0.85rem' }}>
          Unikátní klíč pro hardware bude vygenerován automaticky.
        </p>
        <div className="edit-form-actions">
          <button type="submit" className="btn-save">Vytvořit</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
        </div>
      </form>
      {message && <p className="edit-message">{message}</p>}
    </div>
  )
}

export default CreateDeviceForm
