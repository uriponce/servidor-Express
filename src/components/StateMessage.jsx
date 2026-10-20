import Spinner from './Spinner';

// Estados de pantalla: loading | error | empty
export default function StateMessage({ kind = 'empty', title, children }) {
  return (
    <div className={`state${kind === 'error' ? ' state--error' : ''}`} role={kind === 'error' ? 'alert' : undefined}>
      {kind === 'loading' && <Spinner large />}
      {title && <strong>{title}</strong>}
      {children}
    </div>
  );
}
