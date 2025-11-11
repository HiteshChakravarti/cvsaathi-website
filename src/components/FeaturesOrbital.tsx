import { motion } from "motion/react";
import { FileText, CheckCircle, Briefcase, Bot, TrendingUp } from "lucide-react";

const features = [
  { 
    icon: FileText, 
    label: "Resume Builder",
    description: "Create stunning, ATS-optimized resumes with 50+ templates",
    gradient: "from-teal-500 to-cyan-500",
    stats: "50+ Templates",
  },
  { 
    icon: CheckCircle, 
    label: "ATS Checker",
    description: "Instant compatibility scores and actionable feedback",
    gradient: "from-green-500 to-emerald-500",
    stats: "98% Pass Rate",
  },
  { 
    icon: Briefcase, 
    label: "Interview Prep",
    description: "AI-powered mock interviews with real-time feedback",
    gradient: "from-purple-500 to-pink-500",
    stats: "1000+ Questions",
  },
  { 
    icon: Bot, 
    label: "AI Coach",
    description: "24/7 personal career advisor with smart suggestions",
    gradient: "from-orange-500 to-amber-500",
    stats: "Always Available",
  },
  { 
    icon: TrendingUp, 
    label: "Skill Gap Analysis",
    description: "Discover missing skills and get personalized learning paths",
    gradient: "from-blue-500 to-indigo-500",
    stats: "Smart Insights",
  },
];

export function FeaturesOrbital() {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-block px-5 py-2 mb-6 bg-white border border-teal-200 rounded-full shadow-sm">
            <span className="text-teal-700 uppercase tracking-wider">Powerful Features</span>
          </div>
          <h2 className="text-gray-900 mb-6">
            Everything you need to succeed
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI-powered tools and expert guidance to help you create the perfect resume
          </p>
        </motion.div>

        {/* Orbital Animation Container */}
        <div className="relative h-[800px] flex items-center justify-center">
          {/* Center Logo/Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="absolute z-20"
          >
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-teal-500/50">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="relative"
              >
                <div className="text-white text-center">
                  <div className="text-2xl mb-1">CV</div>
                  <div className="text-sm tracking-wider">Saathi</div>
                </div>
              </motion.div>
            </div>
            
            {/* Pulsing rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-teal-400/30"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
            />
          </motion.div>

          {/* Orbiting Feature Cards */}
          {features.map((feature, index) => {
            const angle = (360 / features.length) * index;
            const radius = 320;
            const orbitDuration = 50;
            
            return (
              <motion.div
                key={index}
                className="absolute"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                animate={{
                  rotateZ: [angle, angle + 360],
                }}
                transition={{
                  rotateZ: {
                    duration: orbitDuration,
                    repeat: Infinity,
                    ease: "linear",
                  }
                }}
                style={{
                  transformOrigin: "center center",
                }}
              >
                <motion.div
                  style={{
                    transform: `translate(${Math.cos((angle * Math.PI) / 180) * radius}px, ${Math.sin((angle * Math.PI) / 180) * radius}px)`,
                  }}
                  animate={{
                    rotateZ: [0, -360],
                  }}
                  transition={{
                    rotateZ: {
                      duration: orbitDuration,
                      repeat: Infinity,
                      ease: "linear",
                    }
                  }}
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.1,
                      y: -10,
                    }}
                    className="group relative"
                  >
                    {/* Connecting line to center */}
                    <motion.div
                      className={`absolute top-1/2 left-1/2 h-1 bg-gradient-to-r ${feature.gradient} opacity-30 origin-left`}
                      style={{
                        width: `${radius}px`,
                        transform: `translate(-100%, -50%) rotate(${180 + angle}deg)`,
                      }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: index * 0.15 }}
                      viewport={{ once: true }}
                    />

                    {/* Feature Card - Larger and more detailed */}
                    <div className={`relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-gray-100 p-8 w-72 group-hover:border-transparent transition-all duration-500 group-hover:shadow-2xl`}>
                      {/* Animated gradient border on hover */}
                      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`} />
                      
                      {/* Glow effect on hover */}
                      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500`} />
                      
                      <div className="relative">
                        {/* Icon - Larger with gradient */}
                        <motion.div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <feature.icon className="w-8 h-8 text-white" />
                        </motion.div>

                        {/* Label */}
                        <h4 className="text-gray-900 mb-2">
                          {feature.label}
                        </h4>
                        
                        {/* Description - More detailed */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {feature.description}
                        </p>

                        {/* Stats Badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${feature.gradient} rounded-full text-white text-xs shadow-md`}>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          {feature.stats}
                        </div>
                      </div>
                    </div>

                    {/* Floating particles */}
                    <motion.div
                      className="absolute -top-2 -right-2 w-2 h-2 bg-teal-400 rounded-full"
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2,
                      }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* Orbital rings - Larger for 5 features */}
          <motion.div
            className="absolute w-[640px] h-[640px] border-2 border-dashed border-teal-200 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-[800px] h-[800px] border border-gray-200 rounded-full opacity-30"
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Additional decorative ring */}
          <motion.div
            className="absolute w-[480px] h-[480px] border border-teal-300/20 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Bottom text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 text-lg">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">5 powerful features</span> working seamlessly together to accelerate your career journey
          </p>
        </motion.div>
      </div>
    </section>
  );
}
