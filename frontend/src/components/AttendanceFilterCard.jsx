import { useState } from 'react'

function AttendanceFilterCard({ filters, onFilterChange, employees, isAdmin }) {
  const today = new Date()
  const [dateMode, setDateMode] = useState('month')
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())

  const months = ['Leden','Únor','Březen','Duben','Květen','Červen',
    'Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i)

  const applyMonth = (month, year) => {
    const firstDay = new Date(year, month, 1).toISOString().slice(0, 10)
    const lastDay = new Date(year, month + 1, 0).toISOString().slice(0, 10)
    onFilterChange({ ...filters, dateFrom: firstDay, dateTo: lastDay })
  }

  const handleMonthSelect = (e) => {
    const month = parseInt(e.target.value)
    setSelectedMonth(month)
    applyMonth(month, selectedYear)
  }

  const handleYearSelect = (e) => {
    const year = parseInt(e.target.value)
    setSelectedYear(year)
    applyMonth(selectedMonth, year)
  }

  return (
    <div className="filter-card">
      {isAdmin && (
        <label>
          Zaměstnanec
          <select value={filters.userId}
            onChange={e => onFilterChange({ ...filters, userId: e.target.value })}>
            <option value="">Všichni</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} {emp.surname}
              </option>
            ))}
          </select>
        </label>
      )}

      {dateMode === 'month' ? (
        <>
          <label>
            Měsíc
            <select value={selectedMonth} onChange={handleMonthSelect}>
              {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </label>
          <label>
            Rok
            <select value={selectedYear} onChange={handleYearSelect}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
        </>
      ) : (
        <>
          <label>
            Od
            <input type="date" value={filters.dateFrom}
              onChange={e => onFilterChange({ ...filters, dateFrom: e.target.value })} />
          </label>
          <label>
            Do
            <input type="date" value={filters.dateTo}
              onChange={e => onFilterChange({ ...filters, dateTo: e.target.value })} />
          </label>
        </>
      )}

      {/* přepínač módu výběru data */}
      <button type="button" className="btn-date-mode"
        title={dateMode === 'month' ? 'Zadat konkrétní datum' : 'Zpět na výběr měsíce'}
        onClick={() => setDateMode(dateMode === 'month' ? 'specific' : 'month')}>
        {dateMode === 'month' ? '📅' : '↩'}
      </button>
    </div>
  )
}

export default AttendanceFilterCard