import { motion } from "motion/react";
import { Upload, Wand2, Download, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Enter Your Details",
    description: "Share your experience, skills, and target city. Our smart forms make it quick and easy.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Wand2,
    title: "AI Works Its Magic",
    description: "Our AI analyzes market trends and optimizes your content for your target role and location.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: CheckCircle,
    title: "Review & Customize",
    description: "Fine-tune your AI-generated resume with our intuitive editor and real-time suggestions.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Download,
    title: "Download & Apply",
    description: "Export in multiple formats and start applying to your dream jobs with confidence.",
    color: "from-orange-500 to-red-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="mb-4 text-white">
            Get Hired in 4 Simple Steps
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            From zero to interview-ready in minutes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 -translate-x-1/2 z-0">
                  <div className={`h-full bg-gradient-to-r ${step.color} opacity-30`} />
                </div>
              )}

              <div className="relative z-10 text-center">
                {/* Icon container */}
                <div className="relative inline-block mb-6">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-3xl blur-2xl opacity-50`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}
                  />
                  <div className="relative w-24 h-24 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Step number */}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white`}>
                    {index + 1}
                  </div>
                </div>

                <h3 className="mb-3 text-white">{step.title}</h3>
                <p className="text-white/60">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
