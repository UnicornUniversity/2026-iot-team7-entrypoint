import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
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
    <Modal onClose={onClose}>
      <h2 style={{ marginTop: 0 }}>Upravit kartu</h2>
      <form className="create-form" onSubmit={handleSave}>
        <label>
          Zam&#283;stnanec
          <select value={userId} onChange={e => setUserId(e.target.value)}>
            <option value="">&#8212; bez zam&#283;stnance &#8212;</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} {u.surname}</option>
            ))}
          </select>
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
          Aktivn&#237;
        </label>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <div className="edit-form-actions">
          <button type="submit" className="btn-save" disabled={loading}>Ulo&#382;it</button>
          <button type="button" className="btn-delete" onClick={handleDelete} disabled={loading}>Smazat</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Zru&#353;it</button>
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

      <h2>Vyhled&#225;v&#225;n&#237;</h2>
      <div className="filter-card">
        <label>
          Karta nebo zam&#283;stnanec
          <input
            placeholder="Hledat podle UID nebo jm&#233;na..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
      </div>

      <div className="widget-card">
        <div className="block-header">
          <h2>Seznam karet</h2>
        </div>
        {filtered.length === 0 ? (
          <p>&#381;&#225;dn&#233; karty nenalezeny.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>UID karty</th>
                  <th>Zam&#283;stnanec</th>
                  <th>Aktivn&#237;</th>
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

    </section>
  )
}

export default Cards