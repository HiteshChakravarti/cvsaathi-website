import { PlaceholderPage } from "../PlaceholderPage";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Heart, FileText, MessageSquare, BookOpen, ArrowRight } from "lucide-react";

export function BackToWorkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Back-to-Work After a Career Break</h1>
          <p className="text-gray-600 text-xl mb-8">Turn your break into a part of your story, not a weak point.</p>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              Whether your break was for family, health, studies or anything else, getting back can feel scary. CVSaathi gives you a structured way to re-enter the workforce.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How we support you:</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <FileText className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Resume templates</h3>
                  <p className="text-gray-600">That honestly show breaks without over-explaining</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <MessageSquare className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Confident communication</h3>
                  <p className="text-gray-600">Tips to talk about your break confidently in interviews</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Heart className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Welcoming roles</h3>
                  <p className="text-gray-600">Suggestions on roles that welcome returnees and flexible workers</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <BookOpen className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Skill refresh guidance</h3>
                  <p className="text-gray-600">Step-by-step guidance to refresh your skills</p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-6 font-semibold">
              Gentle, practical language—no judgement, just progress.
            </p>
          </div>

          <Link to="/auth/signup">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 gap-2">
              Rebuild My Resume
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

