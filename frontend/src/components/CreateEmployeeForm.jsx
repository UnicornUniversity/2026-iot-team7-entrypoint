import { useState } from 'react'
import { register, createCard, getAllCards } from '../api'
import { ROLE_IDS } from '../constants'

async function generateCardUid() {
  const cards = await getAllCards()
  const numbers = cards
    .map(c => c.card_uid?.match(/^US(\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number)
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1234
  return `US${next}`
}

function CreateEmployeeForm({ onClose, onCreated }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('employee')
  const [isActive, setIsActive] = useState(true)
  const [cardUid, setCardUid] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (password !== passwordConfirm) {
      setError('Hesla se neshodují.')
      return
    }
    if (password.length < 8) {
      setError('Heslo musí mít alespoň 8 znaků.')
      return
    }
    setLoading(true)
    try {
      const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
      const name = capitalize(firstName)
      const surname = capitalize(lastName)
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
      const { userId } = await register(name, surname, username, email, ROLE_IDS[role], password)
      if (cardUid) {
        await createCard(cardUid, userId, true)
      }
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
        <div className="form-row">
          <label>
            Heslo
            <input type="password" placeholder="Min. 8 znaků" value={password}
              onChange={e => setPassword(e.target.value)} required />
          </label>
          <label>
            Potvrzení hesla
            <input type="password" placeholder="Zopakuj heslo" value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)} required />
          </label>
        </div>
        <label>
          UID karty
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              placeholder="Nepovinné — nebo vygeneruj"
              value={cardUid}
              onChange={e => setCardUid(e.target.value.toUpperCase())}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn-secondary" onClick={() => generateCardUid().then(setCardUid)}>
              Vygenerovat
            </button>
          </div>
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