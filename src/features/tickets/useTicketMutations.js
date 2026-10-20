import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ticketService } from '../../api/ticketService';
import { queryKeys } from '../../lib/queryKeys';
import { moveTicketInBoard } from './boardCache';

const MOVE_KEY = ['moveTicket'];

export function useCreateTicket(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, ...values }) => ticketService.create(boardId, columnId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
  });
}

export function useUpdateTicket(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, ticketId, ...values }) =>
      ticketService.update(boardId, columnId, ticketId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
  });
}

export function useDeleteTicket(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, ticketId }) => ticketService.remove(boardId, columnId, ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      toast.success('Ticket eliminado');
    },
    onError: (error) => toast.error(error.message),
  });
}

// MOVER = UI OPTIMISTA: se actualiza la caché antes de que el servidor responda.
// Si falla (400/404/red) se revierte al estado anterior y se avisa con un Toast.
export function useMoveTicket(boardId) {
  const queryClient = useQueryClient();
  const key = queryKeys.board(boardId);

  return useMutation({
    mutationKey: MOVE_KEY,
    mutationFn: ({ ticketId, fromColumnId, toColumnId }) =>
      ticketService.move(boardId, fromColumnId, ticketId, toColumnId),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: key }); // evita que un refetch pise el cambio
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (board) => moveTicketInBoard(board, variables));
      return { previous };
    },

    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous); // rollback
      toast.error(`No se pudo mover el ticket: ${error.message}`);
    },

    // Resincroniza con el servidor cuando termina la última movida en vuelo
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: MOVE_KEY }) === 1) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}
