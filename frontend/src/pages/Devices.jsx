import { useState, useEffect } from 'react'
import { getDevices } from '../api'
import DevicesList from '../components/DevicesList'
import CreateDeviceForm from '../components/CreateDeviceForm'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'

function Devices() {
  const [devices, setDevices] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 10
  
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDevices()
  }, [offset])

  const fetchDevices = () => {
    setLoading(true)
    getDevices({ limit, offset })
      .then(res => {
        setDevices(res.data)
        setTotal(res.total)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const filtered = devices.filter(d => 
    (d.name && d.name.toLowerCase().includes(search.toLowerCase())) ||
    (d.location && d.location.toLowerCase().includes(search.toLowerCase())) ||
    (d.key && d.key.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading && devices.length === 0) return <p>Načítám...</p>
  if (error) return <p>Chyba: {error}</p>

  return (
    <section className="page-content">
      <h2>Správa zařízení</h2>

      {/* Blok 1 — vyhledávání */}
      <div className="filter-card">
        <label>
          Zařízení
          <div style={{ position: 'relative' }}>
            <input
              placeholder="Hledat"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingRight: '32px' }}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: 'var(--text)',
                  opacity: 0.6
                }}
              >
                ✕
              </button>
            )}
          </div>
        </label>
      </div>

      {/* Blok 2 — seznam zařízení */}
      <div className="attendance-block">
        <div className="block-header">
          <h2>Seznam zařízení</h2>
          <button className="btn-add" title="Nové zařízení"
            onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕' : '+'}
          </button>
        </div>
        {showForm && (
          <Modal onClose={() => setShowForm(false)}>
            <CreateDeviceForm 
              onClose={() => setShowForm(false)} 
              onAdded={fetchDevices} 
            />
          </Modal>
        )}
        <DevicesList devices={filtered} onRefresh={fetchDevices} />
        
        <Pagination 
          total={total} 
          limit={limit} 
          offset={offset} 
          onPageChange={setOffset} 
        />
      </div>
    </section>
  )
}

export default Devices
