import { PlaceholderPage } from "../PlaceholderPage";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowRight } from "lucide-react";

export function OverviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CVSaathi Overview</h1>
          <p className="text-gray-600 text-xl mb-8">One simple app to manage your entire career journey.</p>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              CVSaathi is an AI-powered career companion built for students and professionals from India's Tier-2 and emerging cities.
            </p>
            <p className="text-gray-700 mb-6">
              Instead of juggling multiple websites, PDFs and random advice, CVSaathi brings everything into one place:
            </p>
            <ul className="list-disc list-inside space-y-3 text-gray-700 mb-8">
              <li>Build an ATS-ready resume in minutes</li>
              <li>Practise interviews with an AI coach</li>
              <li>Understand your skill gaps for your target role</li>
              <li>Get clear, step-by-step guidance instead of generic tips</li>
            </ul>
          </div>

          <Link to="/cvsaathi/features">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 gap-2">
              Explore Features
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

