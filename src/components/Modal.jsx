import { useId } from 'react';
import Button from './Button';

// Presentacional. Se cierra con Escape o clic en el fondo.
export default function Modal({ title, onClose, children }) {
  const titleId = useId();

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal__header">
          <h2 id={titleId}>{title}</h2>
          <Button variant="ghost" icon aria-label="Cerrar" onClick={onClose}>
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
