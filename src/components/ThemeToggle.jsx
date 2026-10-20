import Button from './Button';

// Presentacional: recibe el tema actual y el callback. No conoce localStorage.
export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <Button
      variant="ghost"
      icon
      onClick={onToggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? '☀' : '☾'}
    </Button>
  );
}
