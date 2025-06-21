// "use client"
// import { UserButton } from '@civic/auth/react'
// import { motion } from "framer-motion";
// import { CheckCircle, Shield, ArrowLeft } from 'lucide-react'
// import Link from "next/link";

// export default function Page() {

//   return (
//     <div className='bg-cyber-dark min-h-screen flex flex-col justify-center'>
//       <div className="absolute inset-0 cyber-grid-bg opacity-10"></div>
//       <div className="absolute inset-0 bg-gradient-radial from-cyber-accent/5 via-transparent to-transparent transition-all duration-300"></div>

//       <div className='py-8 lg:py-10 flex flex-col  w-[90%] md:w-[84%] lg:w-[50%] mx-auto'>
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, ease: "easeOut" }}
//           className='cyber-card text-center w-full mx-auto p-2 md:p-4 lg:p-6 shadow-xl rounded-2xl relative z-10'
//         >
//           <div className="flex justify-start">
//             <Link href="/" className="flex items-center gap-1 px-3 py-1.5 bg-cyber-dark/80 border border-cyber-accent/30 rounded-full shadow hover:bg-cyber-accent/10 transition-colors text-cyber-accent text-xs md:text-sm font-medium">
//               <ArrowLeft className="h-4 w-4" />
//               <span>Back</span>
//             </Link>
//           </div>

//           <motion.div
//             animate={{ rotate: [0, 360] }}
//             transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
//             className="inline-block mb-2"
//           >
//             <Shield className="h-12 w-12 text-cyber-accent mx-auto lg:hidden block" />

//             <Shield className="h-16 w-16 text-cyber-accent mx-auto hidden lg:block" />
//           </motion.div>
//           <h1 className=" text-xl md:text-2xl lg:text-3xl font-bold mb-1 glow-text">Kavach.AI</h1>
//           <p className="text-cyber-accent font-semibold mb-4 text-xs md:text-sm tracking-wide">Decentralized AI-Powered Cyber Defense</p>

//           <h2 className=" text-base lg:text-xl font-semibold text-white mb-2">Welcome!</h2>
//           <p className="text-gray-300 mb-4 text-xs lg:text-sm">Sign in to your account to access the dashboard and secure your Web3 experience.</p>

//           <div className="flex items-center mb-4">
//             <div className="flex-1 h-px bg-gradient-to-r from-cyber-accent/30 to-transparent" />
//             <span className="mx-3 text-cyber-accent text-xs font-semibold uppercase tracking-wider">Sign in with Civic</span>
//             <div className="flex-1 h-px bg-gradient-to-l from-cyber-accent/30 to-transparent" />
//           </div>

//           <UserButton className='px-4 py-1 lg:px-4 lg:py-2 cyber-button border-current mb-4 lg:mb-2'
//           style={{
//             // backgroundColor: 'blue',
//             // color: 'white',
//             padding: '6px',
//           }} />

//           <div className="mb-3 lg:mb-4 text-left">
//             <h3 className="text-cyber-accent font-semibold mb-2 text-sm">Why sign in?</h3>
//             <ul className="text-gray-400 text-xs tracking-tight leading-4 lg:space-y-1 pl-4 list-disc">
//               <li>Access real-time threat detection and alerts</li>
//               <li>Manage your Web3 identity securely</li>
//               <li>Earn reputation and rewards for participation</li>
//             </ul>
//           </div>

//           {/* Civic Badge Verified */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//             className="mt-2 p-2 bg-cyber-neon/10 border border-cyber-neon/30 rounded-lg flex items-center justify-center gap-2"
//           >
//             <CheckCircle className="h-4 w-4 text-cyber-neon" />
//             <span className="text-sm font-semibold text-cyber-neon">Civic Badge Verified</span>
//           </motion.div>

//           <div className="mt-1">
//             <Link href="#" className="text-xs tracking-tighter leading-3 text-cyber-accent hover:underline">Need help signing in?</Link>
//           </div>
//         </motion.div>

//         <footer className="mt-10 text-center text-gray-500 text-xs opacity-70 z-10">
//           &copy; {new Date().getFullYear()} Kavach.AI. All rights reserved.
//         </footer>
//       </div>
//     </div>
//   )
// };


"use client"

import { AnimatedCircleInterface } from "@/components/ui/animated-circle-interface"
import { motion } from "framer-motion"
import { Shield, ArrowRight, Mail, Lock } from "lucide-react"
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
              Don't have an account?{" "}
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

