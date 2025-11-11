import { motion, useMotionValue, useTransform } from "motion/react";
import { FileText, CheckCircle, Briefcase, Bot, TrendingUp } from "lucide-react";
import { useState } from "react";

const features = [
  {
    id: 1,
    icon: FileText,
    title: "Resume Builder",
    description: "Create stunning, professional resumes with our intuitive drag-and-drop builder. Choose from 50+ ATS-optimized templates designed for Indian job markets.",
    gradient: "from-teal-500/20 via-cyan-500/20 to-blue-500/20",
    borderGradient: "from-teal-500 via-cyan-500 to-blue-500",
    iconColor: "text-teal-500",
    large: true,
    stats: "50+ Templates",
  },
  {
    id: 2,
    icon: CheckCircle,
    title: "ATS Checker",
    description: "Get instant ATS compatibility scores and actionable feedback to ensure your resume passes all screening systems.",
    gradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
    borderGradient: "from-green-500 via-emerald-500 to-teal-500",
    iconColor: "text-green-500",
    stats: "98% Pass Rate",
  },
  {
    id: 3,
    icon: Briefcase,
    title: "Interview Prep",
    description: "Practice with AI-powered mock interviews tailored to your industry and role. Get real-time feedback and confidence.",
    gradient: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
    borderGradient: "from-purple-500 via-pink-500 to-rose-500",
    iconColor: "text-purple-500",
    stats: "1000+ Questions",
  },
  {
    id: 4,
    icon: Bot,
    title: "AI Coach",
    description: "Your personal AI career advisor provides smart suggestions, content optimization, and career guidance 24/7.",
    gradient: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
    borderGradient: "from-orange-500 via-amber-500 to-yellow-500",
    iconColor: "text-orange-500",
    stats: "24/7 Available",
  },
  {
    id: 5,
    icon: TrendingUp,
    title: "Skill Gap Analysis",
    description: "Discover missing skills for your target roles and get personalized learning paths to bridge the gap and land your dream job.",
    gradient: "from-blue-500/20 via-indigo-500/20 to-violet-500/20",
    borderGradient: "from-blue-500 via-indigo-500 to-violet-500",
    iconColor: "text-blue-500",
    stats: "Smart Insights",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative group ${feature.large ? 'row-span-2' : ''}`}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
          padding: '2px',
        }}
        animate={isHovered ? {
          backgroundPosition: ['0% 0%', '100% 100%'],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div className="w-full h-full rounded-3xl bg-white" />
      </motion.div>

      {/* Card content */}
      <div className="relative h-full bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-gray-100 group-hover:border-transparent overflow-hidden transition-all duration-500">
        {/* Animated gradient background mesh */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          animate={isHovered ? {
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating orbs */}
        <motion.div
          className={`absolute top-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br ${feature.gradient} blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
          animate={isHovered ? {
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={`absolute bottom-10 left-10 w-24 h-24 rounded-full bg-gradient-to-br ${feature.gradient} blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
          animate={isHovered ? {
            x: [0, -15, 0],
            y: [0, 15, 0],
            scale: [1, 1.1, 1],
          } : {}}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <div className={`relative z-10 p-8 h-full flex flex-col ${feature.large ? 'justify-between' : 'justify-start'}`}>
          {/* Icon with rotation animation */}
          <motion.div
            animate={isHovered ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg group-hover:shadow-2xl`}>
              <feature.icon className={`w-8 h-8 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`} />
            </div>
          </motion.div>

          {/* Text content */}
          <div className="flex-1">
            <h3 className="text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300">
              {feature.title}
            </h3>
            <p className={`text-gray-600 ${feature.large ? 'text-base' : 'text-sm'} leading-relaxed mb-4`}>
              {feature.description}
            </p>
          </div>

          {/* Stats badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${feature.borderGradient} rounded-full text-white text-sm shadow-lg self-start`}
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {feature.stats}
          </motion.div>

          {/* Hover arrow indicator */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-8 right-8"
          >
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${feature.borderGradient} flex items-center justify-center`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            backgroundSize: '200% 200%',
          }}
          animate={isHovered ? {
            backgroundPosition: ['0% 0%', '100% 100%'],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
      </div>

      {/* 3D shadow effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl -z-10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${feature.borderGradient})`,
          transform: 'translateZ(-20px)',
        }}
      />
    </motion.div>
  );
}

export function FeaturesHeroBento() {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-teal-100/30 to-cyan-100/30 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-3 mb-6 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-200 rounded-full shadow-sm"
          >
            <span className="text-teal-700 uppercase tracking-wider">Powerful Features</span>
          </motion.div>
          <h2 className="text-gray-900 mb-6">
            Everything you need to succeed
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Five powerful AI-driven tools working together to accelerate your career journey
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[280px]">
          {/* Resume Builder - Large (spans 2 rows and 2 columns on large screens) */}
          <div className="lg:col-span-2 lg:row-span-2">
            <FeatureCard feature={features[0]} index={0} />
          </div>

          {/* ATS Checker - Top right */}
          <div className="lg:col-span-1">
            <FeatureCard feature={features[1]} index={1} />
          </div>

          {/* Interview Prep - Middle right */}
          <div className="lg:col-span-1">
            <FeatureCard feature={features[2]} index={2} />
          </div>

          {/* AI Coach - Bottom left */}
          <div className="lg:col-span-1">
            <FeatureCard feature={features[3]} index={3} />
          </div>

          {/* Skill Gap Analysis - Bottom right */}
          <div className="lg:col-span-2">
            <FeatureCard feature={features[4]} index={4} />
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 text-lg">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">5 powerful features</span> working seamlessly to create your perfect career story
          </p>
        </motion.div>
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-teal-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </section>
  );
}
