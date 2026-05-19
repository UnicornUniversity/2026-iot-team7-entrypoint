import { useState } from 'react'
import { updateMyPassword } from '../api'
import Modal from '../components/Modal'

function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [isError, setIsError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)
    setIsError(false)

    if (newPassword !== confirmPassword) {
      setMessage('Nová hesla se neshodují.')
      setIsError(true)
      return
    }

    if (newPassword.length < 4) {
      setMessage('Heslo musí mít alespoň 4 znaky.')
      setIsError(true)
      return
    }

    updateMyPassword(currentPassword, newPassword)
      .then(() => {
        setMessage('Heslo bylo úspěšně změněno.')
        setTimeout(() => onClose(), 1500)
      })
      .catch(err => {
        setMessage(`Chyba: ${err.message}`)
        setIsError(true)
      })
  }

  return (
    <Modal onClose={onClose}>
      <h2 style={{ marginTop: 0 }}>Změna hesla</h2>
      <form className="create-form" onSubmit={handleSubmit}>
        <label>
          Současné heslo
          <input 
            type="password" 
            value={currentPassword} 
            onChange={e => setCurrentPassword(e.target.value)} 
            required 
            placeholder="Zadej současné heslo"
          />
        </label>
        <hr style={{ margin: '8px 0', opacity: 0.2 }} />
        <label>
          Nové heslo
          <input 
            type="password" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            required 
            placeholder="Zadej nové heslo"
          />
        </label>
        <label>
          Potvrzení nového hesla
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
            placeholder="Zadej nové heslo znovu"
          />
        </label>
        <div className="edit-form-actions">
          <button type="submit" className="btn-save">Uložit heslo</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
        </div>
      </form>
      {message && (
        <p className="edit-message" style={{ color: isError ? '#ef4444' : 'var(--accent)', fontWeight: '600' }}>
          {message}
        </p>
      )}
    </Modal>
  )
}

export default ChangePasswordModal
