import { httpClient } from './httpClient';

const base = (boardId, columnId) => `/boards/${boardId}/columns/${columnId}/tickets`;

export const ticketService = {
  async create(boardId, columnId, { title, description }) {
    const { data } = await httpClient.post(base(boardId, columnId), { title, description });
    return data;
  },
  // Edita contenido. columnId = columna ACTUAL del ticket (la de la URL)
  async update(boardId, columnId, ticketId, { title, description }) {
    const { data } = await httpClient.patch(`${base(boardId, columnId)}/${ticketId}`, {
      title,
      description,
    });
    return data;
  },
  // Mueve a otra columna del mismo tablero. Idempotente: el body es el estado final.
  async move(boardId, fromColumnId, ticketId, toColumnId) {
    const { data } = await httpClient.patch(`${base(boardId, fromColumnId)}/${ticketId}`, {
      column: toColumnId,
    });
    return data;
  },
  async remove(boardId, columnId, ticketId) {
    await httpClient.delete(`${base(boardId, columnId)}/${ticketId}`);
  },
};
