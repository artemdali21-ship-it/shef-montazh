'use client'

import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
}

export function Logo({ size = 'md', showText = true, href }: LogoProps) {
  const sizes = {
    sm: { width: '24px', height: '24px', text: 'text-sm' },
    md: { width: '32px', height: '32px', text: 'text-base' },
    lg: { width: '40px', height: '40px', text: 'text-xl' }
  }

  const config = sizes[size]

  const content = (
    <div className="flex items-center gap-2">
      <img
        src="/images/logo-znak.png"
        alt="Шеф-Монтаж"
        style={{ width: config.width, height: config.height }}
        className="object-contain"
      />
      {showText && (
        <span className={`font-bold text-white ${config.text} tracking-tight uppercase`}>
          ШЕФ-МОНТАЖ
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
