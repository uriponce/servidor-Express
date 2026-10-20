import { httpClient } from './httpClient';

export const columnService = {
  async create(boardId, { title }) {
    const { data } = await httpClient.post(`/boards/${boardId}/columns`, { title });
    return data;
  },
  async remove(boardId, columnId) {
    await httpClient.delete(`/boards/${boardId}/columns/${columnId}`);
  },
};
