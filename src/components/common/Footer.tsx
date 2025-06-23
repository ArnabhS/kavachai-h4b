import { motion } from "framer-motion"
import { Github, Twitter } from "lucide-react"
import Image from "next/image"
import myImage from "@/assets/kavachai.jpg";
import { useTheme } from 'next-themes';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <div className={theme === 'light' ? 'bg-gray-100' : 'bg-black'}>
      <footer className={`${theme === 'light' ? 'bg-gray-100 border-t border-gray-200 text-gray-700' : 'bg-black border-t border-cyber-accent/20 text-gray-400'} py-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 mb-4 md:mb-0"
            >
               <Image
                src={myImage}
                alt="Description of image"
                width={42} // or set layout="responsive" for dynamic sizing
                height={42}
                className="rounded-full"
              />
              <span className={`text-lg font-bold glow-text ${theme === 'light' ? 'text-gray-900' : ''}`}>Kavach.AI</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-6"
            >
              <a href="#" className={theme === 'light' ? 'text-gray-500 hover:text-cyber-accent transition-colors' : 'text-gray-400 hover:text-cyber-accent transition-colors'}>
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className={theme === 'light' ? 'text-gray-600 hover:text-cyber-accent transition-colors' : 'text-gray-400 hover:text-cyber-accent transition-colors'}>
                <Twitter className="h-5 w-5" />
              </a>
            </motion.div>
          </div>

          <div className={`mt-6 pt-8 text-center text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            <p>&copy; 2025 Kavach.AI. Decentralized AI-Powered Cyber Defense.</p>
          </div>
        </div>
      </footer>        
    </div>
  )
}

export default Footer