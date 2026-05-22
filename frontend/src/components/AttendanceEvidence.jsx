import { useState } from 'react'

function AttendanceEvidence({ records, userId }) {
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const arrow = (key) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  if (!userId) return (
    <div className="evidence-empty">
      <p>Vyberte zaměstnance pro zobrazení evidence.</p>
    </div>
  )

  const userRecords = records
    .filter(r => r.user_id === userId && r.success)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  const byDay = {}
  userRecords.forEach(r => {
    const day = new Date(r.timestamp).toLocaleDateString('cs-CZ')
    if (!byDay[day]) byDay[day] = { in: null, out: null, dateObj: new Date(r.timestamp) }
    if (r.direction === 'in' && !byDay[day].in) byDay[day].in = r.timestamp
    if (r.direction === 'out') byDay[day].out = r.timestamp
  })

  const rows = Object.entries(byDay).map(([day, times]) => {
    let workedMins = null
    if (times.in && times.out) {
      workedMins = Math.round((new Date(times.out) - new Date(times.in)) / 60000)
    }
    return { day, times, workedMins }
  })

  rows.sort((a, b) => {
    let valA, valB
    if (sortKey === 'date') {
      valA = a.times.dateObj; valB = b.times.dateObj
    } else if (sortKey === 'in') {
      valA = a.times.in ? new Date(a.times.in) : 0
      valB = b.times.in ? new Date(b.times.in) : 0
    } else if (sortKey === 'out') {
      valA = a.times.out ? new Date(a.times.out) : 0
      valB = b.times.out ? new Date(b.times.out) : 0
    } else if (sortKey === 'worked') {
      valA = a.workedMins ?? -1; valB = b.workedMins ?? -1
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (rows.length === 0) return <p>Žádné záznamy pro vybraného zaměstnance.</p>

  return (
    <div className="table-scroll">
    <table>
      <thead>
        <tr>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
            Datum{arrow('date')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('in')}>
            Příchod{arrow('in')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('out')}>
            Odchod{arrow('out')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('worked')}>
            Odpracováno{arrow('worked')}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ day, times, workedMins }) => {
          const worked = workedMins !== null
            ? `${Math.floor(workedMins / 60)} h ${workedMins % 60} min`
            : '—'
          return (
            <tr key={day}>
              <td>{day}</td>
              <td>{times.in ? new Date(times.in).toLocaleTimeString('cs-CZ') : '—'}</td>
              <td>{times.out ? new Date(times.out).toLocaleTimeString('cs-CZ') : '—'}</td>
              <td>{worked}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
    </div>
  )
}

export default AttendanceEvidence