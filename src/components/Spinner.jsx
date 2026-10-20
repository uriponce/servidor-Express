export default function Spinner({ large = false, label = 'Cargando' }) {
  return (
    <span
      className={`spinner${large ? ' spinner--lg' : ''}`}
      role="status"
      aria-label={label}
    />
  );
}
