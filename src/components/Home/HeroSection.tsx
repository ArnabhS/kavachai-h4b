'use client';

import { motion } from "framer-motion";
import { Shield, ArrowRight, Play } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <div className="relative flex items-center justify-center overflow-hidden py-6">
      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-20" />
      <div className="absolute inset-0 bg-gradient-radial from-cyber-accent/10 via-transparent to-transparent" />

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-2 h-2 bg-cyber-neon rounded-full opacity-60"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-40 right-32 w-3 h-3 bg-cyber-accent rounded-full opacity-40"
      />
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-32 left-32 w-2 h-2 bg-cyber-purple rounded-full opacity-50"
      />

      <div className="relative items-center justify-center z-10 text-center max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-2"
          >
            <Shield className="h-12 w-12 text-cyber-accent mx-auto lg:hidden block" />

            <Shield className="h-16 w-16 text-cyber-accent mx-auto hidden lg:block" />
          </motion.div>

          <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-2 md:mb-4 md:leading-tight">
            <span className="glow-text">Decentralized</span>
            <br />
            <span className="text-white">AI-Powered</span>
            <br />
            <span className="glow-text">Cyber Defense</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="text-sm md:text-lg lg:text-xl text-gray-300 mb-2 lg:mb-6 max-w-3xl mx-auto leading-relaxed"
          >
            Civic-Verified Experts + Agentic AI to Stop Web3 Threats in Real Time.
            <br />
            <span className="text-cyber-accent font-semibold">
              90% of DeFi hacks go undetected - until now.
            </span>
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center"
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 212, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="cyber-button text-sm lg:text-lg px-6 py-2 flex items-center space-x-3 group"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cyber-button-outline text-sm lg:text-lg px-6 py-2 flex items-center space-x-3 group"
          >
            <Play className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>See How It Works</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 lg:mt-16 text-xs md:text-sm text-gray-400"
        >
          <p>Trusted by Web3 security experts worldwide</p>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
