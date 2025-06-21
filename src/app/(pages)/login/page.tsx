"use client"

import { AnimatedCircleInterface } from "@/components/ui/animated-circle-interface"
import { motion } from "framer-motion"
import { UserButton } from "@civic/auth/react"
import Image from "next/image"
import myImage from "@/assets/kavachai.jpg"
import { Shield, Sparkles, ArrowRight } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white flex relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,0.05)_50%,transparent_75%)] pointer-events-none" />

      {/* Left Side - Authentication Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-full max-w-lg space-y-8">
          {/* Authentication Card */}
          <motion.div
            className="bg-white/5 backdrop-blur-2xl shadow-2xl border border-white/10 rounded-3xl p-12 space-y-10 relative overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            {/* Card Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10 rounded-3xl" />
            <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <motion.div
              className="flex flex-col items-center space-y-6 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Logo Section */}
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="w-20 h-20  rounded-2xl flex items-center justify-center shadow-2xl ring-1 ring-white/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <Image
                      src={myImage || "/placeholder.svg"}
                      alt="Kavach.AI Logo"
                      width={72}
                      height={72}
                      className="rounded-xl object-cover relative z-10"
                    />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-3xl blur-xl -z-10" />
                </motion.div>

                <div className="text-center mt-4 space-y-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent tracking-tight">
                    Kavach.AI
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Shield className="w-3 h-3" />
                    <span>Advanced Security Platform</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Welcome Section */}
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-white">Welcome back</h2>
                <p className="text-slate-400 text-base leading-relaxed">
                  Sign in to access your security dashboard and protect what matters most
                </p>
              </div>
            </motion.div>

            {/* Auth Button */}
            <motion.div
              className="space-y-6 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="relative group">
                
               
                  
                    <UserButton className="w-full px-8 py-4  text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none flex items-center justify-center gap-2 group" />
                 
                </div>
              

              {/* Divider */}
           
              {/* Social Login Placeholder */}
              
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <motion.a
                href="#"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium inline-flex items-center gap-1 group"
                whileHover={{ x: 2 }}
              >
                Create one now
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </motion.a>
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">
                Terms of Service
              </a>
              <div className="w-1 h-1 bg-slate-600 rounded-full" />
              <a href="#" className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </a>
              <div className="w-1 h-1 bg-slate-600 rounded-full" />
              <a href="#" className="hover:text-slate-300 transition-colors">
                Support
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Animated Interface */}
      <motion.div
        className="hidden lg:flex flex-1 relative overflow-hidden"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-slate-900/50 to-black/80" />
        <AnimatedCircleInterface />

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center z-10 pointer-events-none">
          <motion.div
            className="text-center space-y-6 max-w-md px-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
           

          
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
