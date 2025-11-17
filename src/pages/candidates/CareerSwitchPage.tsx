import { PlaceholderPage } from "../PlaceholderPage";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { RefreshCw, FileText, BookOpen, MessageSquare, ArrowRight } from "lucide-react";

export function CareerSwitchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Switch Toolkit</h1>
          <p className="text-gray-600 text-xl mb-8">Change your path without starting from zero.</p>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              Thinking of moving from support to operations, or from operations to business analysis / product / tech? CVSaathi helps you reposition what you already know.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Toolkit includes:</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <FileText className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Role-switch resume templates</h3>
                  <p className="text-gray-600">E.g., Support → QA / BA, Non-IT → IT support, etc.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <RefreshCw className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Reposition your experience</h3>
                  <p className="text-gray-600">Guidance on how to describe old experience in a new language</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <BookOpen className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Basic skill maps</h3>
                  <p className="text-gray-600">What to learn first, next, later</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <MessageSquare className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Interview prep</h3>
                  <p className="text-gray-600">For "Why are you switching?" and similar questions</p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Simple learning resource suggestions so you don't drown in random courses.
            </p>
          </div>

          <Link to="/auth/signup">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 gap-2">
              Plan My Career Switch
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

