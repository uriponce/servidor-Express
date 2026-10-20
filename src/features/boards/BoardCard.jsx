import { Link } from 'react-router-dom';
import Button from '../../components/Button';

// Presentacional. El <Link> es navegación pura (no muta nada); borrar es un botón con callback.
export default function BoardCard({ board, onDelete }) {
  return (
    <article className="board-card">
      <Link className="board-card__title" to={`/boards/${board._id}`}>
        {board.title}
      </Link>
      <p className="board-card__desc">{board.description}</p>
      <div className="board-card__foot">
        <span className="mono muted" style={{ fontSize: '0.75rem' }}>#{board._id.slice(-6)}</span>
        <Button size="sm" variant="danger" onClick={() => onDelete(board)} aria-label={`Eliminar tablero ${board.title}`}>
          Eliminar
        </Button>
      </div>
    </article>
  );
}
