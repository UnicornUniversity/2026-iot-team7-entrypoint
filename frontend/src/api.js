// Základní adresa backendu
const BASE_URL = '' // proxy ve vite.config.js přesměruje /api na backend

// Načte seznam všech uživatelů
export async function getUsers() {
  const res = await fetch(`${BASE_URL}/api/v1/users`)
  if (!res.ok) throw new Error('Chyba při načítání uživatelů')
  return res.json()
}

// Načte všechny záznamy docházky
export async function getAttendance() {
  const res = await fetch(`${BASE_URL}/api/v1/attendance`)
  if (!res.ok) throw new Error('Chyba při načítání docházky')
  return res.json()
}

// Načte záznamy docházky konkrétního uživatele
export async function getUserAttendance(userId) {
  const res = await fetch(`${BASE_URL}/api/v1/attendance/${userId}`)
  if (!res.ok) throw new Error('Chyba při načítání docházky')
  return res.json()
}

// Načte seznam všech zařízení
export async function getDevices() {
  const res = await fetch(`${BASE_URL}/api/v1/devices`)
  if (!res.ok) throw new Error('Chyba při načítání zařízení')
  return res.json()
}

// Načte karty podle UID
export async function getCards(cardUid) {
  const res = await fetch(`${BASE_URL}/api/v1/cards/${cardUid}`)
  if (!res.ok) throw new Error('Chyba při načítání karet')
  return res.json()
}

// Přidá nový záznam průchodu
export async function logAttendance(cardUid, deviceId, direction, timestamp) {
  const res = await fetch(`${BASE_URL}/api/v1/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      card_uid: cardUid,
      device_id: deviceId,
      direction,
      timestamp,
    }),
  })
  if (!res.ok) throw new Error('Chyba při přidávání záznamu')
  return res.json()
}

// Vytvoří novou kartu a přiřadí ji uživateli
export async function createCard(cardUid, userId, isActive) {
  const res = await fetch(`${BASE_URL}/api/v1/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // říkáme serveru, že posíláme JSON
    body: JSON.stringify({ cardUid, userId, isActive }), // převedeme objekt na text
  })
  if (!res.ok) throw new Error('Chyba při vytváření karty')
  return res.json()
}
