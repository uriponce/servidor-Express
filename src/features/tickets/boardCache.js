// Funciones PURAS para actualizar la caché del tablero (sin React, fáciles de testear).

// Mueve un ticket entre columnas devolviendo un tablero nuevo (no muta el original)
export function moveTicketInBoard(board, { ticketId, fromColumnId, toColumnId }) {
  if (!board || fromColumnId === toColumnId) return board;

  const source = board.columns.find((c) => c._id === fromColumnId);
  const ticket = source?.tickets.find((t) => t._id === ticketId);
  if (!ticket) return board;

  return {
    ...board,
    columns: board.columns.map((column) => {
      if (column._id === fromColumnId) {
        return { ...column, tickets: column.tickets.filter((t) => t._id !== ticketId) };
      }
      if (column._id === toColumnId) {
        return { ...column, tickets: [...column.tickets, { ...ticket, column: toColumnId }] };
      }
      return column;
    }),
  };
}
