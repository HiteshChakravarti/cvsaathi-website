import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  content?: React.ReactNode;
}

export function PlaceholderPage({ title, description, content }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          {description && (
            <p className="text-gray-600 text-lg mb-8">{description}</p>
          )}
          
          {content || (
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-500">
                This page is coming soon. We're working hard to bring you the best experience.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

