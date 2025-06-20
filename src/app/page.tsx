'use client';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import HeroSection from "@/components/Home/HeroSection";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";



export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h -screen bg-cyber-dark text-white">
      {/* Navigation */}
      <div>
        <Navbar />
      </div>
      

      {/* Main Content */}
      <div className="py-4 mt-14">
      <HeroSection />


      {/* Tech Stack Section */}
      <section className="py-16 bg-cyber-darker border-t border-cyber-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold mb-8 text-gray-300">
              Powered by cutting-edge technology
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["Next.js", "OpenAI", "LangChain", "Civic", "Polygon", "Ethers.js"].map((tech) => (
                <motion.div
                  key={tech}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  className="text-lg font-medium text-gray-400 hover:text-cyber-accent transition-colors cursor-pointer"
                >
                  {tech}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      </div>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-cyber-accent text-cyber-dark p-3 rounded-full shadow-lg hover:shadow-cyber-accent/30 transition-all duration-300 z-50"
     
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  );
}
