'use client';

import { motion } from 'framer-motion';
// import {ArrowRight, Play } from 'lucide-react';
// import Link from 'next/link';
import DotGrid from '@/components/ui/DotGrid'; 
import { Button } from '@/components/ui/button';
import { Award, Clock, Code, Target, TrendingUp, Zap } from 'lucide-react';
import { InfiniteMovingCards } from '@/components/Home/InfiniteMovingCards';

const customers = [
  {
    quote: "Kadak.AI detected a critical vulnerability in our smart contract that saved us $2M in potential losses.",
    name: "Sarah Chen",
    title: "CTO at DeFiProtocol",
  },
  {
    quote: "The real-time threat detection is incredible. We've prevented 15 attacks in the last month alone.",
    name: "Marcus Rodriguez",
    title: "Security Lead at Web3Vault",
  },
  {
    quote: "Finally, a solution that understands the unique challenges of Web3 security.",
    name: "Elena Petrov",
    title: "Founder of CryptoShield",
  },
  {
    quote: "The civic-verified experts provide insights that pure AI simply can't match.",
    name: "David Kim",
    title: "Head of Security at BlockChain Inc",
  },
  {
    quote: "Our incident response time improved by 300% after implementing Kadak.AI.",
    name: "Lisa Thompson",
    title: "CISO at DeFiBank",
  },
]

const avatars = [
  "/placeholder.svg?height=40&width=40",
  "/placeholder.svg?height=40&width=40",
  "/placeholder.svg?height=40&width=40",
  "/placeholder.svg?height=40&width=40",
  "/placeholder.svg?height=40&width=40",
]

const HeroSection = () => {
    return (
        <div className="relative flex items-center justify-center overflow-hidden min-h-screen w-full bg-black">
            {/* ✅ DotGrid as Background Canvas */}
            <DotGrid
                dotSize={3}
                gap={40}
                baseColor="#e3efee"
                activeColor="#5227FF"
                proximity={120}
                shockRadius={250}
                shockStrength={5}
                resistance={750}
                returnDuration={1.5}
                className="absolute inset-0 z-0"
                style={{ position: 'absolute', inset: 0, zIndex: 0 }}
            />

            {/* 🌐 Gradient & Decorative Layers */}
            <div className="absolute inset-0 bg-gradient-radial from-cyber-accent/10 via-transparent to-transparent z-0" />

            {/* ✨ Floating Motion Dots */}
            <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-20 left-20 w-2 h-2 bg-cyber-neon rounded-full opacity-60 z-10"
            />
            <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-40 right-32 w-3 h-3 bg-cyber-accent rounded-full opacity-40 z-10"
            />
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute bottom-32 left-32 w-2 h-2 bg-cyber-purple rounded-full opacity-50 z-10"
            />

            {/* 🔤 Hero Content */}

            <div className="relative z-20 w-[90%]  mx-auto px-4 bg-rose-400">
                {/* <div className='flex gap-10'>
                    <div className=' bg-blue-500'>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="mb-8"
                        >

                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 md:leading-tight">
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
                                className="text-sm md:text-lg lg:text-xl text-gray-300 mb-2 lg:mb-6  mx-auto leading-relaxed"
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
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)' }}
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
                    </div>

                    <div>
                        Hello world
                    </div>

                </div> */}



                <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4">
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Secure Better.
              </motion.h1>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-400 leading-tight">
                  Decentralized
                </h2>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-400 leading-tight">AI-Powered</h2>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-400 leading-tight">
                  Cyber Defense
                </h2>
              </motion.div>
            </div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                Civic-Verified Experts + Agentic AI to Stop Web3 Threats in Real Time.
              </p>
              <p className="text-base md:text-lg text-gray-400">90% of DeFi hacks go undetected - until now.</p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Dashboard
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <Code className="mr-2 h-5 w-5" />
                Security Extension
                <Zap className="ml-2 h-4 w-4 text-orange-400" />
              </Button>
            </motion.div>

            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <div className="flex -space-x-2">
                {avatars.map((avatar, index) => (
                  <motion.img
                    key={index}
                    src={avatar}
                    alt={`User ${index + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-gray-700"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  />
                ))}
              </div>
              <p className="text-gray-400">
                Trusted by <span className="text-white font-semibold">2500+</span> Web3 projects
              </p>
            </motion.div>
          </motion.div>

          {/* Right Side - Dashboard Mockup */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
              {/* Window Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Code className="h-4 w-4" />
                  <span>Kadak.AI for VSCode</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Today s Goals</div>
                  <div className="text-sm font-semibold">
                    <span className="text-orange-400">2/3</span> completed
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-200">Your Security Stats</h3>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Live</span>
                  </div>
                  <p className="text-sm text-gray-400">Dec 21, 2024</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Today</div>
                    <div className="text-2xl font-bold">4h 32m</div>
                    <div className="text-xs text-green-400 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +18% from yesterday
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Weekly Streak</div>
                    <div className="text-2xl font-bold">
                      21 <span className="text-sm text-gray-400">days</span>
                    </div>
                    <div className="text-xs text-orange-400 flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      Personal best!
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Today s Security Progress</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Goal: 6h</div>
                      <div className="text-sm font-semibold">75%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-orange-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 1.5, delay: 1.5 }}
                    ></motion.div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">32m completed</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">Rank</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">#8</div>
                    <div className="text-xs text-green-400">↑ +4</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Customer Testimonials Section */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Trusted by Web3 Security Leaders</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See what industry experts are saying about Kadak.AI s revolutionary approach to decentralized cyber
              defense.
            </p>
          </div>

          <InfiniteMovingCards items={customers} direction="right" speed="slow" />
        </motion.div>
      </div>




                {/* <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-8"
                >
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
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
                            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)' }}
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
                </motion.div> */}

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
