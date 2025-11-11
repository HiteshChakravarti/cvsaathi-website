import { motion, useAnimation } from "motion/react";
import { Code, TrendingUp, Briefcase, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const templates = [
  {
    icon: Code,
    title: "Tech Professional",
    description: "Modern templates for developers, engineers, and tech professionals.",
    tags: ["Developer", "Engineer", "Designer"],
    color: "teal",
  },
  {
    icon: TrendingUp,
    title: "Marketing",
    description: "Eye-catching templates for marketers and creative professionals.",
    tags: ["Marketing", "Social Media", "Creative"],
    color: "cyan",
  },
  {
    icon: Briefcase,
    title: "Business Operations",
    description: "Professional templates for business operations and management.",
    tags: ["Manager", "Consultant", "Operations"],
    color: "teal",
  },
  {
    icon: GraduationCap,
    title: "Fresh Graduate",
    description: "Specially designed for students and recent graduates.",
    tags: ["Graduate", "Intern", "Entry-level"],
    color: "emerald",
  },
  {
    icon: Briefcase,
    title: "Executive",
    description: "Premium templates for senior executives and leadership roles.",
    tags: ["Director", "VP", "Executive"],
    color: "cyan",
  },
];

export function Templates3D() {
  const [rotation, setRotation] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  const rotate = (direction: 'left' | 'right') => {
    if (isRotating) return;
    setIsRotating(true);
    const angle = 360 / templates.length;
    setRotation(prev => direction === 'left' ? prev - angle : prev + angle);
    setTimeout(() => setIsRotating(false), 800);
  };

  return (
    <section id="templates" className="py-32 px-6 relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl" />

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
            <span className="text-teal-700 uppercase tracking-wider">Resume Templates</span>
          </div>
          <h2 className="text-gray-900 mb-6">
            Designer-crafted templates
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pick from modern, classic, and visual templates built to pass ATS filters and impress recruiters
          </p>
        </motion.div>

        {/* 3D Carousel Container */}
        <div className="relative h-[600px] flex items-center justify-center">
          {/* Carousel Stage */}
          <div 
            className="relative w-full h-full"
            style={{ perspective: "2000px" }}
          >
            <motion.div
              className="relative w-full h-full"
              style={{
                transformStyle: "preserve-3d",
              }}
              animate={{
                rotateY: rotation,
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
              }}
            >
              {templates.map((template, index) => {
                const angle = (360 / templates.length) * index;
                const radius = 400;
                
                return (
                  <motion.div
                    key={index}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `
                        translate(-50%, -50%)
                        rotateY(${angle}deg)
                        translateZ(${radius}px)
                      `,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Card */}
                    <div
                      className="w-80 h-96 bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden group hover:border-teal-300 transition-all duration-300"
                      style={{
                        transform: "rotateY(0deg)",
                      }}
                    >
                      {/* Gradient header */}
                      <div className={`h-32 bg-gradient-to-br ${
                        template.color === 'teal' ? 'from-teal-400 to-teal-600' :
                        template.color === 'cyan' ? 'from-cyan-400 to-cyan-600' :
                        'from-emerald-400 to-emerald-600'
                      } relative overflow-hidden`}>
                        {/* Animated gradient overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        
                        {/* Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <template.icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-gray-900 mb-3">{template.title}</h3>
                        <p className="text-gray-600 mb-4">{template.description}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* CTA */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-6 w-full py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                        >
                          Preview Template
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            <Button
              onClick={() => rotate('left')}
              disabled={isRotating}
              size="lg"
              className="bg-white hover:bg-gray-50 text-gray-900 shadow-xl border border-gray-200 rounded-full w-14 h-14 p-0 disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <div className="px-6 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg">
              <span className="text-gray-700">
                Drag to rotate • {templates.length} templates
              </span>
            </div>

            <Button
              onClick={() => rotate('right')}
              disabled={isRotating}
              size="lg"
              className="bg-white hover:bg-gray-50 text-gray-900 shadow-xl border border-gray-200 rounded-full w-14 h-14 p-0 disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 shadow-lg shadow-teal-500/30"
          >
            View All Templates
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
