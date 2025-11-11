import { motion } from "motion/react";
import { FileText, CheckCircle, Briefcase, Bot, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import resumeBuilderImage from "figma:asset/ce21bd338822aa6524bd962f8da53836c0104a49.png";
import interviewPrepImage from "figma:asset/242bbf71ca21edeb48a137b668cfa525df7fb278.png";
import aiCoachImage from "figma:asset/88d543143fdfa1adae75e89cd0a9a88587a9f4c6.png";

const features = [
  {
    id: 1,
    icon: FileText,
    title: "Resume Builder",
    description: "Create stunning, professional resumes with our intuitive drag-and-drop builder. Choose from 50+ ATS-optimized templates designed for Indian job markets.",
    image: resumeBuilderImage,
    hasImage: true,
    large: true,
  },
  {
    id: 2,
    icon: CheckCircle,
    title: "ATS Checker",
    description: "Get instant ATS compatibility scores and actionable feedback to ensure your resume passes all screening systems.",
    hasImage: false,
  },
  {
    id: 3,
    icon: Briefcase,
    title: "Interview Prep",
    description: "Practice with AI-powered mock interviews tailored to your industry and role. Get real-time feedback and confidence.",
    image: interviewPrepImage,
    hasImage: true,
    centerPiece: true,
    large: true,
  },
  {
    id: 4,
    icon: Bot,
    title: "AI Coach",
    description: "Your personal AI career advisor provides smart suggestions, content optimization, and career guidance 24/7.",
    image: aiCoachImage,
    hasImage: true,
    inCard: true,
  },
  {
    id: 5,
    icon: TrendingUp,
    title: "Skill Gap Analysis",
    description: "Discover missing skills for your target roles and get personalized learning paths to bridge the gap and land your dream job.",
    hasImage: false,
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden ${
        feature.large ? 'row-span-2' : ''
      } ${feature.centerPiece ? 'md:col-span-1' : ''}`}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content wrapper */}
      <div className={`relative h-full ${feature.hasImage && !feature.inCard ? 'flex flex-col' : 'p-8'}`}>
        {/* Image section for image-based cards */}
        {feature.hasImage && !feature.inCard && (
          <div className="relative h-48 overflow-hidden rounded-t-3xl">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="h-full"
            >
              <ImageWithFallback
                src={feature.image!}
                alt={feature.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Gradient overlay on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* Text content section */}
        <div className={`${feature.hasImage && !feature.inCard ? 'p-8 flex-1' : ''} relative z-10`}>
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-gray-900 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
          >
            <feature.icon className="w-6 h-6 text-white" />
          </motion.div>

          {/* Title */}
          <h3 
            className="mb-3 transition-colors"
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">
            {feature.description}
          </p>

          {/* Image inside card for AI Coach */}
          {feature.inCard && feature.hasImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-6 relative h-48 rounded-2xl overflow-hidden"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="h-full"
              >
                <ImageWithFallback
                  src={feature.image!}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Hover arrow indicator */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 0%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </motion.div>
  );
}

export function FeaturesBentoModern() {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Subtle background elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 
            className="mb-4"
            style={{
              fontSize: '3.5rem',
              fontWeight: 600,
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            All features in 1 tool
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover features that simplify workflows & grow your business.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Resume Builder - Large top-left */}
          <div className="lg:col-span-2 lg:row-span-1">
            <FeatureCard feature={features[0]} index={0} />
          </div>

          {/* ATS Checker - Top right */}
          <div className="lg:col-span-1 lg:row-span-1">
            <FeatureCard feature={features[1]} index={1} />
          </div>

          {/* Skill Gap Analysis - Bottom left */}
          <div className="lg:col-span-1 lg:row-span-1">
            <FeatureCard feature={features[4]} index={4} />
          </div>

          {/* Interview Prep - Center bottom (large with image) */}
          <div className="lg:col-span-1 lg:row-span-1">
            <FeatureCard feature={features[2]} index={2} />
          </div>

          {/* AI Coach - Bottom right */}
          <div className="lg:col-span-1 lg:row-span-1">
            <FeatureCard feature={features[3]} index={3} />
          </div>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white gap-2 shadow-lg rounded-xl px-8"
              style={{ fontSize: '1rem', fontWeight: 600, padding: '1.25rem 2rem' }}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-md rounded-xl"
              style={{ fontSize: '1rem', fontWeight: 600, padding: '1.25rem 2rem' }}
              onClick={() => {
                document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See Our Services
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gray-300/50 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
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
