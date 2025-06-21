"use client"

import { motion } from "framer-motion"

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="flex space-x-4">
            <div className="flex-1 h-10 bg-gray-700 rounded"></div>
            <div className="w-20 h-10 bg-gray-700 rounded"></div>
          </div>
        </div>
      </motion.div>

      {/* Content Skeletons */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="animate-pulse">
            <div className="h-5 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
