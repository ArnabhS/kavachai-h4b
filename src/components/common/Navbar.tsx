import { motion } from "framer-motion";
import Image from "next/image";
import { UserButton } from "@civic/auth/react";
import myImage from "@/assets/kavachai.jpg";
import { useEffect, useState } from "react";
import { useTheme } from 'next-themes';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div>
      <nav
        className={`fixed top-0 w-full border-b border-cyber-accent/20 z-50 transition-colors duration-300 ${
          scrolled
            ? theme === 'dark'
              ? "bg-backdrop-blur-md bg-gray-700/30 backdrop-blur"
              : "bg-backdrop-blur-md bg-gray-100/60 backdrop-blur"
            : theme === 'dark'
              ? "bg-black"
              : "bg-gray-200"
        }`}
      >
        <div className="max-w-[90%]  mx-auto">
          <div className="flex justify-between items-center h-15">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Image
                src={myImage}
                alt="Description of image"
                width={42}
                height={42}
                className="rounded-full"
              />
              <span className={`text-xl font-bold glow-text ${theme === 'light' ? 'text-gray-900' : ''}`}>Kavach.AI</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-6 "
            >
              <button
                onClick={toggleTheme}
                className={`px-3 py-1 rounded-full border transition-colors duration-200 focus:outline-none ${
                  theme === 'dark'
                    ? 'bg-gray-900 text-white border-gray-700 hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0112 21.75c-5.385 0-9.75-4.365-9.75-9.75 0-4.136 2.664-7.64 6.442-9.175a.75.75 0 01.908.325.75.75 0 01-.062.954A7.501 7.501 0 0012 19.5a7.48 7.48 0 006.646-3.96.75.75 0 01.954-.062.75.75 0 01.325.908z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M4.219 4.219l1.061 1.061M17.657 17.657l1.061 1.061M3 12h1.5M19.5 12H21M4.219 19.781l1.061-1.061M17.657 6.343l1.061-1.061M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                )}
              </button>
              <UserButton
                className={`px-4 py-1 lg:px-4 lg:py-2 cyber-button border-current ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-300' : ''}`}
                style={
                  theme === 'dark'
                    ? {
                        backgroundColor: "#dce2e2",
                        padding: "6px",
                      }
                    : {
                        backgroundColor: "#f5f5f5",
                        color: '#222',
                        padding: "6px",
                        border: '1px solid #e5e7eb',
                      }
                }
              />
            </motion.div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
