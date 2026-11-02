import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  className = '',
  ...props
}) => {
  const baseStyle =
    'bg-white rounded-xl border border-[hsl(214,20%,90%)] transition-colors duration-200';
  const interactiveStyle = interactive
    ? 'hover:border-[hsl(217,91%,45%)] cursor-pointer'
    : '';

  return (
    <div className={`${baseStyle} ${interactiveStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};
