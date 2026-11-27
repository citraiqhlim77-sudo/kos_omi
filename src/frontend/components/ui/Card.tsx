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
    'bg-white rounded-xl border border-[hsl(240,6%,90%)] transition-colors duration-200';
  const interactiveStyle = interactive
    ? 'hover:border-[hsl(186,72%,24%)] cursor-pointer'
    : '';

  return (
    <div className={`${baseStyle} ${interactiveStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};
