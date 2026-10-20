import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import Button from '../components/Button';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="app-header">
        <Link to="/boards" className="app-header__brand">kanban<span>/</span></Link>
        <div className="app-header__right">
          <span className="muted mono" style={{ fontSize: '0.85rem' }}>{user?.name}</span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <Button size="sm" onClick={handleLogout}>Salir</Button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
