import { PlaceholderPage } from "../PlaceholderPage";
import { Bot, MessageSquare, Lightbulb, Target, BookOpen } from "lucide-react";

export function EstelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 mb-6">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Estel – Your AI Career Companion</h1>
            <p className="text-gray-600 text-xl">A friendly guide for all your career questions.</p>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              Estel is the AI brain inside CVSaathi. Think of Estel as that one senior or mentor you can text at any time when you're stuck.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What Estel can help with:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <MessageSquare className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Resume Help</p>
                  <p className="text-sm text-gray-600">Turn rough points into strong resume bullets</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Target className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Role Guidance</p>
                  <p className="text-sm text-gray-600">Suggest better role titles and keywords</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Lightbulb className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Interview Prep</p>
                  <p className="text-sm text-gray-600">Help you answer tricky interview questions</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <BookOpen className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Skill Development</p>
                  <p className="text-sm text-gray-600">Suggest next skills or certifications based on your goal</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How Estel works:</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-8">
              <li>You share your background, goals and doubts</li>
              <li>Estel analyses your inputs and job trends</li>
              <li>You get clear, conversational guidance you can act on immediately</li>
            </ol>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-8">
              <p className="text-sm text-teal-800">
                <strong>Note:</strong> Estel is AI-powered and still learning. Always review suggestions before using them in real applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

