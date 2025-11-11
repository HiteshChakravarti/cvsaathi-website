import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import heroImage from "figma:asset/205dd26f9b4807bb14918f45098b66dde1159143.png";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* 3D Hero Image Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Background gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-teal-900/50 to-gray-900" />
        
        {/* 3D Image with animation */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ 
            scale: 1,
            opacity: 1,
            y: [0, -20, 0],
          }}
          transition={{
            scale: { duration: 1.5, ease: "easeOut" },
            opacity: { duration: 1 },
            y: { 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }
          }}
          className="absolute inset-0"
        >
          <img
            src={heroImage}
            alt="CVSaathi Platform"
            className="w-full h-full object-cover opacity-50"
          />
        </motion.div>
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/80" />
        
        {/* Radial gradient for center focus */}
        <div className="absolute inset-0 bg-radial-gradient opacity-50" 
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(17, 24, 39, 0.8) 100%)'
          }}
        />
        
        {/* Teal glow effects */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Content - Centered with ORB AI style text */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        {/* Badge - ORB AI style adapted for dark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 mb-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-white tracking-wide uppercase" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
            AI-Powered Resume Builder for India
          </span>
        </motion.div>

        {/* Main heading - ORB AI style: Large "CVSaathi" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h1 
            className="text-white drop-shadow-2xl"
            style={{
              fontSize: '6rem',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            CVSaathi
          </h1>
        </motion.div>

        {/* Description - ORB AI style subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-gray-300 mb-12 max-w-2xl mx-auto drop-shadow-lg"
          style={{
            fontSize: '1.125rem',
            fontWeight: 400,
            lineHeight: 1.7,
          }}
        >
          Build a job-winning resume in minutes with expert guidance, ATS scoring, and AI-powered writing in one intuitive workspace
        </motion.p>

        {/* CTA Buttons - Adapted for dark background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white gap-2 shadow-lg shadow-teal-500/50 px-8 rounded-xl border-0"
              style={{ fontSize: '1rem', fontWeight: 600, padding: '1rem 2rem' }}
            >
              Get Template
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-md rounded-xl"
              style={{ fontSize: '1rem', fontWeight: 600, padding: '1rem 2rem' }}
              onClick={() => {
                document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See Our Services
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 flex flex-wrap gap-8 justify-center items-center"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 border-2 border-gray-900" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 border-2 border-gray-900" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 border-2 border-gray-900" />
            </div>
            <span className="text-white/90 text-sm">50,000+ users</span>
          </div>
          <div className="text-white/90 text-sm flex items-center gap-2">
            <span className="text-teal-400">★★★★★</span>
            <span>4.9/5 rating</span>
          </div>
          <div className="text-white/90 text-sm">
            <span className="text-teal-400">100%</span> ATS Compatible
          </div>
        </motion.div>
      </div>
    </section>
  );
}
