import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { columnService } from '../../api/columnService';
import { queryKeys } from '../../lib/queryKeys';

export function useCreateColumn(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values) => columnService.create(boardId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
  });
}

export function useDeleteColumn(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (columnId) => columnService.remove(boardId, columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      toast.success('Columna eliminada');
    },
    onError: (error) => toast.error(error.message),
  });
}
