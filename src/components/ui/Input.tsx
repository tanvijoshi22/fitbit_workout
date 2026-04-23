import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export function Input({ label, error, hint, prefix, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-text-muted flex items-center">{prefix}</span>
        )}
        <input
          {...props}
          className={`
            w-full bg-bg-elevated border border-border rounded-lg
            px-4 py-3 text-sm text-text-primary font-body
            placeholder:text-text-muted
            focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${prefix ? 'pl-10' : ''}
            ${suffix ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
        />
        {suffix && (
          <span className="absolute right-3 text-text-muted flex items-center">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-400 font-body">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted font-body">{hint}</p>}
    </div>
  )
}
