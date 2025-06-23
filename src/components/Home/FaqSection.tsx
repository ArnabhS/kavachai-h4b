"use client"

import { useState } from "react"
import { motion, AnimatePresence, easeOut } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    question: "How does Kavach.ai detect Web3 threats in real-time?",
    answer:
      "Kavach.ai uses advanced machine learning algorithms combined with a decentralized network of security nodes to monitor blockchain transactions, smart contracts, and DeFi protocols 24/7. Our AI models are trained on historical attack patterns and continuously updated by civic-verified security experts.",
  },
  {
    question: "What makes civic-verified experts different from traditional security audits?",
    answer:
      "Our civic-verified experts are blockchain security professionals who have been vetted through our decentralized reputation system. They provide real-time validation of AI findings, reducing false positives and adding contextual analysis that pure AI cannot provide. This hybrid approach ensures both speed and accuracy.",
  },
  {
    question: "How quickly can Kavach.ai respond to detected threats?",
    answer:
      "Kavach.ai provides instant alerts within seconds of threat detection. Our system can automatically trigger protective measures like pausing smart contract functions or alerting your team through multiple channels including Slack, Discord, email, and SMS.",
  },
  {
    question: "Is Kavach.ai compatible with existing Web3 infrastructure?",
    answer:
      "Yes, Kavach.ai is designed for seamless integration with existing Web3 infrastructure. We support all major blockchains, DeFi protocols, and development frameworks. Our APIs and SDKs make integration straightforward for any Web3 project.",
  },
  {
    question: "What types of threats can Kavach.ai detect?",
    answer:
      "Kavach.ai detects a wide range of Web3 threats including smart contract vulnerabilities, flash loan attacks, reentrancy attacks, price manipulation, governance attacks, bridge exploits, and suspicious transaction patterns. Our detection capabilities are continuously expanding.",
  },
  {
    question: "How does the decentralized security model work?",
    answer:
      "Our decentralized model distributes security monitoring across multiple nodes globally, eliminating single points of failure. Each node contributes to threat detection while maintaining privacy and security. The network becomes stronger as more nodes join, creating a robust defense system.",
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
      duration: 0.5,
      ease: easeOut,
    },
  },
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="max-w-4xl mx-auto bg-black">
      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl overflow-hidden"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-900/50 transition-colors duration-200"
              onClick={() => toggleFAQ(index)}
              whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.1)" }}
            >
              <h3 className="text-sm lg:text-lg font-semibold text-white pr-4">{faq.question}</h3>
              <motion.div
                className="flex-shrink-0"
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {openIndex === index ? (
                  <Minus className="h-3 w-3 lg:h-5 lg:w-5 text-gray-400" />
                ) : (
                  <Plus className="h-3 w-3 lg:h-5 lg:w-5 text-gray-400" />
                )}
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <motion.div
                    className="px-6 pb-4"
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <p className="text-gray-400 leading-relaxed text-xs lg:text-sm">{faq.answer}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
