import { PlaceholderPage } from "../PlaceholderPage";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Bot, FileText, MessageSquare, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

export function FeaturesPage() {
  const features = [
    {
      icon: Bot,
      title: "Estel, AI Career Companion",
      description: "The brain behind every CVSaathi feature. Chat with Estel whenever you're stuck: 'How do I improve my resume for this job?', 'What skills am I missing for this role?', 'How do I answer this interview question?' Estel reads your profile, goals and job descriptions, then guides you step by step—in simple, clear language built for Tier-2 India.",
      highlight: true,
    },
    {
      icon: FileText,
      title: "Resume Builder (Powered by Estel)",
      description: "From rough notes to a clean, ATS-friendly resume. Start with role-based templates for freshers and working professionals. Answer simple prompts; Estel turns them into strong bullet points. Get instant suggestions for better wording, keywords and structure. Create multiple versions for different roles without starting from zero.",
      cta: "Create My Resume",
      ctaLink: "/cvsaathi/resume-builder",
    },
    {
      icon: MessageSquare,
      title: "Interview Prep Coach (Powered by Estel)",
      description: "Practise before you sit in front of the panel. Common HR and behavioural questions. Role-specific questions for popular profiles (BA, dev, ops, support etc.). Estel drafts sample answers using your background, not generic text. Tips on tone, clarity and confidence so you sound natural, not memorised.",
      cta: "Practise Interview Questions",
      ctaLink: "/cvsaathi/interview-prep",
    },
    {
      icon: TrendingUp,
      title: "Skill Gap Analysis (Powered by Estel)",
      description: "See what's missing between where you are and where you want to go. Instead of random course hunting, CVSaathi shows you targeted gaps. You pick a target role, share your current education, skills and experience. Estel compares your profile with typical requirements for that role. You get a clear list of skills you already have, skills you're missing, suggested priority order, and simple guidance on how to start.",
      cta: "Check My Skill Gaps",
      ctaLink: "/cvsaathi/skill-gap-analysis",
      highlight: true,
    },
    {
      icon: CheckCircle,
      title: "ATS Score Checker (Powered by Estel)",
      description: "Test your resume before the company's software does. Upload/paste your resume and (optionally) the job description. Estel analyses keyword match, structure and section strength. You see a simple score with reasons, not cryptic metrics. Get concrete suggestions to tweak your resume for better visibility. Currently in beta – results are indicative and may differ across companies.",
      cta: "Run ATS Check",
      ctaLink: "/cvsaathi/ats-checker",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Features</h1>
          <p className="text-gray-600 text-xl mb-4">Estel at the core, tools around it.</p>
          <p className="text-gray-700 max-w-3xl mx-auto">
            At the heart of CVSaathi is Estel, your AI career companion. Every feature you see is basically Estel helping you in a focused way: turning your details into a strong resume, spotting skill gaps, preparing you for interviews, checking how your CV might perform in ATS systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow ${
                  feature.highlight ? 'ring-2 ring-teal-500/50 ring-offset-2' : ''
                }`}
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${
                  feature.highlight ? 'bg-gradient-to-br from-teal-500 to-cyan-500' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${feature.highlight ? 'text-white' : 'text-gray-700'}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                {feature.cta && (
                  <Link to={feature.ctaLink || '#'}>
                    <Button
                      variant={feature.highlight ? 'default' : 'outline'}
                      className={feature.highlight ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700' : ''}
                    >
                      {feature.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

