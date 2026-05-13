import { useState } from 'react'
import { getCards, createCard } from '../api'

function Cards() {
  // stav pro vyhledávání karty
  const [searchUid, setSearchUid] = useState('')
  const [cardResult, setCardResult] = useState(null) // výsledek hledání
  const [searchError, setSearchError] = useState(null)

  // stav pro formulář nové karty
  const [newCardUid, setNewCardUid] = useState('')
  const [newUserId, setNewUserId] = useState('')
  const [createMsg, setCreateMsg] = useState(null) // zpráva po vytvoření

  // vyhledání karty podle UID
  const handleSearch = (e) => {
    e.preventDefault() // zabrání znovunačtení stránky po odeslání formuláře
    setSearchError(null)
    setCardResult(null)
    getCards(searchUid)
      .then(data => setCardResult(data))
      .catch(err => setSearchError(err.message))
  }

  // vytvoření nové karty, is_active nastavíme na true hned při vytvoření
  const handleCreate = (e) => {
    e.preventDefault()
    setCreateMsg(null)
    createCard(newCardUid, newUserId, true)
      .then(() => setCreateMsg('Karta úspěšně vytvořena'))
      .catch(err => setCreateMsg(`Chyba: ${err.message}`))
  }

  return (
    <section className="page-content">
      <h1>Karty</h1>

      <h2>Vyhledat kartu</h2>
      <form onSubmit={handleSearch}>
        <input
          value={searchUid}
          onChange={e => setSearchUid(e.target.value)}
          placeholder="UID karty"
        />
        <button type="submit">Hledat</button>
      </form>
      {/* zobrazíme chybu nebo výsledek hledání */}
      {searchError && <p>Chyba: {searchError}</p>}
      {cardResult && (
        <table>
          <thead><tr><th>UID</th><th>Uživatel ID</th><th>Aktivní</th></tr></thead>
          <tbody>
            {cardResult.map(card => (
              <tr key={card.id}>
                <td>{card.card_uid}</td>
                <td>{card.user_id}</td>
                <td>{card.is_active ? 'Ano' : 'Ne'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Vytvořit kartu</h2>
      <form onSubmit={handleCreate}>
        <input
          value={newCardUid}
          onChange={e => setNewCardUid(e.target.value)}
          placeholder="UID karty"
        />
        <input
          value={newUserId}
          onChange={e => setNewUserId(e.target.value)}
          placeholder="ID uživatele"
        />
        <button type="submit">Vytvořit</button>
      </form>
      {/* zobrazíme zprávu o úspěchu nebo chybě */}
      {createMsg && <p>{createMsg}</p>}
    </section>
  )
}

export default Cards
