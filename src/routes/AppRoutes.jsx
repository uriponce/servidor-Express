import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import AppLayout from './AppLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import BoardsListPage from '../pages/BoardsListPage';
import BoardDetailPage from '../pages/BoardDetailPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/boards" element={<BoardsListPage />} />
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/boards" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
