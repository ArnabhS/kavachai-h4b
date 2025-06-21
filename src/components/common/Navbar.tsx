
import { motion } from "framer-motion";
import Image from "next/image";
import { UserButton } from '@civic/auth/react'
const Navbar = () => {
  return (
    <div>
        <nav className="fixed top-0 w-full bg-cyber-dark/80 backdrop-blur-md border-b border-cyber-accent/20 z-50">
                <div className="max-w-[90%]  mx-auto">
                  <div className="flex justify-between items-center h-16">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-2"
                    >
                     <Image src={'/kavachai.webp'} width={100} height={100} className="h-10 w-10 rounded-full" alt="logo" />
                      <span className="text-xl font-bold glow-text">Kavach.AI</span>
                    </motion.div>


                   
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-6 "
                    >
                      {/* <Link href="/login" className="cyber-button-outline px-4 py-2 text-sm"> */}
                        <UserButton className="text-white hover:text-white"/>
                      {/* </Link> */}
                    </motion.div>
                   
                  </div>
                </div>
              </nav>
    </div>
  )
}

export default Navbar