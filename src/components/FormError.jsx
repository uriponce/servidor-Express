// Error general de un formulario (ej. 401, error de red, 5xx)
export default function FormError({ message }) {
  if (!message) return null;
  return (
    <div className="form-error" role="alert">
      {message}
    </div>
  );
}
