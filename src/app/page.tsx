'use client';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import HeroSection from "@/components/Home/HeroSection";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HowItWorks from "@/components/Home/HowItWorks";
import Features from "@/components/Home/Features";
import FAQ from "@/components/Home/Faq";
import { ThemeProvider, useTheme } from 'next-themes';

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { theme } = useTheme();

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
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className={`min-h-screen ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-950 text-white'}`}>
        <div>
          <Navbar />
        </div>
        
        <div className="mt-14 lg:mt-10 ">
        <HeroSection />
        <HowItWorks />
        <Features />
        <FAQ />
        
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
          className="fixed bottom-8 right-8 bg-cyan-950 text-cyber-dark p-3 rounded-full shadow-lg hover:shadow-cyber-accent/30 transition-all duration-300 z-50"
       
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </div>
    </ThemeProvider>
  );
}
