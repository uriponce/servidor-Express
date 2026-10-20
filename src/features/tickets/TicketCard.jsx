import Button from '../../components/Button';

// Presentacional (sin useEffect ni llamadas a API).
// Recibe el ticket, callbacks y, opcionalmente, props de drag & drop y un selector
// "Mover a…" (alternativa accesible y táctil al arrastre).
export default function TicketCard({
  ticket,
  onDelete,
  onEdit,
  moveOptions = [], // [{ _id, title }] otras columnas posibles
  onMove,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}) {
  const classes = ['ticket', draggable && 'ticket--draggable', isDragging && 'ticket--dragging']
    .filter(Boolean)
    .join(' ');

  return (
    <article className={classes} draggable={draggable} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="ticket__top">
        <span className="ticket__id">#{ticket._id.slice(-6)}</span>
        <div className="ticket__actions">
          {onEdit && (
            <Button size="sm" variant="ghost" icon onClick={() => onEdit(ticket)} aria-label={`Editar ${ticket.title}`}>
              ✎
            </Button>
          )}
          <Button size="sm" variant="ghost" icon onClick={() => onDelete(ticket)} aria-label={`Eliminar ${ticket.title}`}>
            ✕
          </Button>
        </div>
      </div>
      <h3 className="ticket__title">{ticket.title}</h3>
      {ticket.description && <p className="ticket__desc">{ticket.description}</p>}
      {onMove && moveOptions.length > 0 && (
        <select
          className="ticket__move"
          aria-label={`Mover ${ticket.title} a otra columna`}
          value=""
          onChange={(e) => e.target.value && onMove(ticket, e.target.value)}
        >
          <option value="">Mover a…</option>
          {moveOptions.map((column) => (
            <option key={column._id} value={column._id}>
              {column.title}
            </option>
          ))}
        </select>
      )}
    </article>
  );
}
