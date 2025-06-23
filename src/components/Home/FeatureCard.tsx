"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  gradient: string
}

export function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <motion.div
      className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300 h-full"
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative z-10">
        <motion.div
          className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} mb-4`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-white">{icon}</div>
        </motion.div>

        <h3 className="lg:text-xl font-semibold text-white mb-1 lg:mb-3 group-hover:text-gray-100 transition-colors text-lg">{title}</h3>

        <p className="text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors text-sm lg:text-base">{description}</p>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  )
}
