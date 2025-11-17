import { PlaceholderPage } from "../PlaceholderPage";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { MessageSquare, Users, Bot, Lightbulb } from "lucide-react";

export function InterviewPrepPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Interview Prep Coach</h1>
          <p className="text-gray-600 text-xl mb-8">Practise answers before the real interview.</p>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              Most candidates lose confidence in the first 5–10 minutes of an interview. CVSaathi helps you practise beforehand so you walk in prepared.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What you get:</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <MessageSquare className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Common question bank</h3>
                  <p className="text-gray-600">HR questions, behavioural questions, "Tell me about yourself", "Why should we hire you?" and more.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Users className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Role-specific questions</h3>
                  <p className="text-gray-600">For popular roles like Business Analyst, Developer, Support, Operations, etc. (expand over time).</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Bot className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI answer drafts (Powered by Estel)</h3>
                  <p className="text-gray-600">Sample answers based on your own profile so you're not memorising generic lines.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Lightbulb className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Self-review prompts</h3>
                  <p className="text-gray-600">Tips on tone, clarity, and structure so your answers sound natural, not robotic.</p>
                </div>
              </div>
            </div>
          </div>

          <Link to="/auth/signup">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700">
              Practise Interview Questions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

