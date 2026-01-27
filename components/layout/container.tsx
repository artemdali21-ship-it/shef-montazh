import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'full',
  padding = 'md',
  className = ''
}) => {
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'max-w-full'
  };

  const paddings = {
    none: '',
    sm: 'px-2 py-3',
    md: 'px-4 py-6',
    lg: 'px-6 py-8'
  };

  return (
    <div className={`${maxWidths[maxWidth]} ${paddings[padding]} mx-auto ${className}`}>
      {children}
    </div>
  );
};
