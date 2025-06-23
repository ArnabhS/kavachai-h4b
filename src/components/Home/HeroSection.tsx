'use client';

import { motion } from 'framer-motion';
import DotGrid from '@/components/ui/DotGrid';
import { Button } from '@/components/ui/button';
import { Award, Clock, Code, Target, TrendingUp, Zap } from 'lucide-react';
import { AnimatedTooltip } from '../ui/animated-tooltip';
import Link from 'next/link';
import { useTheme } from 'next-themes';

const people = [
  {
    id: 1,
    name: "John Doe",
    designation: "Software Engineer",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
  },
  {
    id: 2,
    name: "Robert Johnson",
    designation: "Product Manager",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    name: "Jane Smith",
    designation: "Data Scientist",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 4,
    name: "Emily Davis",
    designation: "UX Designer",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
  },
];

const HeroSection = () => {
  const { theme } = useTheme();

  return (
    <div className={`relative flex items-center justify-center overflow-hidden min-h-screen w-full ${theme === 'light' ? 'bg-gray-100' : 'bg-black'}`}>
      <DotGrid
        dotSize={3}
        gap={40}
        baseColor={theme === 'light' ? '#899292' : '#e3efee'}
        activeColor="#5227FF"
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
        className="absolute inset-0 z-0"
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />

      <div className={`absolute inset-0 z-0 ${theme === 'light' ? 'bg-gradient-radial from-gray-200/30 via-transparent to-gray-100' : 'bg-gradient-radial from-cyber-accent/10 via-transparent to-black'}`} />

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

      <div className="relative z-20 w-[90%] mx-auto ">

        <div className="relative">
                <div className={`absolute inset-0 rounded-3xl ${theme === 'dark'? 'bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20': 'bg-gradient-to-br from-gray-300/20 via-gray-100 to-gray-200/20' }  `}></div>
                <div className="container mx-auto px-4 py-6 lg:py-10 relative z-10 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
                    {/* Left Side */}
                    <motion.div
                      className="space-y-6"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <div className="space-y-3">
                        
                        <motion.div
                          className="space-y-2 text-pretty"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                        >
                          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${theme === 'dark'? 'bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent':'bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent'} `}>
                            Decentralized
                          </h2>
                          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${theme === 'dark'? 'bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent':'bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent'} `}>
                            AI-Powered
                          </h2>
                          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${theme === 'dark'? 'bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent':'bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent'} `}>
                            Cyber Defense
                          </h2>
                        </motion.div>
                      </div>
        
                      <motion.div
                        className="space-y- 4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                      >
                        <p className={`text-base md:text-lg ${theme === 'dark'? 'text-gray-300' : 'text-gray-700' }  leading-relaxed md:max-w-86`}>
                          Civic-Verified Experts + Agentic AI to Stop Web3 Threats in Real Time.
                        </p>
                        <p className={`text-sm md:text-base  ${theme === 'dark'? 'text-gray-500' : 'text-gray-800' } `}>90% of DeFi hacks go undetected - until now.</p>
                      </motion.div>
        
                      
                      <motion.div
                        className="flex flex-col lg:flex-row gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                      >
                        <Link href={'/dashboard'}>
                        <Button
                          size="lg"
                          className={`w-full lg:w-fit px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:cursor-pointer ${theme ==='dark' ? "bg-gray-100 hover:bg-gray-100 text-black" : "bg-gray-900 hover:bg-gray-900 text-white"}`}
                        >
                          Dashboard
                          <TrendingUp className="ml-2 h-5 w-5" />
                        </Button>
                        </Link>
                        <a href="https://marketplace.visualstudio.com/items?itemName=kavachai.kavachai-white-hat-agent" target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="lg"
                          className={`${theme === 'dark'? 'border-gray-100 text-gray-300 hover:bg-gray-900 hover:border-gray-600' : 'border-gray-900 bg-gray-100 text-black hover:bg-gray-100 hover:border-gray-100'} px-8 py-3 rounded-lg font-semibold w-full lg:w-fit transition-all duration-300 transform hover:scale-105 hover:cursor-pointer`}
                        >
                          <Code className="mr-2 h-5 w-5" />
                          VsCode Extension
                          <Zap className={`ml-2 h-4 w-4  ${theme === 'dark'? 'text-gray-400' : 'text-black'}`} />
                        </Button>
                        </a>
                      </motion.div>
        
                      <motion.div
                        className="flex items-center space-x-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                      >
                        <div className='flex gap-6 items-center'>
                          <div className='flex'>
                            <AnimatedTooltip  items={people} />
                          </div>
                          
                        <p className={` text-sm ${theme === 'dark'? 'text-gray-100' : 'text-black'}`}>2500+ happy customers</p>
                        </div>
                        
                       
                      </motion.div>
                    </motion.div>
        
                    {/* Right Side - Dashboard Mockup */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <div className={`${theme === 'light' ? 'bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-lg text-gray-900' : 'bg-gradient-to-br from-gray-900 to-black border-gray-800 text-white'} rounded-2xl p-4 md:p-6 shadow-2xl border-3 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl w-full mx-auto`}>
                        {/* Window Header */}
                        <div className="flex items-center justify-between mb-4 lg:mb-6">
                          <div className="flex space-x-1 lg:space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <div className={`flex items-center space-x-2 text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>
                            <Code className="h-4 w-4" />
                            <span>Kavach.AI for VSCode</span>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs ${theme === 'light' ? 'text-gray-700' : 'text-gray-500'}`}>Today&#39;s Goals</div>
                            <div className="text-sm font-semibold">
                              <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>2/3</span> completed
                            </div>
                          </div>
                        </div>
        
                        {/* Dashboard Content */}
                        <div className={`${theme === 'light' ? 'space-y-2 lg:space-y-6' : 'space-y-2 lg:space-y-6'}`}>
                          <div>
                            <div className="flex items-center justify-between mb-1 lg:mb-2">
                              <h3 className={`text-sm lg:text-lg font-semibold ${theme === 'dark'? 'text-gray-200' : 'text-gray-800'}`}>Your Security Stats</h3>
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Live</span>
                            </div>
                            <p className={` text-xs lg:text-sm  ${theme === 'dark'? 'text-gray-500' : 'text-gray-800'}`}>Jun 21, 2025</p>
                          </div>
        
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <div className="text-xs lg:text-sm text-gray-500 mb-1">Today</div>
                              <div className={`text-lg  lg:text-2xl font-bold  ${theme === 'dark'? 'text-white' : 'text-black'}`}>4h 32m</div>
                              <div className="text-xs text-green-400 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +18% from yesterday
                              </div>
                            </div>
        
                            <div>
                              <div className="text-xs lg:text-sm text-gray-500 mb-1">Weekly Streak</div>
                              <div className={`text-lg  lg:text-2xl font-bold  ${theme === 'dark'? 'text-white' : 'text-black'}`}>
                                21 <span className="text-sm text-gray-500">days</span>
                              </div>
                              <div className="text-xs text-gray-400 flex items-center">
                                <Award className="h-3 w-3 mr-1" />
                                Personal best!
                              </div>
                            </div>
                          </div>
        
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">Today&#39;s Security Progress</span>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500">Goal: 6h</div>
                                <div className={`text-sm font-semibold ${theme === 'dark'? "text-gray-300" : "text-gray-950"}`}>75%</div>
                              </div>
                            </div>
                            <div className={`w-full  rounded-full h-2 ${theme === 'dark'? 'bg-gray-800' : 'bg-gray-200'}`}>
                              <motion.div
                                className={` h-2 rounded-full ${theme === 'dark'? "bg-gray-300" : "bg-gray-950"}`}
                                initial={{ width: 0 }}
                                animate={{ width: "75%" }}
                                transition={{ duration: 1.5, delay: 1.5 }}
                              ></motion.div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">32m completed</p>
                          </div>
        
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">Rank</span>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-gray-300">#8</div>
                              <div className="text-xs text-green-400">↑ +4</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
      </div>
    </div>
  );
};

export default HeroSection;

