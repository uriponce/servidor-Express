import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { boardService } from '../../api/boardService';
import { queryKeys } from '../../lib/queryKeys';

export const useBoardsQuery = () =>
  useQuery({ queryKey: queryKeys.boards, queryFn: boardService.list });

// Tablero con columnas[] y tickets[] anidados
export const useBoardQuery = (boardId) =>
  useQuery({ queryKey: queryKeys.board(boardId), queryFn: () => boardService.getById(boardId) });

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boardService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.boards, exact: true }),
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boardService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards, exact: true });
      toast.success('Tablero eliminado');
    },
    onError: (error) => toast.error(error.message),
  });
}
