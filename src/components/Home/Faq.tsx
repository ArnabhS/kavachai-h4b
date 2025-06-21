"use client"

import { easeOut, motion } from "framer-motion"
import { FAQSection } from "./FaqSection"


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

export default function FAQ() {
  return (
    <motion.div
      className="py-20 bg-black"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUpVariants}
    >
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Everything you need to know about Kavach.ai&#39;s decentralized security platform
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <FAQSection />
        </motion.div>
      </div>
    </motion.div>
  )
}
