'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface FloatingElement {
  id: number
  src: string
  alt: string
  size: number
  x: number
  y: number
  rotation: number
  delay: number
  duration: number
  blur: number
  opacity: number
}

const elementImages = [
  // Helmets
  { src: '/images/helmet.png', alt: 'Helmet', category: 'helmet' },
  { src: '/images/helmet-silver.png', alt: 'Silver Helmet', category: 'helmet' },
  { src: '/images/helmets-3-hard-hats.png', alt: 'Hard Hats', category: 'helmet' },

  // Tools
  { src: '/images/drill.png', alt: 'Drill', category: 'tool' },
  { src: '/images/hammer.png', alt: 'Hammer', category: 'tool' },
  { src: '/images/wrench.png', alt: 'Wrench', category: 'tool' },
  { src: '/images/screwdriver.png', alt: 'Screwdriver', category: 'tool' },
  { src: '/images/pliers.png', alt: 'Pliers', category: 'tool' },
  { src: '/images/saw.png', alt: 'Saw', category: 'tool' },
  { src: '/images/tape-measure.png', alt: 'Tape Measure', category: 'tool' },

  // Concrete pieces
  { src: '/images/concrete-1.png', alt: 'Concrete 1', category: 'concrete' },
  { src: '/images/concrete-2.png', alt: 'Concrete 2', category: 'concrete' },
  { src: '/images/concrete-3.png', alt: 'Concrete 3', category: 'concrete' },
  { src: '/images/concrete-4.png', alt: 'Concrete 4', category: 'concrete' },
  { src: '/images/concrete-5.png', alt: 'Concrete 5', category: 'concrete' },
]

function generateRandomElement(id: number): FloatingElement {
  const randomImage = elementImages[Math.floor(Math.random() * elementImages.length)]

  // Specific size rules for certain tools
  let size = Math.floor(Math.random() * 80) + 40 // Default: 40-120px

  if (randomImage.src.includes('saw')) {
    size = Math.floor(Math.random() * 50) + 90 // Saw: 90-140px (bigger)
  } else if (randomImage.src.includes('screwdriver')) {
    size = Math.floor(Math.random() * 30) + 40 // Screwdriver: 40-70px (smaller)
  } else if (randomImage.src.includes('wrench')) {
    size = Math.floor(Math.random() * 40) + 60 // Wrench: 60-100px (medium)
  }

  return {
    id,
    src: randomImage.src,
    alt: randomImage.alt,
    size,
    // Better distributed positions (avoid clustering in center)
    x: id % 2 === 0 ? Math.floor(Math.random() * 40) : Math.floor(Math.random() * 40) + 60,
    y: Math.floor(Math.random() * 100),
    // Random rotation
    rotation: Math.floor(Math.random() * 360),
    // Random animation delay
    delay: Math.random() * 5,
    // Random duration between 15-30s
    duration: Math.floor(Math.random() * 15) + 15,
    // Blur for depth effect (0-3px)
    blur: Math.random() * 3,
    // Random opacity for depth
    opacity: 0.15 + Math.random() * 0.25,
  }
}

export default function Background3D({ children }: { children: React.ReactNode }) {
  const [elements, setElements] = useState<FloatingElement[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Generate 15 floating elements
    const generatedElements = Array.from({ length: 15 }, (_, i) => generateRandomElement(i))
    setElements(generatedElements)
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-dashboard -z-10" />

      {/* Floating 3D Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {elements.map((element) => (
          <div
            key={element.id}
            className="absolute floating-element"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
              opacity: element.opacity,
              filter: `blur(${element.blur}px)`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration}s`,
              transform: `rotate(${element.rotation}deg)`,
            }}
          >
            <Image
              src={element.src}
              alt={element.alt}
              width={element.size}
              height={element.size}
              className="w-full h-full object-contain"
              priority={false}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(5deg);
          }
          50% {
            transform: translateY(-40px) translateX(-10px) rotate(-5deg);
          }
          75% {
            transform: translateY(-20px) translateX(10px) rotate(5deg);
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-30px) translateX(-20px) scale(1.05);
          }
        }

        @keyframes floatRotate {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(180deg);
          }
          100% {
            transform: translateY(0px) rotate(360deg);
          }
        }

        .floating-element {
          animation: float linear infinite;
          will-change: transform;
        }

        .floating-element:nth-child(3n) {
          animation-name: floatSlow;
        }

        .floating-element:nth-child(5n) {
          animation-name: floatRotate;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .floating-element {
            opacity: 0.6 !important;
          }
        }

        @media (max-width: 640px) {
          .floating-element {
            opacity: 0.4 !important;
          }
        }
      `}</style>
    </div>
  )
}
