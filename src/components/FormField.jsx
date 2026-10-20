import { forwardRef, useId } from 'react';

// Input / textarea con etiqueta y mensaje de error accesible.
// Compatible con React Hook Form: <FormField {...register('title')} error={errors.title?.message} />
const FormField = forwardRef(function FormField(
  { label, error, multiline = false, ...inputProps },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  const Control = multiline ? 'textarea' : 'input';

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <Control
        id={id}
        ref={ref}
        className="field__control"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <span id={errorId} className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

export default FormField;
