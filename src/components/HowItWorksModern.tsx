import { motion } from "motion/react";
import { Upload, Sparkles, CheckCircle, Download } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload or Start Fresh",
    description: "Import your existing resume or start with a blank template. Our AI will guide you through every step.",
    image: "https://images.unsplash.com/photo-1762330472769-cb8e6c8324d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjByZXN1bWUlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjI3ODM4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tall: true,
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Enhancement",
    description: "Our AI analyzes your content, suggests improvements, and optimizes for ATS systems automatically.",
    image: "https://images.unsplash.com/photo-1759395162739-84190996783c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHRlY2hub2xvZ3klMjBhdXRvbWF0aW9ufGVufDF8fHx8MTc2Mjc4Mzg1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Review & Customize",
    description: "Fine-tune your resume with our intuitive editor. Choose from premium templates and customize colors.",
    image: "https://images.unsplash.com/photo-1762341118954-d0ce391674d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjYXJlZXIlMjBzdWNjZXNzfGVufDF8fHx8MTc2MjY4NDgxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    number: "04",
    icon: Download,
    title: "Download & Apply",
    description: "Export your ATS-optimized resume in multiple formats. Track applications and land interviews.",
    image: "https://images.unsplash.com/photo-1618034100983-e1d78be0dc80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3dubG9hZCUyMGRvY3VtZW50JTIwZGlnaXRhbHxlbnwxfHx8fDE3NjI3ODM4NTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
    >
      {/* Content wrapper */}
      <div className="p-8">
        {/* Icon in dark rounded square */}
        <motion.div
          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-14 h-14 mb-6 bg-gray-900 rounded-xl shadow-lg"
        >
          <step.icon className="w-7 h-7 text-white" />
        </motion.div>

        {/* Title */}
        <h3 
          className="mb-3"
          style={{
            background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed mb-6">
          {step.description}
        </p>

        {/* Number and dots */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-5xl text-gray-200 group-hover:text-gray-300 transition-colors">
            {step.number}
          </span>
          <div className="flex gap-1.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === index ? 'bg-gray-900 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="relative h-64 rounded-2xl overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            <ImageWithFallback
              src={step.image}
              alt={step.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Subtle hover gradient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-50/0 to-gray-100/0 group-hover:from-gray-50/30 group-hover:to-gray-100/20 transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
}

export function HowItWorksModern() {
  return (
    <section id="how-it-works" className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Subtle background decoration */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gray-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-100/50 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-6 bg-teal-50 border border-teal-200 rounded-full shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-teal-700 uppercase tracking-wider">Process</span>
          </motion.div>

          <h2 
            className="mb-4"
            style={{
              fontSize: '3rem',
              fontWeight: 600,
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Four simple steps to success
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A transparent process of collaboration and feedback
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Step 01 - Tall left card */}
          <div className="lg:row-span-2">
            <StepCard step={steps[0]} index={0} />
          </div>

          {/* Step 02 - Top right */}
          <div>
            <StepCard step={steps[1]} index={1} />
          </div>

          {/* Step 03 - Bottom right */}
          <div>
            <StepCard step={steps[2]} index={2} />
          </div>

          {/* Step 04 - Bottom full width (optional, or can be placed differently) */}
          <div className="lg:col-span-2">
            <StepCard step={steps[3]} index={3} />
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-gray-900 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all"
          >
            Start Building Now - It's Free
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}