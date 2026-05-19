import { useState } from 'react'
import { createUser } from '../api'

function CreateEmployeeForm({ onClose }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [cardID, setCardID] = useState('')
  const [role, setRole] = useState('user')
  const [isActive, setIsActive] = useState(true)
  const [message, setMessage] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)

    const userData = {
      firstName,
      lastName,
      username,
      hashedPassword: password, // Service hashes this
      cardID: cardID || null,
      role,
      isActive
    }

    createUser(userData)
      .then(() => {
        setMessage('Zaměstnanec úspěšně vytvořen.')
        setTimeout(() => {
          onClose()
          window.location.reload() // Simple refresh to show new user
        }, 1500)
      })
      .catch(err => setMessage(`Chyba: ${err.message}`))
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Nový zaměstnanec</h2>
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Jméno
            <input placeholder="Zadej jméno" value={firstName}
              onChange={e => setFirstName(e.target.value)} required />
          </label>
          <label>
            Příjmení
            <input placeholder="Zadej příjmení" value={lastName}
              onChange={e => setLastName(e.target.value)} required />
          </label>
        </div>
        <div className="form-row">
          <label>
            Uživatelské jméno
            <input placeholder="Zadej login" value={username}
              onChange={e => setUsername(e.target.value)} required />
          </label>
          <label>
            Heslo
            <input type="password" placeholder="Zadej heslo" value={password}
              onChange={e => setPassword(e.target.value)} required />
          </label>
        </div>
        <label>
          RFID karta (UID)
          <input placeholder="Zadej UID karty" value={cardID}
            onChange={e => setCardID(e.target.value)} />
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
