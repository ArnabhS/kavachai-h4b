"use client"

import { motion } from "framer-motion"
import { Shield, Code, Lock, Eye } from "lucide-react"

export function AnimatedCircleInterface() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>

      {/* Main container */}
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, #10b981 90deg, transparent 180deg, #10b981 270deg, transparent 360deg)",
            mask: "radial-gradient(circle, transparent 85%, black 86%, black 100%)",
            WebkitMask: "radial-gradient(circle, transparent 85%, black 86%, black 100%)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Middle rotating ring */}
        <motion.div
          className="absolute inset-4 rounded-full border border-green-500/30"
          animate={{ rotate: -360 }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {/* Segments on middle ring */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: "0 0",
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${75 + i * 2}px)`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Inner ring with segments */}
        <motion.div
          className="absolute inset-8 rounded-full border border-green-500/20"
          animate={{ rotate: 360 }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {/* Inner ring segments */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-6 bg-gradient-to-t from-green-500/50 to-transparent rounded-full"
              style={{
                top: "0",
                left: "50%",
                transformOrigin: "50% 100%",
                transform: `translateX(-50%) rotate(${i * 30}deg) translateY(8px)`,
              }}
            />
          ))}
        </motion.div>

        {/* Central circle */}
        <motion.div
          className="absolute inset-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-green-500/40 flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 20px rgba(16, 185, 129, 0.3)",
              "0 0 40px rgba(16, 185, 129, 0.5)",
              "0 0 20px rgba(16, 185, 129, 0.3)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {/* Central icon */}
          <motion.div
            className="text-green-400"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Shield className="h-12 w-12" />
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              x: [-5, 5, -5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Corner indicators */}
        {[
          { icon: Code, position: "top-4 left-4" },
          { icon: Lock, position: "top-4 right-4" },
          { icon: Eye, position: "bottom-4 left-4" },
          { icon: Shield, position: "bottom-4 right-4" },
        ].map(({ icon: Icon, position }, i) => (
          <motion.div
            key={i}
            className={`absolute ${position} p-2 rounded-lg bg-gray-800/50 border border-green-500/20`}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.5,
            }}
          >
            <Icon className="h-4 w-4 text-green-400" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
