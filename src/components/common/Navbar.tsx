import { motion } from "framer-motion";
import Image from "next/image";
import { UserButton } from "@civic/auth/react";
import myImage from "@/assets/kavachai.jpg";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <nav
        className={`fixed top-0 w-full border-b border-cyber-accent/20 z-50 transition-colors duration-300 ${scrolled
            ? "bg-backdrop-blur-md bg-black/30 backdrop-blur"
            : "bg-black"
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
                width={42} // or set layout="responsive" for dynamic sizing
                height={42}
                className="rounded-full"
              />
              <span className="text-sm lg:text-xl font-bold glow-text">Kavach.AI</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-6 "
            >

              <UserButton
                className="px-4 py-1 lg:px-4 lg:py-2 cyber-button  border-current hidden lg:block "
                style={{
                  backgroundColor: "#dce2e2", //'#f2f6f6',
                  // color: 'white',
                  padding: "6px",
                }}
              />

              <UserButton
                className="px-2 py-1 lg:px-4 lg:py-2 cyber-button  border-current block lg:hidden text-xs"
                style={{
                  backgroundColor: "#dce2e2", //'#f2f6f6',
                  // color: 'white',
                  padding: "4px",
                }}
              />


            </motion.div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
