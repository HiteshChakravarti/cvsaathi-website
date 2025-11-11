import { motion } from "motion/react";
import { Upload, Sparkles, Download, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload or Start Fresh",
    description: "Import your existing resume or start with a blank template. Our AI will guide you through every step.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Enhancement",
    description: "Our AI analyzes your content, suggests improvements, and optimizes for ATS systems automatically.",
    color: "from-cyan-500 to-teal-500",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Review & Customize",
    description: "Fine-tune your resume with our intuitive editor. Choose from premium templates and customize colors.",
    color: "from-teal-500 to-emerald-500",
  },
  {
    number: "04",
    icon: Download,
    title: "Download & Apply",
    description: "Export your ATS-optimized resume in multiple formats. Track applications and land interviews.",
    color: "from-emerald-500 to-teal-500",
  },
];

export function HowItWorks() {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-white">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
      
      <div className="absolute top-20 right-0 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-block px-5 py-2 mb-6 bg-teal-50 border border-teal-200 rounded-full">
            <span className="text-teal-700 uppercase tracking-wider">How It Works</span>
          </div>
          <h2 className="text-gray-900 mb-6">
            Four simple steps to success
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create a professional, ATS-optimized resume in minutes with our AI-powered platform
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-200 via-cyan-200 to-teal-200 -translate-x-1/2" />

          {/* Steps */}
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className="flex-1 lg:text-right" style={{ textAlign: index % 2 === 0 ? 'right' : 'left' }}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="inline-block">
                      <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${step.color} text-white mb-4`}>
                        Step {step.number}
                      </div>
                    </div>
                    <h3 className="text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 max-w-md" style={{ marginLeft: index % 2 === 0 ? 'auto' : '0', marginRight: index % 2 === 0 ? '0' : 'auto' }}>
                      {step.description}
                    </p>
                  </motion.div>
                </div>

                {/* Icon Circle */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="relative z-10 flex-shrink-0"
                >
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl shadow-teal-500/30 relative group`}>
                    {/* Pulsing ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-teal-400"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3,
                      }}
                    />
                    
                    <step.icon className="w-10 h-10 text-white relative z-10" />
                  </div>
                </motion.div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 transition-all"
          >
            Start Building Now - It's Free
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
