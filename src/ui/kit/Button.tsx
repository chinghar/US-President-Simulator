import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-seal text-paper hover:brightness-110 disabled:bg-rule disabled:text-paper/40',
  secondary: 'border border-rule text-paper hover:border-paper disabled:border-rule disabled:text-paper/30',
  ghost: 'text-paper/70 hover:text-paper disabled:text-paper/30',
  danger: 'border border-flag text-flag hover:bg-flag hover:text-paper',
};

/** Sentence case, names the exact action ("Sign the bill," not "Submit"). */
export function Button({ variant = 'primary', className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        'rounded px-4 py-2 font-sans text-small font-medium transition-colors duration-150',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
      {...props}
    />
  );
}
