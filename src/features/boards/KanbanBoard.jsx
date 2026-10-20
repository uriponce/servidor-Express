import { useState } from 'react';
import Column from '../columns/Column';
import ColumnForm from '../columns/ColumnForm';
import TicketCard from '../tickets/TicketCard';
import TicketForm from '../tickets/TicketForm';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import Button from '../../components/Button';
import { useCreateColumn, useDeleteColumn } from '../columns/useColumnMutations';
import {
  useCreateTicket,
  useDeleteTicket,
  useMoveTicket,
  useUpdateTicket,
} from '../tickets/useTicketMutations';

// CONTENEDOR: orquesta mutaciones, drag & drop y diálogos. La UI la ponen los presentacionales.
export default function KanbanBoard({ board }) {
  const boardId = board._id;
  const createColumn = useCreateColumn(boardId);
  const deleteColumn = useDeleteColumn(boardId);
  const createTicket = useCreateTicket(boardId);
  const updateTicket = useUpdateTicket(boardId);
  const deleteTicket = useDeleteTicket(boardId);
  const moveTicket = useMoveTicket(boardId);

  const [addingColumn, setAddingColumn] = useState(false);
  const [dialog, setDialog] = useState(null); // { type, ... }
  const [dragging, setDragging] = useState(null); // { ticketId, fromColumnId }
  const [overColumnId, setOverColumnId] = useState(null);

  const closeDialog = () => setDialog(null);

  // ---- Drag & drop (HTML5 nativo) ----
  const handleDragStart = (e, ticket, column) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ticket._id); // requerido por Firefox
    setDragging({ ticketId: ticket._id, fromColumnId: column._id });
  };
  const handleDragEnd = () => {
    setDragging(null);
    setOverColumnId(null);
  };
  const handleDragOver = (e, column) => {
    if (!dragging) return;
    e.preventDefault(); // habilita el drop
    if (overColumnId !== column._id) setOverColumnId(column._id);
  };
  const handleDrop = (e, column) => {
    e.preventDefault();
    if (dragging && dragging.fromColumnId !== column._id) {
      moveTicket.mutate({ ...dragging, toColumnId: column._id });
    }
    handleDragEnd();
  };

  // ---- Diálogos ----
  const confirmDelete = async () => {
    try {
      if (dialog.type === 'delete-column') await deleteColumn.mutateAsync(dialog.column._id);
      if (dialog.type === 'delete-ticket')
        await deleteTicket.mutateAsync({ columnId: dialog.ticket.column, ticketId: dialog.ticket._id });
      closeDialog();
    } catch {
      /* el hook ya mostró el Toast con el error */
    }
  };

  const columns = board.columns;

  return (
    <>
      <div className="kanban">
        {columns.map((column) => (
          <Column
            key={column._id}
            column={column}
            count={column.tickets.length}
            isOver={dragging && overColumnId === column._id && dragging.fromColumnId !== column._id}
            onDelete={(c) => setDialog({ type: 'delete-column', column: c })}
            onAddTicket={(c) => setDialog({ type: 'create-ticket', column: c })}
            onDragOver={(e) => handleDragOver(e, column)}
            onDragLeave={() => setOverColumnId(null)}
            onDrop={(e) => handleDrop(e, column)}
          >
            {column.tickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                draggable
                isDragging={dragging?.ticketId === ticket._id}
                onDragStart={(e) => handleDragStart(e, ticket, column)}
                onDragEnd={handleDragEnd}
                onEdit={(t) => setDialog({ type: 'edit-ticket', ticket: t })}
                onDelete={(t) => setDialog({ type: 'delete-ticket', ticket: t })}
                moveOptions={columns.filter((c) => c._id !== column._id)}
                onMove={(t, toColumnId) =>
                  moveTicket.mutate({ ticketId: t._id, fromColumnId: column._id, toColumnId })
                }
              />
            ))}
          </Column>
        ))}

        <div className="column column--new">
          {addingColumn ? (
            <ColumnForm
              onCancel={() => setAddingColumn(false)}
              onSubmit={async (values) => {
                await createColumn.mutateAsync(values);
                setAddingColumn(false);
              }}
            />
          ) : (
            <Button variant="ghost" onClick={() => setAddingColumn(true)}>
              + Nueva columna
            </Button>
          )}
        </div>
      </div>

      {dialog?.type === 'create-ticket' && (
        <Modal title={`Nuevo ticket en «${dialog.column.title}»`} onClose={closeDialog}>
          <TicketForm
            submitLabel="Crear ticket"
            onCancel={closeDialog}
            onSubmit={async (values) => {
              await createTicket.mutateAsync({ columnId: dialog.column._id, ...values });
              closeDialog();
            }}
          />
        </Modal>
      )}

      {dialog?.type === 'edit-ticket' && (
        <Modal title="Editar ticket" onClose={closeDialog}>
          <TicketForm
            submitLabel="Guardar cambios"
            defaultValues={{ title: dialog.ticket.title, description: dialog.ticket.description ?? '' }}
            onCancel={closeDialog}
            onSubmit={async (values) => {
              await updateTicket.mutateAsync({
                columnId: dialog.ticket.column,
                ticketId: dialog.ticket._id,
                ...values,
              });
              closeDialog();
            }}
          />
        </Modal>
      )}

      {dialog?.type === 'delete-column' && (
        <ConfirmModal
          title="Eliminar columna"
          message={`Se eliminará «${dialog.column.title}» junto con sus ${dialog.column.tickets.length} ticket(s). Esta acción no se puede deshacer.`}
          isLoading={deleteColumn.isPending}
          onConfirm={confirmDelete}
          onCancel={closeDialog}
        />
      )}

      {dialog?.type === 'delete-ticket' && (
        <ConfirmModal
          title="Eliminar ticket"
          message={`¿Eliminar «${dialog.ticket.title}»? Esta acción no se puede deshacer.`}
          isLoading={deleteTicket.isPending}
          onConfirm={confirmDelete}
          onCancel={closeDialog}
        />
      )}
    </>
  );
}
