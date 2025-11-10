import { motion, useScroll, useTransform } from "motion/react";
import { Upload, Wand2, FileCheck, Download } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Enter Your Details",
    description: "Share your professional experience, skills, and career goals. Our intelligent forms guide you through each step with smart suggestions.",
    features: ["Auto-fill from LinkedIn", "Smart skill suggestions", "Experience templates"],
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI Optimization",
    description: "Our AI analyzes your target city and role, then optimizes your resume with industry keywords and local market insights.",
    features: ["City-specific keywords", "ATS optimization", "Industry tailoring"],
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Review & Customize",
    description: "Fine-tune your resume with our intuitive editor. Get real-time suggestions and see instant previews of your changes.",
    features: ["Real-time preview", "AI suggestions", "Multiple templates"],
  },
  {
    number: "04",
    icon: Download,
    title: "Export & Apply",
    description: "Download your resume in multiple formats and start applying to jobs with confidence. Track your applications easily.",
    features: ["PDF, DOCX export", "One-click apply", "Application tracking"],
  },
];

export function Process() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <section id="process" className="py-32 px-6 relative" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: "12%" }}
          className="text-center mb-20"
        >
          <div className="inline-block px-4 py-2 mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <span className="text-white/70">PROCESS</span>
          </div>
          <h2 className="mb-4 text-white">
            Simple & Scalable
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Four easy steps to your perfect resume
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left column - Sticky */}
          <div className="lg:sticky lg:top-32">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "12%" }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2DD4BF]/20 to-[#3B82F6]/20 border border-white/10 flex items-center justify-center">
                    <span className="bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>
                  <div>
                    <div className="text-white/50">{step.title}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right column - Scrolling content */}
          <div className="space-y-32">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true, margin: "12%" }}
                className="relative"
              >
                <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2DD4BF] to-[#3B82F6] flex items-center justify-center mb-6`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="mb-4 text-white">{step.title}</h3>
                  <p className="text-white/70 mb-6">{step.description}</p>

                  <div className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
                        <span className="text-white/60">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
