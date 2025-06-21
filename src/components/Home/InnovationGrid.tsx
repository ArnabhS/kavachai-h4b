'use client';

import { motion } from 'framer-motion';
import { Shield, Link, Zap, Award } from 'lucide-react';

const InnovationGrid = () => {
  const innovations = [
    {
      icon: Shield,
      title: 'Civic Auth Verification',
      description: 'Only verified security experts can participate in our threat response network',
      stats: '99.9% verified users',
    },
    {
      icon: Link,
      title: 'On-chain Logging',
      description: 'Every action is recorded on-chain for complete transparency and auditability',
      stats: '100% transparent',
    },
    {
      icon: Zap,
      title: 'Agentic AI Automation',
      description: 'Multi-agent AI system that works 24/7 to detect and analyze Web3 threats',
      stats: '< 30s response time',
    },
    {
      icon: Award,
      title: 'Gamified Reputation',
      description: 'Earn $SHIELD tokens and NFT badges for successful threat mitigation',
      stats: 'Level up your security',
    },
  ];

  return (
    <section className="py-24 bg-cyber-dark relative">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-accent/5 via-transparent to-cyber-neon/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="glow-text">Innovation</span>{' '}
            <span className="text-white">at Scale</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Cutting-edge technology stack that revolutionizes Web3 security
          </p>
        </motion.div>

        {/* Innovations */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {innovations.map((innovation, index) => {
            const Icon = innovation.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: 'easeOut',
                }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="cyber-card p-6 group hover:border-cyber-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-accent/20 will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  whileHover={{ rotate: 45 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyber-accent/20 mb-4 group-hover:bg-cyber-accent/30 transition-colors"
                >
                  <Icon className="h-6 w-6 text-cyber-accent" />
                </motion.div>

                <h3 className="text-lg font-bold mb-3 text-white group-hover:text-cyber-accent transition-colors duration-300">
                  {innovation.title}
                </h3>

                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {innovation.description}
                </p>

                <div className="mt-auto">
                  <span className="inline-block bg-cyber-neon/20 text-cyber-neon px-3 py-1 rounded-full text-xs font-semibold">
                    {innovation.stats}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-cyber-blue/20 rounded-2xl p-8 border border-cyber-accent/20">
            <h3 className="text-2xl font-bold mb-4 glow-text">Why Kavach.AI Wins</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-cyber-accent mb-2">Market Need</h4>
                <p className="text-gray-300 text-sm">
                  90% of DeFi hacks go undetected in real time
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-cyber-neon mb-2">Innovation</h4>
                <p className="text-gray-300 text-sm">
                  First trustless human-AI security workflow
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-cyber-purple mb-2">Value</h4>
                <p className="text-gray-300 text-sm">
                  Combines 4 buzzwords: Civic + Web3 + AI + Security
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InnovationGrid;
