import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      // No reintentar errores 4xx (son errores del cliente, reintentar no los arregla)
      retry: (failureCount, error) => !(error?.status >= 400 && error?.status < 500) && failureCount < 2,
    },
  },
});
