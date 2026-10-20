import { useTheme } from '../../hooks/useTheme';
import ThemeToggle from '../../components/ThemeToggle';

// Marco común de /login y /register
export default function AuthShell({ title, subtitle, children }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="auth-wrap">
      <main className="auth-card">
        <div className="page-head" style={{ marginBottom: '0.5rem' }}>
          <span className="app-header__brand">kanban<span>/</span></span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <h1>{title}</h1>
        <p className="auth-card__sub">{subtitle}</p>
        {children}
      </main>
    </div>
  );
}
