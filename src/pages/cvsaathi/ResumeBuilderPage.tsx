import { PlaceholderPage } from "../PlaceholderPage";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { FileText, Sparkles, Zap, Copy } from "lucide-react";

export function ResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Builder</h1>
          <p className="text-gray-600 text-xl mb-8">ATS-friendly resumes tailored for Indian hiring.</p>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              No more copying old Word templates. CVSaathi's Resume Builder creates clean, modern, and ATS-friendly resumes designed for Indian recruiters.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Sections:</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Sparkles className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Role-based starting points</h3>
                  <p className="text-gray-600">Choose from templates for freshers, IT, finance, operations, sales, support and more.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <FileText className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Guided prompts</h3>
                  <p className="text-gray-600">Simple questions that pull out your achievements, even if you're not sure what to write.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Zap className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI bullet suggestions (Powered by Estel)</h3>
                  <p className="text-gray-600">Turn "I worked on Excel" into clear, impact-focused lines.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Copy className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Multiple versions</h3>
                  <p className="text-gray-600">Create different resumes for campus, off-campus, or role switches without starting from scratch.</p>
                </div>
              </div>
            </div>
          </div>

          <Link to="/auth/signup">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700">
              Create My Resume
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

