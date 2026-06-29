import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-gray-400">{label}</label>}
      <input
        className={cn(
          'w-full px-3 py-2 bg-bg-primary border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500',
          'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-gray-400">{label}</label>}
      <select
        className={cn(
          'w-full px-3 py-2 bg-bg-primary border border-gray-700 rounded-lg text-gray-100',
          'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
