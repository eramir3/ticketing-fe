'use client';

export type FormError = { message: string; field?: string };

type FormErrorsProps = {
  errors?: FormError[] | null;
  className?: string;
};

export default function FormErrors({
  errors,
  className,
}: FormErrorsProps) {
  if (!errors?.length) return null;

  return (
    <ul className={className ?? 'text-sm text-red-600 space-y-1'}>
      {errors.map((error, index) => (
        <li key={`${error.field ?? 'general'}-${index}`}>
          {error.message}
        </li>
      ))}
    </ul>
  );
}
