import { httpClient } from './httpClient';

export const boardService = {
  async list() {
    const { data } = await httpClient.get('/boards');
    return data;
  },
  async create({ title, description }) {
    const { data } = await httpClient.post('/boards', { title, description });
    return data;
  },
  // Tablero con columnas[] y tickets[] anidados
  async getById(boardId) {
    const { data } = await httpClient.get(`/boards/${boardId}`);
    return data;
  },
  async remove(boardId) {
    await httpClient.delete(`/boards/${boardId}`);
  },
};
