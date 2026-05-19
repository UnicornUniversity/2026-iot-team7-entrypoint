function Pagination({ total, limit, offset, onPageChange }) {
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange((currentPage - 2) * limit)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage * limit)
    }
  }

  return (
    <div className="pagination" style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'center', alignItems: 'center' }}>
      <button 
        className="btn-link" 
        disabled={currentPage === 1}
        onClick={handlePrev}
        style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'default' : 'pointer' }}
      >
        « Předchozí
      </button>

      <div style={{ display: 'flex', gap: '4px' }}>
        {pages.map(p => (
          <button 
            key={p} 
            className={`btn-link ${currentPage === p ? 'active' : ''}`}
            style={{ 
              fontWeight: currentPage === p ? 'bold' : 'normal', 
              background: currentPage === p ? 'var(--border)' : 'transparent',
              minWidth: '32px'
            }}
            onClick={() => onPageChange((p - 1) * limit)}
          >
            {p}
          </button>
        ))}
      </div>

      <button 
        className="btn-link" 
        disabled={currentPage === totalPages}
        onClick={handleNext}
        style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'default' : 'pointer' }}
      >
        Další »
      </button>
    </div>
  )
}

export default Pagination
