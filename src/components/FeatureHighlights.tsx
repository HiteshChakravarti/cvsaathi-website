import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { Sparkles, Target, Zap, Lightbulb, Users, TrendingUp, Award, DollarSign } from "lucide-react";
import { MouseEvent } from "react";

const mainFeatures = [
  {
    icon: Target,
    title: "Real-Time Analytics",
    description: "Stay ahead with accurate, real-time performance tracking",
    visual: "chart",
  },
  {
    icon: Sparkles,
    title: "AI-Driven Growth",
    description: "Make smarter moves with accurate, real-time business insights.",
    visual: "stats",
  },
  {
    icon: Zap,
    title: "Sync in real time",
    description: "Connect with your team instantly to track progress and updates",
    visual: "sync",
  },
];

const subFeatures = [
  { icon: Lightbulb, label: "Faster Innovation" },
  { icon: Users, label: "Virtual Assistance" },
  { icon: TrendingUp, label: "Scalable Solutions" },
  { icon: Award, label: "Personalized Experiences" },
  { icon: DollarSign, label: "Cost Effective" },
];

function AnimatedBorderCard({ feature, index }: { feature: typeof mainFeatures[0]; index: number }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      className="group relative"
    >
      {/* Animated border gradient wrapper */}
      <div className="relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-[1px] overflow-hidden">
        {/* Rotating gradient border */}
        <motion.div
          className="pointer-events-none absolute -inset-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(20, 184, 166, 0.4),
                transparent 40%
              )
            `,
          }}
        />

        {/* Animated running border */}
        <div className="absolute inset-0 rounded-3xl opacity-50">
          <div className="absolute inset-0 rounded-3xl border border-transparent [background:linear-gradient(#0A0B0F,#0A0B0F)_padding-box,conic-gradient(from_var(--border-angle),transparent_80%,#14b8a6_86%,#06b6d4_90%,#14b8a6_94%,transparent_100%)_border-box] animate-border" />
        </div>

        {/* Card content */}
        <div className="relative rounded-3xl bg-[#0A0B0F] p-8 h-full">
          {/* Spotlight effect */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition duration-300"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  500px circle at ${mouseX}px ${mouseY}px,
                  rgba(20, 184, 166, 0.08),
                  transparent 80%
                )
              `,
            }}
          />

          {/* Visual representation area */}
          <div className="mb-6 h-40 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
            {feature.visual === "chart" && (
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#teal-gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 314" }}
                    whileInView={{ strokeDasharray: "235 314" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    viewport={{ once: true }}
                  />
                  <defs>
                    <linearGradient id="teal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14B8A6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/80">75%</span>
                </div>
              </div>
            )}
            
            {feature.visual === "stats" && (
              <div className="w-full h-full flex items-center justify-center gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  viewport={{ once: true }}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg"
                >
                  <div className="text-white/90">80%</div>
                  <div className="text-white/50 text-xs">Automation</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  viewport={{ once: true }}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg"
                >
                  <div className="text-white/90">10%</div>
                  <div className="text-white/50 text-xs">Cost</div>
                </motion.div>
                <div className="text-white/30 rotate-90 text-xs">AFTER</div>
              </div>
            )}
            
            {feature.visual === "sync" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-teal-500/30"
              >
                <feature.icon className="w-12 h-12 text-white" />
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h3 className="text-white mb-3">{feature.title}</h3>
            <p className="text-white/60">{feature.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedPill({ feature, index }: { feature: typeof subFeatures[0]; index: number }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay: 0.5 + index * 0.1,
      }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      className="group relative"
    >
      {/* Border wrapper */}
      <div className="relative rounded-full bg-gradient-to-br from-white/10 to-white/5 p-[1px]">
        {/* Spotlight border */}
        <motion.div
          className="pointer-events-none absolute -inset-[1px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                200px circle at ${mouseX}px ${mouseY}px,
                rgba(20, 184, 166, 0.6),
                transparent 60%
              )
            `,
          }}
        />

        {/* Pill content */}
        <div className="relative flex items-center gap-2 px-5 py-3 bg-[#0A0B0F] rounded-full cursor-pointer">
          {/* Spotlight glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  150px circle at ${mouseX}px ${mouseY}px,
                  rgba(20, 184, 166, 0.1),
                  transparent 70%
                )
              `,
            }}
          />

          {/* Icon */}
          <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-teal-500 group-hover:to-cyan-500 transition-all duration-300">
            <feature.icon className="w-3 h-3 text-teal-400 group-hover:text-white transition-colors" />
          </div>
          
          <span className="relative z-10 text-white/70 group-hover:text-white transition-colors">
            {feature.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function FeatureHighlights() {
  return (
    <section id="features" className="py-24 px-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 mb-4 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
            <span className="text-white/70">Features</span>
          </div>
          <h2 className="text-white mb-4">Everything you need to succeed</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Powerful features designed to help you land your dream job
          </p>
        </motion.div>

        {/* Main Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {mainFeatures.map((feature, index) => (
            <AnimatedBorderCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Sub-feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {subFeatures.map((feature, index) => (
            <AnimatedPill key={index} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
