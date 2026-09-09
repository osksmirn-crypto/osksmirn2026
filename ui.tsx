import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>}
      <input
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${className}`}
        {...props}
      />
    </label>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>}
      <select
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
}: ButtonProps) {
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm',
    secondary: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
    ghost: 'text-slate-500 hover:bg-slate-100',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
