'use client'

import { motion } from 'framer-motion'

interface SuccessCheckmarkProps {
  size?: number
  color?: string
}

export function SuccessCheckmark({
  size = 64,
  color = '#BFFF00'
}: SuccessCheckmarkProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <motion.circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke={color}
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.path
        d="M 16 32 L 28 44 L 48 20"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 0.3,
          delay: 0.3,
          ease: "easeOut"
        }}
      />
    </motion.svg>
  )
}

interface SuccessModalProps {
  show: boolean
  title: string
  message?: string
  onClose?: () => void
}

export function SuccessModal({
  show,
  title,
  message,
  onClose
}: SuccessModalProps) {
  if (!show) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-sm w-full text-center"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex justify-center">
          <SuccessCheckmark size={80} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        {message && <p className="text-gray-300">{message}</p>}
      </motion.div>
    </motion.div>
  )
}
