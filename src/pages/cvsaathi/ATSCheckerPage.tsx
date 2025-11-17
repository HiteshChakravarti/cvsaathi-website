import { PlaceholderPage } from "../PlaceholderPage";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { FileSearch, Upload, CheckCircle, AlertCircle } from "lucide-react";

export function ATSCheckerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ATS Score Checker</h1>
          <p className="text-gray-600 text-xl mb-8">See how your resume performs before you apply.</p>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              Many companies use Applicant Tracking Systems (ATS) to filter resumes. CVSaathi's ATS Score Checker, powered by Estel, helps you understand how your CV might perform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How it works:</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Upload className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Upload or paste your resume</h3>
                  <p className="text-gray-600">(Optional) Paste the job description you're targeting</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <FileSearch className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. Get Estel's analysis</h3>
                  <p className="text-gray-600">Estel analyses keyword match, structure and section strength</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Get a simple score with clear reasons</h3>
                  <p className="text-gray-600">You'll see: match with job keywords, missing or weak sections, formatting red flags that ATS may not read well, and quick fixes to improve your chances.</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Currently in beta – results may not reflect every company's ATS system.
                </p>
              </div>
            </div>
          </div>

          <Link to="/auth/signup">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700">
              Run ATS Check
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

