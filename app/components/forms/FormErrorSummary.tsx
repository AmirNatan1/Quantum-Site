export type FieldErrors = Record<string, string>;

export function FormErrorSummary({ message, errors = {} }: { message: string; errors?: FieldErrors }) {
  const entries = Object.entries(errors);
  return (
    <div className="form-error-summary" role="alert" tabIndex={-1}>
      <strong>{message}</strong>
      {entries.length ? <ul>{entries.map(([field, error]) => <li key={field}><a href={`#${field}`}>{error}</a></li>)}</ul> : null}
    </div>
  );
}
