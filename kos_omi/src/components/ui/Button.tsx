import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2', // min 44px touch target
    lg: 'text-base px-6 py-3 min-h-[48px] gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[hsl(217,91%,45%)] text-white hover:bg-[hsl(217,91%,38%)] focus:ring-[hsl(217,91%,45%)] shadow-sm',
    secondary:
      'bg-[hsl(214,95%,96%)] text-[hsl(217,91%,45%)] hover:bg-[hsl(214,85%,90%)] focus:ring-[hsl(217,91%,45%)]',
    outline:
      'border border-[hsl(214,20%,90%)] bg-white text-[hsl(222,47%,11%)] hover:bg-[hsl(210,20%,98%)] hover:border-[hsl(217,91%,45%)] focus:ring-[hsl(217,91%,45%)] shadow-sm',
    ghost:
      'text-[hsl(222,47%,11%)] hover:bg-[hsl(210,20%,95%)] focus:ring-[hsl(217,91%,45%)]',
    destructive:
      'bg-[hsl(0,72%,51%)] text-white hover:bg-[hsl(0,72%,45%)] focus:ring-[hsl(0,72%,51%)] shadow-sm',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
