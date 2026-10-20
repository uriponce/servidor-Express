import Spinner from './Spinner';

// Presentacional. `loading` deshabilita el botón y muestra el spinner (regla de formularios).
export default function Button({
  children,
  variant = 'default', // default | primary | danger | ghost
  size,                // sm
  icon = false,
  block = false,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    variant !== 'default' && `btn--${variant}`,
    size && `btn--${size}`,
    icon && 'btn--icon',
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading && <Spinner label="Procesando" />}
      {children}
    </button>
  );
}
