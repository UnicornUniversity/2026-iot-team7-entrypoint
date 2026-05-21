import { useState } from 'react'
import { createUser } from '../api'
import { ROLE_IDS } from '../constants'

function CreateEmployeeForm({ onClose, onCreated }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('employee')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
      const name = capitalize(firstName)
      const surname = capitalize(lastName)
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
      await createUser(name, surname, username, email, ROLE_IDS[role], isActive)
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
        <label>
          Email
          <input type="email" placeholder="Zadej email" value={email}
            onChange={e => setEmail(e.target.value)} required />
        </label>
        <div className="form-row" style={{ alignItems: 'center' }}>
          <label>
            Role
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="employee">Zaměstnanec</option>
              <option value="admin">Administrátor</option>
              <option value="maintanance">Údržba</option>
            </select>
          </label>
          <label className="checkbox-label" style={{ marginTop: '22px' }}>
            <input type="checkbox" checked={isActive}
              onChange={e => setIsActive(e.target.checked)} />
            Aktivní zaměstnanec
          </label>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="edit-form-actions">
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Ukládám...' : 'Uložit'}
          </button>
          <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
        </div>
      </form>
    </div>
  )
}

export default CreateEmployeeForm
