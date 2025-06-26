"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  gradient: string
}

export function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  const {theme} = useTheme();
  return (
    <motion.div
      className={`group relative rounded-2xl p-6  transition-all duration-300 h-full ${theme === 'dark'? 'bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-gray-700': 'bg-gradient-to-br from-gray-200 to-white border border-gray-400 hover:border-gray-700'}`}
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

        <h3 className={`lg:text-xl font-semibold ${theme === 'dark'? 'text-white group-hover:text-gray-100': 'text-gray-950 group-hover:text-gray-900'}   mb-1 lg:mb-3 transition-colors text-lg`}>{title}</h3>

        <p className={`${theme === 'dark'? 'text-gray-500 group-hover:text-gray-400': 'text-gray-700 group-hover:text-gray-600'} transition-colors leading-relaxed text-sm lg:text-base`}>{description}</p>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  )
}
