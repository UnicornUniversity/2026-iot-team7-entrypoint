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

  // Chronological sort for processing
  const userRecords = records
    .filter(r => r.user?.id === userId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const dayMap = {}
  let currentArrival = null

  userRecords.forEach(r => {
    if (r.type === 'arrival') {
      currentArrival = r
    } else if (r.type === 'departure' && currentArrival) {
      // Segment found! Attribute to the day it STARTED.
      const startDay = new Date(currentArrival.timestamp).toLocaleDateString('cs-CZ')
      
      if (!dayMap[startDay]) {
        dayMap[startDay] = { 
          segments: [], 
          firstIn: null, 
          lastOut: null, 
          dateObj: new Date(currentArrival.timestamp),
          isOpen: false
        }
      }
      
      const duration = new Date(r.timestamp).getTime() - new Date(currentArrival.timestamp).getTime()
      const seg = {
        in: new Date(currentArrival.timestamp),
        out: new Date(r.timestamp),
        mins: Math.round(duration / 60000)
      }
      
      dayMap[startDay].segments.push(seg)
      
      // Track earliest start and latest end for this 'start day'
      if (!dayMap[startDay].firstIn) {
          dayMap[startDay].firstIn = seg.in
      }
      dayMap[startDay].lastOut = seg.out
      
      currentArrival = null
    }
  })

  // If there's an arrival without a departure at the end of the list
  if (currentArrival) {
    const day = new Date(currentArrival.timestamp).toLocaleDateString('cs-CZ')
    if (!dayMap[day]) {
      dayMap[day] = { 
        segments: [], 
        firstIn: new Date(currentArrival.timestamp), 
        lastOut: null, 
        dateObj: new Date(currentArrival.timestamp),
        isOpen: true 
      }
    } else {
      dayMap[day].isOpen = true
      if (!dayMap[day].firstIn) dayMap[day].firstIn = new Date(currentArrival.timestamp)
    }
  }

  const rows = Object.entries(dayMap).map(([day, data]) => {
    const totalMins = data.segments.reduce((sum, seg) => sum + seg.mins, 0)
    return { 
        day, 
        dateObj: data.dateObj,
        firstIn: data.firstIn, 
        lastOut: data.lastOut, 
        workedMins: totalMins,
        segmentsCount: data.segments.length,
        isOpen: data.isOpen
    }
  })

  rows.sort((a, b) => {
    let valA, valB
    if (sortKey === 'date') {
      valA = a.dateObj.getTime(); valB = b.dateObj.getTime()
    } else if (sortKey === 'in') {
      valA = a.firstIn ? a.firstIn.getTime() : 0
      valB = b.firstIn ? b.firstIn.getTime() : 0
    } else if (sortKey === 'out') {
      valA = a.lastOut ? a.lastOut.getTime() : 0
      valB = b.lastOut ? b.lastOut.getTime() : 0
    } else if (sortKey === 'worked') {
      valA = a.workedMins; valB = b.workedMins
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (rows.length === 0) return <p>Žádné záznamy pro vybraného zaměstnance ve vybraném období.</p>

  return (
    <table>
      <thead>
        <tr>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
            Datum{arrow('date')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('in')}>
            První příchod{arrow('in')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('out')}>
            Poslední odchod{arrow('out')}
          </th>
          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('worked')}>
            Celkem odpracováno{arrow('worked')}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ day, firstIn, lastOut, workedMins, segmentsCount, isOpen }) => {
          const worked = workedMins > 0
            ? `${Math.floor(workedMins / 60)} h ${workedMins % 60} min`
            : (isOpen ? 'Probíhá...' : '—')
          
          return (
            <tr key={day}>
              <td>{day}</td>
              <td>{firstIn ? firstIn.toLocaleString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}</td>
              <td>{lastOut ? lastOut.toLocaleString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : (isOpen ? 'Otevřeno' : '—')}</td>
              <td title={`${segmentsCount} segment(ů)`}>
                <strong>{worked}</strong>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default AttendanceEvidence
