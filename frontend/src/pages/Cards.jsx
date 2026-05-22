import { useState, useEffect } from 'react'
import { getAllCards, getUsers, updateCard, deleteCard } from '../api'

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
    <tr className="edit-row">
      <td colSpan={4}>
        <form className="edit-form" onSubmit={handleSave}>
          <select value={userId} onChange={e => setUserId(e.target.value)}>
            <option value="">— bez zaměstnance —</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} {u.surname}</option>
            ))}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            Aktivní
          </label>
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

function Cards() {
  const [cards, setCards] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedId, setSelectedId] = useState(null)

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

  if (loading) return <p>Načítám...</p>
  if (error) return <p>Chyba: {error}</p>

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

      <div className="attendance-block">
        <div className="block-header">
          <h2>Seznam karet</h2>
        </div>
        {filtered.length === 0 ? (
          <p>Žádné karty nenalezeny.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>UID karty</th>
                <th>Zaměstnanec</th>
                <th>Aktivní</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(card => (
                <>
                  <tr
                    key={card.id}
                    style={{ cursor: 'pointer', background: selectedId === card.id ? '#f1f5f9' : '' }}
                    onClick={() => setSelectedId(selectedId === card.id ? null : card.id)}
                  >
                    <td>{card.card_uid}</td>
                    <td>{userMap[card.user_id] || '—'}</td>
                    <td>{card.is_active ? 'Ano' : 'Ne'}</td>
                    <td></td>
                  </tr>
                  {selectedId === card.id && (
                    <EditCardForm
                      key={`edit-${card.id}`}
                      card={card}
                      users={users}
                      onClose={() => setSelectedId(null)}
                      onUpdated={() => setRefreshKey(k => k + 1)}
                    />
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </section>
  )
}

export default Cards