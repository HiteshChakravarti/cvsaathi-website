import { PlaceholderPage } from "../PlaceholderPage";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { TrendingUp, Target, CheckCircle, BookOpen, ArrowRight } from "lucide-react";

export function SkillGapAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Skill Gap Analysis</h1>
          <p className="text-gray-600 text-xl mb-8">Know exactly what to work on next—no more guesswork.</p>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              Most people from Tier-2 cities are willing to work hard; they're just not sure what to study or which skill actually matters for the job.
            </p>
            <p className="text-gray-700 mb-6">
              CVSaathi's Skill Gap Analysis, powered by Estel, helps you choose a target role, compare your current skills with real-world expectations, get a clear, ranked list of gaps to work on, and plan your learning in a realistic, step-by-step way.
            </p>
            <p className="text-gray-700 mb-8 font-semibold">
              Instead of running behind every trending course, you focus on what really moves your career forward.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How it works:</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Target className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Pick a target role</h3>
                  <p className="text-gray-600">Choose from roles like "Business Analyst", "Front-end Developer", "Operations Executive in Fintech", etc.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. Share your profile</h3>
                  <p className="text-gray-600">Provide your current education, skills and experience.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Get Estel's analysis</h3>
                  <p className="text-gray-600">Estel compares your profile with typical requirements for that role and shows you what's missing.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <BookOpen className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">4. Get actionable insights</h3>
                  <p className="text-gray-600">You'll see: skills you already have, skills you're missing, suggested priority order, and simple guidance on how to start (online resources, projects, practice ideas).</p>
                </div>
              </div>
            </div>
          </div>

          <Link to="/auth/signup">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 gap-2">
              Find My Skill Gaps
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

