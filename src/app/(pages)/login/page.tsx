"use client"

import { AnimatedCircleInterface } from "@/components/ui/animated-circle-interface"
import { motion } from "framer-motion"
import { Shield } from "lucide-react"
import { UserButton } from '@civic/auth/react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Side - Authentication Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 lg:p-12"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md space-y-8">
         
          {/* Authentication Card */}
          <motion.div
            className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-white">Kavach.AI</h1>
                  <p className="text-sm text-gray-400">Security Platform</p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Welcome back</h2>
                <p className="text-gray-400">Sign in to access your security dashboard</p>
              </div>
            </motion.div>

            {/* Civic Auth */}
            <UserButton />
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p>
              Dont have an account?{" "}
              <a href="#" className="text-green-400 hover:text-green-300 transition-colors">
                Sign up
              </a>
            </p>
            <p className="mt-2">
              By signing in, you agree to our{" "}
              <a href="#" className="text-green-400 hover:text-green-300 transition-colors">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-green-400 hover:text-green-300 transition-colors">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Animated Interface */}
      <motion.div
        className="hidden lg:flex flex-1 relative overflow-hidden"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <AnimatedCircleInterface />

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center z-10 pointer-events-none">
          <motion.div
            className="text-center space-y-4 max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <h3 className="text-2xl font-bold text-white">Secure by Design</h3>
            <p className="text-gray-300 leading-relaxed">
              Advanced AI-powered security monitoring with real-time threat detection and automated response systems.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-green-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>24/7 Monitoring</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>AI Protection</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

