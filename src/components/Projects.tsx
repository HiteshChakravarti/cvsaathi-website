import { motion } from "motion/react";
import { Card } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Badge } from "./ui/badge";

const projects = [
  {
    title: "Tech Startup Success",
    company: "Bangalore Startup",
    role: "Software Engineer",
    result: "10 interviews in 2 weeks",
    stat: "+300%",
    description: "Helped a software engineer land 10 interviews at top Bangalore startups with our AI-optimized resume.",
    tags: ["Tech", "Bangalore", "Senior"],
  },
  {
    title: "Finance Career Switch",
    company: "Mumbai MNC",
    role: "Financial Analyst",
    result: "Dream job at Fortune 500",
    stat: "₹18L → ₹32L",
    description: "Career switcher landed a senior analyst role with 78% salary increase using our tailored approach.",
    tags: ["Finance", "Mumbai", "Career Change"],
  },
  {
    title: "Fresher Success Story",
    company: "Pune IT Company",
    role: "Junior Developer",
    result: "First job in 3 weeks",
    stat: "3 weeks",
    description: "Fresh graduate received multiple offers within 3 weeks of using our fresher-focused templates.",
    tags: ["IT", "Pune", "Fresher"],
  },
  {
    title: "Marketing Leadership",
    company: "Delhi Agency",
    role: "Marketing Manager",
    result: "5 leadership roles",
    stat: "+250%",
    description: "Marketing professional secured 5 interviews for leadership positions with city-smart optimization.",
    tags: ["Marketing", "Delhi", "Manager"],
  },
  {
    title: "Healthcare Professional",
    company: "Chennai Hospital",
    role: "Medical Officer",
    result: "Top hospital offer",
    stat: "Top 10%",
    description: "Healthcare professional joined a leading Chennai hospital with our specialized medical resume.",
    tags: ["Healthcare", "Chennai", "Senior"],
  },
];

export function Projects() {
  return (
    <section id="projects" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: "12%" }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <span className="text-white/70">PROJECTS</span>
          </div>
          <h2 className="mb-4 text-white">
            Proven Impact & Results
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Real success stories from job seekers across India
          </p>
        </motion.div>

        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {projects.map((project, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Card className="group bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-white/[0.16] transition-all duration-300 p-8 h-full">
                    {/* Stat Badge */}
                    <div className="inline-block px-4 py-2 mb-6 bg-gradient-to-r from-[#2DD4BF]/20 to-[#3B82F6]/20 border border-[#2DD4BF]/30 rounded-full">
                      <span className="bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] bg-clip-text text-transparent">
                        {project.stat}
                      </span>
                    </div>

                    <h3 className="mb-2 text-white">{project.title}</h3>
                    <div className="mb-4 text-white/50">
                      {project.role} at {project.company}
                    </div>

                    <p className="text-white/70 mb-6">{project.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="border-white/20 text-white/70 bg-white/5"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-[#2DD4BF]">
                      Result: {project.result}
                    </div>

                    {/* Subtle gradient on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#2DD4BF]/5 to-[#3B82F6]/5 rounded-lg -z-10" />
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
            <CarouselNext className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
