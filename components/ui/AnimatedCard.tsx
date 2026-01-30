'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode
  hover?: boolean
  delay?: number
  className?: string
}

export function AnimatedCard({
  children,
  hover = true,
  delay = 0,
  className,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      className={cn(
        'bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 transition-all duration-300',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: 'easeOut'
      }}
      whileHover={hover ? {
        y: -4,
        boxShadow: '0 20px 25px -5px rgba(232, 93, 47, 0.2), 0 10px 10px -5px rgba(232, 93, 47, 0.1)'
      } : {}}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedListProps {
  children: React.ReactNode[]
  stagger?: number
  className?: string
}

export function AnimatedList({
  children,
  stagger = 0.1,
  className
}: AnimatedListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * stagger,
            ease: 'easeOut'
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
