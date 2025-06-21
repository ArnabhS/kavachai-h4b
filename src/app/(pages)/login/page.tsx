"use client"
import { UserButton } from '@civic/auth/react'
import { motion } from "framer-motion";
import { CheckCircle, Shield, ArrowLeft } from 'lucide-react'
import Link from "next/link";

export default function Page() {
  
  return (
    <div className='bg-cyber-dark min-h-screen flex flex-col justify-center'>
      <div className="absolute inset-0 cyber-grid-bg opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-cyber-accent/5 via-transparent to-transparent transition-all duration-300"></div>

      <div className='py-8 lg:py-10 flex flex-col  w-[90%] md:w-[84%] lg:w-[50%] mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className='cyber-card text-center w-full mx-auto p-2 md:p-4 lg:p-6 shadow-xl rounded-2xl relative z-10'
        >
          <div className="flex justify-start">
            <Link href="/" className="flex items-center gap-1 px-3 py-1.5 bg-cyber-dark/80 border border-cyber-accent/30 rounded-full shadow hover:bg-cyber-accent/10 transition-colors text-cyber-accent text-xs md:text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </div>

          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-2"
          >
            <Shield className="h-12 w-12 text-cyber-accent mx-auto lg:hidden block" />

            <Shield className="h-16 w-16 text-cyber-accent mx-auto hidden lg:block" />
          </motion.div>
          <h1 className=" text-xl md:text-2xl lg:text-3xl font-bold mb-1 glow-text">Kadak.AI</h1>
          <p className="text-cyber-accent font-semibold mb-4 text-xs md:text-sm tracking-wide">Decentralized AI-Powered Cyber Defense</p>

          <h2 className=" text-base lg:text-xl font-semibold text-white mb-2">Welcome!</h2>
          <p className="text-gray-300 mb-4 text-xs lg:text-sm">Sign in to your account to access the dashboard and secure your Web3 experience.</p>

          <div className="flex items-center mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-cyber-accent/30 to-transparent" />
            <span className="mx-3 text-cyber-accent text-xs font-semibold uppercase tracking-wider">Sign in with Civic</span>
            <div className="flex-1 h-px bg-gradient-to-l from-cyber-accent/30 to-transparent" />
          </div>

          <UserButton className='px-4 py-1 lg:px-4 lg:py-2 cyber-button border-current mb-4 lg:mb-2'
          style={{
            // backgroundColor: 'blue',
            // color: 'white',
            padding: '6px',
          }} />

          <div className="mb-3 lg:mb-4 text-left">
            <h3 className="text-cyber-accent font-semibold mb-2 text-sm">Why sign in?</h3>
            <ul className="text-gray-400 text-xs tracking-tight leading-4 lg:space-y-1 pl-4 list-disc">
              <li>Access real-time threat detection and alerts</li>
              <li>Manage your Web3 identity securely</li>
              <li>Earn reputation and rewards for participation</li>
            </ul>
          </div>

          {/* Civic Badge Verified */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-2 p-2 bg-cyber-neon/10 border border-cyber-neon/30 rounded-lg flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-4 w-4 text-cyber-neon" />
            <span className="text-sm font-semibold text-cyber-neon">Civic Badge Verified</span>
          </motion.div>

          <div className="mt-1">
            <Link href="#" className="text-xs tracking-tighter leading-3 text-cyber-accent hover:underline">Need help signing in?</Link>
          </div>
        </motion.div>

        <footer className="mt-10 text-center text-gray-500 text-xs opacity-70 z-10">
          &copy; {new Date().getFullYear()} Kadak.AI. All rights reserved.
        </footer>
      </div>
    </div>
  )
};
