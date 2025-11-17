import { PlaceholderPage } from "../PlaceholderPage";
import { Button } from "../../components/ui/button";
import { Smartphone, Mail, MapPin } from "lucide-react";

export function DownloadAppPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 mb-6">
              <Smartphone className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Download the CVSaathi App</h1>
            <p className="text-gray-600 text-xl">Coming soon to your favourite app stores.</p>
          </div>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 mb-6">
              We're getting CVSaathi ready for a wider launch on the Google Play Store (and later, the App Store).
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What you'll be able to do on the app:</h2>
            <ul className="list-disc list-inside space-y-3 text-gray-700 mb-8">
              <li>Create and edit your resume anytime, anywhere</li>
              <li>Chat with Estel on the go</li>
              <li>Practise interview questions right before your call</li>
              <li>Save different resume versions for different roles</li>
            </ul>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Early access section:</h3>
              <p className="text-gray-700 mb-6">
                Want to be the first to try the app? Leave your email and city below. We'll notify you when CVSaathi is live in your region.
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Your city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                    <option>Student</option>
                    <option>Working Professional</option>
                    <option>College</option>
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

