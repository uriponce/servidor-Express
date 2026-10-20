import Modal from './Modal';
import Button from './Button';

export default function ConfirmModal({ title, message, confirmLabel = 'Eliminar', isLoading, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="muted">{message}</p>
      <div className="form-actions">
        <Button onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="danger" loading={isLoading} onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
