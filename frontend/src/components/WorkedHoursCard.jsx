function WorkedHoursCard({ records }) {
  // výpočet odpracovaných hodin z párů IN → OUT
  const totalMinutes = (() => {
    // bereme jen úspěšné záznamy, seřazené od nejstaršího
    const sorted = [...records]
      .filter(r => r.success)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    const lastIn = {} // userId → čas posledního příchodu
    let minutes = 0

    sorted.forEach(r => {
      if (r.direction === 'in') {
        // zapamatujeme čas příchodu
        lastIn[r.user_id] = new Date(r.timestamp)
      } else if (r.direction === 'out' && lastIn[r.user_id]) {
        // spočítáme dobu od příchodu do odchodu
        const diff = new Date(r.timestamp) - lastIn[r.user_id]
        minutes += diff / 60000
        delete lastIn[r.user_id]
      }
    })

    return Math.round(minutes)
  })()

  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  return (
    <div className="worked-hours-card">
      <h2>Odpracováno</h2>
      <p>{hours} h {mins} min</p>
    </div>
  )
}

export default WorkedHoursCard
