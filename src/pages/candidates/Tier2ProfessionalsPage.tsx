import { PlaceholderPage } from "../PlaceholderPage";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { MapPin, TrendingUp, FileText, Target, ArrowRight } from "lucide-react";

export function Tier2ProfessionalsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">For Tier-2 City Professionals</h1>
          <p className="text-gray-600 text-xl mb-8">Grow your career without leaving your city behind.</p>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              You may be working in a smaller city, but your ambition isn't small. CVSaathi helps you aim for better roles—within your city or in bigger hubs—without confusion.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What you can do:</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <FileText className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Refresh your resume</h3>
                  <p className="text-gray-600">Transform an old resume into a clean, modern format</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Highlight real achievements</h3>
                  <p className="text-gray-600">Showcase practical achievements from your current job</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <MapPin className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Map your skills</h3>
                  <p className="text-gray-600">To roles in metros or remote companies</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Target className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Plan your growth</h3>
                  <p className="text-gray-600">Practise interviews for promotions or role changes. Understand which skills/certifications are worth your time.</p>
                </div>
              </div>
            </div>
          </div>

          <Link to="/auth/signup">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 gap-2">
              Upgrade My Resume
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

