function Modal({ onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation zabrání zavření při kliknutí uvnitř modalu */}
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  )
}

export default Modal