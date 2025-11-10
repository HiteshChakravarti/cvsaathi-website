import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <motion.div
        animate={{
          backgroundColor: scrolled ? "rgba(12, 14, 24, 0.8)" : "rgba(12, 14, 24, 0)",
          backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
          borderColor: scrolled ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0)",
        }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto border rounded-full px-6 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#3B82F6] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white">CityResume.AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#benefits" className="text-white/70 hover:text-white transition-colors">
            Benefits
          </a>
          <a href="#features" className="text-white/70 hover:text-white transition-colors">
            Features
          </a>
          <a href="#services" className="text-white/70 hover:text-white transition-colors">
            Services
          </a>
          <a href="#process" className="text-white/70 hover:text-white transition-colors">
            Process
          </a>
          <a href="#projects" className="text-white/70 hover:text-white transition-colors">
            Projects
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            Sign In
          </Button>
          <Button className="bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] hover:from-[#2DD4BF]/90 hover:to-[#3B82F6]/90">
            Get Started
          </Button>
        </div>
      </motion.div>
    </motion.nav>
  );
}
