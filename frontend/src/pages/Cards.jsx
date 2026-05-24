import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import { useState, useEffect } from 'react'
import { getAllCards, getUsers, createCard, updateCard, deleteCard } from '../api'

function AddCardModal({ onClose, onAdded }) {
  const [cardUid, setCardUid] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await createCard(cardUid.toUpperCase(), null, true)
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
      <h2 style={{ marginTop: 0 }}>Přidat kartu</h2>
      <form className="create-form" onSubmit={handleSubmit}>
        <label>
          UID karty
          <input
            placeholder="např. A1B2C3D4"
            value={cardUid}
            onChange={e => setCardUid(e.target.value.toUpperCase())}
            required
            autoFocus
          />
        </label>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <div className="edit-form-actions">
          <button type="submit" className="btn-save" disabled={loading}>Uložit</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
        </div>
      </form>
    </Modal>
  )
}

function EditCardForm({ card, users, onClose, onUpdated }) {
  const [userId, setUserId] = useState(card.user_id || '')
  const [isActive, setIsActive] = useState(card.is_active)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await updateCard(card.card_uid, { userId, isActive })
      onUpdated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Opravdu smazat kartu ${card.card_uid}?`)) return
    setError(null)
    setLoading(true)
    try {
      await deleteCard(card.card_uid)
      onUpdated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 style={{ marginTop: 0 }}>Upravit kartu</h2>
      <form className="create-form" onSubmit={handleSave}>
        <label>
          UID karty
          <input value={card.card_uid} disabled style={{ opacity: 0.6 }} />
        </label>
        <label>
          Zaměstnanec
          <select value={userId} onChange={e => setUserId(e.target.value)}>
            <option value="">— bez zaměstnance —</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} {u.surname}</option>
            ))}
          </select>
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
          Aktivní
        </label>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <div className="edit-form-actions">
          <button type="submit" className="btn-save" disabled={loading}>Uložit</button>
          <button type="button" className="btn-delete" onClick={handleDelete} disabled={loading}>Smazat</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
        </div>
      </form>
    </Modal>
  )
}

function Cards() {
  const [cards, setCards] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    Promise.all([getAllCards(), getUsers()])
      .then(([cardsData, usersData]) => {
        setCards(cardsData)
        setUsers(usersData)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const userMap = {}
  users.forEach(u => { userMap[u.id] = `${u.name} ${u.surname}` })

  const filtered = cards.filter(c => {
    const name = userMap[c.user_id] || ''
    return (
      c.card_uid?.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase())
    )
  })

  if (loading) return <Spinner />
  if (error) return <p>Chyba: {error}</p>

  const selectedCard = filtered.find(c => c.id === selectedId)

  return (
    <section className="page-content">

      <h2>Vyhledávání</h2>
      <div className="filter-card">
        <label>
          Karta nebo zaměstnanec
          <input
            placeholder="Hledat podle UID nebo jména..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
      </div>

      <div className="widget-card">
        <div className="block-header">
          <h2>Seznam karet</h2>
          <button className="btn-add" title="Přidat kartu" onClick={() => setShowAdd(true)}>+</button>
        </div>
        {filtered.length === 0 ? (
          <p className="evidence-empty">Žádné karty nenalezeny.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>UID karty</th>
                  <th>Zaměstnanec</th>
                  <th>Aktivní</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(card => (
                  <tr
                    key={card.id}
                    style={{ cursor: 'pointer', background: selectedId === card.id ? '#e0e7ff' : '' }}
                    onClick={() => setSelectedId(selectedId === card.id ? null : card.id)}
                  >
                    <td>{card.card_uid}</td>
                    <td>{userMap[card.user_id] || '—'}</td>
                    <td>
                      <span className={`badge ${card.is_active ? 'badge-green' : 'badge-gray'}`}>
                        {card.is_active ? 'Ano' : 'Ne'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCard && (
        <EditCardForm
          card={selectedCard}
          users={users}
          onClose={() => setSelectedId(null)}
          onUpdated={() => { setSelectedId(null); setRefreshKey(k => k + 1) }}
        />
      )}

      {showAdd && (
        <AddCardModal
          onClose={() => setShowAdd(false)}
          onAdded={() => setRefreshKey(k => k + 1)}
        />
      )}

    </section>
  )
}

export default Cards