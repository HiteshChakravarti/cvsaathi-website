import { PlaceholderPage } from "../PlaceholderPage";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { GraduationCap, FileText, MessageSquare, Target, ArrowRight } from "lucide-react";

export function StudentsFreshersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">For Students & Freshers</h1>
          <p className="text-gray-600 text-xl mb-8">Your first job shouldn't depend on perfect English or fancy coaching.</p>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              If you're in college or just passed out, interviews and resumes can feel overwhelming. CVSaathi breaks the process into simple steps.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How CVSaathi helps you:</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <FileText className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">First resume templates</h3>
                  <p className="text-gray-600">Designed for campus and off-campus hiring</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <GraduationCap className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Guidance for early experience</h3>
                  <p className="text-gray-600">Help with internships, training experience and projects</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <MessageSquare className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Simple explanations</h3>
                  <p className="text-gray-600">For HR and basic technical questions</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Target className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Career paths</h3>
                  <p className="text-gray-600">For common fresher roles (support, operations, analyst, junior dev and more)</p>
                </div>
              </div>
            </div>
          </div>

          <Link to="/auth/signup">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 gap-2">
              Start My First Resume
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

