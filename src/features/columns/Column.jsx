import Button from '../../components/Button';

// Presentacional: una columna del tablero. Los tickets llegan como children.
// Soporta ser zona de destino de drag & drop mediante callbacks.
export default function Column({
  column,
  count,
  isOver = false,
  onDelete,
  onAddTicket,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}) {
  return (
    <section
      className={`column${isOver ? ' column--over' : ''}`}
      aria-label={`Columna ${column.title}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <header className="column__head">
        <h2 className="column__title">
          {column.title}
          <span className="column__count">{count}</span>
        </h2>
        <Button size="sm" variant="ghost" icon onClick={() => onDelete(column)} aria-label={`Eliminar columna ${column.title}`}>
          ✕
        </Button>
      </header>
      <div className="column__list">{children}</div>
      <Button size="sm" variant="ghost" onClick={() => onAddTicket(column)}>
        + Añadir ticket
      </Button>
    </section>
  );
}
