import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export function Feature1() {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-white via-teal-50/30 to-white">
      {/* 3D Layered Circles Background */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* Outer ring */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full border-[40px] border-gray-100/80"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 50px 100px -20px rgba(0,0,0,0.05), inset 0 -30px 60px -20px rgba(20,184,166,0.1)",
          }}
        />
        
        {/* Middle ring */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full border-[30px] border-teal-100/60"
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          style={{
            boxShadow: "0 40px 80px -15px rgba(20,184,166,0.08), inset 0 -20px 40px -10px rgba(20,184,166,0.15)",
          }}
        />
        
        {/* Inner circle */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-white to-teal-50/50 border-[20px] border-teal-200/40"
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          style={{
            boxShadow: "0 30px 60px -10px rgba(20,184,166,0.15), inset 0 -15px 30px -5px rgba(20,184,166,0.2)",
          }}
        />
        
        {/* Core circle */}
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full bg-gradient-to-br from-teal-100 to-cyan-100"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          style={{
            boxShadow: "0 20px 40px -5px rgba(20,184,166,0.25), inset 0 -10px 20px rgba(6,182,212,0.3)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/80 backdrop-blur-sm border border-teal-200/50 rounded-full shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="text-teal-900 text-sm tracking-wide uppercase">AI-Powered For Indian Job Seekers</span>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 bg-gradient-to-r from-gray-900 via-teal-800 to-gray-900 bg-clip-text text-transparent">
            CVSaathi
          </h2>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-600 mb-10 max-w-2xl mx-auto"
        >
          Create AI-powered, ATS-friendly resumes built for the Indian market and beyond
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white gap-2 shadow-lg shadow-gray-900/20 px-8"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/50 backdrop-blur-sm"
            >
              See Our Services
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle gradient overlays */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
    </section>
  );
}
