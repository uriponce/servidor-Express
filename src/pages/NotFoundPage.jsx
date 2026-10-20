import { Link } from 'react-router-dom';
import StateMessage from '../components/StateMessage';

export default function NotFoundPage() {
  return (
    <StateMessage title="404 — Página no encontrada">
      <Link to="/boards">Ir a mis tableros</Link>
    </StateMessage>
  );
}
