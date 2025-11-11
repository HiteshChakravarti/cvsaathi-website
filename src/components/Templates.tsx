import { motion } from "motion/react";
import { Code, TrendingUp, Briefcase, GraduationCap } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

const templates = [
  {
    icon: Code,
    title: "Tech",
    description: "Modern templates for developers, engineers, and tech professionals.",
    tags: ["Developer", "Engineer", "Designer"],
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Marketing",
    description: "Eye-catching templates for marketers and creative professionals.",
    tags: ["Marketing", "Social Media", "Creative"],
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Briefcase,
    title: "Operations",
    description: "Professional templates for business operations and management.",
    tags: ["Manager", "Consultant", "Operations"],
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: GraduationCap,
    title: "Freshers",
    description: "Specially designed for students and recent graduates.",
    tags: ["Graduate", "Intern", "Entry-level"],
    gradient: "from-indigo-500 to-teal-500",
  },
];

export function Templates() {
  return (
    <section id="templates" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 mb-4 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
            <span className="text-white/70">Templates</span>
          </div>
          <h2 className="text-white mb-4">Designer-crafted templates</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Pick from modern, classic, and visual templates built to pass ATS filters
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, rotateY: 5 }}
              style={{ perspective: 1000 }}
            >
              <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/10 hover:border-teal-500/30 cursor-pointer p-6 h-full transition-all">
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Corner glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-teal-500/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${template.gradient} flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20`}
                  >
                    <template.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  <h3 className="text-white mb-2">{template.title}</h3>
                  <p className="text-white/60 mb-4">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag, tagIndex) => (
                      <Badge 
                        key={tagIndex} 
                        variant="outline" 
                        className="text-white/70 border-white/20 bg-white/5 backdrop-blur-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
