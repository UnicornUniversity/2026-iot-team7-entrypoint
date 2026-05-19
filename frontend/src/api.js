// Základní adresa backendu
const BASE_URL = '' // proxy ve vite.config.js přesměruje /api na backend

function getHeaders() {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * Přeloží anglické chybové zprávy ze serveru do češtiny.
 * Pokud zprávu nezná, vrátí původní zprávu nebo null.
 */
function translateError(msg) {
  if (!msg) return null;
  const m = msg.toString();
  if (m.includes('account is inactive')) return 'Tento účet je neaktivní. Obraťte se na administrátora.';
  if (m.includes('Invalid credentials')) return 'Neplatné jméno nebo heslo';
  if (m.includes('Username already exists')) return 'Uživatelské jméno již existuje';
  if (m.includes('Device key already exists')) return 'Klíč zařízení již existuje';
  if (m.includes('cannot delete your own account')) return 'Nemůžete smazat svůj vlastní účet';
  if (m.includes('Current password is incorrect')) return 'Současné heslo je nesprávné';
  if (m.includes('Unauthorized')) return 'Nemáte oprávnění k této akci';
  return m;
}

// Přihlášení uživatele
export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(translateError(data.message) || 'Neplatné jméno nebo heslo');
  }
  
  localStorage.setItem('token', data.access_token)
  return data
}

// Načte seznam všech uživatelů
export async function getUsers(filters = {}) {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v != null && v !== '')
  )
  const query = new URLSearchParams(cleanFilters).toString()
  const res = await fetch(`${BASE_URL}/api/v1/users?${query}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Chyba při načítání uživatelů')
  return res.json()
}

// Vytvoří nového uživatele
export async function createUser(userData) {
  const res = await fetch(`${BASE_URL}/api/v1/users`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  })
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(translateError(data.message) || 'Chyba při vytváření uživatele');
  }
  return data
}

// Upraví uživatele
export async function updateUser(id, userData) {
  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  })
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(translateError(data.message) || 'Chyba při úpravě uživatele');
  }
  return data
}

// Smaže uživatele
export async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(translateError(data.message) || 'Chyba při mazání uživatele');
  }
}

// Načte všechny záznamy docházky (Admin) nebo vlastní (Uživatel)
export async function getAttendance(filters = {}, isAdmin = true, userId = null) {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v != null && v !== '')
  )
  const query = new URLSearchParams(cleanFilters).toString()
  
  const endpoint = isAdmin ? `${BASE_URL}/api/v1/records?${query}` : `${BASE_URL}/api/v1/records/my?${query}`
  
  const res = await fetch(endpoint, { headers: getHeaders() })
  if (!res.ok) throw new Error('Chyba při načítání docházky')
  return res.json()
}

// Načte záznamy docházky konkrétního uživatele
export async function getUserAttendance(userId, filters = {}) {
  return getAttendance({ ...filters, userId }, true)
}

// Změní heslo aktuálně přihlášeného uživatele
export async function updateMyPassword(currentPassword, newPassword) {
  const res = await fetch(`${BASE_URL}/api/v1/users/me/password`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
      throw new Error(translateError(data.message) || 'Chyba při změně hesla');
  }
  return res.json()
}

// Načte seznam všech zařízení
export async function getDevices(filters = {}) {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v != null && v !== '')
  )
  const query = new URLSearchParams(cleanFilters).toString()
  const res = await fetch(`${BASE_URL}/api/v1/devices?${query}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Chyba při načítání zařízení')
  return res.json()
}

// Vytvoří nové zařízení
export async function createDevice(deviceData) {
  const res = await fetch(`${BASE_URL}/api/v1/devices`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(deviceData),
  })
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(translateError(data.message) || 'Chyba při vytváření zařízení');
  }
  return data
}

// Upraví zařízení
export async function updateDevice(id, deviceData) {
  const res = await fetch(`${BASE_URL}/api/v1/devices/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(deviceData),
  })
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(translateError(data.message) || 'Chyba při úpravě zařízení');
  }
  return data
}

// Smaže zařízení
export async function deleteDevice(id) {
  const res = await fetch(`${BASE_URL}/api/v1/devices/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(translateError(data.message) || 'Chyba při mazání zařízení');
  }
}

// Načte karty podle UID (Nyní hledá uživatele podle cardID)
export async function getCards(cardUid) {
  const res = await fetch(`${BASE_URL}/api/v1/users/card/${cardUid}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Chyba při načítání karet')
  const user = await res.json()
  if (user) {
    return [{
      id: user.id,
      card_uid: user.cardID,
      user_id: user.id,
      is_active: user.isActive
    }]
  }
  return []
}

// Vytvoří novou kartu (v naší logice přiřadí cardID uživateli)
export async function createCard(cardUid, userId, isActive) {
  const res = await fetch(`${BASE_URL}/api/v1/users/${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ cardID: cardUid, isActive }),
  })
  if (!res.ok) throw new Error('Chyba při přiřazování karty')
  return res.json()
}

// Přidá nový záznam průchodu
export async function logAttendance(userId, type, timestamp, deviceId = null) {
  const res = await fetch(`${BASE_URL}/api/v1/records`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      user: { id: userId },
      device: deviceId ? { id: deviceId } : null,
      type,
      timestamp,
    }),
  })
  if (!res.ok) throw new Error('Chyba při přidávání záznamu')
  return res.json()
}

// Upraví záznam docházky
export async function updateAttendanceRecord(id, recordData) {
  const res = await fetch(`${BASE_URL}/api/v1/records/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(recordData),
  })
  if (!res.ok) throw new Error('Chyba při úpravě záznamu')
  return res.json()
}

// Smaže záznam docházky
export async function deleteAttendanceRecord(id) {
  const res = await fetch(`${BASE_URL}/api/v1/records/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Chyba při mazání záznamu')
}
