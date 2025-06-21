"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: ReactNode
}

export function StatsCard({ title, value, change, trend, icon }: StatsCardProps) {
  return (
    <motion.div
      className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300"
      whileHover={{ y: -2, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-800 rounded-lg">
          <div className="text-gray-300">{icon}</div>
        </div>
        <div className={`flex items-center space-x-1 text-sm ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
          {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>{change}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
    </motion.div>
  )
}
