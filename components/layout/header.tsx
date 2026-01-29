'use client'

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  backButton?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  backButton = false,
  rightAction,
  transparent = false,
  className = ''
}) => {
  const router = useRouter();

  return (
    <header
      className={`
        sticky top-0 z-20 border-b border-white/10
        ${transparent ? 'bg-transparent' : 'bg-[#2A2A2A]/80 backdrop-blur-md'}
        ${className}
      `}
    >
      <div className="h-16 flex items-center justify-between px-4">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          {backButton && (
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          
          {(title || subtitle) && (
            <div>
              {title && (
                <h1 className="text-white font-montserrat font-700 text-xl leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-[#9B9B9B] font-montserrat font-500 text-sm">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Side */}
        <div>
          {rightAction || <div className="w-10"></div>}
        </div>
      </div>
    </header>
  );
};
