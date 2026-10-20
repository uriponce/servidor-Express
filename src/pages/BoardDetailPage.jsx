import { Link, useParams } from 'react-router-dom';
import { useBoardQuery } from '../features/boards/useBoards';
import KanbanBoard from '../features/boards/KanbanBoard';
import StateMessage from '../components/StateMessage';
import Button from '../components/Button';

export default function BoardDetailPage() {
  const { boardId } = useParams();
  const { data: board, isLoading, isError, error, refetch } = useBoardQuery(boardId);

  if (isLoading) return <StateMessage kind="loading" title="Cargando tablero…" />;

  if (isError) {
    const notFound = error.status === 404 || error.status === 400;
    return (
      <StateMessage kind="error" title={notFound ? 'Tablero no encontrado' : 'No se pudo cargar el tablero'}>
        <span>{error.message}</span>
        {!notFound && <Button onClick={() => refetch()}>Reintentar</Button>}
        <Link to="/boards">← Volver a mis tableros</Link>
      </StateMessage>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="breadcrumb"><Link to="/boards">tableros</Link> / #{board._id.slice(-6)}</p>
          <h1>{board.title}</h1>
          {board.description && <p className="muted">{board.description}</p>}
        </div>
      </div>
      <KanbanBoard board={board} />
    </>
  );
}
