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

export async function updateCard(cardUid, fields) {
  const res = await fetch(`${BASE_URL}/api/v1/cards/${cardUid}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(fields),
  })
  if (!res.ok) throw new Error('Chyba při úpravě karty')
  return res.json()
}

export async function deleteCard(cardUid) {
  const res = await fetch(`${BASE_URL}/api/v1/cards/${cardUid}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Chyba při mazání karty')
  return res.json()
}

export async function getAllCards() {
  const res = await fetch(`${BASE_URL}/api/v1/cards`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Chyba při načítání karet')
  return res.json()
}

export async function getCards(cardUid) {
  const res = await fetch(`${BASE_URL}/api/v1/cards/${cardUid}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Chyba při načítání karet')
  return res.json()
}

export async function updateAttendance(id, fields) {
  const res = await fetch(`${BASE_URL}/api/v1/attendance/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(fields),
  })
  if (!res.ok) throw new Error('Chyba při úpravě záznamu')
  return res.json()
}

export async function deleteAttendance(id) {
  const res = await fetch(`${BASE_URL}/api/v1/attendance/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Chyba při mazání záznamu')
  return res.json()
}

export async function logAttendance(cardUid, deviceId, direction, timestamp) {
  const res = await fetch(`${BASE_URL}/api/v1/attendance`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ cardUid, deviceId, direction, timestamp }),
  })
  if (!res.ok) throw new Error('Chyba při přidávání záznamu')
  return res.json()
}

export async function updateUser(id, fields) {
  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(fields),
  })
  if (!res.ok) throw new Error('Chyba při úpravě zaměstnance')
  return res.json()
}

export async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    if (data.message?.includes('foreign key')) {
      throw new Error('Zaměstnanec má přiřazenou kartu nebo záznamy docházky — nejdříve je odstraň.')
    }
    throw new Error('Chyba při mazání zaměstnance')
  }
  return res.json()
}

export async function createUser(name, surname, username, email, roleId, isActive) {
  const res = await fetch(`${BASE_URL}/api/v1/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, surname, username, email, roleId, isActive }),
  })
  if (!res.ok) throw new Error('Chyba při vytváření zaměstnance')
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
