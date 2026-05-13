import { useState } from 'react'

function CreateEmployeeForm({ onClose }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [rfid, setRfid] = useState('')
  const [role, setRole] = useState('user')
  const [isActive, setIsActive] = useState(true)
  const [message, setMessage] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: nahradit reálným API voláním až BE dodá endpoint
    setMessage('Vytvoření zaměstnance zatím není dostupné.')
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Nový zaměstnanec</h2>
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Jméno
            <input placeholder="Zadej jméno" value={firstName}
              onChange={e => setFirstName(e.target.value)} />
          </label>
          <label>
            Příjmení
            <input placeholder="Zadej příjmení" value={lastName}
              onChange={e => setLastName(e.target.value)} />
          </label>
        </div>
        <label>
          Email
          <input type="email" placeholder="Zadej email" value={email}
            onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          RFID karta (UID)
          <input placeholder="Zadej UID karty" value={rfid}
            onChange={e => setRfid(e.target.value)} />
        </label>
        <div className="form-row" style={{ alignItems: 'center' }}>
          <label>
            Role
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="user">Uživatel</option>
              <option value="admin">Administrátor</option>
            </select>
          </label>
          <label className="checkbox-label" style={{ marginTop: '22px' }}>
            <input type="checkbox" checked={isActive}
              onChange={e => setIsActive(e.target.checked)} />
            Aktivní zaměstnanec
          </label>
        </div>
        <div className="edit-form-actions">
          <button type="submit" className="btn-save">Uložit</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
        </div>
      </form>
      {message && <p className="edit-message">{message}</p>}
    </div>
  )
}

export default CreateEmployeeForm