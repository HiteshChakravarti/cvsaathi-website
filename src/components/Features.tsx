import { motion } from "motion/react";
import { useState } from "react";
import { Brain, FileText, Target, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Content Generation",
    description: "Smart AI writes compelling bullet points and descriptions based on your experience.",
  },
  {
    icon: FileText,
    title: "ATS-Optimized Templates",
    description: "Choose from professionally designed templates that pass all tracking systems.",
  },
  {
    icon: Target,
    title: "Role-Specific Customization",
    description: "Tailored content for your specific industry, role, and experience level.",
  },
  {
    icon: Sparkles,
    title: "Real-Time Suggestions",
    description: "Get instant feedback and improvements as you build your resume.",
  },
];

export function Features() {
  const [activeTab, setActiveTab] = useState("before");

  return (
    <section id="features" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: "12%" }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <span className="text-white/70">FEATURES</span>
          </div>
          <h2 className="mb-4 text-white">
            All Features in 1 Tool
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Everything you need to create a winning resume in one powerful platform
          </p>
        </motion.div>

        {/* Before/After Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: "12%" }}
          className="mb-16"
        >
          <Tabs defaultValue="before" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/5 backdrop-blur-xl border border-white/10">
              <TabsTrigger value="before" className="data-[state=active]:bg-white/10">
                BEFORE
              </TabsTrigger>
              <TabsTrigger value="after" className="data-[state=active]:bg-white/10">
                AFTER
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8 max-w-4xl mx-auto">
              <TabsContent value="before">
                <motion.div
                  initial={{ opacity: 0.6, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                >
                  <div className="space-y-4">
                    <div className="text-white/90">Without CityResume.AI:</div>
                    <ul className="space-y-3 text-white/60">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>Spend hours formatting and designing your resume</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>Generic content that doesn't stand out to recruiters</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>No idea if your resume will pass ATS systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>One-size-fits-all approach for all job applications</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="after">
                <motion.div
                  initial={{ opacity: 0.6, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="bg-gradient-to-br from-[#2DD4BF]/10 to-[#3B82F6]/10 backdrop-blur-xl border border-[#2DD4BF]/20 rounded-2xl p-8"
                >
                  <div className="space-y-4">
                    <div className="text-white/90">With CityResume.AI:</div>
                    <ul className="space-y-3 text-white/80">
                      <li className="flex items-start gap-2">
                        <span className="text-[#2DD4BF] mt-1">✓</span>
                        <span>Professional resume ready in 15 minutes with AI automation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#2DD4BF] mt-1">✓</span>
                        <span>AI-generated compelling content tailored to your experience</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#2DD4BF] mt-1">✓</span>
                        <span>100% ATS-optimized with guaranteed system compatibility</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#2DD4BF] mt-1">✓</span>
                        <span>City-smart customization for your target job market</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.09,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              viewport={{ once: true, margin: "12%" }}
            >
              <Card className="bg-white/[0.06] backdrop-blur-xl border border-white/10 p-6 h-full hover:border-white/[0.16] transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2DD4BF]/20 to-[#3B82F6]/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-[#2DD4BF]" />
                </div>
                <h3 className="mb-2 text-white">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
