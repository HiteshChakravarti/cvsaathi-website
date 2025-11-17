import { PlaceholderPage } from "../PlaceholderPage";
import { Button } from "../../components/ui/button";
import { FileText, GraduationCap, MessageSquare, Mail } from "lucide-react";

export function GovtPSUPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="text-center mb-12">
            <div className="inline-flex px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold mb-6">
              Coming Soon
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">For Govt & PSU Aspirants</h1>
            <p className="text-gray-600 text-xl">Career tools for those aiming at secure, respected roles.</p>
          </div>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              Many CVSaathi users are also preparing for government exams and PSU roles. We're working on features specifically for you.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Planned areas:</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <FileText className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Simple templates</h3>
                  <p className="text-gray-600">For CV/BD/statement formats used in some exams and interviews</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <GraduationCap className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Clear presentation</h3>
                  <p className="text-gray-600">Help in presenting educational and attempt history clearly</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <MessageSquare className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Interview guidance</h3>
                  <p className="text-gray-600">On how to talk about exam prep, attempts and gaps in interviews</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-8 mb-8">
              <p className="text-sm text-amber-800 mb-4">
                <strong>Status:</strong> These features are currently in planning and early testing.
              </p>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-teal-600" />
                Early interest:
              </h3>
              <p className="text-gray-700 mb-6">
                Preparing for govt or PSU roles? Drop your email and exam type so we can design CVSaathi to support you better.
              </p>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam focus</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                    <option>UPSC</option>
                    <option>State</option>
                    <option>Banking</option>
                    <option>PSU</option>
                    <option>Other</option>
                  </select>
                </div>
                <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700">
                  Notify Me When Available
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

