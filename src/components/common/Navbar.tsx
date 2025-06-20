import Link from "next/link";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const Navbar = () => {
  return (
    <div>
        <nav className="fixed top-0 w-full bg-cyber-dark/80 backdrop-blur-md border-b border-cyber-accent/20 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-2"
                    >
                      <Shield className="h-8 w-8 text-cyber-accent" />
                      <span className="text-xl font-bold glow-text">Kadak.AI</span>
                    </motion.div>
        
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-6"
                    >
                      <Link href="/login" className="cyber-button-outline px-4 py-2 text-sm">
                        Login
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </nav>
    </div>
  )
}

export default Navbar