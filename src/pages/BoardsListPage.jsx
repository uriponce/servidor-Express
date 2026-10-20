import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardsQuery, useCreateBoard, useDeleteBoard } from '../features/boards/useBoards';
import BoardCard from '../features/boards/BoardCard';
import BoardForm from '../features/boards/BoardForm';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Button from '../components/Button';
import StateMessage from '../components/StateMessage';

export default function BoardsListPage() {
  const navigate = useNavigate();
  const { data: boards, isLoading, isError, error, refetch } = useBoardsQuery();
  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard();
  const [creating, setCreating] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);

  const handleCreate = async (values) => {
    const board = await createBoard.mutateAsync(values);
    navigate(`/boards/${board._id}`); // solo después de que la API respondió OK
  };

  const handleDelete = async () => {
    try {
      await deleteBoard.mutateAsync(boardToDelete._id);
      setBoardToDelete(null);
    } catch {
      /* el hook ya mostró el Toast */
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Mis tableros</h1>
        <Button variant="primary" onClick={() => setCreating(true)}>+ Nuevo tablero</Button>
      </div>

      {isLoading && <StateMessage kind="loading" title="Cargando tableros…" />}

      {isError && (
        <StateMessage kind="error" title="No se pudieron cargar los tableros">
          <span>{error.message}</span>
          <Button onClick={() => refetch()}>Reintentar</Button>
        </StateMessage>
      )}

      {boards && boards.length === 0 && (
        <StateMessage title="Todavía no tenés tableros">
          <span>Creá el primero para empezar a organizar tus tickets.</span>
        </StateMessage>
      )}

      {boards && boards.length > 0 && (
        <div className="board-grid">
          {boards.map((board) => (
            <BoardCard key={board._id} board={board} onDelete={setBoardToDelete} />
          ))}
        </div>
      )}

      {creating && (
        <Modal title="Nuevo tablero" onClose={() => setCreating(false)}>
          <BoardForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </Modal>
      )}

      {boardToDelete && (
        <ConfirmModal
          title="Eliminar tablero"
          message={`Se eliminará «${boardToDelete.title}» con todas sus columnas y tickets.`}
          isLoading={deleteBoard.isPending}
          onConfirm={handleDelete}
          onCancel={() => setBoardToDelete(null)}
        />
      )}
    </>
  );
}
