"use client"

import { easeOut, motion } from "framer-motion"
import { Brain, Shield, Users, Eye, AlertTriangle, Cpu } from "lucide-react"
import { FeatureCard } from "./FeatureCard"

const features = [
  {
    icon: <Brain className="h-4 w-4 lg:h-8 lg:w-8" />,
    title: "AI-Powered Detection",
    description:
      "Advanced machine learning algorithms analyze patterns and detect threats in real-time across Web3 protocols.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Cpu className="h-4 w-4 lg:h-8 lg:w-8" />,
    title: "VS Code Extension",
    description: "Seamless integration with existing Web3 infrastructure and development workflows.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: <Shield className="h-4 w-4 lg:h-8 lg:w-8" />,
    title: "Decentralized Security",
    description: "Distributed network of security nodes ensures no single point of failure in threat detection.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: <Users className="h-4 w-4 lg:h-8 lg:w-8" />,
    title: "Civic-Verified Experts",
    description: "Human experts validate AI findings, providing context and reducing false positives.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: <Eye className="h-4 w-4 lg:h-8 lg:w-8" />,
    title: "Real-Time Monitoring",
    description: "24/7 surveillance of smart contracts, DeFi protocols, and blockchain transactions.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: <AlertTriangle className="h-4 w-4 lg:h-8 lg:w-8" />,
    title: "Instant Alerts",
    description: "Immediate notifications when threats are detected, with detailed analysis and recommendations.",
    gradient: "from-yellow-500 to-orange-500",
  },
  
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
    },
  },
}

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOut,
    },
  },
}

export default function Features() {
  return (
    <motion.div
      className="py-12 bg-gradient-to-b from-gray-950 to-black px-6 lg:px-8 "
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUpVariants}
    >
      <div className="container mx-auto lg:px-4">
        <motion.div className="text-center mb-10 lg:mb-16" variants={itemVariants}>
          <h2 className="text-xl md:text-4xl font-bold mb-4 text-white">Advanced Security Features</h2>
          <p className="text-gray-500 max-w-3xl mx-auto text-sm md:text-base lg:text-lg">
            Comprehensive Web3 security powered by cutting-edge AI and human expertise
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <FeatureCard {...feature}/>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
