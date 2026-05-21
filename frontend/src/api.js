const BASE_URL = ''

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Špatný email nebo heslo')
  return res.json()
}

export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return
  await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
}

export async function getUserById(id) {
  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Chyba při načítání uživatele')
  return res.json()
}

export async function getUsers() {
  const res = await fetch(`${BASE_URL}/api/v1/users`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Chyba při načítání uživatelů')
  return res.json()
}

export async function getAttendance() {
  const res = await fetch(`${BASE_URL}/api/v1/attendance`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Chyba při načítání docházky')
  return res.json()
}

export async function getUserAttendance(userId) {
  const res = await fetch(`${BASE_URL}/api/v1/attendance/${userId}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Chyba při načítání docházky')
  return res.json()
}

export async function getDevices() {
  const res = await fetch(`${BASE_URL}/api/v1/devices`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Chyba při načítání zařízení')
  return res.json()
}

export async function getCards(cardUid) {
  const res = await fetch(`${BASE_URL}/api/v1/cards/${cardUid}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Chyba při načítání karet')
  return res.json()
}

export async function logAttendance(cardUid, deviceId, direction, timestamp) {
  const res = await fetch(`${BASE_URL}/api/v1/attendance`, {
    method: 'POST',
    headers: authHeaders(),
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

export async function createCard(cardUid, userId, isActive) {
  const res = await fetch(`${BASE_URL}/api/v1/cards`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ cardUid, userId, isActive }),
  })
  if (!res.ok) throw new Error('Chyba při vytváření karty')
  return res.json()
}
