import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
        }}
      />
    </>
  );
}
